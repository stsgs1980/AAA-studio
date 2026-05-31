'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Upload } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { useAgentStore } from '../hooks/use-agent-store';
import { ROLE_GROUPS, STATUS_OPTIONS } from '../types';
import { AgentTable } from './agent-table';
import { AgentImportDialog } from './agent-import-dialog';

export function AgentList() {
  const store = useAgentStore();
  const [showFilters, setShowFilters] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Auto-fetch on mount and when filters change
  const fetchAgents = useAgentStore((s) => s.fetchAgents);
  const search = useAgentStore((s) => s.search);
  const filterGroup = useAgentStore((s) => s.filterGroup);
  const filterStatus = useAgentStore((s) => s.filterStatus);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents, search, filterGroup, filterStatus]);

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
          onClick={() => setShowImport(true)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
          title="Import agents from ZIP"
        >
          <Upload className="h-4 w-4" /> Import
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
            {ROLE_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select
            value={store.filterStatus}
            onChange={(e) => store.setFilterStatus(e.target.value)}
            className="rounded-md border bg-background px-2 py-1.5 text-sm outline-none"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
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

      {/* Table / Empty / Loading */}
      {store.loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <AgentTable
          agents={store.agents}
          onEdit={store.openEdit}
          onClone={store.clone}
          onRemove={store.remove}
        />
      )}

      {showImport && (
        <AgentImportDialog
          onClose={() => setShowImport(false)}
          onImported={() => store.fetchAgents()}
        />
      )}
    </div>
  );
}
