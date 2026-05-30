'use client';

import { useCallback, useState } from 'react';
import { useFlowEditorStore } from '../store/flow-store';
import { executeFlow, type ExecutionResult } from '../lib/node-executor';

export function useFlowActions() {
  const { flowId, flowName, nodes, edges, loadFlow, setExecutionResults } = useFlowEditorStore();
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  const saveFlow = useCallback(async () => {
    try {
      setSaving(true);
      setMessage('');
      const body = { name: flowName, nodes, edges };
      let res: Response;

      if (flowId) {
        res = await fetch(`/api/flows/${flowId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        res = await fetch('/api/flows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }

      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      if (!flowId) {
        const { nodes: n, edges: e } = useFlowEditorStore.getState();
        loadFlow(n, e, data.id, flowName);
      }
      setMessage('Saved');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  }, [flowId, flowName, nodes, edges, loadFlow]);

  const runFlow = useCallback(async () => {
    if (nodes.length === 0) { setMessage('Nothing to run'); return; }

    try {
      setRunning(true);
      useFlowEditorStore.setState({ isRunning: true });

      if (flowId) {
        // Saved flow -> server-side execution with full usage tracking
        setMessage('Executing on server...');

        // Save first to sync nodes/edges
        await fetch(`/api/flows/${flowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: flowName, nodes, edges }),
        });

        const res = await fetch(`/api/flows/${flowId}/execute`, { method: 'POST' });
        if (!res.ok) throw new Error(`Execution failed: ${res.status}`);
        const data = await res.json();

        // Map server NodeResult[] to client ExecutionResult[]
        const results: ExecutionResult[] = (data.results ?? []).map((r: Record<string, unknown>) => ({
          nodeId: r.nodeId as string,
          nodeType: r.nodeType as string,
          status: r.status as 'completed' | 'failed',
          output: r.output as Record<string, unknown>,
          error: r.error as string | undefined,
          duration: r.duration as number,
          model: r.model as string | undefined,
          usage: r.usage as ExecutionResult['usage'] | undefined,
          cost: r.cost as number | undefined,
        }));

        setExecutionResults(results);

        // Show usage summary if available
        const u = data.usage as Record<string, unknown> | undefined;
        const costStr = u?.totalCost ? ` | $${Number(u.totalCost).toFixed(4)}` : '';
        const tokenStr = u?.totalTokens ? ` | ${u.totalTokens} tokens` : '';
        setMessage(data.success ? `Done (${results.length} nodes${tokenStr}${costStr})` : `Failed: ${data.error}`);
      } else {
        // Unsaved flow -> client-side execution via /api/llm proxy
        setMessage('Executing locally...');
        const { results, success } = await executeFlow(nodes, edges);
        setExecutionResults(results);
        setMessage(success ? `Done (${results.length} nodes)` : 'Execution failed');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Run failed';
      setMessage(msg);
    } finally {
      setRunning(false);
      useFlowEditorStore.setState({ isRunning: false });
    }
  }, [flowId, flowName, nodes, edges, setExecutionResults]);

  return { saveFlow, runFlow, saving, running, message };
}
