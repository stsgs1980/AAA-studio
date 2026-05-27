'use client'

import { useEffect, useState } from 'react'
import { TOP_PERFORMERS } from '../data/constants'

export function TopPerformers() {
  const [barWidths, setBarWidths] = useState<number[]>(TOP_PERFORMERS.map(() => 0))

  useEffect(() => {
    const timers = TOP_PERFORMERS.map((_, i) =>
      setTimeout(() => {
        setBarWidths((prev) => {
          const next = [...prev]
          next[i] = TOP_PERFORMERS[i].score
          return next
        })
      }, 100 + i * 80)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">Top Performers</h3>

      <div className="flex flex-col">
        {TOP_PERFORMERS.map((agent, i) => (
          <div key={agent.name}
            className={`grid grid-cols-[24px_1fr_auto] items-center gap-3 py-2.5 transition-colors duration-150 hover:bg-[rgba(6,182,212,0.03)] ${
              i < TOP_PERFORMERS.length - 1 ? 'border-b border-border' : ''
            }`}>
            {/* Rank */}
            <span className="text-xs font-bold text-center text-muted-foreground">
              {i + 1}
            </span>

            {/* Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: agent.dotColor }} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate text-foreground">
                  {agent.name}
                </div>
                <div className="text-[11px] text-muted-foreground">{agent.group}</div>
              </div>
            </div>

            {/* Score area */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-1.5 rounded-full overflow-hidden bg-muted">
                <div className="h-full rounded-full bg-cyan-500 transition-all duration-800 ease-out"
                  style={{ width: `${barWidths[i]}%`, transitionDuration: '600ms' }} />
              </div>
              <span className="text-[13px] font-semibold min-w-6 text-right text-cyan-500">
                {agent.score}
              </span>
              <span className="text-[11px] min-w-[50px] text-right text-muted-foreground">
                {agent.tasks} tasks
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
