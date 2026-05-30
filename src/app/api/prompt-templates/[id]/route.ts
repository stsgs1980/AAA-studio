import { db } from '@/lib/db';
import { handleError, success } from '@/lib/api-error';
import { promptTemplateCreateSchema } from '@/lib/validations';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = promptTemplateCreateSchema.partial().parse(await request.json());
    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = body.name;
    if (body.category != null) data.category = body.category;
    if (body.content != null) data.content = body.content;
    if (body.variables != null) data.variables = JSON.stringify(body.variables);
    if (body.framework != null) data.framework = body.framework;
    if (body.tags != null) data.tags = JSON.stringify(body.tags);
    const template = await db.promptTemplate.update({ where: { id }, data });
    return success({ ...template, tags: JSON.parse(template.tags), variables: JSON.parse(template.variables) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.promptTemplate.delete({ where: { id } });
    return success({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
