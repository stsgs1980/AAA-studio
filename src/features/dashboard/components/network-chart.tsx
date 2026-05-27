'use client'

import { useState, useEffect } from 'react'

// Hard-coded chart data matching wireframe SVG coordinates
const API_POINTS = [60,130, 130,190, 200,175, 270,155, 340,120, 410,100, 480,80, 550,65, 620,90, 690,110, 760,85, 830,70, 860,75]
const WS_POINTS = [60,218, 130,210, 200,200, 270,185, 340,165, 410,148, 480,135, 550,120, 620,145, 690,158, 760,140, 830,128, 860,132]

const X_LABELS = [
  { x: 60, label: '00:00' },
  { x: 200, label: '04:00' },
  { x: 340, label: '08:00' },
  { x: 480, label: '12:00' },
  { x: 620, label: '16:00' },
  { x: 760, label: '20:00' },
  { x: 860, label: '24:00' },
]

const Y_LABELS = [
  { y: 30, label: '200' },
  { y: 82, label: '150' },
  { y: 134, label: '100' },
  { y: 186, label: '50' },
  { y: 238, label: '0' },
]

const GRID_LINES = [
  { y: 26 },
  { y: 78 },
  { y: 130 },
  { y: 182 },
  { y: 234 },
]

function pairsToPoints(pairs: number[]): string {
  return pairs.reduce((acc, _, i, arr) => {
    if (i % 2 === 0 && i + 1 < arr.length) acc.push(`${arr[i]},${arr[i + 1]}`)
    return acc
  }, [] as string[]).join(' ')
}

function pairsToArea(pairs: number[]): string {
  const points = pairsToPoints(pairs)
  const lastX = pairs[pairs.length - 2]
  const firstX = pairs[0]
  return `M${firstX},234 L${points} L${lastX},234 Z`
}

export function NetworkChart() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  const apiPointsStr = pairsToPoints(API_POINTS)
  const wsPointsStr = pairsToPoints(WS_POINTS)
  const apiArea = pairsToArea(API_POINTS)
  const wsArea = pairsToArea(WS_POINTS)

  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Network Activity
        </h3>
        <span className="text-xs text-muted-foreground">Last 24 hours</span>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-[3px] rounded-sm bg-cyan-500" />
          API Calls
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2.5 h-[3px] rounded-sm bg-cyan-400" />
          WS Events
        </div>
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 900 260" width="100%" preserveAspectRatio="xMidYMid meet"
          className="min-w-[600px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <defs>
            <linearGradient id="gradApi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradWs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis labels */}
          {Y_LABELS.map((yl) => (
            <text key={yl.y} x="30" y={yl.y} fill="var(--muted-foreground)" fontSize="10" textAnchor="end">
              {yl.label}
            </text>
          ))}

          {/* Grid lines */}
          {GRID_LINES.map((gl) => (
            <line key={gl.y} x1="40" y1={gl.y} x2="880" y2={gl.y} stroke="var(--border)" strokeWidth="1" />
          ))}

          {/* X-axis labels */}
          {X_LABELS.map((xl) => (
            <text key={xl.x} x={xl.x} y="254" fill="var(--muted-foreground)" fontSize="10" textAnchor="middle">
              {xl.label}
            </text>
          ))}

          {/* API area + line */}
          <path d={apiArea} fill="url(#gradApi)"
            style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease' }} />
          <polyline points={apiPointsStr} fill="none" stroke="#06B6D4" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{
              strokeDasharray: animated ? 'none' : '2000',
              strokeDashoffset: animated ? '0' : '2000',
              transition: 'stroke-dashoffset 1.5s ease',
            }} />

          {/* WS area + line */}
          <path d={wsArea} fill="url(#gradWs)"
            style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }} />
          <polyline points={wsPointsStr} fill="none" stroke="#22D3EE" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{
              strokeDasharray: '4 3',
              opacity: animated ? 1 : 0,
              transition: 'opacity 0.8s ease 0.3s',
            }} />

          {/* Data dots */}
          <circle cx="480" cy="80" r="3" fill="#06B6D4" opacity="0.7" />
          <circle cx="830" cy="70" r="3" fill="#06B6D4" opacity="0.7" />
        </svg>
      </div>
    </div>
  )
}
