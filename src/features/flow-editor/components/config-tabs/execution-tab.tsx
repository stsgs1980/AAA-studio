'use client';

import { useFlowEditorStore } from '../../store/flow-store';
import { cn } from '@stsgs/ui';

const STATUS_COLOR = {
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
} as const;

const NODE_TYPE_LABELS: Record<string, string> = {
  start: 'Start', end: 'End', llm: 'LLM', prompt: 'Prompt',
  chain: 'Chain', router: 'Router', rag: 'RAG', agent: 'Agent',
  orchestrator: 'Orchestrator', condition: 'Condition', filter: 'Filter',
  transform: 'Transform', input: 'Input', output: 'Output',
  embedding: 'Embedding', 'vector-store': 'Vector Store',
  api: 'API Call', webhook: 'Webhook', error: 'Error',
};

/**
 * Execution History tab — shows real execution results from the store.
 */
export function ExecutionTab() {
  const results = useFlowEditorStore((s) => s.executionResults);
  const isRunning = useFlowEditorStore((s) => s.isRunning);

  if (results.length === 0 && !isRunning) {
    return (
      <div className="space-y-3 p-1">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Execution History
        </h4>
        <p className="text-[10px] text-muted-foreground italic text-center pt-4">
          Press Run to execute the flow
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-1">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Execution History
      </h4>

      {isRunning && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded border border-blue-500/30 bg-blue-500/5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-medium text-blue-400">Running...</span>
        </div>
      )}

      {results.map((r, i) => (
        <div
          key={`${r.nodeId}-${i}`}
          className="rounded border border-border bg-background p-2 space-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('h-1.5 w-1.5 rounded-full', STATUS_COLOR[r.status])} />
              <span className="text-[11px] font-medium">
                {NODE_TYPE_LABELS[r.nodeType] ?? r.nodeType}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {(r.duration / 1000).toFixed(1)}s
            </span>
          </div>

          {r.error && (
            <p className="text-[10px] text-destructive leading-relaxed">{r.error}</p>
          )}

          {r.output && !r.error && (
            <pre className="text-[10px] text-muted-foreground bg-muted rounded p-1.5 overflow-auto max-h-24 whitespace-pre-wrap break-words font-mono">
              {truncateOutput(r.output)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

function truncateOutput(output: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(output)) {
    if (k === 'timestamp' || k === 'started' || k === 'finished') continue;
    const str = typeof v === 'string' ? v : JSON.stringify(v);
    parts.push(`${k}: ${str.length > 200 ? str.slice(0, 200) + '...' : str}`);
  }
  return parts.join('\n') || JSON.stringify(output);
}
