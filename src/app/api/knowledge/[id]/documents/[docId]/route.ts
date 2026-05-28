import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string; docId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { docId } = await params;
    await db.knowledgeDocument.delete({ where: { id: docId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/knowledge/:id/documents/:docId]', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
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
    return NextResponse.json(doc);
  } catch (error) {
    console.error('[PUT /api/knowledge/:id/documents/:docId]', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}
