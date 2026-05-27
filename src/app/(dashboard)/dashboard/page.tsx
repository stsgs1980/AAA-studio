import {
  Bot,
  Workflow,
  BookOpen,
  Activity,
  TrendingUp,
  Clock,
  Cpu,
  Zap,
} from "lucide-react";

const kpis = [
  { label: "Active Agents", value: "12", change: "+2", icon: Bot },
  { label: "Active Flows", value: "8", change: "+1", icon: Workflow },
  { label: "Knowledge Docs", value: "156", change: "+24", icon: BookOpen },
  { label: "Executions (24h)", value: "342", change: "+18%", icon: Activity },
  { label: "Success Rate", value: "94.7%", change: "+1.2%", icon: TrendingUp },
  { label: "Avg Latency", value: "1.2s", change: "-0.3s", icon: Clock },
  { label: "Tokens Used", value: "48.2K", change: "+12K", icon: Cpu },
  { label: "Skills Active", value: "23", change: "+3", icon: Zap },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your multi-agent system
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  {kpi.label}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold">{kpi.value}</span>
                <span className="text-xs text-emerald-600 font-medium">
                  {kpi.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content area - placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Agent Performance</h3>
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Chart placeholder — Phase 4
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Recent Executions</h3>
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Activity timeline — Phase 4
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4">System Architecture</h3>
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Architecture diagram — Phase 4
        </div>
      </div>
    </div>
  );
}
