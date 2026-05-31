import { db } from '@/lib/db';

export interface CostDashboardData {
  totals: { inputTokens: number; outputTokens: number; totalTokens: number; totalCost: number; callCount: number };
  byModel: { model: string; cost: number; tokens: number; calls: number }[];
  dailyTrend: { date: string; cost: number; tokens: number }[];
}

export async function fetchCostData(): Promise<CostDashboardData> {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const where = { timestamp: { gte: since7d } };

  const totals = await db.costRecord.aggregate({
    where,
    _sum: { inputTokens: true, outputTokens: true, totalTokens: true, costUsd: true },
    _count: true,
  });

  const byModel = await db.costRecord.groupBy({
    by: ['model'],
    where,
    _sum: { costUsd: true, totalTokens: true },
    _count: true,
    orderBy: { _sum: { costUsd: 'desc' } },
  });

  const dailyTrend: { date: string; cost: number; tokens: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const agg = await db.costRecord.aggregate({
      where: { timestamp: { gte: dayStart, lt: dayEnd } },
      _sum: { costUsd: true, totalTokens: true },
    });
    dailyTrend.push({
      date: dayStart.toISOString().slice(0, 10),
      cost: agg._sum.costUsd ?? 0,
      tokens: agg._sum.totalTokens ?? 0,
    });
  }

  return {
    totals: {
      inputTokens: totals._sum.inputTokens ?? 0,
      outputTokens: totals._sum.outputTokens ?? 0,
      totalTokens: totals._sum.totalTokens ?? 0,
      totalCost: totals._sum.costUsd ?? 0,
      callCount: totals._count,
    },
    byModel: byModel.map((m) => ({
      model: m.model, cost: m._sum.costUsd ?? 0, tokens: m._sum.totalTokens ?? 0, calls: m._count,
    })),
    dailyTrend,
  };
}
