import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const collection = await db.knowledgeCollection.findUnique({ where: { id } });
    if (!collection) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const tagsRaw = formData.get('tags') as string | null;

    let content = '';
    let fileType = 'txt';

    if (file) {
      fileType = file.name.split('.').pop()?.toLowerCase() ?? 'txt';
      if (!['txt', 'md', 'pdf', 'docx'].includes(fileType)) {
        return NextResponse.json({ error: `Unsupported file type: ${fileType}` }, { status: 400 });
      }
      content = await file.text();
    } else {
      // Body already consumed by formData — no file case
      content = '';
      fileType = 'txt';
    }

    if (!content.trim() && !file) {
      return NextResponse.json({ error: 'Content or file is required' }, { status: 400 });
    }

    const doc = await db.knowledgeDocument.create({
      data: {
        collectionId: id,
        title: title ?? (file?.name ?? 'Untitled Document'),
        content,
        fileType,
        tags: JSON.stringify(tagsRaw ? tagsRaw.split(',').map((t) => t.trim()) : []),
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('[POST /api/knowledge/:id/documents]', error);
    return NextResponse.json({ error: 'Failed to add document' }, { status: 500 });
  }
}
