import { Clock, CheckCircle2, XCircle, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@stsgs/ui";
import type { Execution, NodeResult } from "../types";

const STATUS_ICON: Record<string, React.ElementType> = { completed: CheckCircle2, failed: XCircle, running: Loader2, pending: Clock };
const STATUS_COLOR: Record<string, string> = {
  completed: "text-emerald-500", failed: "text-red-500", running: "text-amber-500",
  pending: "text-muted-foreground",
};

function parseResults(exec: Execution): NodeResult[] {
  if (!exec.result) return [];
  try {
    const data = JSON.parse(exec.result);
    return data.results ?? [];
  } catch { return []; }
}

function fmtDuration(exec: Execution): string {
  if (!exec.completedAt) return "";
  const ms = new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function ExecutionList({
  executions, selectedId, onSelect,
}: {
  executions: Execution[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (executions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-12">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p>No executions yet. Click play to execute this flow.</p>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {executions.map((ex) => {
        const Icon = STATUS_ICON[ex.status] ?? Clock;
        const results = parseResults(ex);
        return (
          <button
            key={ex.id}
            onClick={() => onSelect(ex.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors text-left",
              selectedId === ex.id && "bg-accent",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", STATUS_COLOR[ex.status])} />
            <span className="text-sm font-medium capitalize">{ex.status}</span>
            {results.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {results.length} nodes
              </span>
            )}
            {ex.error && (
              <span className="text-xs text-red-400 truncate max-w-[160px]">
                {ex.error}
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {fmtDuration(ex)}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
