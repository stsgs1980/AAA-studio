'use client';

import { useCallback, useState } from 'react';
import { useFlowEditorStore } from '../store/flow-store';

export function useFlowActions() {
  const { flowId, flowName, nodes, edges, loadFlow } = useFlowEditorStore();
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
        loadFlow(nodes, edges, data.id, flowName);
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
      setMessage('Running...');
      const body = { name: flowName, nodes, edges, status: 'active' };
      let res: Response;

      if (flowId) {
        res = await fetch(`/api/flows/${flowId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        res = await fetch('/api/flows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }

      if (!res.ok) throw new Error();
      setMessage('Flow saved and queued');
    } catch {
      setMessage('Run failed');
    } finally {
      setRunning(false);
    }
  }, [flowId, flowName, nodes, edges]);

  return { saveFlow, runFlow, saving, running, message };
}
