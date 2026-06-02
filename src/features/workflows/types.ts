export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  agentId: string | null;
  roleGroup: string | null;
  action: 'process' | 'review' | 'transform' | 'delegate' | 'broadcast' | 'decision';
  timeout: number;
  config: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  triggerType: string;
  version: number;
  steps: WorkflowStep[];
  _count?: { steps: number; executions: number };
  createdAt: string;
  updatedAt: string;
}

export const WORKFLOW_ACTIONS = ['process', 'review', 'transform', 'delegate', 'broadcast', 'decision'] as const;
export const TRIGGER_TYPES = ['manual', 'event', 'schedule', 'webhook', 'agent'] as const;

export const ACTION_LABELS: Record<string, string> = {
  process: 'Process',
  review: 'Review',
  transform: 'Transform',
  delegate: 'Delegate',
  broadcast: 'Broadcast',
  decision: 'Decision',
};
