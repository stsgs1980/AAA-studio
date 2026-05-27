'use client'

import { useState, useEffect, useId } from 'react'

interface MiniSparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
}

export function MiniSparkline({
  data,
  color,
  width = 100,
  height = 28,
}: MiniSparklineProps) {
  const [opacity, setOpacity] = useState(0)
  const gradId = useId()

  useEffect(() => {
    const timer = setTimeout(() => setOpacity(1), 200)
    return () => clearTimeout(timer)
  }, [])

  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return `${x},${y}`
  })

  const areaPath =
    `M0,${height} ` +
    data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - pad - ((v - min) / range) * (height - pad * 2)
        return `L${x},${y}`
      })
      .join(' ') +
    ` L${width},${height} Z`

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ opacity, transition: 'opacity 0.6s ease-out' }}
    >
      <defs>
        <linearGradient id={`spark-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${gradId})`} />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
