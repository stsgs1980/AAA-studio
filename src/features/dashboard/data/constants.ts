export const KPI_DATA = [
  { label: "Active Agents", value: "21", suffix: "/26", change: "+3", changeType: "positive" as const, sparkData: [14, 16, 15, 18, 17, 19, 21] },
  { label: "Tasks Completed", value: "1,847", suffix: "", change: "+12.5%", changeType: "positive" as const, sparkData: [120, 150, 130, 180, 170, 200, 220] },
  { label: "Success Rate", value: "97.3", suffix: "%", change: "+0.8%", changeType: "positive" as const, sparkData: [95, 96, 95.5, 96.5, 97, 96.8, 97.3] },
  { label: "Avg Response", value: "1.2", suffix: "s", change: "-0.3s", changeType: "positive" as const, sparkData: [2.1, 1.9, 1.8, 1.7, 1.5, 1.3, 1.2] },
] as const

export const STATUS_DISTRIBUTION = [
  { label: "Active", count: 21, color: "rgb(34 197 94)" },
  { label: "Idle", count: 3, color: "rgb(234 179 8)" },
  { label: "Paused", count: 1, color: "rgb(249 115 22)" },
  { label: "Standby", count: 1, color: "rgb(100 116 139)" },
] as const

export const TOP_PERFORMERS = [
  { name: "Alpha-7", group: "STR", score: 98, tasks: 342, color: "rgb(6 182 212)" },
  { name: "Nova-12", group: "PLN", score: 95, tasks: 289, color: "rgb(6 182 212)" },
  { name: "Echo-3", group: "RES", score: 92, tasks: 256, color: "rgb(6 182 212)" },
  { name: "Flux-19", group: "COD", score: 88, tasks: 198, color: "rgb(6 182 212)" },
  { name: "Drift-8", group: "REV", score: 85, tasks: 176, color: "rgb(6 182 212)" },
] as const

export const NETWORK_DATA = [
  12, 18, 15, 8, 5, 3, 2, 4, 15, 28, 42, 55,
  62, 58, 48, 52, 65, 72, 68, 55, 42, 35, 25, 18,
] as const

export const HEALTH_METRICS = [
  { label: "CPU Usage", value: 34, maxValue: 100, unit: "%", status: "healthy" as const },
  { label: "Memory", value: 62, maxValue: 100, unit: "%", status: "healthy" as const },
  { label: "Database", value: 28, maxValue: 100, unit: "%", status: "healthy" as const },
  { label: "Network I/O", value: 45, maxValue: 100, unit: "%", status: "healthy" as const },
] as const

export const ACTIVITY_EVENTS = [
  { time: "2m ago", agent: "Alpha-7", group: "STR", description: "Completed batch processing pipeline", color: "rgb(6 182 212)" },
  { time: "5m ago", agent: "Nova-12", group: "PLN", description: "Generated strategic plan for Q3 targets", color: "rgb(6 182 212)" },
  { time: "8m ago", agent: "Echo-3", group: "RES", description: "Resolved 3 research queries in parallel", color: "rgb(6 182 212)" },
  { time: "12m ago", agent: "Flux-19", group: "COD", description: "Deployed hotfix to auth service module", color: "rgb(6 182 212)" },
  { time: "18m ago", agent: "Drift-8", group: "REV", description: "Quality audit passed with 99.2% score", color: "rgb(6 182 212)" },
  { time: "25m ago", agent: "Matrix-1", group: "SPC", description: "Orchestrated cross-team sync workflow", color: "rgb(6 182 212)" },
] as const

export const HEATMAP_DATA: number[][] = [
  [0, 5, 3, 2, 1, 0, 0, 0],
  [5, 0, 7, 4, 3, 2, 1, 0],
  [3, 7, 0, 6, 5, 3, 2, 1],
  [2, 4, 6, 0, 8, 4, 3, 2],
  [1, 3, 5, 8, 0, 6, 4, 3],
  [0, 2, 3, 4, 6, 0, 7, 5],
  [0, 1, 2, 3, 4, 7, 0, 6],
  [0, 0, 1, 2, 3, 5, 6, 0],
]

export const GROUP_LABELS = ["STR", "PLN", "RES", "COD", "REV", "TST", "DEP", "SPC"] as const
