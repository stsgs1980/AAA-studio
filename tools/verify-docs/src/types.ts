// ============================================================================
// types.ts -- Type definitions for verify-docs engine
// ============================================================================

/** A single check: count something in code, compare with README */
export interface CheckConfig {
  /** Human-readable name for output */
  name: string;
  /** Where to get the actual value from. Built-in: "file:...", "glob:...", "git:HEAD". Custom: "custom:..." */
  source: string;
  /** Regex pattern to count in the source file (only for file: source). All matches are counted. */
  countPattern?: string;
  /** Exclude matches that contain any of these strings */
  countExclude?: string[];
  /** Exclude file paths that contain any of these strings (only for glob: source) */
  exclude?: string[];
  /** Regex to extract the number from README. Must have a capturing group (\\d+). null = info-only. */
  readmePattern: string | null;
  /** Allowed difference between actual and readme. 0 = exact match. Use for commit counts etc. */
  tolerance?: number;
  /** If true, only print the value -- don't compare with README */
  infoOnly?: boolean;
}

/** Cross-repo consistency check: compare a value from a sibling repo with an expected value */
export interface CrossRepoConfig {
  /** Human-readable name for output */
  name: string;
  /** Relative path to sibling repo from project root (e.g. "../other-repo") */
  repo: string;
  /** File path within the sibling repo. Prefix with "file:" for clarity. */
  source: string;
  /** How to extract a number from the file:
   *  - "extract:PATTERN" -- extract first match of (\\d+) group from PATTERN
   *  - "PATTERN" -- count all regex matches */
  filePattern: string;
  /** Name of a Section 1 check to compare against (must match a CheckConfig.name) */
  matchAgainst?: string | null;
  /** Regex to extract expected value from README (alternative to matchAgainst) */
  readmePattern?: string | null;
  /** Allowed difference between values */
  tolerance?: number;
}

// ============================================================================
// Section 3: Version synchronization
// ============================================================================

/** A single target file whose version must match the source */
export interface VersionTarget {
  /** File path relative to project root */
  file: string;
  /** Regex with a capturing group for the version string (e.g. "version:\\s*([\\d.]+)") */
  pattern: string;
}

/** Version sync: one source of truth, many targets must match */
export interface VersionSyncConfig {
  /** Source of truth for the version number.
   *  Uses the same source system: "file:manifest.json", "file:package.json", etc. */
  source: string;
  /** Regex with one capturing group that extracts the version from the source file.
   *  Example: "\"version\":\\s*\"([\\d.]+)\"" */
  extractPattern: string;
  /** List of files whose version must match the source */
  targets: VersionTarget[];
}

// ============================================================================
// Section 4: Feature status (stub detection)
// ============================================================================

/** Feature status check: detect "stubs" in docs that are actually implemented */
export interface FeatureStatusConfig {
  /** Human-readable feature name */
  name: string;
  /** Patterns in documentation that indicate a feature is NOT implemented.
   *  If ANY of these appear in docFile near a context match, the feature is
   *  considered "claimed as stub". Examples: ["stub", "TODO", "not implemented"] */
  stubPatterns: string[];
  /** Documentation file to scan for stub markers (relative to project root) */
  docFile: string;
  /** Optional: regex context to narrow the search area in docFile.
   *  If provided, stubPatterns are only checked within lines matching this regex.
   *  Example: "vacancy.detail" -- only look for stubs near lines mentioning "vacancy detail" */
  contextPattern?: string;
  /** Files that, if they ALL exist, prove the feature is implemented.
   *  At least one file must be specified. */
  implementationFiles: string[];
  /** Optional: patterns in documentation that indicate a feature IS implemented.
   *  If ANY of these appear in docFile near a context match, the feature is
   *  considered "claimed as working". Examples: ["implemented", "working", "done"] */
  implementedPatterns?: string[];
}

// ============================================================================
// Section 5: Documentation coverage
// ============================================================================

/** Documentation coverage check: verify that code files are mentioned in docs */
export interface DocCoverageConfig {
  /** Human-readable name for this coverage check */
  name: string;
  /** Directory to scan for source files (relative to project root). Example: "src/lib" */
  sourceDir: string;
  /** Glob pattern for file names to check. Default: "*" (all files).
   *  Example: "*.js" or "*.py" */
  glob?: string;
  /** Documentation file to check for mentions (relative to project root).
   *  Example: "ARCHITECTURE.md" */
  docFile: string;
  /** If true, every matching source file must be mentioned in docFile.
   *  If false, only report count of mentioned vs not mentioned (info-only). */
  requiredMention: boolean;
  /** "err" = mismatch counts as error (blocks push).
   *  "warn" = only warns, does not increment error count. */
  severity: "err" | "warn";
  /** File name patterns to exclude from the check.
   *  Example: ["index.js", "*.test.js", "*.spec.js"] */
  excludePatterns?: string[];
}

// ============================================================================
// Root config and result types
// ============================================================================

/** Root config: what to verify and where to find it */
export interface VerifyConfig {
  /** Path to the document to verify (relative to project root). Usually "README.md" */
  readme: string;
  /** Section 1 checks: code vs README */
  checks: CheckConfig[];
  /** Section 2 checks: cross-repo consistency (optional) */
  crossRepo?: CrossRepoConfig[];
  /** Section 3: version synchronization (optional) */
  versionSync?: VersionSyncConfig;
  /** Section 4: feature status / stub detection (optional) */
  featureStatus?: FeatureStatusConfig[];
  /** Section 5: documentation coverage (optional) */
  docCoverage?: DocCoverageConfig[];
}

/** Overall verification result */
export interface VerifyResult {
  /** true if all checks passed */
  passed: boolean;
  /** Number of mismatches found */
  errors: number;
  /** Results from Section 1 (code vs README) */
  section1: LineResult[];
  /** Results from Section 2 (cross-repo consistency) */
  section2: LineResult[];
  /** Results from Section 3 (version synchronization) */
  section3: LineResult[];
  /** Results from Section 4 (feature status / stub detection) */
  section4: LineResult[];
  /** Results from Section 5 (documentation coverage) */
  section5: LineResult[];
}

/** A single output line */
export interface LineResult {
  /** Status: OK = match, ERR = mismatch, info = info-only, skip = skipped, ci = skipped in CI, warn = soft error */
  status: "OK" | "ERR" | "info" | "skip" | "ci" | "warn";
  /** Check name */
  name: string;
  /** Human-readable detail string */
  detail: string;
}

/** Source resolver function type */
export type SourceResolver = (source: string, root: string) => number | null;
