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
} from '@/features/dashboard';

export default function DashboardPage() {
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
        <ActivityTimeline />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConnectionHeatmap />
        <FormulaGrid />
      </div>
    </div>
  );
}
