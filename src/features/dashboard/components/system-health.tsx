'use client'

import { useState, useEffect } from 'react'
import { HEALTH_METRICS } from '../data/constants'

export function SystemHealth() {
  const [metricWidths, setMetricWidths] = useState<number[]>(Array(4).fill(0))

  useEffect(() => {
    const timer = setTimeout(() => {
      setMetricWidths(HEALTH_METRICS.map((m) => (m.value / m.maxValue) * 100))
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  const getBarColor = (pct: number) => {
    if (pct > 80) return 'bg-red-500'
    if (pct > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        System Health
      </h3>
      <div className="space-y-4">
        {HEALTH_METRICS.map((metric, idx) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">
                {metric.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {metric.value}{metric.unit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor(metric.value)}`}
                style={{
                  width: `${metricWidths[idx]}%`,
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              WebSocket Connected
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
            0.02% Error Rate
          </span>
        </div>
      </div>
    </div>
  )
}
