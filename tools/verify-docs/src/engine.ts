// ============================================================================
// engine.ts — Core verification engine
//
// Generic, project-agnostic. Reads a config, resolves sources, compares.
// Custom source types can be registered via registerSource().
// ============================================================================

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

// ── Types ──────────────────────────────────────────────────────────────────

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
  /** If true, only print the value — don't compare with README */
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
   *  - "extract:PATTERN" — extract first match of (\\d+) group from PATTERN
   *  - "PATTERN" — count all regex matches */
  filePattern: string;
  /** Name of a Section 1 check to compare against (must match a CheckConfig.name) */
  matchAgainst?: string | null;
  /** Regex to extract expected value from README (alternative to matchAgainst) */
  readmePattern?: string | null;
  /** Allowed difference between values */
  tolerance?: number;
}

/** Root config: what to verify and where to find it */
export interface VerifyConfig {
  /** Path to the document to verify (relative to project root). Usually "README.md" */
  readme: string;
  /** Section 1 checks: code vs README */
  checks: CheckConfig[];
  /** Section 2 checks: cross-repo consistency (optional) */
  crossRepo?: CrossRepoConfig[];
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
}

/** A single output line */
export interface LineResult {
  /** Status: OK = match, ERR = mismatch, info = info-only, skip = skipped, ci = skipped in CI */
  status: "OK" | "ERR" | "info" | "skip" | "ci";
  /** Check name */
  name: string;
  /** Human-readable detail string */
  detail: string;
}

// ── Source resolvers (extensible) ──────────────────────────────────────────

type SourceResolver = (source: string, root: string) => number | null;

const resolvers: Map<string, SourceResolver> = new Map();

// ── Built-in source resolvers ─────────────────────────────────────────────

resolvers.set("git:HEAD", (_source: string, root: string) => {
  try {
    // Skip on shallow clone — history is incomplete
    const isShallow = execSync(
      "git rev-parse --is-shallow-repository", { cwd: root }
    ).toString().trim();
    if (isShallow === "true") return null;
    return parseInt(
      execSync("git rev-list --count HEAD", { cwd: root }).toString().trim(),
      10
    );
  } catch {
    return null;
  }
});

resolvers.set("glob:", (source: string, root: string) => {
  const globPath = source.slice(5);
  const parts = globPath.split("/");
  const fileName = parts.pop()!;
  const dir = parts.join("/");
  const regex = new RegExp(
    fileName.replace(/\*/g, ".*").replace(/\./g, "\\.") + "$"
  );
  return findFiles(dir || ".", regex, root).length;
});

resolvers.set("file:", () => {
  // Handled separately with countPattern in resolveCheck
  return -1;
});

/**
 * Register a custom source resolver.
 *
 * @param prefix - Source prefix to match (e.g. "custom:screens")
 * @param resolver - Function that takes (source, root) and returns a number or null
 *
 * @example
 * registerSource("custom:screens", (_source, root) => {
 *   const pages = findFiles("src/app", /page\.tsx$/, root);
 *   return pages.length;
 * });
 */
export function registerSource(prefix: string, resolver: SourceResolver): void {
  resolvers.set(prefix, resolver);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function findFiles(dir: string, pattern: RegExp, root: string): string[] {
  const results: string[] = [];
  const fullDir = join(root, dir);
  try {
    const entries = readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      if (["node_modules", ".next", "dist", ".git", ".turbo", "build", "out"].includes(entry.name)) continue;
      const relPath = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        results.push(...findFiles(relPath, pattern, root));
      } else if (pattern.test(entry.name)) {
        results.push(relPath);
      }
    }
  } catch {
    /* directory doesn't exist */
  }
  return results;
}

function safeRead(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function resolveCheck(
  check: CheckConfig,
  root: string,
  readmeContent: string
): { actual: number | null; readme: number | null } {
  let actual: number | null = null;

  // Try registered resolvers (longest prefix match first)
  const matchingPrefix = Array.from(resolvers.keys())
    .filter((prefix) => check.source === prefix || check.source.startsWith(prefix))
    .sort((a, b) => b.length - a.length)[0];

  if (matchingPrefix) {
    actual = resolvers.get(matchingPrefix)!(check.source, root);
  }

  // file: with countPattern — count regex matches in a file
  if (check.source.startsWith("file:")) {
    const filePath = join(root, check.source.slice(5));
    const content = safeRead(filePath);
    if (content && check.countPattern) {
      const regex = new RegExp(check.countPattern, "gm");
      const matches = content.match(regex);
      if (matches) {
        const filtered = check.countExclude
          ? matches.filter((m) => !check.countExclude!.some((exc) => m.includes(exc)))
          : matches;
        actual = filtered.length;
      }
    }
  }

  // Apply exclude for glob
  if (check.source.startsWith("glob:") && check.exclude && actual !== null) {
    const globPath = check.source.slice(5);
    const fileName = globPath.split("/").pop()!;
    const dir = globPath.split("/").slice(0, -1).join("/");
    const regex = new RegExp(
      fileName.replace(/\*/g, ".*").replace(/\./g, "\\.") + "$"
    );
    let files = findFiles(dir || ".", regex, root);
    for (const exc of check.exclude) {
      files = files.filter((f) => !f.includes(exc));
    }
    actual = files.length;
  }

  // Get readme value
  let readme: number | null = null;
  if (check.readmePattern) {
    const match = readmeContent.match(new RegExp(check.readmePattern));
    readme = match ? parseInt(match[1], 10) : null;
  }

  return { actual, readme };
}

// ── Main engine ───────────────────────────────────────────────────────────

/**
 * Run the verification engine.
 *
 * @param root - Absolute path to the project root
 * @param config - Verification config (usually loaded from verify-docs.json)
 * @param options - Optional: { ci: true } to skip cross-repo checks
 * @returns VerifyResult with pass/fail status and detailed output
 */
export function verify(
  root: string,
  config: VerifyConfig,
  options?: { ci?: boolean }
): VerifyResult {
  const ci = options?.ci ?? false;
  const readmeContent = readFileSync(join(root, config.readme), "utf-8");
  const section1: LineResult[] = [];
  const section2: LineResult[] = [];
  let errors = 0;

  // ── Section 1: README vs Code ─────────────────────────────────────────

  for (const check of config.checks) {
    const { actual, readme } = resolveCheck(check, root, readmeContent);

    if (check.infoOnly) {
      section1.push({
        status: "info",
        name: check.name,
        detail: `code=${actual ?? "?"}`,
      });
      continue;
    }
    if (readme === null) {
      section1.push({
        status: "skip",
        name: check.name,
        detail: "not in README",
      });
      continue;
    }
    if (actual === null) {
      section1.push({
        status: "skip",
        name: check.name,
        detail: "can't count from source",
      });
      continue;
    }

    const tol = check.tolerance || 0;
    const ok = actual === readme || (tol && Math.abs(actual - readme) <= tol);
    const detail = ok && tol && actual !== readme
      ? `code=${actual} readme=${readme} MATCH (±${tol})`
      : ok
        ? `code=${actual} readme=${readme} MATCH`
        : `code=${actual} readme=${readme} MISMATCH -> fix: ${readme} -> ${actual}`;

    if (!ok) errors++;
    section1.push({ status: ok ? "OK" : "ERR", name: check.name, detail });
  }

  // Build lookup for cross-repo references
  const actualValues: Record<string, number> = {};
  for (const check of config.checks) {
    const { actual } = resolveCheck(check, root, readmeContent);
    if (actual !== null) actualValues[check.name] = actual;
  }

  // ── Section 2: Cross-repo consistency ─────────────────────────────────

  for (const cross of config.crossRepo ?? []) {
    if (ci) {
      section2.push({
        status: "ci",
        name: cross.name,
        detail: "skipped (no sibling repos in CI)",
      });
      continue;
    }

    const repoPath = join(root, cross.repo);
    if (!existsSync(repoPath)) {
      section2.push({
        status: "skip",
        name: cross.name,
        detail: `${cross.repo} not found`,
      });
      continue;
    }

    const filePath = join(
      repoPath,
      cross.source.startsWith("file:") ? cross.source.slice(5) : cross.source
    );
    const content = safeRead(filePath);
    if (!content) {
      section2.push({
        status: "skip",
        name: cross.name,
        detail: "can't read file",
      });
      continue;
    }

    let crossValue: number | null = null;
    if (cross.filePattern) {
      if (cross.filePattern.startsWith("extract:")) {
        const pat = cross.filePattern.slice(8);
        const match = content.match(new RegExp(pat));
        crossValue = match ? parseInt(match[1], 10) : null;
      } else {
        crossValue = (
          content.match(new RegExp(cross.filePattern, "gm")) || []
        ).length;
      }
    }

    if (crossValue === null) {
      section2.push({
        status: "skip",
        name: cross.name,
        detail: "pattern not found",
      });
      continue;
    }

    let expected: number | null = null;
    if (cross.matchAgainst) {
      expected = actualValues[cross.matchAgainst] ?? null;
    } else if (cross.readmePattern) {
      const readmeMatch = readmeContent.match(new RegExp(cross.readmePattern));
      expected = readmeMatch ? parseInt(readmeMatch[1], 10) : null;
    }

    if (expected === null) {
      section2.push({
        status: "skip",
        name: cross.name,
        detail: "no expected value",
      });
      continue;
    }

    const tol = cross.tolerance || 0;
    const ok =
      crossValue === expected ||
      (tol && Math.abs(crossValue - expected) <= tol);
    const detail = ok && tol && crossValue !== expected
      ? `value=${crossValue} expected=${expected} (±${tol})`
      : ok
        ? `value=${crossValue} expected=${expected} MATCH`
        : `value=${crossValue} expected=${expected} MISMATCH -> fix: ${crossValue} -> ${expected}`;

    if (!ok) errors++;
    section2.push({ status: ok ? "OK" : "ERR", name: cross.name, detail });

    // Make this value available for subsequent cross-repo checks
    if (crossValue !== null) actualValues[cross.name] = crossValue;
  }

  return { passed: errors === 0, errors, section1, section2 };
}
