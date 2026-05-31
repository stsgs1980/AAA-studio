'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useDashboardData } from '../hooks/use-dashboard-data'
import { useLanguage } from '@/lib/i18n/language-context'

const STATUS_ICON: Record<string, { bg: string }> = {
  completed: { bg: 'bg-emerald-500' },
  failed: { bg: 'bg-red-500' },
  running: { bg: 'bg-amber-500' },
  pending: { bg: 'bg-slate-400' },
}

export function ActivityTimeline() {
  const { data } = useDashboardData()
  const events = data.timeline
  const [expanded, setExpanded] = useState<number | null>(null)
  const { t } = useLanguage()

  const toggle = (index: number) => {
    setExpanded((prev) => (prev === index ? null : index))
  }

  if (events.length === 0) {
    return (
      <div className="rounded-[10px] bg-card border border-border p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
          {t.dashboard['Activity Timeline']}
        </h3>
        <p className="text-sm text-muted-foreground py-8 text-center">{t.dashboard['No activity yet']}</p>
      </div>
    )
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
        {t.dashboard['Recent Executions']}
      </h3>

      <div className="flex flex-col max-h-[360px] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(128,128,128,0.2) transparent' }}>
        {events.map((event, i) => {
          const isExpanded = expanded === i
          const icon = STATUS_ICON[event.status] ?? STATUS_ICON.pending
          const dur = event.duration ? `${(event.duration / 1000).toFixed(1)}s` : null
          const tokens = event.tokensUsed ? `${event.tokensUsed} ${t.dashboard.tokens}` : null

          return (
            <div key={event.id}
              className={`flex gap-3 py-3 cursor-pointer transition-colors duration-150 hover:bg-[rgba(6,182,212,0.03)] ${
                i < events.length - 1 ? 'border-b border-border' : ''
              }`}
              onClick={() => toggle(i)}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${icon.bg}`} />

              <span className="text-[12px] shrink-0 pt-0.5 min-w-[44px] text-muted-foreground font-mono">
                {formatTime(event.time)}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-primary">{event.agent}</span>
                  {' '}{t.dashboard.execution}{' '}
                  <span className={`font-medium ${
                    event.status === 'completed' ? 'text-emerald-500'
                    : event.status === 'failed' ? 'text-red-500'
                    : 'text-amber-500'
                  }`}>
                    {event.status}
                  </span>
                  {dur && <span className="text-muted-foreground"> in {dur}</span>}
                </p>
                <div className="overflow-hidden transition-all duration-300 ease-out"
                  style={{
                    maxHeight: isExpanded ? '100px' : '0',
                    opacity: isExpanded ? 1 : 0,
                    marginTop: isExpanded ? '8px' : '0',
                  }}>
                  <div className="text-[12px] leading-relaxed p-2 px-3 rounded-md bg-muted border-l-2 border-cyan-500 text-muted-foreground">
                    {t.dashboard['Group:']} {event.group}
                    {dur && <span className="ml-2">{t.dashboard['Duration:']} {dur}</span>}
                    {tokens && <span className="ml-2">{t.dashboard['Tokens:']} {tokens}</span>}
                  </div>
                </div>
              </div>

              <ChevronRight className="h-2.5 w-2.5 shrink-0 pt-1 text-muted-foreground transition-transform duration-200"
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
