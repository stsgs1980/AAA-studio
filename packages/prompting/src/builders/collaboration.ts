// ============================================================================
// @stsgs/prompting - Collaboration Context Builder
// Builds team roster and delegation protocol for Orchestrator + Workers.
// ============================================================================

import type { TeamMember } from "@stsgs/shared";

/** Build a team roster section for an Orchestrator agent. */
export function buildCollaborationContext(members: TeamMember[]): string {
  if (members.length === 0) return "";

  const lines: string[] = ["Team members:"];
  for (const m of members) {
    const caps = m.capabilities.map(c => `- ${c}`).join("\n  ");
    lines.push(`\n**${m.name}** (${m.role})\n  ${caps}`);
  }
  return lines.join("\n");
}

/** Build a delegation protocol section. */
export function buildDelegationProtocol(
  handoffMode: "return" | "transfer" = "return",
  maxRetries: number = 2
): string {
  const modeDesc = handoffMode === "return"
    ? "After each delegation, the team member returns results to you for synthesis."
    : "After delegation, the team member takes ownership of the subtask.";

  return (
    `Delegation protocol:\n${modeDesc}\n` +
    `- Delegate one subtask at a time.\n` +
    `- Each delegation must be self-contained with all needed context.\n` +
    `- If a result is unsatisfactory, re-delegate with improved instructions (max ${maxRetries} retries).\n` +
    `- After all subtasks complete, synthesize results into a coherent response.`
  );
}

/** Build a worker's context section (who else is on the team). */
export function buildWorkerContext(selfId: string, members: TeamMember[]): string {
  const others = members.filter(m => m.id !== selfId);
  if (others.length === 0) return "";

  const lines = ["You are part of a team. Other team members:"];
  for (const m of others) {
    lines.push(`- ${m.name}: ${m.role} -- ${m.capabilities.join(", ")}`);
  }
  lines.push("If a task falls outside your expertise, note this so it can be delegated.");
  return lines.join("\n");
}
