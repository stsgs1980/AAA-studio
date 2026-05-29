import type { LibraryPrompt } from "./prompt-categories";
import { SYSTEM_PROMPTS } from "./system-prompts";
import { CODE_PROMPTS } from "./code-prompts";
import { CREATIVE_PROMPTS } from "./creative-prompts";
import { ANALYSIS_PROMPTS } from "./analysis-prompts";
import { DATA_PROMPTS } from "./data-prompts";
import { SECURITY_PROMPTS } from "./security-prompts";

/**
 * All prompts merged into a single array.
 * Add new category files here as the library grows.
 */
export const PROMPT_LIBRARY: LibraryPrompt[] = [
  ...SYSTEM_PROMPTS,
  ...CODE_PROMPTS,
  ...CREATIVE_PROMPTS,
  ...ANALYSIS_PROMPTS,
  ...DATA_PROMPTS,
  ...SECURITY_PROMPTS,
];
