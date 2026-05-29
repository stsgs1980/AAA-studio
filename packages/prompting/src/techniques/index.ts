import type { PromptTechnique, TechniqueCategory, OutputFormat } from "@stsgs/shared";
import { TECHNIQUES_DATA } from "./data.js";

/** Return all techniques, optionally filtered by category. */
export function getTechniques(filter?: TechniqueCategory): PromptTechnique[] {
  if (!filter) return TECHNIQUES_DATA;
  return TECHNIQUES_DATA.filter((t) => t.category === filter);
}

/** Return a single technique by id, or undefined if not found. */
export function getTechnique(id: string): PromptTechnique | undefined {
  return TECHNIQUES_DATA.find((t) => t.id === id);
}

/** Return techniques applicable to a given output format. */
export function getTechniquesForFormat(format: OutputFormat): PromptTechnique[] {
  return TECHNIQUES_DATA.filter((t) => t.applicableTo.includes(format));
}

/** Return techniques matching a difficulty level. */
export function getTechniquesByDifficulty(
  level: PromptTechnique["difficulty"],
): PromptTechnique[] {
  return TECHNIQUES_DATA.filter((t) => t.difficulty === level);
}
