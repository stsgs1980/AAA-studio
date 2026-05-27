'use client';

import { useState, useEffect } from 'react';
import { KpiCard } from './kpi-card';
import type { KpiData } from '../types';

interface DashboardApiResponse {
  agents: { total: number; active: number; idle: number; draft: number };
  executions: { total: number; completed: number; failed: number; successRate: number };
  avgDuration: number | null;
}

function toKpis(data: DashboardApiResponse | null): KpiData[] {
  if (!data) {
    return [
      { label: 'Active Agents', value: '0', suffix: '/0' },
      { label: 'Tasks Completed', value: '0', trend: { value: '0', direction: 'neutral' }, trendSub: 'no data yet' },
      { label: 'Success Rate', value: '0', suffix: '%' },
      { label: 'Avg Response', value: '0', suffix: 'ms' },
    ];
  }
  const a = data.agents;
  const e = data.executions;
  const dur = data.avgDuration;
  return [
    { label: 'Active Agents', value: String(a.active), suffix: `/${a.total}` },
    { label: 'Tasks Completed', value: String(e.completed), trend: { value: String(e.failed), direction: e.failed > 0 ? 'up' : 'neutral' }, trendSub: e.failed > 0 ? `${e.failed} failed` : 'no failures' },
    { label: 'Success Rate', value: String(e.successRate), suffix: '%', badge: e.successRate >= 90 ? 'Healthy' : e.successRate >= 50 ? 'Warning' : 'Critical' },
    { label: 'Avg Response', value: dur ? String(Math.round(dur / 100) / 10) : '0', suffix: dur ? 's' : 'ms', mono: true },
  ];
}

export function KpiStrip() {
  return <LiveKpiStrip />;
}

export function LiveKpiStrip() {
  const [kpis, setKpis] = useState<KpiData[]>(toKpis(null));

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: DashboardApiResponse) => { if (d) setKpis(toKpis(d)); })
      .catch(() => { /* fallback static */ });
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} data={kpi} />
      ))}
    </div>
  );
}
