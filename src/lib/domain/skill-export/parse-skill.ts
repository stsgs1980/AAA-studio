/** Shared utility: parse JSON string fields from DB Skill record.
 *  Eliminates the 3x copy-paste across route.ts, [id]/route.ts, format-adapters.ts */

export function parseSkillFields(s: Record<string, unknown>) {
  return {
    ...s,
    inputSchema: JSON.parse(s.inputSchema as string),
    outputSchema: JSON.parse(s.outputSchema as string),
    tags: JSON.parse(s.tags as string),
    triggers: JSON.parse(s.triggers as string),
    standardIds: JSON.parse(s.standardIds as string),
    dependencies: JSON.parse(s.dependencies as string),
    annotations: JSON.parse(s.annotations as string),
  };
}
