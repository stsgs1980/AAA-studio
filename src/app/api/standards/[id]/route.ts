import { db } from '@/lib/db';
import { handleError, success, Conflict } from '@/lib/api-error';
import { standardUpdateSchema } from '@/lib/validations';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = standardUpdateSchema.parse(await request.json());
    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = body.name;
    if (body.category != null) data.category = body.category;
    if (body.description != null) data.description = body.description;
    if (body.rules != null) data.rules = JSON.stringify(body.rules);
    if (body.severity != null) data.severity = body.severity;
    if (body.version != null) data.version = body.version;
    const standard = await db.standard.update({ where: { id }, data });
    return success({ ...standard, rules: JSON.parse(standard.rules) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    // Cross-ref check: find Skills that reference this standard
    const skills = await db.skill.findMany({ select: { id: true, name: true, standardIds: true } });
    const linked = skills.filter(s => JSON.parse(s.standardIds).includes(id));
    if (linked.length > 0) {
      throw Conflict(`Cannot delete: referenced by ${linked.length} skill(s)`);
    }
    // Cross-ref check: find Agents that reference this standard
    const agents = await db.agent.findMany({ select: { id: true, name: true, standards: true } });
    const linkedAgents = agents.filter(a => JSON.parse(a.standards).includes(id));
    if (linkedAgents.length > 0) {
      throw Conflict(`Cannot delete: referenced by ${linkedAgents.length} agent(s)`);
    }
    await db.standard.delete({ where: { id } });
    return success({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
