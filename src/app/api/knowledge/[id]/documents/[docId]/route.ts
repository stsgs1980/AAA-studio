import { db } from '@/lib/db';
import { handleError, success } from '@/lib/api-error';

type Params = { params: Promise<{ id: string; docId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { docId } = await params;
    await db.knowledgeDocument.delete({ where: { id: docId } });
    return success({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { docId } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.title != null) data.title = body.title;
    if (body.content != null) data.content = body.content;
    if (body.tags != null) data.tags = JSON.stringify(body.tags);
    const doc = await db.knowledgeDocument.update({ where: { id: docId }, data });
    return success(doc);
  } catch (error) {
    return handleError(error);
  }
}
