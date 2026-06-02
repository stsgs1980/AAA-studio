import { db } from '@/lib/db';
import { handleError, success } from '@/lib/api-error';

type Range = '24h' | '7d' | '30d' | 'all';

function sinceFrom(range: Range): Date | undefined {
  const now = Date.now();
  if (range === '24h') return new Date(now - 24 * 60 * 60 * 1000);
  if (range === '7d') return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (range === '30d') return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return undefined;
}

/** GET /api/cost — aggregated cost analytics from CostRecord */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const range = (url.searchParams.get('range') ?? '7d') as Range;
    const since = sinceFrom(range);
    const where = since ? { timestamp: { gte: since } } : {};

    // Total aggregates
    const totals = await db.costRecord.aggregate({
      where,
      _sum: { inputTokens: true, outputTokens: true, totalTokens: true, costUsd: true },
      _count: true,
    });

    // Breakdown by model
    const byModel = await db.costRecord.groupBy({
      by: ['model'],
      where,
      _sum: { costUsd: true, totalTokens: true },
      _count: true,
      orderBy: { _sum: { costUsd: 'desc' } },
    });

    // Breakdown by execution type
    const byType = await db.costRecord.groupBy({
      by: ['executionType'],
      where,
      _sum: { costUsd: true, totalTokens: true },
      _count: true,
    });

    // Daily trend (last N days)
    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const dailyTrend: { date: string; cost: number; tokens: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayWhere = { timestamp: { gte: dayStart, lt: dayEnd } };
      const agg = await db.costRecord.aggregate({ where: dayWhere, _sum: { costUsd: true, totalTokens: true } });
      dailyTrend.push({
        date: dayStart.toISOString().slice(0, 10),
        cost: agg._sum.costUsd ?? 0,
        tokens: agg._sum.totalTokens ?? 0,
      });
    }

    return success({
      totals: {
        inputTokens: totals._sum.inputTokens ?? 0,
        outputTokens: totals._sum.outputTokens ?? 0,
        totalTokens: totals._sum.totalTokens ?? 0,
        totalCost: totals._sum.costUsd ?? 0,
        callCount: totals._count,
      },
      byModel: byModel.map((m) => ({
        model: m.model,
        cost: m._sum.costUsd ?? 0,
        tokens: m._sum.totalTokens ?? 0,
        calls: m._count,
      })),
      byType: byType.map((t) => ({
        type: t.executionType,
        cost: t._sum.costUsd ?? 0,
        tokens: t._sum.totalTokens ?? 0,
        calls: t._count,
      })),
      dailyTrend,
    });
  } catch (error) {
    return handleError(error);
  }
}
