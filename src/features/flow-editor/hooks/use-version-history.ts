'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFlowEditorStore } from '../store/flow-store';

export interface VersionEntry {
  id: string;
  version: number;
  description: string;
  createdAt: string;
}

export function useVersionHistory(open: boolean, onClose: () => void) {
  const flowId = useFlowEditorStore((s) => s.flowId);
  const loadFlow = useFlowEditorStore((s) => s.loadFlow);
  const nodes = useFlowEditorStore((s) => s.nodes);
  const edges = useFlowEditorStore((s) => s.edges);
  const flowName = useFlowEditorStore((s) => s.flowName);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!flowId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/flows/${flowId}/versions`);
      if (res.ok) { const d = await res.json(); setVersions(Array.isArray(d) ? d : []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [flowId]);

  useEffect(() => { if (open && flowId) fetchVersions(); }, [open, flowId, fetchVersions]);

  const createVersion = useCallback(async () => {
    if (!flowId) return;
    setCreating(true);
    try {
      await fetch(`/api/flows/${flowId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      const res = await fetch(`/api/flows/${flowId}/versions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc }),
      });
      if (res.ok) { setDesc(''); await fetchVersions(); }
    } catch { /* ignore */ } finally { setCreating(false); }
  }, [flowId, nodes, edges, desc, fetchVersions]);

  const restoreVersion = useCallback(async (version: number) => {
    if (!flowId) return;
    try {
      const res = await fetch(`/api/flows/${flowId}/versions/${version}`);
      if (res.ok) { const d = await res.json(); loadFlow(d.nodes, d.edges, flowId, flowName); }
    } catch { /* ignore */ }
  }, [flowId, flowName, loadFlow]);

  return { versions, loading, desc, setDesc, creating, createVersion, restoreVersion, flowId };
}
