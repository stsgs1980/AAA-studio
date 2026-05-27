'use client'

import { ArrowUp, ArrowDown } from 'lucide-react'
import { MiniSparkline } from './mini-sparkline'
import { KPI_DATA } from '../data/constants'

export function KpiStrip() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_DATA.map((kpi) => {
        const isPositive = kpi.changeType === 'positive'
        return (
          <div
            key={kpi.label}
            className="rounded-lg border border-border bg-card p-4 relative overflow-hidden"
          >
            <p className="text-xs text-muted-foreground font-medium">
              {kpi.label}
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                {kpi.value}
              </span>
              {kpi.suffix && (
                <span className="text-sm text-muted-foreground">
                  {kpi.suffix}
                </span>
              )}
            </div>
            <div
              className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span>{kpi.change}</span>
            </div>
            {kpi.sparkData && (
              <div className="absolute bottom-2 right-2 opacity-60">
                <MiniSparkline
                  data={[...kpi.sparkData]}
                  color="rgb(6 182 212)"
                  width={64}
                  height={28}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
