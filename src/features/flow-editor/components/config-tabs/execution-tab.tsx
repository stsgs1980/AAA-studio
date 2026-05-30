'use client';

import { useMemo } from 'react';
import { useFlowEditorStore } from '../../store/flow-store';
import { cn } from '@stsgs/ui';
import type { ExecutionResult } from '../../lib/node-executor';

const STATUS_COLOR = {
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
} as const;

const NODE_TYPE_LABELS: Record<string, string> = {
  start: 'Start', end: 'End', llm: 'LLM', prompt: 'Prompt',
  chain: 'Chain', router: 'Router', rag: 'RAG', agent: 'Agent',
  orchestrator: 'Orchestrator', condition: 'Condition', filter: 'Filter',
  transform: 'Transform', input: 'Input', output: 'Output',
};

/** Format cost as USD string */
function fmtCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

/** Truncate output for display, skipping internal fields */
function truncateOutput(output: Record<string, unknown>): string {
  const skip = new Set(['timestamp', 'started', 'finished', 'usage']);
  const parts: string[] = [];
  for (const [k, v] of Object.entries(output)) {
    if (skip.has(k)) continue;
    const str = typeof v === 'string' ? v : JSON.stringify(v);
    parts.push(`${k}: ${str.length > 200 ? str.slice(0, 200) + '...' : str}`);
  }
  return parts.join('\n') || JSON.stringify(output);
}

/** Compute aggregate usage summary from results */
function computeSummary(results: ExecutionResult[]) {
  let totalPrompt = 0, totalCompletion = 0, totalCost = 0;
  const models = new Set<string>();
  for (const r of results) {
    if (r.usage) { totalPrompt += r.usage.promptTokens; totalCompletion += r.usage.completionTokens; }
    if (r.cost) totalCost += r.cost;
    if (r.model) models.add(r.model);
  }
  return { totalTokens: totalPrompt + totalCompletion, totalPrompt, totalCompletion, totalCost, models: [...models] };
}

/** Render a single node result card */
function NodeCard({ r }: { r: ExecutionResult }) {
  return (
    <div className="rounded border border-border bg-background p-2 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('h-1.5 w-1.5 rounded-full', STATUS_COLOR[r.status])} />
          <span className="text-[11px] font-medium">{NODE_TYPE_LABELS[r.nodeType] ?? r.nodeType}</span>
        </div>
        <div className="flex items-center gap-2">
          {r.model && (
            <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[100px]" title={r.model}>
              {r.model}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">{(r.duration / 1000).toFixed(1)}s</span>
        </div>
      </div>
      {r.usage && r.usage.totalTokens > 0 && (
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <span>{r.usage.totalTokens.toLocaleString()} tok</span>
          <span className="font-mono">({r.usage.promptTokens}/{r.usage.completionTokens})</span>
          {r.cost != null && <span className="text-amber-600 dark:text-amber-400/80">{fmtCost(r.cost)}</span>}
        </div>
      )}
      {r.error && <p className="text-[10px] text-destructive leading-relaxed">{r.error}</p>}
      {r.output && !r.error && (
        <pre className="text-[10px] text-muted-foreground bg-muted rounded p-1.5 overflow-auto max-h-24 whitespace-pre-wrap break-words font-mono">
          {truncateOutput(r.output)}
        </pre>
      )}
    </div>
  );
}

/**
 * Execution History tab -- shows results with model, tokens, and cost.
 */
export function ExecutionTab() {
  const results = useFlowEditorStore((s) => s.executionResults);
  const isRunning = useFlowEditorStore((s) => s.isRunning);
  const summary = useMemo(() => computeSummary(results), [results]);

  if (results.length === 0 && !isRunning) {
    return (
      <div className="space-y-3 p-1">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Execution History</h4>
        <p className="text-[10px] text-muted-foreground italic text-center pt-4">Press Run to execute the flow</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-1">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Execution History</h4>

      {isRunning && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-blue-500/30 bg-blue-500/5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Running...</span>
        </div>
      )}

      {summary.totalTokens > 0 && (
        <div className="rounded border border-border bg-muted/50 px-2 py-1.5 space-y-0.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Total tokens</span>
            <span className="font-medium">{summary.totalTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">In / Out</span>
            <span className="font-mono text-[9px]">{summary.totalPrompt.toLocaleString()} / {summary.totalCompletion.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">Est. cost</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">{fmtCost(summary.totalCost)}</span>
          </div>
          {summary.models.length > 0 && (
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Models</span>
              <span className="font-mono text-[9px] truncate max-w-[120px]" title={summary.models.join(', ')}>
                {summary.models.join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {results.map((r, i) => <NodeCard key={`${r.nodeId}-${i}`} r={r} />)}
    </div>
  );
}
