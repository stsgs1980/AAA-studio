import { z } from 'zod';
import { handleError, success, BadRequest } from '@/lib/api-error';
import { evaluateSummary } from '@/lib/services/scanner-service';

export const maxDuration = 60;

const schema = z.object({
  summary: z.string().min(10, 'Summary too short'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw BadRequest('Invalid input', parsed.error.flatten());
    const evaluation = await evaluateSummary(parsed.data.summary);
    return success(evaluation);
  } catch (error) {
    return handleError(error);
  }
}