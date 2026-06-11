import { z } from 'zod';
import { handleError, success, BadRequest } from '@/lib/api-error';
import type { ScannerFile, StructureSummary } from '@/lib/scanner/types';
import { classifyFile } from '@/lib/scanner/parser';

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

    const files: ScannerFile[] = parsed.data.files.map(f => ({
      ...f,
      type: classifyFile(f.path, f.content),
    }));

    const fileTypes: Record<string, number> = {};
    let totalSize = 0;
    for (const f of files) {
      fileTypes[f.type] = (fileTypes[f.type] ?? 0) + 1;
      totalSize += f.size;
    }

    const largestFiles = [...files]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(f => ({ path: f.path, size: f.size }));

    const result: StructureSummary = {
      totalFiles: files.length,
      totalSize,
      skillsCount: fileTypes['skill'] ?? 0,
      standardsCount: fileTypes['standard'] ?? 0,
      fileTypes,
      largestFiles,
    };

    return success(result);
  } catch (error) {
    return handleError(error);
  }
}
