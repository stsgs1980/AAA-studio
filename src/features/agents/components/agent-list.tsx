'use client';

import { useState } from 'react';
import { cn } from '@stsgs/ui';
import { Search, Plus, Filter } from 'lucide-react';
import { useAgentStore } from '../hooks/use-agent-store';

const groupColors: Record<string, string> = {
  orchestrator: 'bg-purple-500/15 text-purple-400',
  planner: 'bg-blue-500/15 text-blue-400',
  researcher: 'bg-emerald-500/15 text-emerald-400',
  coder: 'bg-cyan-500/15 text-cyan-400',
  reviewer: 'bg-amber-500/15 text-amber-400',
  tester: 'bg-orange-500/15 text-orange-400',
  deployer: 'bg-pink-500/15 text-pink-400',
  specialist: 'bg-slate-500/15 text-slate-400',
};

const statusDot: Record<string, string> = {
  active: 'bg-emerald-400',
  inactive: 'bg-amber-400',
  draft: 'bg-slate-500',
};

export function AgentList() {
  const store = useAgentStore();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search + Actions bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={store.search}
            onChange={(e) => store.setSearch(e.target.value)}
            placeholder="Search agents by name, role, description..."
            className="w-full rounded-lg border bg-background px-3 py-2 pl-9 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn('p-2 rounded-lg border hover:bg-accent transition-colors', showFilters && 'bg-accent')}
          title="Filters"
        >
          <Filter className="h-4 w-4" />
        </button>
        <button
          onClick={store.openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Agent
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
          <select
            value={store.filterGroup}
            onChange={(e) => store.setFilterGroup(e.target.value)}
            className="rounded-md border bg-background px-2 py-1.5 text-sm outline-none"
          >
            <option value="">All Groups</option>
            {store.ROLE_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select
            value={store.filterStatus}
            onChange={(e) => store.setFilterStatus(e.target.value)}
            className="rounded-md border bg-background px-2 py-1.5 text-sm outline-none"
          >
            <option value="">All Statuses</option>
            {store.STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="ml-auto text-xs text-muted-foreground">
            {store.agents.length} agent{store.agents.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Error */}
      {store.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {store.error}
          <button onClick={() => store.setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Table */}
      {store.loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
      ) : store.agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">No agents found</p>
          <p className="mt-1 text-xs">Create your first agent to get started</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Group</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Model</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.agents.map((agent) => (
                <tr key={agent.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => store.openEdit(agent)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full shrink-0', statusDot[agent.status] ?? 'bg-slate-500')} />
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{agent.role || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', groupColors[agent.group] ?? groupColors.specialist)}>
                      {agent.group}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{agent.status}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{agent.model}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => store.clone(agent.id)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Clone">
                        <CopyIcon className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => store.remove(agent.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Inline icons to avoid extra dependencies
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
