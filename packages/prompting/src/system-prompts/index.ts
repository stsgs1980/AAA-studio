// ============================================================================
// @stsgs/prompting - System Prompt Templates (5 Phase 3 agent types)
// ============================================================================

import type { AgentType } from "@stsgs/shared";
import { SYSTEM_PROMPT_TEMPLATES } from "./data";

/** Get all system prompt templates */
export function getSystemPromptTemplates(): AgentType[] {
  return SYSTEM_PROMPT_TEMPLATES;
}

/** Get template by agent type ID */
export function getSystemPromptTemplate(id: string): AgentType | undefined {
  return SYSTEM_PROMPT_TEMPLATES.find(t => t.id === id);
}

/** Get templates for a specific phase */
export function getTemplatesByPhase(phase: number): AgentType[] {
  return SYSTEM_PROMPT_TEMPLATES.filter(t => t.phase === phase);
}

/**
 * Build a system prompt from a template and variable values.
 * Replaces {key} placeholders with provided values.
 */
export function buildSystemPrompt(
  templateId: string,
  values: Record<string, string>
): string | null {
  const tmpl = getSystemPromptTemplate(templateId);
  if (!tmpl) return null;

  let result = tmpl.template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value || `{${key}}`);
  }

  // Remove empty optional sections (lines with only unresolved placeholders)
  result = result
    .split("\n")
    .filter(line => !/^\{[a-z_]+\}$/.test(line.trim()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return result;
}

export { SYSTEM_PROMPT_TEMPLATES };
