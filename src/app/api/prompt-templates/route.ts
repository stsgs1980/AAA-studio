import { db } from '@/lib/db';
import { handleError, success, created } from '@/lib/api-error';
import { promptTemplateCreateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const templates = await db.promptTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
    return success(templates.map((t) => ({ ...t, tags: JSON.parse(t.tags), variables: JSON.parse(t.variables) })));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = promptTemplateCreateSchema.parse(await request.json());
    const template = await db.promptTemplate.create({
      data: {
        name: body.name.trim(),
        category: body.category ?? 'general',
        content: body.content,
        variables: JSON.stringify(body.variables ?? []),
        framework: body.framework ?? null,
        tags: JSON.stringify(body.tags ?? []),
      },
    });
    return created({ ...template, tags: JSON.parse(template.tags), variables: JSON.parse(template.variables) });
  } catch (error) {
    return handleError(error);
  }
}
