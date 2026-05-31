'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DashboardData } from '../types'

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
      const json: DashboardData = await res.json()
      setData(json)
    } catch {
      /* keep empty */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
    const interval = setInterval(refetch, 30_000)
    return () => clearInterval(interval)
  }, [refetch])

  return { data, loading, refetch }
}
