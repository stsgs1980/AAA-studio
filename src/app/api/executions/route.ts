import { db } from '@/lib/db';
import { handleError, success } from '@/lib/api-error';
import { paginationSchema } from '@/lib/validations';

/** GET /api/executions -- unified list of all execution types */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pag = paginationSchema.parse(Object.fromEntries(searchParams));
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (agentId) where.agentId = agentId;
    if (status) where.status = status;

    const [executions, total] = await Promise.all([
      db.agentExecution.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        include: { agent: { select: { id: true, name: true, roleGroup: true, model: true } } },
        skip: (pag.page - 1) * pag.pageSize,
        take: pag.pageSize,
      }),
      db.agentExecution.count({ where }),
    ]);

    const stats = await db.agentExecution.aggregate({
      where: { status: 'completed' },
      _sum: { tokensUsed: true, duration: true },
      _avg: { tokensUsed: true, duration: true },
      _count: true,
    });

    return success({
      executions,
      total,
      page: pag.page,
      pageSize: pag.pageSize,
      stats: {
        totalTokens: stats._sum.tokensUsed ?? 0,
        totalDuration: stats._sum.duration ?? 0,
        avgTokens: Math.round(stats._avg.tokensUsed ?? 0),
        avgDuration: Math.round(stats._avg.duration ?? 0),
        completedCount: stats._count,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
