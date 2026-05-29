import { db } from "@/lib/db";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = body.name;
    if (body.category != null) data.category = body.category;
    if (body.description != null) data.description = body.description;
    if (body.inputSchema != null) data.inputSchema = JSON.stringify(body.inputSchema);
    if (body.outputSchema != null) data.outputSchema = JSON.stringify(body.outputSchema);
    if (body.code != null) data.code = body.code;
    if (body.tests != null) data.tests = body.tests;
    if (body.tags != null) data.tags = JSON.stringify(body.tags);
    if (body.standardIds != null) data.standardIds = JSON.stringify(body.standardIds);
    const skill = await db.skill.update({ where: { id }, data });
    return NextResponse.json({
      ...skill,
      inputSchema: JSON.parse(skill.inputSchema),
      outputSchema: JSON.parse(skill.outputSchema),
      tags: JSON.parse(skill.tags),
      standardIds: JSON.parse(skill.standardIds),
    });
  } catch (error) {
    console.error("[PUT /api/skills/:id]", error);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    // Cross-ref check: find Agents that reference this skill
    const agents = await db.agent.findMany({ select: { id: true, name: true, skills: true } });
    const linked = agents.filter(a => JSON.parse(a.skills).includes(id));
    if (linked.length > 0) {
      return NextResponse.json({
        error: `Cannot delete: referenced by ${linked.length} agent(s)`,
        referencedBy: linked.map(a => ({ id: a.id, name: a.name })),
      }, { status: 409 });
    }
    await db.skill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/skills/:id]", error);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
