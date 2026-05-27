'use client'

import { useState, useEffect } from 'react'
import { TOP_PERFORMERS } from '../data/constants'

export function TopPerformers() {
  const [barWidths, setBarWidths] = useState<number[]>(Array(5).fill(0))

  useEffect(() => {
    const timer = setTimeout(() => {
      setBarWidths(TOP_PERFORMERS.map((p) => p.score))
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Top Performers
      </h3>
      <div className="space-y-3">
        {TOP_PERFORMERS.map((agent, idx) => (
          <div key={agent.name} className="flex items-center gap-3">
            <span
              className={`text-sm font-bold w-5 text-center flex-shrink-0 ${
                idx === 0
                  ? 'text-yellow-500'
                  : idx === 1
                    ? 'text-slate-300'
                    : idx === 2
                      ? 'text-orange-400'
                      : 'text-muted-foreground'
              }`}
            >
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {agent.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium flex-shrink-0">
                    {agent.group}
                  </span>
                </div>
                <span className="text-sm font-semibold text-cyan-500 flex-shrink-0 ml-2">
                  {agent.score}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{
                    width: `${barWidths[idx]}%`,
                    transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0 w-10 text-right">
              {agent.tasks}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
