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
    if (body.description != null) data.description = body.description;
    if (body.rules != null) data.rules = JSON.stringify(body.rules);
    if (body.severity != null) data.severity = body.severity;
    if (body.version != null) data.version = body.version;
    const standard = await db.standard.update({ where: { id }, data });
    return NextResponse.json({ ...standard, rules: JSON.parse(standard.rules) });
  } catch (error) {
    console.error('[PUT /api/standards/:id]', error);
    return NextResponse.json({ error: 'Failed to update standard' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.standard.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/standards/:id]', error);
    return NextResponse.json({ error: 'Failed to delete standard' }, { status: 500 });
  }
}
