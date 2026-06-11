import { z } from 'zod';
import { handleError, success, BadRequest } from '@/lib/api-error';
import { analyzeFiles } from '@/lib/services/scanner-service';

const schema = z.object({
  files: z.array(z.object({
    path: z.string(), content: z.string(), size: z.number(),
  })).min(1, 'At least one file is required'),
  evaluate: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw BadRequest('Invalid input', parsed.error.flatten());
    const report = await analyzeFiles(parsed.data.files, parsed.data.evaluate);
    return success(report);
  } catch (error) {
    return handleError(error);
  }
}
