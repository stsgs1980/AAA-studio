import { db } from '@/lib/db';
import { handleError, success, created, paginate } from '@/lib/api-error';
import { skillCreateSchema, paginationSchema } from '@/lib/validations';

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
    return paginate(
      skills.map((s) => ({
        ...s,
        inputSchema: JSON.parse(s.inputSchema),
        outputSchema: JSON.parse(s.outputSchema),
        tags: JSON.parse(s.tags),
        standardIds: JSON.parse(s.standardIds),
      })),
      total,
      query.page,
      query.pageSize,
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = skillCreateSchema.parse(await request.json());
    const skill = await db.skill.create({
      data: {
        name: body.name,
        category: body.category ?? 'general',
        description: body.description ?? '',
        inputSchema: JSON.stringify(body.inputSchema ?? {}),
        outputSchema: JSON.stringify(body.outputSchema ?? {}),
        code: body.code ?? '',
        tests: body.tests ?? '',
        tags: JSON.stringify(body.tags ?? []),
        standardIds: JSON.stringify(body.standardIds ?? []),
      },
    });
    return created({
      ...skill,
      inputSchema: JSON.parse(skill.inputSchema),
      outputSchema: JSON.parse(skill.outputSchema),
      tags: JSON.parse(skill.tags),
      standardIds: JSON.parse(skill.standardIds),
    });
  } catch (error) {
    return handleError(error);
  }
}
