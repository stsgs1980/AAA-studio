export interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  framework: string | null;
  tags: string[];
}

export const CATEGORIES = [
  "general",
  "system",
  "user",
  "agent",
  "chain-of-thought",
  "few-shot",
  "evaluation",
] as const;

export function extractVars(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g);
  return [...new Set(matches?.map((m) => m.replace(/[{}]/g, "")) ?? [])];
}

export function getScoreColor(score: number): string {
  if (score >= 9) return "bg-brand-green";
  if (score >= 7) return "bg-brand-accent";
  if (score >= 5) return "bg-brand-amber";
  return "bg-brand-red";
}

export function getScoreRingColor(score: number): string {
  if (score >= 9) return "border-brand-green text-brand-green";
  if (score >= 7) return "border-brand-accent text-brand-accent";
  if (score >= 5) return "border-brand-amber text-brand-amber";
  return "border-brand-red text-brand-red";
}

export function getIntentColor(intent: string): string {
  const map: Record<string, string> = {
    code: "text-brand-cyan bg-brand-cyan/15",
    creative: "text-brand-purple bg-brand-purple/15",
    analysis: "text-brand-amber bg-brand-amber/15",
    question: "text-brand-accent bg-brand-accent/15",
    instruction: "text-brand-green bg-brand-green/15",
    conversation: "text-text-secondary bg-midnight-elevated",
    correction: "text-brand-red bg-brand-red/15",
  };
  return map[intent] ?? "text-text-secondary bg-midnight-elevated";
}

// Re-exports from @stsgs/prompting
export type { PromptScore } from "@stsgs/prompting";
export type { Formula } from "@stsgs/prompting";
export type { Framework, FrameworkSection } from "@stsgs/prompting";
export type { PromptIntent, IntentResult } from "@stsgs/prompting";
export type { ComparisonResult, ComparisonCriterion } from "@stsgs/prompting";
