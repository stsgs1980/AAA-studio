'use client';

import { cn } from '@stsgs/ui';
import type { AgentRecord } from '../types';
import { CopyIcon, TrashIcon } from './agent-icons';

export const groupColors: Record<string, string> = {
  orchestrator: 'bg-purple-500/15 text-purple-600',
  planner: 'bg-blue-500/15 text-blue-600',
  researcher: 'bg-emerald-500/15 text-emerald-600',
  coder: 'bg-cyan-500/15 text-cyan-600',
  reviewer: 'bg-amber-500/15 text-amber-600',
  tester: 'bg-orange-500/15 text-orange-600',
  deployer: 'bg-pink-500/15 text-pink-400',
  specialist: 'bg-slate-500/15 text-slate-400',
};

const statusDot: Record<string, string> = {
  active: 'bg-emerald-400',
  inactive: 'bg-amber-400',
  draft: 'bg-slate-500',
};

interface Props {
  agents: AgentRecord[];
  onEdit: (agent: AgentRecord) => void;
  onClone: (id: string) => void;
  onRemove: (id: string) => void;
}

export function AgentTable({ agents, onEdit, onClone, onRemove }: Props) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No agents found</p>
        <p className="mt-1 text-xs">Create your first agent to get started</p>
      </div>
    );
  }

  return (
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
          {agents.map((agent) => (
            <tr key={agent.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => onEdit(agent)}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full shrink-0', statusDot[agent.status] ?? 'bg-slate-500')} />
                  <span className="font-medium">{agent.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{agent.role || '--'}</td>
              <td className="px-4 py-3">
                <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', groupColors[agent.group] ?? groupColors.specialist)}>
                  {agent.group}
                </span>
              </td>
              <td className="px-4 py-3 capitalize">{agent.status}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{agent.model}</td>
              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onClone(agent.id)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Clone">
                    <CopyIcon className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onRemove(agent.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
