'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wrench, Plus, Trash2, Code2, TestTube2 } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';
import { CodeBlock } from '@/components/code-block';

interface Skill {
  id: string; name: string; category: string; description: string;
  inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown>;
  code: string; tests: string; tags: string[]; createdAt: string;
}

export default function SkillForgePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<Skill | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [tab, setTab] = useState<'info' | 'code' | 'tests'>('info');
  const [loading, setLoading] = useState(true);

  const fetchSkills = useCallback(async () => {
    try { setLoading(true); const res = await fetch('/api/skills'); if (!res.ok) throw new Error(); setSkills(await res.json()); }
    catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    try { const res = await fetch('/api/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim(), description: '' }) }); if (!res.ok) throw new Error(); setNewName(''); setShowNew(false); fetchSkills(); }
    catch { /* silent */ }
  }, [newName, fetchSkills]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    try { const res = await fetch(`/api/skills/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); if (selected?.id === id) setSelected(null); fetchSkills(); }
    catch { /* silent */ }
  }, [selected, fetchSkills]);

  const handleSaveCode = useCallback(async () => {
    if (!selected) return;
    try { const res = await fetch(`/api/skills/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: selected.code, tests: selected.tests }) }); if (!res.ok) throw new Error(); fetchSkills(); }
    catch { /* silent */ }
  }, [selected, fetchSkills]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Skill Forge</h1>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Skill
        </button>
      </div>

      {showNew && (
        <div className="flex items-end gap-2 rounded-lg border bg-card p-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Skill name" className="h-9 px-3 rounded-md border bg-background text-sm flex-1" onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
          <button onClick={handleCreate} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm">Create</button>
          <button onClick={() => setShowNew(false)} className="h-9 px-3 rounded-md border text-sm hover:bg-accent">Cancel</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          <div className="rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={4} /></div>
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={3} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">Skills ({skills.length})</h2>
            </div>
            <div className="divide-y overflow-y-auto max-h-[55vh]">
              {skills.map((s) => (
                <div key={s.id} className={cn('flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50 group', selected?.id === s.id && 'bg-accent')} onClick={() => { setSelected(s); setTab('info'); }}>
                  <Code2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.category}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {skills.length === 0 && <p className="text-sm text-muted-foreground p-4">No skills yet.</p>}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{selected ? selected.name : 'Select a skill'}</h2>
              {selected && (
                <div className="flex gap-1">
                  {(['info', 'code', 'tests'] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={cn('px-2 py-1 rounded text-xs font-medium transition-colors', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>
                      {t === 'code' && <Code2 className="h-3 w-3 inline mr-1" />}
                      {t === 'tests' && <TestTube2 className="h-3 w-3 inline mr-1" />}
                      {t}
                    </button>
                  ))}
                  <button onClick={handleSaveCode} className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium ml-2 hover:bg-primary/90">Save</button>
                </div>
              )}
            </div>
            <div className="flex-1 p-4">
              {selected ? tab === 'info' ? (
                <div className="space-y-3">
                  <div><span className="text-xs text-muted-foreground">Category</span><p className="text-sm">{selected.category}</p></div>
                  <div><span className="text-xs text-muted-foreground">Description</span><p className="text-sm">{selected.description || 'No description'}</p></div>
                  <div><span className="text-xs text-muted-foreground">Tags</span><div className="flex gap-1 mt-1">{selected.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{t}</span>)}</div></div>
                  <div><span className="text-xs text-muted-foreground">Input Schema</span><CodeBlock code={JSON.stringify(selected.inputSchema, null, 2)} language="json" title="inputSchema" maxLines={20} className="mt-1" /></div>
                  <div><span className="text-xs text-muted-foreground">Output Schema</span><CodeBlock code={JSON.stringify(selected.outputSchema, null, 2)} language="json" title="outputSchema" maxLines={20} className="mt-1" /></div>
                </div>
              ) : tab === 'code' ? (
                <textarea value={selected.code} onChange={(e) => setSelected({ ...selected, code: e.target.value })} className="w-full h-full min-h-[300px] p-3 rounded-lg border bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Write skill code here..." />
              ) : (
                <textarea value={selected.tests} onChange={(e) => setSelected({ ...selected, tests: e.target.value })} className="w-full h-full min-h-[300px] p-3 rounded-lg border bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Write tests here..." />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Select a skill to view</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
