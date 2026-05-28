/**
 * Prompt categories for the library.
 * Each maps to a color pair used in badges and filters.
 */
export const PROMPT_CATEGORIES = [
  { id: "system",    label: "System",    color: "text-brand-accent bg-brand-accent/15" },
  { id: "code",      label: "Code",      color: "text-brand-green bg-brand-green/15" },
  { id: "creative",  label: "Creative",  color: "text-brand-purple bg-brand-purple/15" },
  { id: "analysis",  label: "Analysis",  color: "text-brand-amber bg-brand-amber/15" },
  { id: "security",  label: "Security",  color: "text-brand-red bg-brand-red/15" },
  { id: "data",      label: "Data",      color: "text-brand-cyan bg-brand-cyan/15" },
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number]["id"];

export interface LibraryPrompt {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  tags: string[];
  prompt: string;
  /** Formula acronym if this prompt follows a known structure */
  formulaRef?: string;
}
