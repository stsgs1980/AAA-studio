'use client'

import { useDashboardData } from '../hooks/use-dashboard-data'
import { useLanguage } from '@/lib/i18n/language-context'

const GROUP_COLORS = [
  'var(--chart-cyan-300)', 'var(--chart-cyan-400)', 'var(--chart-cyan-500)', 'var(--chart-cyan-600)',
  'var(--chart-cyan-700)', 'var(--chart-cyan-800)', 'var(--chart-cyan-900)', 'var(--chart-navy-deep)',
]

function heatColor(val: number, maxVal: number): string {
  if (val === 0) return 'var(--muted)'
  const intensity = Math.min(val / maxVal, 1)
  return `rgba(6, ${Math.round(10 + 172 * intensity)}, ${Math.round(15 + 197 * intensity)}, ${0.15 + intensity * 0.75})`
}

function abbreviate(label: string): string {
  return label.slice(0, 3).toUpperCase()
}

export function ConnectionHeatmap() {
  const { data } = useDashboardData()
  const { groups, density, maxDensity } = data.heatmap
  const { t } = useLanguage()

  if (groups.length === 0) {
    return (
      <div className="rounded-[10px] bg-card border border-border p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
          {t.dashboard['Connection Heatmap']}
        </h3>
        <p className="text-[11px] mb-4 text-muted-foreground">
          {t.dashboard['Parent-child connections by agent group']}
        </p>
        <p className="text-sm text-muted-foreground py-8 text-center">{t.dashboard['No connections yet']}</p>
      </div>
    )
  }

  const size = groups.length

  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
        {t.dashboard['Connection Heatmap']}
      </h3>
      <p className="text-[11px] mb-4 text-muted-foreground">
        {t.dashboard['Parent-child connections by agent group']}
      </p>

      <div className="grid gap-[2px] w-full max-w-[400px]"
        style={{
          gridTemplateColumns: `32px repeat(${size}, 1fr)`,
          gridTemplateRows: `24px repeat(${size}, 1fr)`,
        }}>
        <div />

        {groups.map((g, i) => (
          <div key={g} className="flex items-center justify-center text-[9px] overflow-hidden whitespace-nowrap"
            style={{ color: GROUP_COLORS[i % GROUP_COLORS.length] }}
            title={g}>
            {abbreviate(g)}
          </div>
        ))}

        {density.map((row, ri) => (
          <div key={ri} className="contents">
            <div className="flex items-center justify-end pr-1 text-[9px] overflow-hidden whitespace-nowrap"
              style={{ color: GROUP_COLORS[ri % GROUP_COLORS.length] }}
              title={groups[ri]}>
              {abbreviate(groups[ri])}
            </div>

            {row.map((val, ci) => {
              const isDiag = ri === ci
              return (
                <div key={ci}
                  className="rounded-[3px] min-h-[32px] cursor-default transition-transform duration-150 hover:scale-115 hover:z-2"
                  style={{
                    background: isDiag ? 'var(--muted)' : heatColor(val, maxDensity),
                    border: isDiag ? '1px solid var(--border)' : 'none',
                  }}
                  title={isDiag
                    ? `${groups[ri]} ${t.dashboard['(self)']}`
                    : `${groups[ri]} -> ${groups[ci]}: ${val}`}
                  onMouseEnter={(e) => {
                    if (!isDiag) {
                      ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 8px rgba(6,182,212,0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
