import { Clock, CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@stsgs/ui";
import type { NodeResult } from "../types";

const STATUS_ICON: Record<string, React.ElementType> = { completed: CheckCircle2, failed: XCircle, running: Loader2 };
const STATUS_COLOR: Record<string, string> = {
  completed: "text-emerald-500", failed: "text-red-500", running: "text-amber-500",
};

function snap(val: unknown, max = 120): string {
  if (val == null) return "";
  const s = typeof val === "string" ? val : JSON.stringify(val);
  return s.length > max ? s.slice(0, max) + "..." : s;
}

export function ExecutionDetail({
  results, onBack,
}: { results: NodeResult[]; onBack: () => void }) {
  const totalMs = results.reduce((sum, r) => sum + r.duration, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1 rounded hover:bg-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">Node Results</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {results.length} nodes &middot; {totalMs}ms
        </span>
      </div>

      <div className="divide-y rounded-lg border">
        {results.map((r) => {
          const Icon = STATUS_ICON[r.status] ?? Clock;
          return (
            <div key={r.nodeId} className="px-3 py-2.5 space-y-1">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4 shrink-0", STATUS_COLOR[r.status])} />
                <span className="text-sm font-mono">{r.nodeType}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {r.nodeId.slice(0, 8)}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">{r.duration}ms</span>
              </div>
              {r.error && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1 mt-1">{r.error}</p>
              )}
              {r.output && (
                <pre className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 font-mono overflow-x-auto whitespace-pre-wrap">
                  {snap(r.output)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
