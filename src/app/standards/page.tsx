'use client';

import { useEffect, useState, useCallback } from 'react';
import { Shield, Plus, Trash2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@stsgs/ui';

interface Standard {
  id: string; name: string; category: string; description: string;
  rules: { id: string; description: string; enabled: boolean }[];
  severity: string; version: string; createdAt: string;
}

const SEV_ICON: Record<string, React.ElementType> = { error: AlertCircle, warning: AlertTriangle, info: Info };
const SEV_COLOR: Record<string, string> = { error: 'text-red-500', warning: 'text-amber-500', info: 'text-blue-500' };
const SEV_BG: Record<string, string> = { error: 'bg-red-500/10', warning: 'bg-amber-500/10', info: 'bg-blue-500/10' };

export default function StandardsManagerPage() {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [selected, setSelected] = useState<Standard | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSeverity, setNewSeverity] = useState('info');

  const fetchStandards = useCallback(async () => {
    const res = await fetch('/api/standards');
    setStandards(await res.json());
  }, []);

  useEffect(() => { fetchStandards(); }, [fetchStandards]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    await fetch('/api/standards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), severity: newSeverity }),
    });
    setNewName(''); setShowNew(false); fetchStandards();
  }, [newName, newSeverity, fetchStandards]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this standard?')) return;
    await fetch(`/api/standards/${id}`, { method: 'DELETE' });
    if (selected?.id === id) setSelected(null);
    fetchStandards();
  }, [selected, fetchStandards]);

  const toggleRule = useCallback(async (ruleIdx: number) => {
    if (!selected) return;
    const updated = selected.rules.map((r, i) => i === ruleIdx ? { ...r, enabled: !r.enabled } : r);
    await fetch(`/api/standards/${selected.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules: updated }),
    });
    setSelected({ ...selected, rules: updated });
  }, [selected]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Standards Manager</h1>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Standard
        </button>
      </div>

      {showNew && (
        <div className="flex items-end gap-2 rounded-lg border bg-card p-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Standard name" className="h-9 px-3 rounded-md border bg-background text-sm flex-1" />
          <select value={newSeverity} onChange={(e) => setNewSeverity(e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <button onClick={handleCreate} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Create</button>
          <button onClick={() => setShowNew(false)} className="h-9 px-3 rounded-md border text-sm hover:bg-accent">Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/30">
            <h2 className="text-sm font-semibold">Standards ({standards.length})</h2>
          </div>
          <div className="divide-y overflow-y-auto max-h-[55vh]">
            {standards.map((s) => {
              const Icon = SEV_ICON[s.severity] ?? Info;
              return (
                <div key={s.id} className={cn('flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50 group', selected?.id === s.id && 'bg-accent')} onClick={() => setSelected(s)}>
                  <Icon className={cn('h-4 w-4 shrink-0', SEV_COLOR[s.severity])} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <span className="text-[10px] text-muted-foreground">{s.rules.length} rules &middot; v{s.version}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            {standards.length === 0 && <p className="text-sm text-muted-foreground p-4">No standards yet.</p>}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b bg-muted/30">
            <h2 className="text-sm font-semibold">{selected ? selected.name : 'Select a standard'}</h2>
          </div>
          <div className="p-4">
            {selected ? (
              <div className="space-y-4">
                <div className="flex gap-4 text-sm">
                  <div><span className="text-xs text-muted-foreground">Severity</span><span className={cn('ml-2 px-2 py-0.5 rounded text-xs font-medium', SEV_BG[selected.severity], SEV_COLOR[selected.severity])}>{selected.severity}</span></div>
                  <div><span className="text-xs text-muted-foreground">Version</span><span className="ml-2 text-sm">{selected.version}</span></div>
                  <div><span className="text-xs text-muted-foreground">Category</span><span className="ml-2 text-sm">{selected.category}</span></div>
                </div>
                {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Rules ({selected.rules.length})</h3>
                  {selected.rules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No rules defined. Edit via API to add rules.</p>
                  ) : (
                    <div className="divide-y rounded-lg border">
                      {selected.rules.map((r, i) => (
                        <div key={r.id} className="flex items-center gap-3 px-3 py-2">
                          <button onClick={() => toggleRule(i)} className={cn('h-4 w-4 rounded border transition-colors', r.enabled ? 'bg-primary border-primary' : 'border-muted-foreground/30')} />
                          <span className={cn('text-sm flex-1', !r.enabled && 'text-muted-foreground line-through')}>{r.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Select a standard to view</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
