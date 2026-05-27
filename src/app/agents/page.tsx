'use client';

import { Bot } from 'lucide-react';
import { AgentList, AgentForm, AgentExecutions } from '@/features/agents';
import { useAgentStore } from '@/features/agents/hooks/use-agent-store';

export default function AgentManagementPage() {
  const { editing } = useAgentStore();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, configure and manage AI agents with custom roles and capabilities.
          </p>
        </div>
      </div>

      <AgentList />

      {/* Execution history for selected agent */}
      {editing && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <AgentExecutions agentId={editing.id} />
        </div>
      )}

      <AgentForm />
    </div>
  );
}
