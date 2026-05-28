'use client';

import { GitBranch, Play, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';
import {
  usePipelines, ExecutionList, ExecutionDetail,
} from '@/features/pipelines';
import type { Execution, NodeResult } from '@/features/pipelines';

function parseNodeResults(exec: Execution): NodeResult[] {
  if (!exec.result) return [];
  try { const d = JSON.parse(exec.result); return d.results ?? []; }
  catch { return []; }
}

export default function PipelinesPage() {
  const {
    flows, executions, selectedFlow, selectedExec,
    loading, running, selectFlow, selectExec, executeFlow, deleteFlow,
  } = usePipelines();

  const activeExec = selectedExec ? executions.find((e) => e.id === selectedExec) : null;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <GitBranch className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Pipelines</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          <div className="rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={4} /></div>
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={3} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          {/* Left: Flow list */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">Flows ({flows.length})</h2>
            </div>
            <div className="divide-y overflow-y-auto max-h-[55vh]">
              {flows.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">
                  No flows yet. Create one in the Flow Editor.
                </p>
              ) : flows.map((f) => (
                <div
                  key={f.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors group',
                    selectedFlow === f.id && 'bg-accent',
                  )}
                  onClick={() => selectFlow(f.id)}
                >
                  <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <div className="text-xs text-muted-foreground">v{f.version} &middot; {f.status}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); executeFlow(f.id); }}
                    className="p-1 rounded hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                    title="Execute"
                    disabled={running}
                  >
                    {running && selectedFlow === f.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Play className="h-3.5 w-3.5" />
                    }
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFlow(f.id); }}
                    className="p-1 rounded hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Execution detail or list */}
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">
                {selectedFlow ? flows.find((f) => f.id === selectedFlow)?.name ?? 'Flow' : 'Select a flow'}
              </h2>
            </div>
            <div className="p-4">
              {!selectedFlow ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                  Select a flow to view executions
                </div>
              ) : activeExec && selectedExec ? (
                <ExecutionDetail
                  results={parseNodeResults(activeExec)}
                  onBack={() => selectExec(null)}
                />
              ) : (
                <ExecutionList
                  executions={executions}
                  selectedId={selectedExec}
                  onSelect={selectExec}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
