import { z } from 'zod';
import { handleError, success, BadRequest } from '@/lib/api-error';
import { buildStructure } from '@/lib/services/scanner-service';
import { classifyFile } from '@/lib/scanner/parser';
import { heuristicEvaluation } from '@/lib/scanner/heuristic';

const schema = z.object({
  files: z.array(z.object({
    path: z.string(), size: z.number(),
  })).min(1, 'At least one file is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw BadRequest('Invalid input', parsed.error.flatten());
    const typedFiles = parsed.data.files.map(f => ({
      ...f, content: '', type: classifyFile(f.path, ''),
    }));
    const structure = buildStructure(typedFiles);
    const evaluation = heuristicEvaluation(structure, [], [], []);
    return success({ structure, skills: [], standards: [], references: [], antiPatterns: [], evaluation, timestamp: new Date().toISOString() });
  } catch (error) {
    return handleError(error);
  }
}