import { Network } from "lucide-react";

export default function AgentHierarchyPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Network className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">
          Agent Hierarchy
        </h1>
      </div>
      <p className="text-muted-foreground">
        Visual graph of agent relationships and organizational structure.
      </p>
      <div className="rounded-xl border bg-card p-12 shadow-sm flex items-center justify-center">
        <p className="text-muted-foreground">Coming Soon</p>
      </div>
    </div>
  );
}
