// ============================================================================
// Skill types -- re-export from unified standard.ts + SkillFile types
// ============================================================================

export type { Skill, SkillCategory, SKILL_CATEGORIES } from "./standard";

/** SkillFile -- a single file within a Skill */
export interface SkillFile {
  id: string;
  skillId: string;
  path: string;
  content: string;
  language: SkillFileLanguage;
  role: SkillFileRole;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Language options for a SkillFile */
export type SkillFileLanguage =
  | "typescript" | "javascript" | "python" | "json"
  | "yaml" | "markdown" | "text" | "bash";

/** Role options for a SkillFile */
export type SkillFileRole =
  | "entry" | "code" | "test" | "config" | "doc" | "schema";

/** SkillFile role display metadata */
export const SKILL_FILE_ROLES: { value: SkillFileRole; label: string; icon: string }[] = [
  { value: "entry",  label: "Entry point", icon: "🚀" },
  { value: "code",   label: "Code",        icon: "📄" },
  { value: "test",   label: "Test",        icon: "🧪" },
  { value: "config", label: "Config",      icon: "⚙️" },
  { value: "doc",    label: "Documentation",icon: "📖" },
  { value: "schema", label: "Schema",      icon: "📋" },
];

/** SkillFile language display metadata */
export const SKILL_FILE_LANGUAGES: { value: SkillFileLanguage; label: string }[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python",    label: "Python" },
  { value: "json",      label: "JSON" },
  { value: "yaml",      label: "YAML" },
  { value: "markdown",  label: "Markdown" },
  { value: "text",      label: "Plain Text" },
  { value: "bash",      label: "Bash" },
];

/** Detect language from file path */
export function detectLanguage(path: string): SkillFileLanguage {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, SkillFileLanguage> = {
    ts: "typescript", tsx: "typescript",
    js: "javascript", jsx: "javascript", mjs: "javascript",
    py: "python",
    json: "json",
    yaml: "yaml", yml: "yaml",
    md: "markdown", mdx: "markdown",
    sh: "bash", bash: "bash",
  };
  return map[ext] ?? "text";
}

/** Detect role from file path */
export function detectRole(path: string): SkillFileRole {
  if (path.startsWith("tests/") || path.includes(".test.") || path.includes(".spec.")) return "test";
  if (path === "README.md" || path.startsWith("docs/")) return "doc";
  if (path.startsWith("config/") || path.endsWith(".config.") || path === ".env") return "config";
  if (path.includes("schema") || path.endsWith(".schema.json")) return "schema";
  if (path === "index.ts" || path === "main.ts" || path === "src/index.ts") return "entry";
  return "code";
}
