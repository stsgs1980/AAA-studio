import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = body.name;
    if (body.category != null) data.category = body.category;
    if (body.content != null) data.content = body.content;
    if (body.variables != null) data.variables = JSON.stringify(body.variables);
    if (body.framework != null) data.framework = body.framework;
    if (body.tags != null) data.tags = JSON.stringify(body.tags);
    const template = await db.promptTemplate.update({ where: { id }, data });
    return NextResponse.json({ ...template, tags: JSON.parse(template.tags), variables: JSON.parse(template.variables) });
  } catch (error) {
    console.error('[PUT /api/prompt-templates/:id]', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.promptTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/prompt-templates/:id]', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
