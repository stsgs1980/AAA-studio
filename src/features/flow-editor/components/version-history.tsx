'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, RotateCcw, X, Save } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { useFlowEditorStore } from '../store/flow-store';

interface VersionEntry { id: string; version: number; description: string; createdAt: string }

export function VersionHistory({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  if (!open) return null;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-border z-30 flex flex-col shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Version History</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-accent">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="px-4 py-3 border-b border-border space-y-2">
        <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="Version description..."
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={createVersion} disabled={creating || !flowId}
          className={cn('w-full flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90', (creating || !flowId) && 'opacity-50 pointer-events-none')}>
          <Save className="h-3 w-3" />{creating ? 'Saving...' : 'Save Version'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {loading && <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>}
        {!loading && versions.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No versions yet</p>}
        {versions.map((v) => (
          <div key={v.id} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent group">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">v{v.version}</p>
              {v.description && <p className="text-[10px] text-muted-foreground truncate">{v.description}</p>}
              <p className="text-[10px] text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={() => restoreVersion(v.version)} title="Restore"
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 text-primary">
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
