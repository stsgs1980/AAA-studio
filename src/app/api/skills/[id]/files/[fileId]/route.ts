import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';
import { z } from 'zod';

type Params = { params: Promise<{ id: string; fileId: string }> };

const fileUpdateSchema = z.object({
  path: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  language: z.enum([
    'typescript', 'javascript', 'python', 'json',
    'yaml', 'markdown', 'text', 'bash',
  ]).optional(),
  role: z.enum([
    'entry', 'code', 'test', 'config', 'doc', 'schema',
  ]).optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * GET /api/skills/[id]/files/[fileId]
 * Get a single file.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id, fileId } = await params;
    const file = await db.skillFile.findFirst({
      where: { id: fileId, skillId: id },
    });
    if (!file) throw NotFound('File not found');
    return success(file);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/skills/[id]/files/[fileId]
 * Update a file (content, path, language, role, order).
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id, fileId } = await params;
    const body = fileUpdateSchema.parse(await request.json());

    const existing = await db.skillFile.findFirst({
      where: { id: fileId, skillId: id },
    });
    if (!existing) throw NotFound('File not found');

    const data: Record<string, unknown> = {};
    if (body.path != null) data.path = body.path;
    if (body.content != null) data.content = body.content;
    if (body.language != null) data.language = body.language;
    if (body.role != null) data.role = body.role;
    if (body.order != null) data.order = body.order;

    const file = await db.skillFile.update({
      where: { id: fileId },
      data,
    });
    return success(file);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/skills/[id]/files/[fileId]
 * Remove a file from a skill.
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id, fileId } = await params;
    const existing = await db.skillFile.findFirst({
      where: { id: fileId, skillId: id },
    });
    if (!existing) throw NotFound('File not found');

    await db.skillFile.delete({ where: { id: fileId } });
    return success({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
