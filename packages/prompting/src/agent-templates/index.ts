import type { AgentRole } from "@stsgs/shared";
import { AGENT_ROLES_DATA } from "./roles";

/** Get all available agent roles */
export function getAgentRoles(): AgentRole[] {
  return AGENT_ROLES_DATA;
}

/** Get a single agent role by id */
export function getAgentRole(id: string): AgentRole | undefined {
  return AGENT_ROLES_DATA.find((r) => r.id === id);
}

/** Get the system prompt string for a given role id */
export function getRoleSystemPrompt(roleId: string): string | undefined {
  return getAgentRole(roleId)?.systemPrompt;
}

/** Find the best matching agent role for a natural-language intent string */
export function getBestAgentForIntent(intent: string): AgentRole | undefined {
  const lower = intent.toLowerCase();
  const scored = AGENT_ROLES_DATA.map((role) => {
    let score = 0;
    for (const s of role.strengths) {
      if (lower.includes(s.toLowerCase())) score += 2;
    }
    for (const b of role.bestFor) {
      if (lower.includes(b.toLowerCase())) score += 3;
    }
    if (lower.includes(role.id)) score += 4;
    return { role, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].role : undefined;
}
