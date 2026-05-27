import type { RoleGroup } from '@stsgs/shared';

export interface AgentRecord {
  id: string;
  name: string;
  role: string;
  group: string;
  status: 'active' | 'inactive' | 'draft';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string;
  skills: string;
  standards: string;
  parentId: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
  parent?: { id: string; name: string } | null;
}

export interface AgentListResponse {
  agents: AgentRecord[];
  count: number;
}

export const ROLE_GROUPS: RoleGroup[] = [
  'orchestrator', 'planner', 'researcher', 'coder',
  'reviewer', 'tester', 'deployer', 'specialist',
];

export const STATUS_OPTIONS = ['active', 'inactive', 'draft'] as const;
export const MODELS = ['glm-4', 'glm-4-flash', 'gpt-4', 'gpt-4o', 'claude-3.5-sonnet'];

export type AgentStatus = 'active' | 'inactive' | 'draft';

export const DEFAULT_FORM = {
  name: '', role: '', group: 'specialist' as RoleGroup,
  status: 'draft' as AgentStatus, model: 'glm-4', temperature: 0.7,
  maxTokens: 4096, systemPrompt: '', tools: '[]', skills: '[]',
  standards: '[]', parentId: null as string | null, description: '',
};
