import type { PromptFramework, FrameworkStep } from "@stsgs/shared";
import { FRAMEWORKS_DATA } from "./data";

// ─── Backward compat ──────────────────────────────────────────

/** @deprecated Use getFrameworks() or PromptFramework from @stsgs/shared */
export const FRAMEWORKS = FRAMEWORKS_DATA;

/** @deprecated Use PromptFramework from @stsgs/shared */
export type Framework = PromptFramework;

/** @deprecated Use FrameworkStep from @stsgs/shared */
export type FrameworkSection = FrameworkStep;

// ─── Query Functions ──────────────────────────────────────────

/** Returns all registered prompting frameworks. */
export function getFrameworks(): PromptFramework[] {
  return FRAMEWORKS_DATA;
}

/** Returns a single framework by its ID, or undefined if not found. */
export function getFramework(id: string): PromptFramework | undefined {
  return FRAMEWORKS_DATA.find((f) => f.id === id);
}

/** Returns frameworks filtered by the given complexity level. */
export function getFrameworksByComplexity(
  level: PromptFramework["complexity"],
): PromptFramework[] {
  return FRAMEWORKS_DATA.filter((f) => f.complexity === level);
}

// ─── Builder ──────────────────────────────────────────────────

/**
 * Builds a prompt string from a framework's steps and the provided values.
 *
 * For each step whose label matches a key in `values`, the value is used.
 * Missing required steps are replaced with their placeholder.
 * Optional steps with no value are omitted.
 */
export function buildFromFramework(
  frameworkId: string,
  values: Record<string, string>,
): string {
  const framework = getFramework(frameworkId);
  if (!framework) return "";

  return framework.steps
    .filter((step) => {
      // Always include required steps (placeholder if no value)
      if (step.required) return true;
      // Include optional steps only when a value is provided
      const key = step.label;
      return key in values && values[key].length > 0;
    })
    .map((step) => {
      const key = step.label;
      const value = values[key];
      const content = value?.length > 0 ? value : step.placeholder;
      return `## ${step.label}\n${content}`;
    })
    .join("\n\n");
}
