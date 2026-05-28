import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const standards = await db.standard.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(standards.map((s) => ({ ...s, rules: JSON.parse(s.rules) })));
  } catch (error) {
    console.error('[GET /api/standards]', error);
    return NextResponse.json({ error: 'Failed to fetch standards' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, description, rules, severity, version } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const standard = await db.standard.create({
      data: { name: name.trim(), category: category ?? 'general', description: description ?? '', rules: JSON.stringify(rules ?? []), severity: severity ?? 'info', version: version ?? '1.0.0' },
    });
    return NextResponse.json({ ...standard, rules: JSON.parse(standard.rules) }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/standards]', error);
    return NextResponse.json({ error: 'Failed to create standard' }, { status: 500 });
  }
}
