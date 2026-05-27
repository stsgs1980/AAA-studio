// ============================================================================
// @stsgs/prompting - Blind comparison
// ============================================================================

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

/** Compare two prompts blindly by criteria */
export function comparePrompts(
  promptA: string,
  promptB: string,
  _evaluationContext?: string
): ComparisonResult {
  const criteria: ComparisonCriterion[] = [
    {
      name: "Clarity",
      scoreA: scoreClarityComp(promptA),
      scoreB: scoreClarityComp(promptB),
      notes: "",
    },
    {
      name: "Specificity",
      scoreA: scoreSpecificityComp(promptA),
      scoreB: scoreSpecificityComp(promptB),
      notes: "",
    },
    {
      name: "Structure",
      scoreA: scoreStructureComp(promptA),
      scoreB: scoreStructureComp(promptB),
      notes: "",
    },
  ];

  const totalA = criteria.reduce((sum, c) => sum + c.scoreA, 0) / criteria.length;
  const totalB = criteria.reduce((sum, c) => sum + c.scoreB, 0) / criteria.length;

  const threshold = 0.5;
  let winner: "a" | "b" | "tie" = "tie";
  if (totalA - totalB > threshold) winner = "a";
  else if (totalB - totalA > threshold) winner = "b";

  return { winner, scoreA: Math.round(totalA), scoreB: Math.round(totalB), criteria };
}

function scoreClarityComp(prompt: string): number {
  let s = 5;
  if (prompt.length < 300) s += 1;
  if (prompt.length < 150) s += 1;
  if (!/etc\.|and so on/i.test(prompt)) s += 1;
  if (prompt.split(/[.!?]+/).every((s) => s.split(/\s+/).length < 30)) s += 1;
  return Math.min(10, s);
}

function scoreSpecificityComp(prompt: string): number {
  let s = 4;
  if (/\d+/.test(prompt)) s += 1;
  if (/example|such as|for instance/i.test(prompt)) s += 1;
  if (/must|should|required/i.test(prompt)) s += 1;
  if (/format|output|return/i.test(prompt)) s += 2;
  return Math.min(10, s);
}

function scoreStructureComp(prompt: string): number {
  let s = 4;
  if (/^#{1,3}\s/m.test(prompt)) s += 2;
  if (/^\s*[-*]\s/m.test(prompt)) s += 1;
  if (/^\s*\d+[.)]\s/m.test(prompt)) s += 1;
  if (/\n\s*\n/.test(prompt)) s += 2;
  return Math.min(10, s);
}
