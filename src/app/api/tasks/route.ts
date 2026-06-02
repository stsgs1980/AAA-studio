import { db } from '@/lib/db';
import { handleError, success, created } from '@/lib/api-error';
import { taskCreateSchema, paginationSchema } from '@/lib/validations';

/** GET /api/tasks -- list tasks with filters and status counts */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pag = paginationSchema.parse(Object.fromEntries(searchParams));
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');
    const priority = searchParams.get('priority');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (agentId) where.agentId = agentId;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: { agent: { select: { id: true, name: true, roleGroup: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (pag.page - 1) * pag.pageSize,
        take: pag.pageSize,
      }),
      db.task.count({ where }),
    ]);

    const counts = await db.task.groupBy({
      by: ['status'],
      _count: true,
      where: agentId ? { agentId } : undefined,
    });

    return success({
      tasks,
      counts: Object.fromEntries(counts.map((c) => [c.status, c._count])),
      total,
      page: pag.page,
      pageSize: pag.pageSize,
    });
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/tasks -- create a new task */
export async function POST(request: Request) {
  try {
    const body = taskCreateSchema.parse(await request.json());

    if (body.agentId) {
      const agent = await db.agent.findUnique({ where: { id: body.agentId } });
      if (!agent) throw new Error('Agent not found');
    }

    const task = await db.task.create({
      data: {
        title: body.title,
        description: body.description ?? '',
        status: body.status ?? 'pending',
        priority: body.priority ?? 'medium',
        agentId: body.agentId ?? null,
      },
      include: { agent: { select: { id: true, name: true, roleGroup: true } } },
    });

    return created(task);
  } catch (error) {
    return handleError(error);
  }
}
