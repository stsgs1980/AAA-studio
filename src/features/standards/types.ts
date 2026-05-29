// ============================================================================
// Standards feature types — re-exports from @stsgs/shared
// Single source of truth: packages/shared/src/types/standard.ts
// ============================================================================

export type {
  Standard,
  StandardRule,
  StandardSeverity,
  StandardCategory,
} from "@stsgs/shared";

export {
  SEVERITY_OPTIONS,
  STANDARD_CATEGORIES,
  generateRuleId,
} from "@stsgs/shared";
