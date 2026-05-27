'use client'

import { STATUS_DISTRIBUTION } from '../data/constants'

const RADIUS = 60
const STROKE = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function StatusDistribution() {
  const total = STATUS_DISTRIBUTION.reduce((s, d) => s + d.count, 0)
  let offset = 0

  return (
    <div className="rounded-lg border border-border bg-card p-4 lg:col-span-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Agent Status
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg width={160} height={160} viewBox="0 0 160 160">
            {STATUS_DISTRIBUTION.map((seg) => {
              const pct = seg.count / total
              const dash = pct * CIRCUMFERENCE
              const gap = CIRCUMFERENCE - dash
              const segEl = (
                <circle
                  key={seg.label}
                  cx={80}
                  cy={80}
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  transform="rotate(-90 80 80)"
                />
              )
              offset += dash
              return segEl
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{total}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1 w-full">
          {STATUS_DISTRIBUTION.map((seg) => {
            const pct = ((seg.count / total) * 100).toFixed(1)
            return (
              <div key={seg.label} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {seg.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {seg.count} ({pct}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
