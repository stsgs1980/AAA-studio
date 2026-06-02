import { db } from '@/lib/db';
import { handleError, created, paginate } from '@/lib/api-error';
import { workflowCreateSchema, paginationSchema } from '@/lib/validations';

/** GET /api/workflows -- list workflows */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pag = paginationSchema.parse(Object.fromEntries(searchParams));
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [workflows, total] = await Promise.all([
      db.workflow.findMany({
        where,
        include: { _count: { select: { steps: true, executions: true } } },
        orderBy: { updatedAt: 'desc' },
        skip: (pag.page - 1) * pag.pageSize,
        take: pag.pageSize,
      }),
      db.workflow.count({ where }),
    ]);

    return paginate(workflows, total, pag.page, pag.pageSize);
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/workflows -- create workflow */
export async function POST(request: Request) {
  try {
    const body = workflowCreateSchema.parse(await request.json());

    const workflow = await db.workflow.create({
      data: {
        name: body.name,
        description: body.description ?? '',
        triggerType: body.triggerType ?? 'manual',
        triggerConfig: JSON.stringify(body.triggerConfig ?? {}),
        tags: body.tags ?? '',
      },
    });

    return created(workflow);
  } catch (error) {
    return handleError(error);
  }
}
