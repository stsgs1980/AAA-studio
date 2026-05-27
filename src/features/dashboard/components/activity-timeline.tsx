'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { TIMELINE_EVENTS } from '../data/constants'

export function ActivityTimeline() {
  const [expanded, setExpanded] = useState<number | null>(null)

  const toggle = (index: number) => {
    setExpanded((prev) => (prev === index ? null : index))
  }

  return (
    <div className="rounded-[10px] p-5 transition-colors duration-200"
      style={{ background: '#0A0A0F', border: '1px solid #27272a' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: '#a1a1aa' }}>Activity Timeline</h3>

      <div className="flex flex-col max-h-[360px] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {TIMELINE_EVENTS.map((event, i) => {
          const isExpanded = expanded === i
          const agentSpan = (agent: string) =>
            `<span style="color:#06B6D4;font-weight:600">${agent}</span>`

          const summaryHtml = event.agents.reduce((html, agent, j) => {
            if (j === 0) return agentSpan(agent)
            if (j === event.agents.length - 1) return `${html} ${event.summary} ${agentSpan(agent)}`
            return `${html}, ${agentSpan(agent)}`
          }, '')

          return (
            <div key={i}
              className="flex gap-3 py-3 cursor-pointer transition-colors duration-150 hover:bg-[rgba(6,182,212,0.03)]"
              style={{ borderBottom: i < TIMELINE_EVENTS.length - 1 ? '1px solid #1a1a22' : 'none' }}
              onClick={() => toggle(i)}>
              {/* Dot */}
              <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: '#06B6D4' }} />

              {/* Time */}
              <span className="text-[12px] shrink-0 pt-0.5 min-w-[44px]"
                style={{ color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>
                {event.time}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-relaxed" style={{ color: '#a1a1aa' }}
                  dangerouslySetInnerHTML={{ __html: summaryHtml }} />
                <div className="overflow-hidden transition-all duration-300 ease-out"
                  style={{
                    maxHeight: isExpanded ? '100px' : '0',
                    opacity: isExpanded ? 1 : 0,
                    marginTop: isExpanded ? '8px' : '0',
                  }}>
                  <div className="text-[12px] leading-relaxed p-2 px-3 rounded-md"
                    style={{
                      color: '#52525b',
                      background: '#111118',
                      borderLeft: '2px solid #06B6D4',
                    }}>
                    {event.details}
                  </div>
                </div>
              </div>

              {/* Expand icon */}
              <ChevronRight className="h-2.5 w-2.5 shrink-0 pt-1 transition-transform duration-200"
                style={{
                  color: '#52525b',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
