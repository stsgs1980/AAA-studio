export interface KpiData {
  label: string
  value: string
  suffix?: string
  mono?: boolean
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' }
  trendSub?: string
  badge?: string
  sparkData?: number[]
}

export interface StatusSegment {
  label: string
  count: number
  color: string
}

export interface Performer {
  name: string
  group: string  // roleGroup from API, displayed as group for UI compat
  score: number
  tasks: number
  dotColor: string
}

export interface TimelineEvent {
  time: string
  agents: string[]
  summary: string
  details: string
}

export interface HealthMetric {
  label: string
  value: string
  percent?: number
  status: 'ok' | 'warning'
  hasBar?: boolean
  isConnected?: boolean
  isTime?: boolean
}

export interface FormulaRow {
  name: string
  agents: string
  category: string
}

// --- API response types ---
export interface DashboardData {
  agents: { total: number; active: number; idle: number; draft: number }
  executions: {
    total: number; completed: number; failed: number; running: number
    successRate: number
  }
  avgDuration: number | null
  statusGroups: { label: string; count: number }[]
  topPerformers: { name: string; group: string; roleGroup?: string; tasks: number; avgDuration: number }[]
  healthMetrics: HealthMetric[]
  timeline: {
    id: string; time: string; agent: string; group: string  // roleGroup
    status: string; duration: number | null; tokensUsed: number | null
  }[]
  networkChart: {
    hourlyLabels: string[]
    apiCalls: number[]
    failures: number[]
    peak: number
    avg: number
  }
  heatmap: {
    groups: string[]
    density: number[][]
    maxDensity: number
  }
  formulaRows: FormulaRow[]
  meta: { skills: number; pipelines: number }
}
