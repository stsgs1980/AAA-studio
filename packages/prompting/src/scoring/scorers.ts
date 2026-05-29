// ============================================================================
// @stsgs/prompting - Individual scoring functions
// ============================================================================

import { clamp } from "./helpers";

export function scoreClarity(prompt: string): number {
  let score = 2;
  const sentences = prompt.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const wc = prompt.split(/\s+/).length;

  if (sentences.length >= 1) score += 1;
  if (wc >= 8) score += 1;
  if (wc >= 20) score += 1;
  if (wc >= 40) score += 1;
  if (/etc\.|and so on|stuff|things|whatever/i.test(prompt)) score -= 2;
  const avgWords = wc / Math.max(sentences.length, 1);
  if (avgWords >= 5 && avgWords <= 25) score += 1;
  if (/[.!?]/.test(prompt)) score += 1;
  if (/(\n\s*\n|;\s)/.test(prompt)) score += 1;
  if (/^(you are|as a|act as|imagine)/i.test(prompt.trim())) score += 2;
  if (prompt === prompt.toUpperCase() && prompt.length > 5) score -= 1;

  return clamp(score);
}

export function scoreSpecificity(prompt: string): number {
  let score = 1;
  const wc = prompt.split(/\s+/).length;
  if (wc >= 15) score += 1;
  if (wc >= 30) score += 1;
  if (wc >= 60) score += 1;
  if (/\d+/.test(prompt)) score += 1;
  if (/\b\d{2,}\b/.test(prompt)) score += 1;
  if (/\b(example|such as|for instance|e\.g\.)\b/i.test(prompt)) score += 1;
  if (/\b(must|should|shall|required|only|exactly)\b/i.test(prompt)) score += 1;
  if (/\b(do not|don't|never|avoid|not)\b/i.test(prompt)) score += 1;
  if (/\b(format|output|return|response|json|xml|markdown)\b/i.test(prompt)) score += 1;
  return clamp(score);
}

export function scoreStructure(prompt: string): number {
  let score = 2;
  const sentences = prompt.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length >= 2) score += 1;
  if (sentences.length >= 4) score += 1;
  const headers = (prompt.match(/^#{1,3}\s/gm) || []).length;
  if (headers >= 1) score += 1;
  if (headers >= 2) score += 1;
  const bullets = (prompt.match(/^\s*[-*]\s/gm) || []).length;
  if (bullets >= 1) score += 1;
  if (bullets >= 3) score += 1;
  const numbered = (prompt.match(/^\s*\d+[.)]\s/gm) || []).length;
  if (numbered >= 1) score += 1;
  if (numbered >= 3) score += 1;
  const paragraphs = prompt.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length >= 2) score += 1;
  if (paragraphs.length >= 3) score += 1;
  if (/\b(step|phase|part|section|chapter)\s*\d/i.test(prompt)) score += 1;
  return clamp(score);
}

export function scoreCompleteness(prompt: string): number {
  let score = 2;
  if (/\b(context|background|scenario|given)\b/i.test(prompt)) score += 1;
  if (/\b(goal|objective|purpose|aim|task)\b/i.test(prompt)) score += 1;
  if (/\b(audience|user|for|who|reader)\b/i.test(prompt)) score += 1;
  if (/\b(constraint|limitation|boundary|within|only)\b/i.test(prompt)) score += 1;
  if (/\b(example|sample|instance|case)\b/i.test(prompt)) score += 1;
  if (/\b(tone|style|voice|formal|casual)\b/i.test(prompt)) score += 1;
  if (prompt.split(/\s+/).length >= 40) score += 1;
  return clamp(score);
}

export function scoreCreativity(prompt: string): number {
  let score = 2;
  if (/\b(you are|as a|act as|pretend|imagine|persona)\b/i.test(prompt)) score += 2;
  if (/\b(analogize|metaphor|like a|similar to)\b/i.test(prompt)) score += 2;
  if (/\b(creative|innovative|unique|novel|original)\b/i.test(prompt)) score += 1;
  if (prompt.includes("?")) score += 1;
  if (/\b(from the perspective|in the role of|as if)\b/i.test(prompt)) score += 2;
  return clamp(score);
}

export function scoreActionability(prompt: string): number {
  let score = 1;
  const actionVerbs = /\b(create|build|write|generate|produce|make|develop|design|implement|list|explain|analyze|compare|evaluate|describe|define|provide|give|extract|transform|convert|translate|summarize|review)\b/i;
  if (actionVerbs.test(prompt)) score += 2;
  if (/\b(step|first|then|next|finally|after that)\b/i.test(prompt)) score += 1;
  if (/\b(outcome|result|deliverable|output|product|report|list)\b/i.test(prompt)) score += 1;
  if (/\b(format|structure|as a list|as json|in markdown|as table|severity|level)\b/i.test(prompt)) score += 2;
  if (/\b(\d+\s+(items?|points?|steps?|examples?|paragraphs?|levels?|each))\b/i.test(prompt)) score += 1;
  return clamp(score);
}
