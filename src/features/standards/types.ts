export interface StandardRule {
  id: string;
  description: string;
  enabled: boolean;
}

export interface Standard {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: StandardRule[];
  severity: "error" | "warning" | "info";
  version: string;
  createdAt: string;
  updatedAt?: string;
}

export type StandardSeverity = Standard["severity"];

export const SEVERITY_OPTIONS: { value: StandardSeverity; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

export const CATEGORY_OPTIONS = [
  "general", "prompt", "agent", "flow", "quality", "security", "architecture",
] as const;

export function generateRuleId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
