import { db } from '@/lib/db';
import { callLLM } from '@/lib/llm/client';
import { withRetry } from '@/lib/resilience/api-retry';
import { parseJudgeResponse, selfCorrect } from '@/app/api/self-correction/correction-loop';

/** List self-correction sessions with filters and status counts */
export async function listSessions(params: {
  status?: string;
  agentId?: string;
  limit?: number;
}) {
  const { status, agentId, limit = 20 } = params;
  const cappedLimit = Math.min(limit, 50);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (agentId) where.agentId = agentId;

  const sessions = await db.selfCorrectionSession.findMany({
    where, orderBy: { createdAt: 'desc' }, take: cappedLimit,
    select: {
      id: true, input: true, initialOutput: true, judgeScore: true,
      judgeVerdict: true, judgeReasoning: true, revisedOutput: true,
      revisionScore: true, status: true, maxRetries: true, retryCount: true,
      createdAt: true,
      agent: { select: { id: true, name: true, roleGroup: true } },
    },
  });

  const counts = await db.selfCorrectionSession.groupBy({ by: ['status'], _count: true });

  return {
    sessions,
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count])),
  };
}

/** Start a self-correction session: generate → judge → create session → self-correct */
export async function startSession(input: string, agentId: string | undefined, maxRetries: number, active: NonNullable<Awaited<ReturnType<typeof import('@/lib/llm/settings')['getActiveProvider']>>>) {
  // Step 1: Generate initial output (with retry on transient failures)
  const genResp = await withRetry(() => callLLM({
    provider: active.provider, model: active.model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant. Provide a thorough response.' },
      { role: 'user', content: input },
    ],
    temperature: active.settings.temperature, maxTokens: active.settings.maxTokens,
  }), { maxRetries: 2, initialDelay: 1000 });

  // Step 2: Judge the output (with retry)
  const judgeResp = await withRetry(() => callLLM({
    provider: active.provider, model: active.model,
    messages: [
      { role: 'system', content: 'Score 0-10, give verdict. Format:\nSCORE: <number>\nVERDICT: <approved|needs_revision|rejected>\nREASONING: <text>' },
      { role: 'user', content: `Input: ${input}\n\nResponse:\n${genResp.content}` },
    ],
    temperature: 0.1, maxTokens: 200,
  }), { maxRetries: 2, initialDelay: 1000 });

  const { score, verdict, reasoning } = parseJudgeResponse(judgeResp.content);

  // Create session
  const session = await db.selfCorrectionSession.create({
    data: {
      input, initialOutput: genResp.content,
      judgeScore: score, judgeVerdict: verdict, judgeReasoning: reasoning,
      maxRetries, agentId: agentId || null,
      status: verdict === 'approved' ? 'completed' : 'reviewing',
    },
  });

  // Step 3: Self-correct if needed
  if (verdict === 'needs_revision' && maxRetries > 0) {
    return await selfCorrect(session.id, genResp.content, input, reasoning, active, maxRetries);
  }

  return session;
}
