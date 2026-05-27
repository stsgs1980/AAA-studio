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
    <div className="rounded-[10px] p-5 transition-colors duration-200"
      style={{ background: '#0A0A0F', border: '1px solid #27272a' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: '#a1a1aa' }}>Top Performers</h3>

      <div className="flex flex-col">
        {TOP_PERFORMERS.map((agent, i) => (
          <div key={agent.name}
            className="grid grid-cols-[24px_1fr_auto] items-center gap-3 py-2.5 transition-colors duration-150 hover:bg-[rgba(6,182,212,0.03)]"
            style={{ borderBottom: i < TOP_PERFORMERS.length - 1 ? '1px solid #1a1a22' : 'none' }}>
            {/* Rank */}
            <span className="text-xs font-bold text-center" style={{ color: '#52525b' }}>
              {i + 1}
            </span>

            {/* Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: agent.dotColor }} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: '#fafafa' }}>
                  {agent.name}
                </div>
                <div className="text-[11px]" style={{ color: '#52525b' }}>{agent.group}</div>
              </div>
            </div>

            {/* Score area */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a22' }}>
                <div className="h-full rounded-full transition-all duration-600 ease-out"
                  style={{ width: `${barWidths[i]}%`, background: '#06B6D4', transitionDuration: '600ms' }} />
              </div>
              <span className="text-[13px] font-semibold min-w-6 text-right" style={{ color: '#06B6D4' }}>
                {agent.score}
              </span>
              <span className="text-[11px] min-w-[50px] text-right" style={{ color: '#52525b' }}>
                {agent.tasks} tasks
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
