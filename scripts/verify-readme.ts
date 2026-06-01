// ============================================================================
// verify-readme.ts — Data-driven doc consistency checker
//
// Reads verify-config.json for what to check, counts from code,
// compares with README, cross-checks sibling repos.
//
// Run: bun run verify
// Config: verify-config.json (edit this, not the script)
// Exits 1 on mismatch, 0 on success.
// ============================================================================

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");
const CONFIG = JSON.parse(readFileSync(join(ROOT, "verify-config.json"), "utf-8"));
const README = readFileSync(join(ROOT, CONFIG.readme), "utf-8");

// ── Helpers ─────────────────────────────────────────────────────────────────

function findFiles(dir: string, pattern: RegExp, root: string): string[] {
  const results: string[] = [];
  const fullDir = join(root, dir);
  try {
    const entries = readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      if (["node_modules", ".next", "dist", ".git"].includes(entry.name)) continue;
      const relPath = dir ? `${dir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        results.push(...findFiles(relPath, pattern, root));
      } else if (pattern.test(entry.name)) {
        results.push(relPath);
      }
    }
  } catch { /* skip */ }
  return results;
}

function safeRead(filePath: string): string | null {
  try { return readFileSync(filePath, "utf-8"); } catch { return null; }
}

function countFromSource(source: string, root: string): number | null {
  // git:HEAD — count commits (skip on shallow clone)
  if (source === "git:HEAD") {
    try {
      const isShallow = execSync("git rev-parse --is-shallow-repository", { cwd: root }).toString().trim();
      if (isShallow === "true") return null; // skip — shallow clone has incomplete history
      return parseInt(execSync("git rev-list --count HEAD", { cwd: root }).toString().trim(), 10);
    } catch { return null; }
  }

  // custom:i18n — count unique namespace keys
  if (source === "custom:i18n") {
    const src = safeRead(join(root, "src/lib/i18n/translations/index.ts"));
    if (!src) return null;
    const keys = (src.match(/(\w+): \{ \.\.\.\w+[A-Z]/g) || []);
    return new Set(keys.map((k) => k.split(":")[0])).size;
  }

  // custom:packages — count dirs with package.json
  if (source === "custom:packages") {
    try {
      return readdirSync(join(root, "packages"), { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."))
        .filter((d) => { try { return statSync(join(root, "packages", d.name, "package.json")).isFile(); } catch { return false; } })
        .length;
    } catch { return null; }
  }

  // custom:screens — count dashboard page.tsx (excluding wiki/[slug])
  if (source === "custom:screens") {
    try {
      const allPages = findFiles("src/app/(dashboard)", /page\.tsx$/, root);
      return allPages.filter((p) => !p.includes("wiki/[slug]")).length;
    } catch { return null; }
  }

  // glob:path — count files matching glob
  if (source.startsWith("glob:")) {
    const globPath = source.slice(5);
    // Extract directory and filename pattern
    const parts = globPath.split("/");
    const fileName = parts.pop()!;
    const dir = parts.join("/");
    const regex = new RegExp(fileName.replace(/\*/g, ".*").replace(/\./g, "\\.") + "$");
    return findFiles(dir || ".", regex, root).length;
  }

  // file:path — read and count with countPattern
  if (source.startsWith("file:")) {
    return -1; // handled separately with countPattern
  }

  return null;
}

// ── Resolve a single check ──────────────────────────────────────────────────

interface CheckConfig {
  name: string;
  source: string;
  countPattern?: string;
  countExclude?: string[];
  exclude?: string[];
  readmePattern: string | null;
  tolerance?: number;
  infoOnly?: boolean;
}

function resolveCheck(check: CheckConfig, root: string): { actual: number | null; readme: number | null } {
  // Get actual count from source
  let actual: number | null = null;

  if (check.source.startsWith("custom:") || check.source === "git:HEAD" || check.source.startsWith("glob:")) {
    actual = countFromSource(check.source, root);
  } else if (check.source.startsWith("file:")) {
    const filePath = join(root, check.source.slice(5));
    const content = safeRead(filePath);
    if (content && check.countPattern) {
      const regex = new RegExp(check.countPattern, "gm");
      let matches = (content.match(regex) || []);
      // Apply exclude filter
      if (check.countExclude) {
        matches = matches.filter((m) => !check.countExclude.some((exc) => m.includes(exc)));
      }
      actual = matches.length;
    }
  }

  // Apply exclude for glob
  if (check.source.startsWith("glob:") && check.exclude && actual !== null) {
    const globPath = check.source.slice(5);
    const fileName = globPath.split("/").pop()!;
    const dir = globPath.split("/").slice(0, -1).join("/");
    const regex = new RegExp(fileName.replace(/\*/g, ".*").replace(/\./g, "\\.") + "$");
    let files = findFiles(dir || ".", regex, root);
    for (const exc of check.exclude) {
      files = files.filter((f) => !f.includes(exc));
    }
    actual = files.length;
  }

  // Get readme value
  let readme: number | null = null;
  if (check.readmePattern) {
    const match = README.match(new RegExp(check.readmePattern));
    readme = match ? parseInt(match[1], 10) : null;
  }

  return { actual, readme };
}

// ── SECTION 1: README vs Code ───────────────────────────────────────────────

console.log("\n=== 1. README vs Code ===\n");

let errors = 0;

for (const check of CONFIG.checks) {
  const { actual, readme } = resolveCheck(check, ROOT);

  if (check.infoOnly) {
    console.log(`[info] ${check.name}: code=${actual ?? "?"}`);
    continue;
  }

  if (readme === null) {
    console.log(`[--] ${check.name}: not in README`);
    continue;
  }

  if (actual === null) {
    console.log(`[??] ${check.name}: can't count from source`);
    continue;
  }

  const tol = check.tolerance || 0;
  const ok = actual === readme || (tol && Math.abs(actual - readme) <= tol);
  const detail = ok && tol && actual !== readme ? `MATCH (±${tol}: code=${actual})` : ok ? "MATCH" : "MISMATCH";

  console.log(`[${ok ? "OK" : "ERR"}] ${check.name}: code=${actual} readme=${readme} ${detail}`);
  if (!ok) { errors++; console.log(`     -> Fix: ${readme} -> ${actual}`); }
}

// ── SECTION 2: Cross-repo checks ────────────────────────────────────────────

console.log("\n=== 2. Cross-repo Consistency ===\n");

// Build lookup of actual values from section 1
const actualValues: Record<string, number> = {};
for (const check of CONFIG.checks) {
  const { actual } = resolveCheck(check, ROOT);
  if (actual !== null) actualValues[check.name] = actual;
}

for (const cross of CONFIG.crossRepo) {
  const repoPath = join(ROOT, cross.repo);

  if (!existsSync(repoPath)) {
    console.log(`[--] ${cross.name}: ${cross.repo} not found, skip`);
    continue;
  }

  // Get value from cross-repo file
  const filePath = join(repoPath, cross.source.startsWith("file:") ? cross.source.slice(5) : cross.source);
  const content = safeRead(filePath);

  if (!content) {
    console.log(`[--] ${cross.name}: can't read file`);
    continue;
  }

  let crossValue: number | null = null;

  // If filePattern starts with "extract:" — extract a number from the first match
  // If filePattern starts with "^" or has "\" — count occurrences
  // Otherwise — count occurrences
  if (cross.filePattern) {
    if (cross.filePattern.startsWith("extract:")) {
      // Extraction pattern — extract (\\d+) group
      const pat = cross.filePattern.slice(8);
      const match = content.match(new RegExp(pat));
      crossValue = match ? parseInt(match[1], 10) : null;
    } else {
      // Count pattern — count all matches
      crossValue = (content.match(new RegExp(cross.filePattern, "gm")) || []).length;
    }
  }

  if (crossValue === null) {
    console.log(`[--] ${cross.name}: pattern not found`);
    continue;
  }

  // What to compare against?
  let expected: number | null = null;
  if (cross.matchAgainst) {
    expected = actualValues[cross.matchAgainst] ?? null;
  } else if (cross.readmePattern) {
    const readmeMatch = README.match(new RegExp(cross.readmePattern));
    expected = readmeMatch ? parseInt(readmeMatch[1], 10) : null;
  }

  if (expected === null) {
    console.log(`[--] ${cross.name}: no expected value`);
    continue;
  }

  const tol = cross.tolerance || 0;
  const ok = crossValue === expected || (tol && Math.abs(crossValue - expected) <= tol);
  const detail = ok && tol && crossValue !== expected ? `(±${tol}: expected=${expected})` : "";

  console.log(`[${ok ? "OK" : "ERR"}] ${cross.name}: value=${crossValue} expected=${expected} ${detail}`);
  if (!ok) { errors++; console.log(`     -> Fix: ${crossValue} -> ${expected}`); }
}

// ── Summary ─────────────────────────────────────────────────────────────────

if (errors > 0) {
  console.log(`\n!! ${errors} mismatch(es) found!`);
  process.exit(1);
} else {
  console.log("\nAll numbers consistent.");
  process.exit(0);
}
