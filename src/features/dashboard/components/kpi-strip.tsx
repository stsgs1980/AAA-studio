'use client';

import { KpiCard } from './kpi-card';
import { useDashboardData } from '../hooks/use-dashboard-data';
import type { KpiData } from '../types';

function toKpis(data: NonNullable<ReturnType<typeof useDashboardData>['data']>): KpiData[] {
  const a = data.agents;
  const e = data.executions;
  const dur = data.avgDuration;
  return [
    {
      label: 'Active Agents',
      value: String(a.active),
      suffix: `/${a.total}`,
    },
    {
      label: 'Tasks Running',
      value: String(e.running),
      trend: { value: String(e.completed), direction: e.completed > 0 ? 'up' : 'neutral' },
      trendSub: `${e.completed} completed`,
    },
    {
      label: 'Success Rate',
      value: String(e.successRate),
      suffix: '%',
      badge: e.successRate >= 80 ? 'Healthy' : e.successRate >= 50 ? 'Warning' : 'Critical',
    },
    {
      label: 'Avg Response',
      value: dur ? String(Math.round(dur / 100) / 10) : '--',
      suffix: dur ? 's' : '',
      mono: true,
    },
  ];
}

export function LiveKpiStrip() {
  const { data } = useDashboardData();
  const kpis = toKpis(data);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} data={kpi} />
      ))}
    </div>
  );
}

export function KpiStrip() {
  return <LiveKpiStrip />;
}
