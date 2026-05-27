'use client'

import { useEffect, useState } from 'react'
import { useDashboardData } from '../hooks/use-dashboard-data'
import type { HealthMetric } from '../types'

export function SystemHealth() {
  const { data } = useDashboardData()
  const metrics: HealthMetric[] = data.healthMetrics

  const [widths, setWidths] = useState<number[]>([])

  useEffect(() => {
    setWidths(metrics.map(() => 0))
    const timers = metrics.map((m, i) =>
      setTimeout(() => {
        setWidths((prev) => {
          const next = [...prev]
          next[i] = m.percent ?? 0
          return next
        })
      }, 100 + i * 120)
    )
    return () => timers.forEach(clearTimeout)
  }, [metrics])

  if (metrics.length === 0) {
    return (
      <div className="rounded-[10px] bg-card border border-border p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
          System Health
        </h3>
        <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
        System Health
      </h3>

      <div className="flex flex-col gap-4">
        {metrics.map((metric, i) => (
          <div key={metric.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">{metric.label}</span>
              <span className="text-[13px] font-semibold text-foreground font-mono">
                {metric.value}
              </span>
            </div>

            {metric.hasBar && (
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-muted">
                <div className={`h-full rounded-full transition-all duration-800 ease-out ${
                  metric.status === 'ok' ? 'bg-cyan-500' : 'bg-amber-500'
                }`}
                  style={{
                    width: `${widths[i] ?? 0}%`,
                    transitionDuration: '800ms',
                  }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
