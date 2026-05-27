'use client'

import { ChevronUp, ChevronDown, Check } from 'lucide-react'
import { MiniSparkline } from './mini-sparkline'
import { AnimatedCounter } from './animated-counter'
import type { KpiData } from '../types'

interface KpiCardProps {
  data: KpiData
}

export function KpiCard({ data }: KpiCardProps) {
  const numericValue = parseFloat(data.value.replace(/,/g, ''))
  const showAnimated = !isNaN(numericValue) && numericValue > 0 && !data.value.includes('/')

  return (
    <div className="group rounded-[10px] bg-card border border-border p-5 relative overflow-hidden transition-all duration-200 hover:-translate-y-px">
      {/* Top accent line on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />

      {/* Label */}
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {data.label}
      </p>

      {/* Value */}
      <div className="mt-2 flex items-baseline gap-1">
        {showAnimated ? (
          <span className="text-3xl font-bold text-foreground">
            <AnimatedCounter target={numericValue} decimals={data.value.includes('.') ? 1 : 0} />
          </span>
        ) : (
          <span className="text-3xl font-bold text-foreground">
            {data.value}
          </span>
        )}
        {data.suffix && (
          <span className="text-base font-normal text-muted-foreground">
            {data.suffix}
          </span>
        )}
      </div>

      {/* Meta section */}
      <div className="flex items-center gap-2 mt-3">
        {data.trend && (
          <>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
              {data.trend.direction === 'up' ? (
                <ChevronUp className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <ChevronDown className="h-3 w-3" strokeWidth={2.5} />
              )}
              {data.trend.value}
            </span>
            {data.trendSub && (
              <span className="text-xs text-muted-foreground">{data.trendSub}</span>
            )}
          </>
        )}

        {data.badge && (
          <span className="text-[11px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 bg-emerald-500/10 text-emerald-500">
            <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
            {data.badge}
          </span>
        )}

        {data.sparkData && (
          <div className="flex-1 h-7">
            <MiniSparkline data={[...data.sparkData]} color="#06B6D4" />
          </div>
        )}
      </div>
    </div>
  )
}
