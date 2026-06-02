// ============================================================================
// AAA Studio -- Skill Completeness Criteria
// 6 criteria for scoring skill completeness. Each matched = ~17 points.
// ============================================================================

import type { ParsedSkill } from './types';

interface CompletenessCriterion {
  label: string;
  /** Returns true if this criterion is met */
  test: (ctx: SkillParseContext) => boolean;
}

export interface SkillParseContext {
  sections: Set<string>;
  frontmatter: Record<string, string>;
  body: string;
}

export const COMPLETENESS_CRITERIA: CompletenessCriterion[] = [
  // 1. Has a purpose/description
  { label: 'description', test: ({ sections, frontmatter }) =>
    sections.has('description') || sections.has('overview') || sections.has('summary')
      || sections.has('what this skill does') || !!frontmatter.description },
  // 2. Has trigger/when-to-use
  { label: 'trigger', test: ({ sections, frontmatter }) =>
    sections.has('trigger') || sections.has('when to use') || sections.has('use cases')
      || sections.has('usage') || !!(frontmatter.trigger && frontmatter.trigger.length > 0) },
  // 3. Has steps/instructions/how-to
  { label: 'steps', test: ({ sections }) =>
    sections.has('steps') || sections.has('instructions') || sections.has('how to')
      || sections.has('how to use') || sections.has('quick start') || sections.has('getting started')
      || sections.has('implementation') || sections.has('workflow') },
  // 4. Has output/return value specification
  { label: 'output', test: ({ sections }) =>
    sections.has('output') || sections.has('returns') || sections.has('response')
      || sections.has('result') || sections.has('output format') || sections.has('parameters') },
  // 5. Has worked examples or code blocks
  { label: 'examples', test: ({ sections, body }) =>
    sections.has('examples') || sections.has('example') || sections.has('sample output')
      || sections.has('demo') || body.includes('```') },
  // 6. Has constraints/rules/warnings
  { label: 'constraints', test: ({ sections, body }) =>
    sections.has('constraints') || sections.has('rules') || sections.has('warnings')
      || sections.has('notes') || sections.has('limitations') || sections.has('important')
      || /(?:warning|caution|must|should not|do not)\b/i.test(body) },
];

/** Score completeness: returns 0-100 + array of matched/missed criterion labels */
export function scoreCompleteness(
  ctx: SkillParseContext,
): { score: number; matched: string[]; missed: string[] } {
  const matched: string[] = [];
  const missed: string[] = [];
  for (const c of COMPLETENESS_CRITERIA) {
    (c.test(ctx) ? matched : missed).push(c.label);
  }
  return { score: Math.round((matched.length / COMPLETENESS_CRITERIA.length) * 100), matched, missed };
}
