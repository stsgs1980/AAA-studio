import { scorePrompt } from '@stsgs/prompting';
import {
  StandardsCheckItem, RubricScenario,
  RubricResult, RubricCriterionResult, DIMENSION_LABELS,
} from '../types';
import type { PromptScore } from '@stsgs/prompting';

export function generateSuggestions(score: PromptScore): string[] {
  const suggestions: string[] = [];
  const keys = Object.keys(DIMENSION_LABELS) as (keyof PromptScore)[];
  for (const key of keys) {
    if (key === 'overall') continue;
    const val = score[key];
    if (val < 4) {
      suggestions.push(`${DIMENSION_LABELS[key]} needs significant improvement (${val}/10)`);
    } else if (val < 7) {
      suggestions.push(`${DIMENSION_LABELS[key]} could be strengthened (${val}/10)`);
    }
  }
  return suggestions;
}

export function checkStandards(
  text: string,
  rules: { name: string; pattern?: string; enabled: boolean }[],
): StandardsCheckItem[] {
  return rules
    .filter((r) => r.enabled && r.pattern)
    .map((r) => {
      try {
        const regex = new RegExp(r.pattern!, 'im');
        return { standardId: '', standardName: r.name, passed: regex.test(text), matchedRules: [r.name] };
      } catch {
        const fallback = text.toLowerCase().includes(r.pattern?.toLowerCase() ?? '');
        return { standardId: '', standardName: r.name, passed: fallback, matchedRules: fallback ? [r.name] : [] };
      }
    });
}

export function evaluateRubric(
  text: string, scenario: RubricScenario, threshold: number,
): RubricResult {
  const score = scorePrompt(text);
  type Dim = keyof typeof DIMENSION_LABELS;
  const map: Record<string, Dim[]> = {
    prompt: ['specificity', 'structure', 'completeness', 'actionability'],
    code: ['structure', 'completeness', 'specificity', 'clarity'],
    content: ['clarity', 'specificity', 'completeness', 'creativity'],
    design: ['structure', 'creativity', 'clarity', 'completeness'],
  };
  const dims = map[scenario] ?? map.prompt;
  const criteria: RubricCriterionResult[] = dims.map((dim) => {
    const val = score[dim as keyof PromptScore] as number;
    return {
      name: DIMENSION_LABELS[dim],
      weight: 1,
      score: val,
      passed: val >= threshold,
      feedback: val >= 8
        ? 'Excellent. No changes needed.'
        : val >= 6
          ? 'Good, but there is room for improvement.'
          : val >= 4
            ? 'Below average. Consider revising this area.'
            : 'Poor. Significant improvement required.',
    };
  });
  const overall = Math.round(
    criteria.reduce((sum, c) => sum + c.score * c.weight, 0) /
    criteria.reduce((sum, c) => sum + c.weight, 0),
  );
  return { scenario, criteria, overall, passed: overall >= threshold, threshold };
}
