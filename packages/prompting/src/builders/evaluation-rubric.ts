// ============================================================================
// @stsgs/prompting - Evaluation Rubric Builder
// Evaluation prompts need rubrics, not vague "is this good?" instructions.
// ============================================================================

import type { EvaluationCriterion } from "@stsgs/shared";

/** Build an evaluation section for a system prompt. */
export function buildEvaluationRubric(
  criteria: EvaluationCriterion[], scaleMax: number = 10
): string {
  const lines: string[] = ["Evaluation criteria:"];

  for (const c of criteria) {
    lines.push(
      `${c.weight > 1 ? `(${c.weight}x weight) ` : ""}` +
      `${c.name}: ${c.description}`
    );
    lines.push(`  Scoring: ${c.scoringGuide}`);
  }

  lines.push(`\nScore each criterion 0-${scaleMax}. Provide specific feedback.`);
  return lines.join("\n");
}

/** Build a pass/fail rubric section with threshold. */
export function buildPassFailRubric(
  criteria: EvaluationCriterion[], threshold: number = 7
): string {
  const rubric = buildEvaluationRubric(criteria);
  return (
    `${rubric}\n\n` +
    `Pass threshold: ${threshold}/10.\n` +
    "If score >= threshold, output 'Pass' with brief justification.\n" +
    "If score < threshold, output 'Fail' with specific improvement suggestions."
  );
}

/** Get a default rubric for common evaluation scenarios. */
export function getDefaultRubric(
  scenario: "code" | "content" | "prompt" | "design"
): EvaluationCriterion[] {
  const rubrics: Record<string, EvaluationCriterion[]> = {
    code: [
      { name: "Correctness", description: "Does it work as specified?", weight: 3, scoringGuide: "10=perfect, 5=partial bugs, 0=broken" },
      { name: "Type Safety", description: "Are types correct and complete?", weight: 2, scoringGuide: "10=full typing, 5=partial, 0=any everywhere" },
      { name: "Error Handling", description: "Are edge cases handled?", weight: 2, scoringGuide: "10=comprehensive, 5=basic, 0=none" },
      { name: "Readability", description: "Is the code clear?", weight: 1, scoringGuide: "10=self-documenting, 5=needs comments, 0=unreadable" },
    ],
    content: [
      { name: "Accuracy", description: "Is the information correct?", weight: 3, scoringGuide: "10=verified, 5=mostly, 0=inaccurate" },
      { name: "Clarity", description: "Is it easy to understand?", weight: 2, scoringGuide: "10=crystal clear, 5=needs re-reading, 0=confusing" },
      { name: "Completeness", description: "Does it cover the topic?", weight: 2, scoringGuide: "10=comprehensive, 5=gaps, 0=superficial" },
      { name: "Relevance", description: "Does it address the audience?", weight: 1, scoringGuide: "10=targeted, 5=somewhat, 0=off-target" },
    ],
    prompt: [
      { name: "Specificity", description: "Are instructions unambiguous?", weight: 3, scoringGuide: "10=precise, 5=vague, 0=unclear" },
      { name: "Structure", description: "Is the prompt well-organized?", weight: 2, scoringGuide: "10=excellent flow, 5=needs work, 0=chaotic" },
      { name: "Constraints", description: "Are boundaries specified?", weight: 2, scoringGuide: "10=explicit, 5=partial, 0=none" },
      { name: "Examples", description: "Are examples provided?", weight: 1, scoringGuide: "10=relevant, 5=generic, 0=none" },
    ],
    design: [
      { name: "Usability", description: "Is it intuitive?", weight: 3, scoringGuide: "10=effortless, 5=learnable, 0=confusing" },
      { name: "Accessibility", description: "Does it meet WCAG?", weight: 2, scoringGuide: "10=AA compliant, 5=partial, 0=inaccessible" },
      { name: "Consistency", description: "Does it follow patterns?", weight: 2, scoringGuide: "10=consistent, 5=deviations, 0=inconsistent" },
      { name: "Visual Hierarchy", description: "Is info prioritized?", weight: 1, scoringGuide: "10=clear, 5=acceptable, 0=flat" },
    ],
  };
  return rubrics[scenario] ?? rubrics.content;
}
