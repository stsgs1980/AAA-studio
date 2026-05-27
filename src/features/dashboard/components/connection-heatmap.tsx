'use client'

import {
  HEATMAP_DENSITY,
  HEATMAP_GROUPS,
  HEATMAP_GROUP_FULL,
  HEATMAP_GROUP_COLORS,
} from '../data/constants'

function heatColor(val: number): string {
  if (val < 0) return 'var(--muted)'
  const intensity = val / 10
  return `rgba(6, ${Math.round(10 + 172 * intensity)}, ${Math.round(15 + 197 * intensity)}, ${0.15 + intensity * 0.75})`
}

export function ConnectionHeatmap() {
  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">Connection Heatmap</h3>
      <p className="text-[11px] mb-4 text-muted-foreground">
        Inter-group connection density (darker = more connections)
      </p>

      <div className="grid gap-[2px] w-full max-w-[380px]"
        style={{ gridTemplateColumns: '32px repeat(8, 1fr)', gridTemplateRows: '24px repeat(8, 1fr)' }}>
        {/* Corner */}
        <div />

        {/* Column headers */}
        {HEATMAP_GROUPS.map((g, i) => (
          <div key={g} className="flex items-center justify-center text-[9px] overflow-hidden whitespace-nowrap"
            style={{ color: HEATMAP_GROUP_COLORS[i] }} title={HEATMAP_GROUP_FULL[i]}>
            {g}
          </div>
        ))}

        {/* Data rows */}
        {HEATMAP_DENSITY.map((row, ri) => (
          <div key={ri} className="contents">
            {/* Row label */}
            <div className="flex items-center justify-end pr-1 text-[9px] overflow-hidden whitespace-nowrap"
              style={{ color: HEATMAP_GROUP_COLORS[ri] }} title={HEATMAP_GROUP_FULL[ri]}>
              {HEATMAP_GROUPS[ri]}
            </div>

            {/* Cells */}
            {row.map((val, ci) => {
              const isDiag = val < 0
              return (
                <div key={ci}
                  className="rounded-[3px] min-h-[32px] cursor-default transition-transform duration-150 hover:scale-115 hover:z-2"
                  style={{
                    background: isDiag ? 'var(--muted)' : heatColor(val),
                    border: isDiag ? '1px solid var(--border)' : 'none',
                    boxShadow: 'none',
                  }}
                  title={isDiag
                    ? `${HEATMAP_GROUP_FULL[ri]} (self)`
                    : `${HEATMAP_GROUP_FULL[ri]} ↔ ${HEATMAP_GROUP_FULL[ci]}: ${val}/10`}
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
