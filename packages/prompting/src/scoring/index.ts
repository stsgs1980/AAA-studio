// ============================================================================
// @stsgs/prompting - Scoring system (6 criteria)
// ============================================================================

export interface PromptScore {
  clarity: number;
  specificity: number;
  structure: number;
  completeness: number;
  creativity: number;
  actionability: number;
  overall: number;
}

import {
  scoreClarity, scoreSpecificity, scoreStructure,
  scoreCompleteness, scoreCreativity, scoreActionability,
} from "./scorers";

const ZERO: PromptScore = {
  clarity: 0, specificity: 0, structure: 0,
  completeness: 0, creativity: 0, actionability: 0, overall: 0,
};

/** Score each criterion 0-10 */
export function scorePrompt(prompt: string): PromptScore {
  const text = prompt.trim();
  if (!text) return ZERO;

  const clarity = scoreClarity(text);
  const specificity = scoreSpecificity(text);
  const structure = scoreStructure(text);
  const completeness = scoreCompleteness(text);
  const creativity = scoreCreativity(text);
  const actionability = scoreActionability(text);

  const overall = Math.round(
    (clarity + specificity + structure + completeness + creativity + actionability) / 6
  );

  return { clarity, specificity, structure, completeness, creativity, actionability, overall };
}

/** Get score label */
export function getScoreLabel(score: number): string {
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5) return "Average";
  if (score >= 3) return "Below Average";
  return "Poor";
}
