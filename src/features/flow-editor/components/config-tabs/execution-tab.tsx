'use client';

import type { NodeExecutionStatus } from '../../types';
import { cn } from '@stsgs/ui';

/** Placeholder execution history — real data comes after running a flow. */
const MOCK: Array<{
  id: string;
  status: NodeExecutionStatus;
  startedAt: number;
  duration?: number;
  error?: string;
}> = [
  { id: '1', status: 'completed', startedAt: Date.now() - 60000, duration: 1200 },
  { id: '2', status: 'failed', startedAt: Date.now() - 120000, duration: 800, error: 'Timeout' },
  { id: '3', status: 'running', startedAt: Date.now() - 5000 },
];

const STATUS_COLOR: Record<NodeExecutionStatus, string> = {
  idle: 'bg-slate-500',
  running: 'bg-blue-500 animate-pulse',
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
};

/**
 * Execution History tab — shows past node executions
 * with status, duration, and error messages.
 */
export function ExecutionTab() {
  return (
    <div className="space-y-3 p-1">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Execution History
      </h4>

      {MOCK.map((exec) => (
        <div
          key={exec.id}
          className="rounded border border-border bg-background p-2 space-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('h-1.5 w-1.5 rounded-full', STATUS_COLOR[exec.status])} />
              <span className="text-[11px] font-medium capitalize">{exec.status}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {new Date(exec.startedAt).toLocaleTimeString()}
            </span>
          </div>
          {exec.duration != null && (
            <p className="text-[10px] text-muted-foreground">
              Duration: {(exec.duration / 1000).toFixed(1)}s
            </p>
          )}
          {exec.error && (
            <p className="text-[10px] text-destructive">Error: {exec.error}</p>
          )}
        </div>
      ))}

      <p className="text-[10px] text-muted-foreground italic text-center pt-2">
        Run the flow to see real execution history
      </p>
    </div>
  );
}
