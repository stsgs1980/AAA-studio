// ============================================================================
// @stsgs/prompting - Scoring helpers
// ============================================================================

export function clamp(value: number): number {
  return Math.min(10, Math.max(0, value));
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function sentenceCount(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
}
