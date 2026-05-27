import type {
  KpiData,
  StatusSegment,
  Performer,
  TimelineEvent,
  HealthMetric,
  FormulaRow,
} from '../types'

export const KPI_DATA: KpiData[] = [
  {
    label: 'Active Agents',
    value: '21',
    suffix: '/26',
    sparkData: [14, 16, 15, 18, 17, 19, 21, 20, 18, 19, 21],
  },
  {
    label: 'Tasks Running',
    value: '8',
    trend: { value: '+3', direction: 'up' },
    trendSub: 'vs last hour',
  },
  {
    label: 'Avg Response',
    value: '1.2',
    suffix: 's',
    mono: true,
    trend: { value: '-0.3s', direction: 'down' },
    trendSub: 'improving',
  },
  {
    label: 'System Uptime',
    value: '99.7',
    suffix: '%',
    badge: 'Healthy',
  },
]

export const STATUS_DISTRIBUTION: StatusSegment[] = [
  { label: 'Active', count: 21, color: '#06B6D4' },
  { label: 'Idle', count: 3, color: '#eab308' },
  { label: 'Paused', count: 1, color: '#f97316' },
  { label: 'Standby', count: 1, color: '#52525b' },
]

export const TOP_PERFORMERS: Performer[] = [
  { name: 'Architect', group: 'Strategy', score: 94, tasks: 12, dotColor: '#67E8F9' },
  { name: 'Inspector', group: 'Control', score: 91, tasks: 10, dotColor: '#06B6D4' },
  { name: 'Coordinator', group: 'Tactics', score: 88, tasks: 9, dotColor: '#22D3EE' },
  { name: 'Coder', group: 'Execution', score: 85, tasks: 11, dotColor: '#0891B2' },
  { name: 'Archivist', group: 'Memory', score: 82, tasks: 7, dotColor: '#0E7490' },
]

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    time: '14:32',
    agents: ['Coordinator', 'Coder'],
    summary: 'delegated task to',
    details:
      'Coordinator used ReAct formula to analyze task complexity, then delegated code generation to Coder agent in the Execution group. Task #1847 started.',
  },
  {
    time: '14:28',
    agents: ['Inspector'],
    summary: 'completed validation cycle',
    details:
      'Inspector completed a full validation cycle on the latest deployment artifacts. All 14 checks passed. No anomalies detected in the Control group pipeline.',
  },
  {
    time: '14:25',
    agents: ['Architect'],
    summary: 'revised strategy plan',
    details:
      'Architect revised the multi-agent strategy plan, adjusting resource allocation for the Execution group and adding a new CoT-based reasoning pathway for the Tactics group.',
  },
  {
    time: '14:20',
    agents: ['Guard'],
    summary: 'blocked unauthorized access',
    details:
      'Guard agent blocked an unauthorized access attempt from an external source targeting the Communication group. Source IP has been logged and flagged for review.',
  },
  {
    time: '14:15',
    agents: ['Observer'],
    summary: 'detected anomaly in Execution group',
    details:
      'Observer detected an anomaly in the Execution group: Executor-B response time increased 40% above baseline. Diagnostician has been notified for investigation.',
  },
]

export const HEALTH_METRICS: HealthMetric[] = [
  { label: 'CPU Usage', value: '34%', percent: 34, status: 'ok', hasBar: true },
  { label: 'Memory', value: '2.1 / 8 GB', percent: 26.25, status: 'ok', hasBar: true },
  { label: 'Database', value: '45ms avg', status: 'ok' },
  { label: 'WebSocket', value: 'Connected', status: 'ok', isConnected: true },
  { label: 'Last Error', value: '2h ago', status: 'warning', isTime: true },
]

export const FORMULA_DATA: FormulaRow[] = [
  { name: 'CoT', agents: '3 agents', category: 'Foundational' },
  { name: 'ReAct', agents: '4 agents', category: 'Planning' },
  { name: 'SelfConsistency', agents: '2 agents', category: 'Verification' },
  { name: 'MoA', agents: '1 agent', category: 'Advanced' },
  { name: 'ToT', agents: '2 agents', category: 'Foundational' },
]

export const HEATMAP_GROUPS = [
  'STR', 'TAC', 'CTR', 'EXE', 'MEM', 'MON', 'COM', 'LRN',
] as const

export const HEATMAP_GROUP_FULL = [
  'Strategy', 'Tactics', 'Control', 'Execution', 'Memory', 'Monitoring', 'Communication', 'Learning',
] as const

export const HEATMAP_GROUP_COLORS = [
  '#67E8F9', '#22D3EE', '#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63', '#1E3A5F',
] as const

export const HEATMAP_DENSITY: number[][] = [
  [-1, 9, 5, 4, 3, 4, 5, 6],
  [9, -1, 6, 7, 3, 3, 6, 4],
  [5, 6, -1, 9, 4, 5, 4, 3],
  [4, 7, 9, -1, 5, 6, 5, 4],
  [3, 3, 4, 5, -1, 4, 3, 5],
  [4, 3, 5, 6, 4, -1, 4, 3],
  [5, 6, 4, 5, 3, 4, -1, 4],
  [6, 4, 3, 4, 5, 3, 4, -1],
]
