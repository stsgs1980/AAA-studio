export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  agentId: string | null;
  agent: { id: string; name: string; roleGroup: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const TASK_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  running: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-foreground',
  high: 'text-orange-400',
  critical: 'text-red-400',
};
