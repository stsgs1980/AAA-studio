'use client'

import { useState, useEffect, useId } from 'react'
import { NETWORK_DATA } from '../data/constants'

const W = 700
const H = 200
const PAD_L = 36
const PAD_R = 16
const PAD_T = 16
const PAD_B = 28

export function NetworkChart() {
  const [animated, setAnimated] = useState(false)
  const gradId = useId()

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const data = [...NETWORK_DATA]
  const max = Math.max(...data)
  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const points = data.map((v, i) => ({
    x: PAD_L + (i / (data.length - 1)) * plotW,
    y: PAD_T + plotH - (v / max) * plotH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD_T + plotH} L${PAD_L},${PAD_T + plotH} Z`

  const yTicks = [0, 25, 50, 75, 100]
  const gridLines = yTicks.map((t) => ({
    y: PAD_T + plotH - (t / max) * plotH,
    label: t.toString(),
  }))

  const sorted = [...data].sort((a, b) => b - a)
  const peaks = sorted.slice(0, 3)
  const peakIndices = peaks.map(
    (v) => data.findIndex((d) => d === v)
  )

  const avg = (data.reduce((s, v) => s + v, 0) / data.length).toFixed(1)
  const current = data[data.length - 1]
  const peak = data[peakIndices[0]]

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Network Activity (24h)
      </h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{
            opacity: animated ? 1 : 0,
            transition: 'opacity 0.6s ease-out',
          }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(6 182 212)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(6 182 212)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {gridLines.map((g) => (
            <g key={g.y}>
              <line x1={PAD_L} y1={g.y} x2={W - PAD_R} y2={g.y} className="stroke-muted/30" strokeWidth="1" />
              <text x={PAD_L - 8} y={g.y + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
                {g.label}
              </text>
            </g>
          ))}
          {[0, 6, 12, 18, 23].map((h) => {
            const x = PAD_L + (h / 23) * plotW
            return (
              <text key={h} x={x} y={H - 4} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {h.toString().padStart(2, '0')}:00
              </text>
            )
          })}
          <path d={areaPath} fill={`url(#${gradId})`} />
          <path d={linePath} fill="none" stroke="rgb(6 182 212)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {peakIndices.map((idx) => {
            const p = points[idx]
            return (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="6" fill="rgb(6 182 212)" opacity="0.2">
                  <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={p.x} cy={p.y} r="3" fill="rgb(6 182 212)" />
              </g>
            )
          })}
        </svg>
      </div>
      <div className="flex gap-4 mt-3">
        {[
          { label: 'Peak', value: peak },
          { label: 'Average', value: avg },
          { label: 'Current', value: current },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{b.label}</span>
            <span className="text-sm font-semibold text-foreground">{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
