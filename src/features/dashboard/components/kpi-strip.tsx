'use client';

import { KpiCard } from './kpi-card';
import { useDashboardData } from '../hooks/use-dashboard-data';
import { useLanguage } from '@/lib/i18n/language-context';
import type { KpiData } from '../types';

function useKpis(data: NonNullable<ReturnType<typeof useDashboardData>['data']>): KpiData[] {
  const { t } = useLanguage();
  const a = data.agents;
  const e = data.executions;
  const dur = data.avgDuration;
  return [
    {
      label: t.dashboard['Active Agents'],
      value: String(a.active),
      suffix: `/${a.total}`,
    },
    {
      label: t.dashboard['Tasks Running'],
      value: String(e.running),
      trend: { value: String(e.completed), direction: e.completed > 0 ? 'up' : 'neutral' },
      trendSub: `${e.completed} ${t.dashboard.completed}`,
    },
    {
      label: t.dashboard['Success Rate'],
      value: String(e.successRate),
      suffix: '%',
      badge: e.successRate >= 80 ? t.dashboard.Healthy : e.successRate >= 50 ? t.dashboard.Warning : t.dashboard.Critical,
    },
    {
      label: t.dashboard['Avg Response'],
      value: dur ? String(Math.round(dur / 100) / 10) : '--',
      suffix: dur ? 's' : '',
      mono: true,
    },
  ];
}

export function LiveKpiStrip() {
  const { data } = useDashboardData();
  const kpis = useKpis(data);

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
