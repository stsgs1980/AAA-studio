import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const collection = await db.knowledgeCollection.findUnique({
      where: { id },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      ...collection,
      tags: JSON.parse(collection.tags),
      documents: collection.documents.map((d) => ({ ...d, tags: JSON.parse(d.tags) })),
    });
  } catch (error) {
    console.error('[GET /api/knowledge/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = body.name;
    if (body.description != null) data.description = body.description;
    if (body.tags != null) data.tags = JSON.stringify(body.tags);
    const collection = await db.knowledgeCollection.update({ where: { id }, data });
    return NextResponse.json(collection);
  } catch (error) {
    console.error('[PUT /api/knowledge/:id]', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.knowledgeCollection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/knowledge/:id]', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
