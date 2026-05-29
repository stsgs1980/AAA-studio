'use client'

import { AnimatedCounter } from './animated-counter'
import { useDashboardData } from '../hooks/use-dashboard-data'
import { useState } from 'react'

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--chart-cyan-500)',
  inactive: 'var(--chart-yellow-500)',
  draft: 'var(--chart-zinc-600)',
  specialist: 'var(--chart-cyan-400)',
  strategy: 'var(--chart-cyan-300)',
}

function statusColor(label: string): string {
  const lower = label.toLowerCase()
  for (const [key, color] of Object.entries(STATUS_COLORS)) {
    if (lower.includes(key)) return color
  }
  return 'var(--chart-slate-400)'
}

export function StatusDistribution() {
  const { data } = useDashboardData()
  const [hovered, setHovered] = useState<string | null>(null)

  const groups = data.statusGroups
  if (groups.length === 0) {
    return (
      <div className="rounded-[10px] bg-card border border-border p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
          Status Distribution
        </h3>
        <p className="text-sm text-muted-foreground py-8 text-center">No agents yet</p>
      </div>
    )
  }

  const total = groups.reduce((s, g) => s + g.count, 0)
  const radius = 70
  const stroke = 24
  const circumference = 2 * Math.PI * radius

  let runningOffset = 0
  const segments = groups.map((item) => {
    const color = statusColor(item.label)
    const segLen = (item.count / total) * circumference
    const segment = {
      ...item,
      color,
      segLen,
      offset: runningOffset,
      pct: ((item.count / total) * 100).toFixed(1),
    }
    runningOffset += segLen
    return segment
  })

  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
        Agent Groups
      </h3>

      <div className="flex flex-col items-center">
        <div className="relative w-[200px] h-[200px] mx-auto mb-5">
          <svg viewBox="0 0 200 200" width="200" height="200">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="100" cy="100" r={radius}
                fill="none" stroke={seg.color} strokeWidth={stroke}
                strokeDasharray={`${seg.segLen} ${circumference - seg.segLen}`}
                strokeDashoffset={-seg.offset}
                transform="rotate(-90 100 100)"
                className="cursor-pointer transition-all duration-200"
                style={{
                  opacity: hovered && hovered !== seg.label ? 0.3 : 1,
                  filter: hovered === seg.label ? 'brightness(1.4)' : 'none',
                }}
                onMouseEnter={() => setHovered(seg.label)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-bold text-foreground">
              <AnimatedCounter target={total} />
            </span>
            <span className="text-[11px] text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="grid grid-cols-2 w-full" style={{ gap: '8px 24px' }}>
          {segments.map((seg) => (
            <div key={seg.label}
              className={`flex items-center gap-2 text-[13px] transition-opacity duration-200 ${
                hovered && hovered !== seg.label ? 'text-muted-foreground' : 'text-foreground'
              }`}
              onMouseEnter={() => setHovered(seg.label)}
              onMouseLeave={() => setHovered(null)}>
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
              <span>{seg.label}</span>
              <span className="ml-auto font-semibold text-foreground">{seg.count}</span>
              <span className="text-[11px] w-9 text-right text-muted-foreground">{seg.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
