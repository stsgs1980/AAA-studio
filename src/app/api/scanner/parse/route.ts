import { z } from 'zod';
import { handleError, success, BadRequest } from '@/lib/api-error';
import type { ScannerFile, ParsedSkill, ParsedStandard } from '@/lib/scanner/types';
import { classifyFile, parseSkillMarkdown, parseStandardMarkdown } from '@/lib/scanner/parser';

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

    const skills: ParsedSkill[] = [];
    const standards: ParsedStandard[] = [];

    for (const file of typedFiles) {
      if (file.type === 'skill') {
        skills.push(parseSkillMarkdown(file.path, file.content));
      } else if (file.type === 'standard') {
        standards.push(parseStandardMarkdown(file.path, file.content));
      }
    }

    return success({ skills, standards });
  } catch (error) {
    return handleError(error);
  }
}
