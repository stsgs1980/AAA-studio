import { db } from '@/lib/db';
import { handleError, created, paginate } from '@/lib/api-error';
import { skillCreateSchema, paginationSchema } from '@/lib/validations';

/** Generate URL-safe slug from name with uniqueness check */
async function generateSlug(name: string): Promise<string> {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = base || 'skill';
  let suffix = 1;
  while (await db.skill.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

/** Parse JSON string fields for API response */
function parseSkillFields(s: Record<string, unknown>) {
  return {
    ...s,
    inputSchema: JSON.parse(s.inputSchema as string),
    outputSchema: JSON.parse(s.outputSchema as string),
    tags: JSON.parse(s.tags as string),
    triggers: JSON.parse(s.triggers as string),
    standardIds: JSON.parse(s.standardIds as string),
    dependencies: JSON.parse(s.dependencies as string),
    annotations: JSON.parse(s.annotations as string),
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = paginationSchema.parse(Object.fromEntries(url.searchParams));
    const total = await db.skill.count();
    const skills = await db.skill.findMany({
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { updatedAt: 'desc' },
    });
    return paginate(skills.map(parseSkillFields), total, query.page, query.pageSize);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = skillCreateSchema.parse(await request.json());
    const slug = body.slug || await generateSlug(body.name);
    const skill = await db.skill.create({
      data: {
        name: body.name,
        slug,
        version: body.version ?? '1.0.0',
        skillId: body.skillId ?? '',
        category: body.category ?? 'general',
        description: body.description ?? '',
        longDescription: body.longDescription ?? '',
        inputSchema: JSON.stringify(body.inputSchema ?? {}),
        outputSchema: JSON.stringify(body.outputSchema ?? {}),
        code: body.code ?? '',
        tests: body.tests ?? '',
        tags: JSON.stringify(body.tags ?? []),
        triggers: JSON.stringify(body.triggers ?? []),
        standardIds: JSON.stringify(body.standardIds ?? []),
        compatibility: body.compatibility ?? 'both',
        dependencies: JSON.stringify(body.dependencies ?? []),
        annotations: JSON.stringify(body.annotations ?? {}),
        author: body.author ?? '',
        license: body.license ?? 'MIT',
      },
    });
    return created(parseSkillFields(skill));
  } catch (error) {
    return handleError(error);
  }
}
