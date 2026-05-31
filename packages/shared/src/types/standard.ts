// ============================================================================
// Unified Standard + Skill types (single source of truth)
// ============================================================================

/** StandardRule -- unified definition with name, description, pattern, enabled */
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

/** Standard categories */
export const STANDARD_CATEGORIES = [
  "general", "prompt", "agent", "flow", "quality", "security", "architecture",
] as const;

export type StandardCategory = (typeof STANDARD_CATEGORIES)[number];

/** Severity display options */
export const SEVERITY_OPTIONS: { value: StandardSeverity; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

/** Generate unique rule ID */
export function generateRuleId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Skill file roles -- matches Prisma SkillFile.role comment */
export const SKILL_FILE_ROLES = [
  'entry', 'code', 'test', 'config', 'doc', 'schema',
  'script', 'reference', 'eval',
] as const;
export type SkillFileRole = (typeof SKILL_FILE_ROLES)[number];

/** Skill definition -- full model synced with Prisma schema */
export interface Skill {
  id: string;
  name: string;
  slug: string;
  version: string;
  skillId: string;
  category: string;
  description: string;
  longDescription: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  code: string;
  tests?: string;
  tags: string[];
  triggers: string[];
  standardIds: string[];
  compatibility: string;
  dependencies: { skillId: string; version: string }[];
  annotations: Record<string, boolean>;
  author: string;
  license: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Skill categories */
export const SKILL_CATEGORIES = [
  "general", "code", "data", "security", "communication", "analysis",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
