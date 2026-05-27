'use client'

import { ACTIVITY_EVENTS } from '../data/constants'

export function ActivityTimeline() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Recent Activity
      </h3>
      <div className="space-y-0">
        {ACTIVITY_EVENTS.map((event, idx) => {
          const isLast = idx === ACTIVITY_EVENTS.length - 1
          return (
            <div key={idx} className="flex gap-3 group">
              <div className="flex flex-col items-center">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1 group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: event.color }}
                />
                {!isLast && (
                  <div className="w-px flex-1 bg-border min-h-6" />
                )}
              </div>
              <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-4'}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {event.time}
                  </span>
                  <span className="text-sm font-semibold text-cyan-500 truncate">
                    {event.agent}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium flex-shrink-0">
                    {event.group}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
