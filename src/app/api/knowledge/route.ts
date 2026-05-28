import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const collections = await db.knowledgeCollection.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { documents: true } } },
    });
    return NextResponse.json(collections);
  } catch (error) {
    console.error('[GET /api/knowledge]', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, tags } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const collection = await db.knowledgeCollection.create({
      data: {
        name: name.trim(),
        description: description ?? '',
        tags: JSON.stringify(tags ?? []),
      },
    });
    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('[POST /api/knowledge]', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
