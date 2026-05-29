import type { PromptScore } from '@stsgs/prompting';

export type InputMode = 'text' | 'file' | 'url' | 'agent';

export interface EvaluationInput {
  mode: InputMode;
  text: string;
  fileName: string;
  sourceUrl: string;
  agentId: string;
}

export const EVAL_DEFAULTS: EvaluationInput = {
  mode: 'text',
  text: '',
  fileName: '',
  sourceUrl: '',
  agentId: '',
};

export interface EvaluationResult {
  score: PromptScore;
  suggestions: string[];
  standardsCheck: StandardsCheckResult;
  rubricResult: RubricResult | null;
}

export interface StandardsCheckResult {
  checked: number;
  passed: number;
  failed: number;
  details: StandardsCheckItem[];
}

export interface StandardsCheckItem {
  standardId: string;
  standardName: string;
  passed: boolean;
  matchedRules: string[];
}

export type RubricScenario = 'code' | 'content' | 'prompt' | 'design';

export interface RubricResult {
  scenario: RubricScenario;
  criteria: RubricCriterionResult[];
  overall: number;
  passed: boolean;
  threshold: number;
}

export interface RubricCriterionResult {
  name: string;
  weight: number;
  score: number;
  passed: boolean;
  feedback: string;
}

export const DIMENSION_LABELS: Record<keyof Omit<PromptScore, 'overall'>, string> = {
  clarity: 'Clarity',
  specificity: 'Specificity',
  structure: 'Structure',
  completeness: 'Completeness',
  creativity: 'Creativity',
  actionability: 'Actionability',
};
