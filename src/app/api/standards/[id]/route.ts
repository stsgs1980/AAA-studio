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
    // Cross-ref check: find Skills that reference this standard
    const skills = await db.skill.findMany({ select: { id: true, name: true, standardIds: true } });
    const linked = skills.filter(s => JSON.parse(s.standardIds).includes(id));
    if (linked.length > 0) {
      return NextResponse.json({
        error: `Cannot delete: referenced by ${linked.length} skill(s)`,
        referencedBy: linked.map(s => ({ id: s.id, name: s.name })),
      }, { status: 409 });
    }
    // Cross-ref check: find Agents that reference this standard
    const agents = await db.agent.findMany({ select: { id: true, name: true, standards: true } });
    const linkedAgents = agents.filter(a => JSON.parse(a.standards).includes(id));
    if (linkedAgents.length > 0) {
      return NextResponse.json({
        error: `Cannot delete: referenced by ${linkedAgents.length} agent(s)`,
        referencedBy: linkedAgents.map(a => ({ id: a.id, name: a.name })),
      }, { status: 409 });
    }
    await db.standard.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/standards/:id]', error);
    return NextResponse.json({ error: 'Failed to delete standard' }, { status: 500 });
  }
}
