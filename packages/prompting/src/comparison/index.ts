// ============================================================================
// @stsgs/prompting - Blind comparison using main scoring
// ============================================================================

import { scorePrompt } from "../scoring";

export interface ComparisonResult {
  winner: "a" | "b" | "tie";
  scoreA: number;
  scoreB: number;
  criteria: ComparisonCriterion[];
}

export interface ComparisonCriterion {
  name: string;
  scoreA: number;
  scoreB: number;
  notes: string;
}

/** Compare two prompts using all 6 scoring dimensions */
export function comparePrompts(
  promptA: string,
  promptB: string,
  _evaluationContext?: string
): ComparisonResult {
  const sA = scorePrompt(promptA);
  const sB = scorePrompt(promptB);

  const dimensions: (keyof Omit<typeof sA, "overall">)[] = [
    "clarity", "specificity", "structure", "completeness", "creativity", "actionability",
  ];

  const criteria: ComparisonCriterion[] = dimensions.map((dim) => {
    const a = sA[dim];
    const b = sB[dim];
    const diff = a - b;
    return {
      name: dim.charAt(0).toUpperCase() + dim.slice(1),
      scoreA: a,
      scoreB: b,
      notes: diff > 1 ? `A is stronger` : diff < -1 ? `B is stronger` : "Similar",
    };
  });

  const totalA = sA.overall;
  const totalB = sB.overall;

  const threshold = 0.5;
  let winner: "a" | "b" | "tie" = "tie";
  if (totalA - totalB > threshold) winner = "a";
  else if (totalB - totalA > threshold) winner = "b";

  return { winner, scoreA: totalA, scoreB: totalB, criteria };
}
