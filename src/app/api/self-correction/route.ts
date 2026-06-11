import { handleError, success, created, BadRequest } from '@/lib/api-error';
import { z } from 'zod';
import { getActiveProvider } from '@/lib/llm';
import { listSessions, startSession } from '@/lib/services/self-correction-service';

const startSchema = z.object({
  input: z.string().min(1),
  agentId: z.string().optional(),
  maxRetries: z.number().int().min(0).max(5).default(2),
});

/** GET /api/self-correction -- list sessions */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await listSessions({
      status: searchParams.get('status') || undefined,
      agentId: searchParams.get('agentId') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
    });
    return success(result);
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
    const session = await startSession(parsed.input, parsed.agentId, parsed.maxRetries, active);
    return created(session);
  } catch (error) {
    return handleError(error);
  }
}
