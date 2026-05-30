import type { RoleGroup } from '@stsgs/shared';
import type { PromptScore } from '@stsgs/prompting';

export const CREATOR_STEPS = [
  'agent-type',
  'configure',
  'prompt',
  'tools',
  'preview',
] as const;

export type CreatorStep = (typeof CREATOR_STEPS)[number];

export interface WizardForm {
  // step 1 - type
  agentTypeId: string;
  agentRoleId: string;
  // step 2 - config
  name: string;
  description: string;
  group: RoleGroup;
  roleGroup: RoleGroup;
  formula: string;
  model: string;
  temperature: number;
  maxTokens: number;
  // step 3 - prompt
  systemPrompt: string;
  // step 4 - tools
  tools: string[];
  skillIds: string[];
  standardIds: string[];
  knowledgeIds: string[];
}

export const CREATOR_DEFAULTS: WizardForm = {
  agentTypeId: '',
  agentRoleId: '',
  name: '',
  description: '',
  group: 'specialist',
  roleGroup: 'specialist' as RoleGroup,
  formula: '',
  model: 'glm-4',
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: '',
  tools: [],
  skillIds: [],
  standardIds: [],
  knowledgeIds: [],
};

export interface CreatorScore {
  score: PromptScore;
  suggestions: string[];
}
