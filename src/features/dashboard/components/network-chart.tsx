'use client'

import { useState, useEffect } from 'react'
import { useDashboardData } from '../hooks/use-dashboard-data'

export function NetworkChart() {
  const { data } = useDashboardData()
  const chart = data.networkChart
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  const { hourlyLabels, apiCalls, failures, peak, avg } = chart

  if (hourlyLabels.length === 0) {
    return (
      <div className="rounded-[10px] bg-card border border-border p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
          Execution Activity
        </h3>
        <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
      </div>
    )
  }

  const W = 900
  const H = 260
  const PAD_L = 40
  const PAD_R = 20
  const PAD_T = 10
  const PAD_B = 26
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const maxVal = Math.max(peak, 1)
  const toX = (i: number) => PAD_L + (i / Math.max(hourlyLabels.length - 1, 1)) * plotW
  const toY = (v: number) => PAD_T + plotH - (v / maxVal) * plotH

  const gridLines = 5
  const gridYs = Array.from({ length: gridLines + 1 }, (_, i) =>
    PAD_T + (i / gridLines) * plotH
  )
  const gridLabels = Array.from({ length: gridLines + 1 }, (_, i) =>
    String(Math.round(maxVal * (1 - i / gridLines)))
  )

  const apiPoints = apiCalls.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')

  const failPoints = failures.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')

  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Execution Activity (24h)
        </h3>
        <div className="flex gap-4 text-[11px] text-muted-foreground">
          <span>Peak: {peak}</span>
          <span>Avg: {avg}/h</span>
        </div>
      </div>

      <div className="flex gap-6 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-[3px] rounded-sm bg-emerald-500" />
          Total Executions
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-[3px] rounded-sm bg-red-500" />
          Failures
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet"
          className="min-w-[600px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <defs>
            <linearGradient id="gradApi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradFail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridYs.map((gy, i) => (
            <line key={i} x1={PAD_L} y1={gy} x2={W - PAD_R} y2={gy}
              stroke="var(--border)" strokeWidth="1" />
          ))}
          {gridLabels.map((label, i) => (
            <text key={i} x={PAD_L - 6} y={gridYs[i] + 4} fill="var(--muted-foreground)"
              fontSize="10" textAnchor="end">{label}</text>
          ))}

          {hourlyLabels.filter((_, i) => i % 4 === 0).map((label, i) => {
            const idx = i * 4
            return (
              <text key={idx} x={toX(idx)} y={H - 4} fill="var(--muted-foreground)"
                fontSize="10" textAnchor="middle">{label}</text>
            )
          })}

          {apiCalls.length > 0 && (
            <>
              <path
                d={`M${toX(0)},${toY(0)} L${apiPoints} L${toX(apiCalls.length - 1)},${toY(0)} Z`}
                fill="url(#gradApi)"
                style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease' }} />
              <polyline points={apiPoints} fill="none" stroke="#10B981" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                  strokeDasharray: animated ? 'none' : '2000',
                  strokeDashoffset: animated ? '0' : '2000',
                  transition: 'stroke-dashoffset 1.5s ease',
                }} />
            </>
          )}

          {failures.length > 0 && (
            <>
              <path
                d={`M${toX(0)},${toY(0)} L${failPoints} L${toX(failures.length - 1)},${toY(0)} Z`}
                fill="url(#gradFail)"
                style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }} />
              <polyline points={failPoints} fill="none" stroke="#EF4444" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="4 3"
                style={{
                  opacity: animated ? 1 : 0,
                  transition: 'opacity 0.8s ease 0.3s',
                }} />
            </>
          )}
        </svg>
      </div>
    </div>
  )
}
