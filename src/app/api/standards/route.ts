import { db } from '@/lib/db';
import { handleError, created, paginate } from '@/lib/api-error';
import { standardCreateSchema, paginationSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = paginationSchema.parse(Object.fromEntries(url.searchParams));
    const total = await db.standard.count();
    const standards = await db.standard.findMany({
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { updatedAt: 'desc' },
    });
    return paginate(
      standards.map((s) => ({ ...s, rules: JSON.parse(s.rules) })),
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
    const body = standardCreateSchema.parse(await request.json());
    const standard = await db.standard.create({
      data: {
        name: body.name,
        category: body.category ?? 'general',
        description: body.description ?? '',
        rules: JSON.stringify(body.rules ?? []),
        severity: body.severity ?? 'info',
        version: body.version ?? '1.0.0',
      },
    });
    return created({ ...standard, rules: JSON.parse(standard.rules) });
  } catch (error) {
    return handleError(error);
  }
}
