import { z } from 'zod';
import { handleError, success, BadRequest } from '@/lib/api-error';
import type { ScannerFile, ReferenceCheck } from '@/lib/scanner/types';
import { classifyFile } from '@/lib/scanner/parser';
import { extractReferences, checkReferences } from '@/lib/scanner/references';

const schema = z.object({
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    size: z.number(),
  })).min(1, 'At least one file is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw BadRequest('Invalid input', parsed.error.flatten());

    const typedFiles: ScannerFile[] = parsed.data.files.map(f => ({
      ...f,
      type: classifyFile(f.path, f.content),
    }));

    const rawRefs = extractReferences(typedFiles);
    const references: ReferenceCheck[] = checkReferences(rawRefs, typedFiles);

    return success({ references });
  } catch (error) {
    return handleError(error);
  }
}
