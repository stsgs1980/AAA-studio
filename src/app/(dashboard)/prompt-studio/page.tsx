'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, Plus, Trash2, Copy, Tag } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';
import { type Template, CATEGORIES, extractVars } from '@/features/prompt-studio';

export default function PromptStudioPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    try { setLoading(true); const res = await fetch('/api/prompt-templates'); if (!res.ok) throw new Error(); setTemplates(await res.json()); }
    catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { if (selected) setEditContent(selected.content); }, [selected]);

  const handleSave = useCallback(async () => {
    if (!selected) return;
    try { const res = await fetch(`/api/prompt-templates/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: editContent, variables: extractVars(editContent) }) }); if (!res.ok) throw new Error(); fetchTemplates(); }
    catch { /* silent */ }
  }, [selected, editContent, fetchTemplates]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    const content = 'Write your prompt here for {{topic}}...';
    try { const res = await fetch('/api/prompt-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim(), category: newCategory, content, variables: extractVars(content) }) }); if (!res.ok) throw new Error(); setNewName(''); setShowNew(false); fetchTemplates(); }
    catch { /* silent */ }
  }, [newName, newCategory, fetchTemplates]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try { const res = await fetch(`/api/prompt-templates/${id}`, { method: 'DELETE' }); if (!res.ok) throw new Error(); if (selected?.id === id) setSelected(null); fetchTemplates(); }
    catch { /* silent */ }
  }, [selected, fetchTemplates]);

  const filtered = filterCat ? templates.filter((t) => t.category === filterCat) : templates;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Prompt Studio</h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowNew(!showNew)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      {showNew && (
        <div className="flex items-end gap-2 rounded-lg border bg-card p-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Template name" className="h-9 px-3 rounded-md border bg-background text-sm flex-1" />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
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
            <div className="px-3 py-2 border-b bg-muted/30"><h2 className="text-sm font-semibold">Templates ({filtered.length})</h2></div>
            <div className="divide-y overflow-y-auto max-h-[55vh]">
              {filtered.map((t) => (
                <div key={t.id} className={cn('flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50 group', selected?.id === t.id && 'bg-accent')} onClick={() => setSelected(t)}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.name}</div>
                    <div className="flex gap-1 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t.category}</span>
                      {t.framework && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t.framework}</span>}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground p-4">No templates found.</p>}
            </div>
          </div>
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{selected ? selected.name : 'Select a template'}</h2>
              {selected && (<div className="flex gap-1">
                <button onClick={() => navigator.clipboard.writeText(editContent)} className="p-1 rounded hover:bg-accent" title="Copy"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={handleSave} className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">Save</button>
              </div>)}
            </div>
            <div className="flex-1 p-4">
              {selected ? (
                <div className="space-y-3 h-full flex flex-col">
                  <div className="flex gap-2 flex-wrap">
                    {selected.tags.map((tag) => (<span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted"><Tag className="h-2.5 w-2.5" />{tag}</span>))}
                    {selected.variables.map((v) => (<span key={v} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">{v}</span>))}
                  </div>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="flex-1 w-full min-h-[300px] p-3 rounded-lg border bg-background text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <div className="text-xs text-muted-foreground">{selected.variables.length} variables &middot; {editContent.length} chars &middot; {editContent.split('\n').length} lines</div>
                </div>
              ) : (<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Select a template to edit</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
