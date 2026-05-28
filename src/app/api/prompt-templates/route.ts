import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const templates = await db.promptTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(templates.map((t) => ({ ...t, tags: JSON.parse(t.tags), variables: JSON.parse(t.variables) })));
  } catch (error) {
    console.error('[GET /api/prompt-templates]', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, content, variables, framework, tags } = body;
    if (!name?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }
    const template = await db.promptTemplate.create({
      data: { name: name.trim(), category: category ?? 'general', content, variables: JSON.stringify(variables ?? []), framework: framework ?? null, tags: JSON.stringify(tags ?? []) },
    });
    return NextResponse.json({ ...template, tags: JSON.parse(template.tags), variables: JSON.parse(template.variables) }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/prompt-templates]', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
