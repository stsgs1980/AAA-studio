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

/** Score each criterion 0-10 */
export function scorePrompt(prompt: string): PromptScore {
  const clarity = scoreClarity(prompt);
  const specificity = scoreSpecificity(prompt);
  const structure = scoreStructure(prompt);
  const completeness = scoreCompleteness(prompt);
  const creativity = scoreCreativity(prompt);
  const actionability = scoreActionability(prompt);

  const overall = Math.round(
    (clarity + specificity + structure + completeness + creativity + actionability) / 6
  );

  return { clarity, specificity, structure, completeness, creativity, actionability, overall };
}

function scoreClarity(prompt: string): number {
  let score = 5;
  const sentences = prompt.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 0 && sentences[0].length < 50) score += 1;
  if (!prompt.includes("etc.") && !prompt.includes("and so on")) score += 1;
  if (prompt.length < 500) score += 1;
  const avgSentenceLength =
    sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(sentences.length, 1);
  if (avgSentenceLength < 25) score += 1;
  if (avgSentenceLength < 15) score += 1;
  return Math.min(10, Math.max(0, score));
}

function scoreSpecificity(prompt: string): number {
  let score = 4;
  if (/\d+/.test(prompt)) score += 1;
  if (/(\bexample\b|\bsuch as\b|\bfor instance\b)/i.test(prompt)) score += 1;
  if (/(\bmust\b|\bshould\b|\bshall\b|\brequired\b)/i.test(prompt)) score += 1;
  if (/\b(?:do not|don't|never|avoid)\b/i.test(prompt)) score += 1;
  if (/(\bformat\b|\boutput\b|\breturn\b|\bresponse\b)/i.test(prompt)) score += 2;
  return Math.min(10, Math.max(0, score));
}

function scoreStructure(prompt: string): number {
  let score = 4;
  if (/^#{1,3}\s/m.test(prompt)) score += 2;
  if (/^\s*[-*]\s/m.test(prompt)) score += 1;
  if (/^\s*\d+[.)]\s/m.test(prompt)) score += 1;
  if (/\n\s*\n/.test(prompt)) score += 1;
  if (/(?:section|step|phase|part)\s*\d/i.test(prompt)) score += 1;
  return Math.min(10, Math.max(0, score));
}

function scoreCompleteness(prompt: string): number {
  let score = 5;
  if (/(\bcontext\b|\bbackground\b)/i.test(prompt)) score += 1;
  if (/(\bgoal\b|\bobjective\b|\bpurpose\b)/i.test(prompt)) score += 1;
  if (/(\baudience\b|\buser\b|\bwho\b)/i.test(prompt)) score += 1;
  if (/(\bconstraint\b|\blimitation\b)/i.test(prompt)) score += 1;
  if (/(\bexample\b|\bsample\b)/i.test(prompt)) score += 1;
  return Math.min(10, Math.max(0, score));
}

function scoreCreativity(prompt: string): number {
  let score = 5;
  if (/(\banalogize|metaphor|imagine|picture|visualize)/i.test(prompt)) score += 2;
  if (/(\brole\b|persona|act as|you are)/i.test(prompt)) score += 1;
  if (/(\bcreative|innovative|unique|novel)/i.test(prompt)) score += 1;
  if (prompt.includes("?")) score += 1;
  return Math.min(10, Math.max(0, score));
}

function scoreActionability(prompt: string): number {
  let score = 4;
  const actionVerbs =
    /\b(create|build|write|generate|produce|make|develop|design|implement|list|explain|analyze|compare|evaluate|describe|define|provide|give)\b/i;
  if (actionVerbs.test(prompt)) score += 2;
  if (/(\bstep\s*\d|first|then|next|finally)/i.test(prompt)) score += 1;
  if (/(\boutcome\b|\bresult\b|\bdeliverable\b)/i.test(prompt)) score += 1;
  if (/(\bformat\b|\bstructure\b|\bas\s+\w+\s+\ba?\s*list\b)/i.test(prompt)) score += 2;
  return Math.min(10, Math.max(0, score));
}

/** Get score label */
export function getScoreLabel(score: number): string {
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  if (score >= 5) return "Average";
  if (score >= 3) return "Below Average";
  return "Poor";
}
