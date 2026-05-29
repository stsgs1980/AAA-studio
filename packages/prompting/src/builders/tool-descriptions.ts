// ============================================================================
// @stsgs/prompting - Tool Description Builder
// Anthropic ACI: "Tool descriptions are as important as the system prompt."
// ============================================================================

import type { ToolDescriptionDef } from "@stsgs/shared";

/**
 * Build a tool description following Anthropic ACI guidelines.
 */
export function buildToolDescription(def: ToolDescriptionDef): string {
  const sections: string[] = [];

  sections.push(`**${def.name}**: ${def.description}`);
  sections.push(`When to use: ${def.whenToUse}`);

  if (def.parameters.length > 0) {
    const params = def.parameters
      .map(p => {
        const req = p.required ? "(required)" : "(optional)";
        return `- \`${p.name}\` ${req}: ${p.description}`;
      })
      .join("\n");
    sections.push(`Parameters:\n${params}`);
  }

  if (def.edgeCases && def.edgeCases.length > 0) {
    const cases = def.edgeCases.map(c => `- ${c}`).join("\n");
    sections.push(`Edge cases:\n${cases}`);
  }

  return sections.join("\n\n");
}

/**
 * Build a concise tool description for Router agents.
 */
export function buildToolDescriptionForRouter(
  name: string, description: string, capabilities: string[]
): string {
  const caps = capabilities.map(c => `- ${c}`).join("\n");
  return `${name}: ${description}\n${caps}`;
}
