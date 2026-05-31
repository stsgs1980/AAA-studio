import { db } from '@/lib/db';
import { handleError, success, created, BadRequest } from '@/lib/api-error';
import { z } from 'zod';
import { getActiveProvider } from '@/lib/llm';
import { callLLM } from '@/lib/llm/client';
import { withRetry } from '@/lib/resilience/api-retry';
import { parseJudgeResponse, selfCorrect } from './correction-loop';

const startSchema = z.object({
  input: z.string().min(1),
  agentId: z.string().optional(),
  maxRetries: z.number().int().min(0).max(5).default(2),
});

/** GET /api/self-correction -- list sessions */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const agentId = searchParams.get('agentId') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (agentId) where.agentId = agentId;

    const sessions = await db.selfCorrectionSession.findMany({
      where, orderBy: { createdAt: 'desc' }, take: limit,
      select: {
        id: true, input: true, initialOutput: true, judgeScore: true,
        judgeVerdict: true, judgeReasoning: true, revisedOutput: true,
        revisionScore: true, status: true, maxRetries: true, retryCount: true,
        createdAt: true,
        agent: { select: { id: true, name: true, roleGroup: true } },
      },
    });

    const counts = await db.selfCorrectionSession.groupBy({ by: ['status'], _count: true });
    return success({
      sessions,
      counts: Object.fromEntries(counts.map((c) => [c.status, c._count])),
    });
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/self-correction -- start a self-correction session */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = startSchema.parse(body);
    const active = await getActiveProvider();
    if (!active) throw BadRequest('LLM not configured');

    // Step 1: Generate initial output (with retry on transient failures)
    const genResp = await withRetry(() => callLLM({
      provider: active.provider, model: active.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Provide a thorough response.' },
        { role: 'user', content: parsed.input },
      ],
      temperature: active.settings.temperature, maxTokens: active.settings.maxTokens,
    }), { maxRetries: 2, initialDelay: 1000 });

    // Step 2: Judge the output (with retry)
    const judgeResp = await withRetry(() => callLLM({
      provider: active.provider, model: active.model,
      messages: [
        { role: 'system', content: 'Score 0-10, give verdict. Format:\nSCORE: <number>\nVERDICT: <approved|needs_revision|rejected>\nREASONING: <text>' },
        { role: 'user', content: `Input: ${parsed.input}\n\nResponse:\n${genResp.content}` },
      ],
      temperature: 0.1, maxTokens: 200,
    }), { maxRetries: 2, initialDelay: 1000 });

    const { score, verdict, reasoning } = parseJudgeResponse(judgeResp.content);

    // Create session
    const session = await db.selfCorrectionSession.create({
      data: {
        input: parsed.input, initialOutput: genResp.content,
        judgeScore: score, judgeVerdict: verdict, judgeReasoning: reasoning,
        maxRetries: parsed.maxRetries, agentId: parsed.agentId || null,
        status: verdict === 'approved' ? 'completed' : 'reviewing',
      },
    });

    // Step 3: Self-correct if needed
    if (verdict === 'needs_revision' && parsed.maxRetries > 0) {
      const revised = await selfCorrect(session.id, genResp.content, parsed.input, reasoning, active, parsed.maxRetries);
      return created(revised);
    }

    return created(session);
  } catch (error) {
    return handleError(error);
  }
}
