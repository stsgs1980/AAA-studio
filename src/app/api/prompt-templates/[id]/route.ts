/** Single Prompt Template API — GET, PUT, DELETE. */
import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const tpl = await db.promptTemplate.findUnique({ where: { id } });
    if (!tpl) throw NotFound('Template not found');
    return success({ ...tpl, tags: JSON.parse(tpl.tags), variables: JSON.parse(tpl.variables ?? '[]') });
  } catch (e) { return handleError(e); }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.category !== undefined) data.category = body.category;
    if (body.content !== undefined) data.content = body.content;
    if (body.systemPrompt !== undefined) data.systemPrompt = body.systemPrompt;
    if (body.temperature !== undefined) data.temperature = body.temperature;
    if (body.maxTokens !== undefined) data.maxTokens = body.maxTokens;
    if (body.nodeType !== undefined) data.nodeType = body.nodeType;
    if (body.variables !== undefined) data.variables = JSON.stringify(body.variables);
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);
    const tpl = await db.promptTemplate.update({ where: { id }, data });
    return success(tpl);
  } catch (e) { return handleError(e); }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const tpl = await db.promptTemplate.findUnique({ where: { id } });
    if (!tpl) throw NotFound('Template not found');
    if (tpl.isBuiltin) return success({ error: 'Cannot delete built-in template' }, 400);
    await db.promptTemplate.delete({ where: { id } });
    return success({ deleted: true });
  } catch (e) { return handleError(e); }
}
