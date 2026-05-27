'use client'

import {
  KpiStrip,
  StatusDistribution,
  TopPerformers,
  NetworkChart,
  SystemHealth,
  ActivityTimeline,
  ConnectionHeatmap,
} from '@/features/dashboard'

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <KpiStrip />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <StatusDistribution />
        <TopPerformers />
      </div>

      <NetworkChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SystemHealth />
        <ActivityTimeline />
      </div>

      <ConnectionHeatmap />
    </div>
  )
}
