'use client';

import { cn } from '@stsgs/ui';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAgentExecutions } from '../hooks/use-agent-executions';

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', label: 'Done' },
  failed: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'Failed' },
  running: { icon: Loader2, color: 'text-blue-600 dark:text-blue-400', label: 'Running' },
  pending: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', label: 'Pending' },
};

function formatDuration(ms: number | null): string {
  if (ms === null) return '--';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = Math.round((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  agentId: string | null;
}

export function AgentExecutions({ agentId }: Props) {
  const { executions, loading, successCount, failCount, avgDuration } = useAgentExecutions(agentId);

  if (!agentId) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Execution History</h3>
        <span className="text-xs text-muted-foreground">{executions.length} runs</span>
      </div>

      {/* Summary chips */}
      {executions.length > 0 && (
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-600 dark:text-emerald-400">{successCount} passed</span>
          {failCount > 0 && <span className="text-red-600 dark:text-red-400">{failCount} failed</span>}
          {avgDuration !== null && <span className="text-muted-foreground">avg {formatDuration(avgDuration)}</span>}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">Loading...</div>
      ) : executions.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No executions yet</div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Duration</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Tokens</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">When</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((ex) => {
                const cfg = statusConfig[ex.status] ?? statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={ex.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Icon className={cn('h-3.5 w-3.5', cfg.color, ex.status === 'running' && 'animate-spin')} />
                        <span>{cfg.label}</span>
                      </div>
                      {ex.error && <p className="text-red-600 dark:text-red-400/70 mt-0.5 truncate max-w-[200px]" title={ex.error}>{ex.error}</p>}
                    </td>
                    <td className="px-3 py-2 font-mono">{formatDuration(ex.duration)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{ex.tokensUsed ?? '--'}</td>
                    <td className="px-3 py-2 text-muted-foreground">{timeAgo(ex.startedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}