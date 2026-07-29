'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DashboardData } from '../types'
import { useRealtimeEvent } from '@/lib/domain/ws/use-realtime'

const EMPTY: DashboardData = {
  agents: { total: 0, active: 0, idle: 0, draft: 0 },
  executions: { total: 0, completed: 0, failed: 0, running: 0, successRate: 0 },
  avgDuration: null,
  statusGroups: [],
  topPerformers: [],
  healthMetrics: [],
  timeline: [],
  networkChart: { hourlyLabels: [], apiCalls: [], failures: [], peak: 1, avg: 0 },
  heatmap: { groups: [], density: [[]], maxDensity: 1 },
  formulaRows: [],
  meta: { skills: 0, pipelines: 0 },
  cost: { totals: { inputTokens: 0, outputTokens: 0, totalTokens: 0, totalCost: 0, callCount: 0 }, byModel: [], dailyTrend: [] },
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(EMPTY)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) return
      const json: Partial<DashboardData> = await res.json()
      setData({
        ...EMPTY,
        ...json,
        statusGroups: json.statusGroups ?? EMPTY.statusGroups,
        topPerformers: json.topPerformers ?? EMPTY.topPerformers,
        healthMetrics: json.healthMetrics ?? EMPTY.healthMetrics,
        timeline: json.timeline ?? EMPTY.timeline,
        networkChart: { ...EMPTY.networkChart, ...json.networkChart },
        heatmap: { ...EMPTY.heatmap, ...json.heatmap },
        formulaRows: json.formulaRows ?? EMPTY.formulaRows,
        cost: {
          ...EMPTY.cost,
          ...json.cost,
          totals: { ...EMPTY.cost.totals, ...(json.cost?.totals ?? {}) },
          byModel: json.cost?.byModel ?? EMPTY.cost.byModel,
          dailyTrend: json.cost?.dailyTrend ?? EMPTY.cost.dailyTrend,
        },
      })
    } catch {
      /* keep empty */
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + 30s polling fallback
  useEffect(() => {
    refetch()
    const interval = setInterval(refetch, 30_000)
    return () => clearInterval(interval)
  }, [refetch])

  // Real-time: WS push triggers immediate refresh
  useRealtimeEvent<{ reason: string }>(
    ['dashboard'], 'refresh',
    () => { refetch() },
  )

  return { data, loading, refetch }
}

