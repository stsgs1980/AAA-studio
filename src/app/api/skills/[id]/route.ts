import { db } from '@/lib/db';
import { handleError, success, Conflict } from '@/lib/api-error';
import { skillUpdateSchema } from '@/lib/validations';
import { parseSkillFields } from '@/lib/skill-export/parse-skill';

type Params = { params: Promise<{ id: string }> };

/** Map Zod-validated body fields to Prisma data, serializing JSON fields */
function buildUpdateData(body: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const jsonFields = ['inputSchema', 'outputSchema', 'tags', 'triggers', 'standardIds', 'dependencies', 'annotations'];
  const stringFields = ['name', 'slug', 'version', 'skillId', 'category', 'description', 'longDescription', 'code', 'tests', 'compatibility', 'author', 'license'];
  for (const f of stringFields) { if (body[f] != null) data[f] = body[f]; }
  for (const f of jsonFields) { if (body[f] != null) data[f] = JSON.stringify(body[f]); }
  return data;
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = skillUpdateSchema.parse(await request.json());
    const data = buildUpdateData(body as Record<string, unknown>);
    // If name changed but slug not provided, regenerate slug
    if (data.name && !data.slug) {
      const base = (data.name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const existing = await db.skill.findFirst({ where: { slug: { startsWith: base }, id: { not: id } } });
      data.slug = existing ? `${base}-${Date.now()}` : base;
    }
    const skill = await db.skill.update({ where: { id }, data });
    return success(parseSkillFields(skill));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const agents = await db.agent.findMany({ select: { id: true, name: true, skills: true } });
    const linked = agents.filter(a => JSON.parse(a.skills).includes(id));
    if (linked.length > 0) throw Conflict(`Cannot delete: referenced by ${linked.length} agent(s)`);
    await db.skill.delete({ where: { id } });
    return success({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
