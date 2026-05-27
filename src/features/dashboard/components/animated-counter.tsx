'use client'

import { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  target: number
  duration?: number
  decimals?: number
}

export function AnimatedCounter({
  target,
  duration = 1200,
  decimals = 0,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = null
    let frameId: number
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const progress = Math.min((timestamp - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Number((eased * target).toFixed(decimals)))
      if (progress < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [target, duration, decimals])

  return <>{count}</>
}
