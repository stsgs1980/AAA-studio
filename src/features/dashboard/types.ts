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
  group: string
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
