// ============================================================================
// Unified Standard types
// ============================================================================

/** StandardRule — unified definition with name, description, pattern, enabled */
export interface StandardRule {
  id: string;
  name: string;
  description: string;
  pattern?: string; // regex or glob pattern for linting
  enabled: boolean;
}

/** Standard definition */
export interface Standard {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: StandardRule[];
  severity: "info" | "warning" | "error";
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Standard severity levels */
export type StandardSeverity = Standard["severity"];

/** Skill definition — linked to Standards via standardIds */
export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  code: string;
  tests?: string;
  tags: string[];
  standardIds: string[]; // linked Standard IDs
  createdAt: Date;
  updatedAt: Date;
}

/** Skill categories */
export const SKILL_CATEGORIES = [
  "general", "code", "data", "security", "communication", "analysis",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
