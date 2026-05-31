'use client';

import {
  LiveKpiStrip,
  StatusDistribution,
  TopPerformers,
  NetworkChart,
  SystemHealth,
  ActivityTimeline,
  ConnectionHeatmap,
  FormulaGrid,
  QuickActions,
  CostOverview,
  ApprovalPanel,
} from '@/features/dashboard';
import { useDashboardData } from '@/features/dashboard/hooks/use-dashboard-data';
import type { CostData } from '@/features/dashboard/types';

const EMPTY_COST: CostData = { totals: { inputTokens: 0, outputTokens: 0, totalTokens: 0, totalCost: 0, callCount: 0 }, byModel: [], dailyTrend: [] };

export default function DashboardPage() {
  const { data } = useDashboardData();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-end justify-between">
        <LiveKpiStrip />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <StatusDistribution />
        </div>
        <div className="lg:col-span-2">
          <TopPerformers />
        </div>
      </div>

      <NetworkChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SystemHealth />
        <CostOverview data={data?.cost ?? EMPTY_COST} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityTimeline />
        <ApprovalPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConnectionHeatmap />
        <FormulaGrid />
      </div>
    </div>
  );
}
