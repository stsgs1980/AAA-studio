'use client'

import { useEffect, useState } from 'react'
import { HEALTH_METRICS } from '../data/constants'

export function SystemHealth() {
  const [widths, setWidths] = useState<number[]>(HEALTH_METRICS.map(() => 0))

  useEffect(() => {
    const timers = HEALTH_METRICS.map((m, i) =>
      setTimeout(() => {
        setWidths((prev) => {
          const next = [...prev]
          next[i] = m.percent ?? 0
          return next
        })
      }, 100 + i * 120)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="rounded-[10px] p-5 transition-colors duration-200"
      style={{ background: '#0A0A0F', border: '1px solid #27272a' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: '#a1a1aa' }}>System Health</h3>

      <div className="flex flex-col gap-4">
        {HEALTH_METRICS.map((metric, i) => (
          <div key={metric.label} className="flex flex-col gap-1.5">
            {/* Label row */}
            <div className="flex items-center justify-between">
              <span className="text-[13px]" style={{ color: '#a1a1aa' }}>{metric.label}</span>

              {metric.isConnected ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                  <span className="text-[13px] font-semibold" style={{ color: '#22c55e' }}>
                    {metric.value}
                  </span>
                </span>
              ) : metric.isTime ? (
                <span className="text-[12px]" style={{ color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>
                  {metric.value}
                </span>
              ) : metric.hasBar ? (
                <span className="text-[13px] font-semibold" style={{ color: '#fafafa', fontFamily: "'JetBrains Mono', monospace" }}>
                  {metric.value}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                  <span className="text-[13px] font-semibold" style={{ color: '#fafafa', fontFamily: "'JetBrains Mono', monospace" }}>
                    {metric.value}
                  </span>
                </span>
              )}
            </div>

            {/* Progress bar */}
            {metric.hasBar && (
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a22' }}>
                <div className="h-full rounded-full transition-all duration-800 ease-out"
                  style={{
                    width: `${widths[i]}%`,
                    background: '#06B6D4',
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
