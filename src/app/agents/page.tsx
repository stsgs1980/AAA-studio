import { Bot } from "lucide-react";

export default function AgentManagementPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">
          Agent Management
        </h1>
      </div>
      <p className="text-muted-foreground">
        Create, configure and manage AI agents with custom roles and
        capabilities.
      </p>
      <div className="rounded-xl border bg-card p-12 shadow-sm flex items-center justify-center">
        <p className="text-muted-foreground">Coming Soon</p>
      </div>
    </div>
  );
}
