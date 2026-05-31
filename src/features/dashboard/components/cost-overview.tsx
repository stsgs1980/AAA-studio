'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import { formatCost } from '@/lib/cost';

interface CostData {
  totals: { inputTokens: number; outputTokens: number; totalTokens: number; totalCost: number; callCount: number };
  byModel: { model: string; cost: number; tokens: number; calls: number }[];
  dailyTrend: { date: string; cost: number; tokens: number }[];
}

export function CostOverview({ data }: { data: CostData }) {
  const { t } = useLanguage();
  const t2 = t.dashboard ?? {};
  const { totals, byModel } = data;

  // SVG mini bar chart for daily trend
  const maxCost = Math.max(...data.dailyTrend.map((d) => d.cost), 0.001);
  const barW = data.dailyTrend.length > 1 ? 100 / data.dailyTrend.length : 100;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t2['Cost Overview'] ?? 'Cost Overview'}</h3>
        <span className="text-xs text-muted-foreground">{totals.callCount} calls</span>
      </div>

      {/* Total + tokens row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{formatCost(totals.totalCost)}</p>
          <p className="text-[10px] text-muted-foreground">{t2['Total Spend'] ?? 'Total Spend'}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{(totals.totalTokens / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-muted-foreground">{t2['Total Tokens'] ?? 'Total Tokens'}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{totals.callCount}</p>
          <p className="text-[10px] text-muted-foreground">{t2['LLM Calls'] ?? 'LLM Calls'}</p>
        </div>
      </div>

      {/* Daily trend sparkline */}
      {data.dailyTrend.length > 1 && (
        <div className="h-16 w-full">
          <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
            {data.dailyTrend.map((d, i) => {
              const h = Math.max((d.cost / maxCost) * 35, 0.5);
              return <rect key={d.date} x={i * barW} y={40 - h} width={barW * 0.8} height={h} rx={1} className="fill-primary/40" />;
            })}
          </svg>
        </div>
      )}

      {/* Model breakdown */}
      {byModel.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{t2['By Model'] ?? 'By Model'}</p>
          {byModel.slice(0, 5).map((m) => {
            const pct = totals.totalCost > 0 ? (m.cost / totals.totalCost) * 100 : 0;
            return (
              <div key={m.model} className="flex items-center gap-2">
                <span className="text-xs text-foreground font-mono truncate min-w-0 flex-1">{m.model}</span>
                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground w-16 text-right">{formatCost(m.cost)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
