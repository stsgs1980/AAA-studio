'use client'

import { useEffect, useState } from 'react'
import { useDashboardData } from '../hooks/use-dashboard-data'

const DOT_COLORS = ['var(--chart-cyan-300)', 'var(--chart-cyan-500)', 'var(--chart-cyan-400)', 'var(--chart-cyan-600)', 'var(--chart-cyan-700)']

export function TopPerformers() {
  const { data } = useDashboardData()
  const performers = data.topPerformers

  const [barWidths, setBarWidths] = useState<number[]>([])

  useEffect(() => {
    setBarWidths(performers.map(() => 0))
    const timers = performers.map((_, i) =>
      setTimeout(() => {
        setBarWidths((prev) => {
          const next = [...prev]
          const max = performers[0]?.tasks ?? 1
          next[i] = Math.round((performers[i].tasks / max) * 100)
          return next
        })
      }, 100 + i * 80)
    )
    return () => timers.forEach(clearTimeout)
  }, [performers])

  if (performers.length === 0) {
    return (
      <div className="rounded-[10px] bg-card border border-border p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
          Top Performers
        </h3>
        <p className="text-sm text-muted-foreground py-8 text-center">No executions yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
        Top Performers
      </h3>

      <div className="flex flex-col">
        {performers.map((agent, i) => (
          <div key={agent.name}
            className={`grid grid-cols-[24px_1fr_auto] items-center gap-3 py-2.5 transition-colors duration-150 hover:bg-[rgba(6,182,212,0.03)] ${
              i < performers.length - 1 ? 'border-b border-border' : ''
            }`}>
            <span className="text-xs font-bold text-center text-muted-foreground">
              {i + 1}
            </span>

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0"
                style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate text-foreground">
                  {agent.name}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {agent.group} &middot; {agent.avgDuration}s avg
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 h-1.5 rounded-full overflow-hidden bg-muted">
                <div className="h-full rounded-full bg-cyan-500 transition-all duration-800 ease-out"
                  style={{
                    width: `${barWidths[i] ?? 0}%`,
                    transitionDuration: '600ms',
                  }} />
              </div>
              <span className="text-[13px] font-semibold min-w-6 text-right text-cyan-700">
                {agent.tasks}
              </span>
              <span className="text-[11px] min-w-[42px] text-right text-muted-foreground">
                tasks
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
