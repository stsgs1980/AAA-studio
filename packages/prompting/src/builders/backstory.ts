// ============================================================================
// @stsgs/prompting - Backstory Builder (CrewAI pattern)
// 3-5 sentences of expertise dramatically affect output quality.
// ============================================================================

import type { BackstoryDef } from "@stsgs/shared";

/**
 * Build a backstory section for a Specialist agent.
 */
export function buildBackstory(def: BackstoryDef): string {
  const parts: string[] = [];

  parts.push(
    `${def.expertise} You have spent years mastering ${def.role} ` +
    "and understand both the theory and the practical pitfalls."
  );

  parts.push(def.approach);
  parts.push(def.personality);

  if (def.constraints.length > 0) {
    const constraints = def.constraints.map(c => `- ${c}`).join("\n");
    parts.push(`Key constraints:\n${constraints}`);
  }

  return parts.join("\n");
}

/** Build a minimal backstory (2 sentences) for lightweight agents. */
export function buildMinimalBackstory(role: string, expertise: string): string {
  return (
    `You are an expert ${role} with deep knowledge of ${expertise}. ` +
    "You approach problems methodically and deliver precise results."
  );
}
