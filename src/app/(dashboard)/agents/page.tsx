'use client';

import { Bot } from 'lucide-react';
import { AgentList, AgentForm, AgentExecutions } from '@/features/agents';
import { useAgentStore } from '@/features/agents/hooks/use-agent-store';
import { TeamTab } from '@/features/agents/components/team-tab';
import { useState } from 'react';

export default function AgentManagementPage() {
  const { editing } = useAgentStore();
  const [tab, setTab] = useState<'executions' | 'team'>('executions');

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

      {/* Tabs for selected agent */}
      {editing && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button onClick={() => setTab('executions')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === 'executions' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}>Executions</button>
            {editing.roleGroup === 'orchestrator' && (
              <button onClick={() => setTab('team')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === 'team' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}>Team</button>
            )}
          </div>
          <div className="p-4">
            {tab === 'executions' && <AgentExecutions agentId={editing.id} />}
            {tab === 'team' && <TeamTab agentId={editing.id} roleGroup={editing.roleGroup ?? ''} />}
          </div>
        </div>
      )}

      <AgentForm />
    </div>
  );
}
