'use client';

import { useEffect } from 'react';
import { useAgentStore } from '../hooks/use-agent-store';
import { ROLE_GROUPS, STATUS_OPTIONS, MODELS } from '../types';
import type { RoleGroup } from '@stsgs/shared';
import { X } from 'lucide-react';

export function AgentForm() {
  const store = useAgentStore();
  const f = store.form;

  useEffect(() => {
    if (!store.showForm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') store.setShowForm(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store.showForm, store.setShowForm]);

  if (!store.showForm) return null;

  const isEdit = !!store.editing;

  const fieldClass = 'w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring';
  const labelClass = 'block text-xs font-medium text-muted-foreground mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Agent' : 'New Agent'}</h2>
          <button onClick={() => store.setShowForm(false)} className="p-1 rounded hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error */}
        {store.error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {store.error}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          {/* Row: Name + Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={labelClass}>Name *</label>
              <input value={f.name} onChange={(e) => store.setField('name', e.target.value)} className={fieldClass} placeholder="Agent name" />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={f.status} onChange={(e) => store.setField('status', e.target.value as typeof f.status)} className={fieldClass}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Role + Group */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Role</label>
              <input value={f.role} onChange={(e) => store.setField('role', e.target.value)} className={fieldClass} placeholder="e.g. Code Reviewer" />
            </div>
            <div>
              <label className={labelClass}>Group</label>
              <select value={f.group} onChange={(e) => store.setField('group', e.target.value as RoleGroup)} className={fieldClass}>
                {ROLE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Model + Temperature */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Model</label>
              <select value={f.model} onChange={(e) => store.setField('model', e.target.value)} className={fieldClass}>
                {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Temperature: {f.temperature}</label>
              <input type="range" min="0" max="2" step="0.1" value={f.temperature} onChange={(e) => store.setField('temperature', parseFloat(e.target.value))} className="w-full mt-1 accent-primary" />
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className={labelClass}>Max Tokens</label>
            <input type="number" value={f.maxTokens} onChange={(e) => store.setField('maxTokens', parseInt(e.target.value) || 4096)} className={fieldClass} />
          </div>

          {/* System Prompt */}
          <div>
            <label className={labelClass}>System Prompt</label>
            <textarea value={f.systemPrompt} onChange={(e) => store.setField('systemPrompt', e.target.value)} rows={4} className={fieldClass + ' resize-y'} placeholder="Enter system prompt..." />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={f.description} onChange={(e) => store.setField('description', e.target.value)} rows={2} className={fieldClass + ' resize-y'} placeholder="What does this agent do?" />
          </div>

          {/* Parent Agent */}
          <div>
            <label className={labelClass}>Parent Agent ID</label>
            <input value={f.parentId ?? ''} onChange={(e) => store.setField('parentId', e.target.value || null)} className={fieldClass} placeholder="Optional parent" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t">
          <button onClick={() => store.setShowForm(false)} className="px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
            Cancel
          </button>
          <button
            onClick={store.save}
            disabled={store.saving}
            className="px-4 py-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {store.saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
