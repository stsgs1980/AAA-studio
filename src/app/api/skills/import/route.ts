import { handleError, created, BadRequest } from '@/lib/api-error';
import { importSkillFile } from '@/lib/services/skill-import-service';

/** POST /api/skills/import -- Import skills from SKILL.md or ZIP */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) throw BadRequest('No file provided. Upload .md or .zip.');
    const result = await importSkillFile(file);
    return created(result);
  } catch (error) { return handleError(error); }
}
