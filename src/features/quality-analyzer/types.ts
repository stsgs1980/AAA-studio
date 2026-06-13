import type { PromptScore } from '@stsgs/prompting';

export type InputMode = 'text' | 'file' | 'url' | 'agent';

export interface EvaluationInput {
  mode: InputMode;
  text: string;
  fileName: string;
  sourceUrl: string;
  agentId: string;
  /** Structured file list (set by folder/zip uploads for scanner) */
  files: { name: string; content: string; size: number }[];
}

export const EVAL_DEFAULTS: EvaluationInput = {
  mode: 'text',
  text: '',
  fileName: '',
  sourceUrl: '',
  agentId: '',
  files: [],
};

export interface EvaluationResult {
  score: PromptScore;
  suggestions: string[];
  standardsCheck: StandardsCheckResult;
  rubricResult: RubricResult | null;
  llmAnalysis: string | null;
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

export type FilterReason = 'skip_file' | 'skip_dir' | 'dot_dir' | 'wrong_ext' | 'too_large' | 'directory';

export interface FilterLogEntry {
  path: string;
  reason: FilterReason;
}

export interface FilterLog {
  total: number;
  accepted: number;
  entries: FilterLogEntry[];
}
