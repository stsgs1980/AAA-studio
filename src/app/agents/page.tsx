import { Bot } from 'lucide-react';
import { AgentList, AgentForm } from '@/features/agents';

export default function AgentManagementPage() {
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
      <AgentForm />
    </div>
  );
}
