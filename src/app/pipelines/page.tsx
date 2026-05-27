'use client';

import { useEffect, useState, useCallback } from 'react';
import { GitBranch, Play, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';

interface Flow { id: string; name: string; description: string; status: string; version: number; createdAt: string; updatedAt: string }

interface Execution { id: string; flowId: string; status: string; startedAt: string; completedAt: string | null }

const STATUS_ICON: Record<string, React.ElementType> = { completed: CheckCircle2, failed: XCircle, running: Clock };
const STATUS_COLOR: Record<string, string> = { completed: 'text-emerald-500', failed: 'text-red-500', running: 'text-amber-500', pending: 'text-muted-foreground' };

export default function PipelinesPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFlows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/flows');
      if (!res.ok) throw new Error();
      setFlows(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  const fetchExecutions = useCallback(async (flowId: string | null) => {
    if (!flowId) { setExecutions([]); return; }
    try {
      const res = await fetch(`/api/flows/${flowId}/executions`);
      if (!res.ok) throw new Error();
      setExecutions(await res.json());
    } catch { setExecutions([]); }
  }, []);

  useEffect(() => { fetchFlows(); }, [fetchFlows]);

  useEffect(() => {
    fetchExecutions(selectedFlow);
  }, [selectedFlow, fetchExecutions]);

  const handleExecute = useCallback(async (flowId: string) => {
    try {
      const res = await fetch(`/api/flows/${flowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (!res.ok) throw new Error();
      fetchFlows();
    } catch { /* silent */ }
  }, [fetchFlows]);

  const handleDelete = useCallback(async (flowId: string) => {
    if (!confirm('Delete this flow?')) return;
    try {
      const res = await fetch(`/api/flows/${flowId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      if (selectedFlow === flowId) setSelectedFlow(null);
      fetchFlows();
    } catch { /* silent */ }
  }, [selectedFlow, fetchFlows]);

  const flowExecs = executions.filter((e) => e.flowId === selectedFlow);

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
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">Flows ({flows.length})</h2>
            </div>
            <div className="divide-y overflow-y-auto max-h-[55vh]">
              {flows.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No flows yet. Create one in the Flow Editor.</p>
              ) : flows.map((f) => (
                <div key={f.id} className={cn('flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors group', selectedFlow === f.id && 'bg-accent')} onClick={() => setSelectedFlow(f.id)}>
                  <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <div className="text-xs text-muted-foreground">v{f.version} &middot; {f.status}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleExecute(f.id); }} className="p-1 rounded hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all" title="Execute">
                    <Play className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id); }} className="p-1 rounded hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">
                {selectedFlow ? flows.find((f) => f.id === selectedFlow)?.name ?? 'Flow' : 'Select a flow'}
              </h2>
            </div>
            <div className="p-4">
              {selectedFlow ? (
                flowExecs.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-12">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No executions yet. Click the play button to execute this flow.</p>
                  </div>
                ) : (
                  <div className="divide-y rounded-lg border">
                    {flowExecs.map((ex) => {
                      const Icon = STATUS_ICON[ex.status] ?? Clock;
                      return (
                        <div key={ex.id} className="flex items-center gap-3 px-3 py-2.5">
                          <Icon className={cn('h-4 w-4', STATUS_COLOR[ex.status])} />
                          <span className="text-sm">{ex.status}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{new Date(ex.startedAt).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Select a flow to view executions</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
