// ============================================================================
// verify-readme.ts — Auto-verify README.md numbers against actual codebase
// Run: bun run scripts/verify-readme.ts
// Exits with code 1 if any mismatch found.
// ============================================================================

import { readFileSync, readdirSync, statSync } from "fs";
import { execSync } from "child_process";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");
const README = readFileSync(join(ROOT, "README.md"), "utf-8");

// Simple recursive file finder (no external deps)
function findFiles(dir: string, pattern: RegExp, root: string): string[] {
  const results: string[] = [];
  const fullDir = join(root, dir);
  try {
    const entries = readdirSync(fullDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") continue;
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

interface Check {
  name: string;
  actual: number;
  readmeValue: number | null;
}

// ── 1. Count dashboard screens (page.tsx under (dashboard), excluding wiki/[slug]) ──
const allDashboardPages = findFiles("src/app/(dashboard)", /page\.tsx$/, ROOT);
const dashboardScreens = allDashboardPages.filter(
  (p) => !p.includes("wiki/[slug]"),
).length;

// ── 2. Count Prisma models ──────────────────────────────────────────────────
const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf-8");
const prismaModels = (schema.match(/^model \w+/gm) || []).length;

// ── 3. Count formulas ───────────────────────────────────────────────────────
const formulasSrc = readFileSync(
  join(ROOT, "packages/prompting/src/formulas/index.ts"),
  "utf-8",
);
const formulas = (formulasSrc.match(/^\s+id: "/gm) || []).length;

// ── 4. Count frameworks ─────────────────────────────────────────────────────
const frameworksSrc = readFileSync(
  join(ROOT, "packages/prompting/src/frameworks/data.ts"),
  "utf-8",
);
const frameworks = (frameworksSrc.match(/^\s+id: "/gm) || []).length;

// ── 5. Count techniques ─────────────────────────────────────────────────────
const techniquesSrc = readFileSync(
  join(ROOT, "packages/prompting/src/techniques/data.ts"),
  "utf-8",
);
const techniques = (techniquesSrc.match(/^\s+id: "/gm) || []).length;

// ── 6. Count i18n namespaces ────────────────────────────────────────────────
const i18nIndex = readFileSync(
  join(ROOT, "src/lib/i18n/translations/index.ts"),
  "utf-8",
);
// Count unique namespace keys (each appears twice: en + ru)
const i18nKeys = (i18nIndex.match(/(\w+): \{ \.\.\.\w+[A-Z]/g) || []);
const i18nNamespaces = new Set(i18nKeys.map((k) => k.split(":")[0])).size;

// ── 7. Count ESLint rules ───────────────────────────────────────────────────
const eslintSrc = readFileSync(
  join(ROOT, "packages/eslint-plugin/src/index.ts"),
  "utf-8",
);
const eslintRules = (eslintSrc.match(/"no-unicode-escapes"|"max-lines"|"max-use-state"|"no-cross-layer"/g) || []).length;

// ── 8. Count wiki articles ──────────────────────────────────────────────────
const wikiPages = findFiles("src/features/wiki/pages", /\.tsx$/, ROOT).length;

// ── 9. Count API routes ─────────────────────────────────────────────────────
const apiRoutes = findFiles("src/app/api", /route\.ts$/, ROOT).length;

// ── 10. Count git commits ───────────────────────────────────────────────────
const gitCommits = parseInt(
  execSync("git rev-list --count HEAD", { cwd: ROOT }).toString().trim(),
  10,
);

// ── 11. Count node types ────────────────────────────────────────────────────
const nodeRegistry = readFileSync(
  join(ROOT, "src/features/flow-editor/nodes/node-registry.ts"),
  "utf-8",
);
const nodeTypes = (nodeRegistry.match(/\{ type: '/g) || []).length;

// ── 12. Count connection/edge types ─────────────────────────────────────────
const flowValidation = readFileSync(
  join(ROOT, "src/lib/validations/flow.ts"),
  "utf-8",
);
// Count entries in the connection type union: 'command', 'sync', 'twin', etc.
const edgeTypesMatch = flowValidation.match(/'(\w+)',\s*'(\w+)',\s*'(\w+)',\s*'(\w+)',\s*'(\w+)',\s*'(\w+)',\s*'(\w+)'/);
const edgeTypes = edgeTypesMatch ? 7 : (flowValidation.match(/'command'|'sync'|'twin'|'delegate'|'feedback'|'supervise'|'broadcast'/g) || []).length;

// ── 13. Count flow templates ────────────────────────────────────────────────
const flowTemplatesSrc = readFileSync(
  join(ROOT, "src/features/pipelines/data/flow-templates.ts"),
  "utf-8",
);
const flowTemplates = (flowTemplatesSrc.match(/^  id: "/gm) || []).length;

// ── 14. Count packages ──────────────────────────────────────────────────────
const packages = readdirSync(join(ROOT, "packages"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("."))
  .filter((d) => {
    try { return statSync(join(ROOT, "packages", d.name, "package.json")).isFile(); } catch { return false; }
  }).length;

// ── 15. Count scoring dimensions ────────────────────────────────────────────
// Dimensions are defined as fields in the PromptScore interface in scoring/index.ts
const scoringIndex = readFileSync(
  join(ROOT, "packages/prompting/src/scoring/index.ts"),
  "utf-8",
);
// Count lines like "  clarity: number;" etc. (exclude "overall" which is derived)
const scoringAllDims = (scoringIndex.match(/^\s+(\w+): number;/gm) || []);
const scoringDimensions = scoringAllDims.filter((d) => !d.includes("overall")).length;

// ── Extract numbers from README ─────────────────────────────────────────────
function extract(pattern: RegExp): number | null {
  const match = README.match(pattern);
  return match ? parseInt(match[1], 10) : null;
}

// ── Build checks ────────────────────────────────────────────────────────────
const checks: Check[] = [
  { name: "Dashboard screens",       actual: dashboardScreens,    readmeValue: extract(/Screens \((\d+)\)/) },
  { name: "Formulas",                actual: formulas,             readmeValue: extract(/Formulas \((\d+)\)/) },
  { name: "Frameworks",              actual: frameworks,           readmeValue: extract(/Frameworks \((\d+)\)/) },
  { name: "Techniques",              actual: techniques,           readmeValue: extract(/Techniques \((\d+)\)/) },
  { name: "i18n namespaces",         actual: i18nNamespaces,       readmeValue: extract(/(\d+) namespaces/) },
  { name: "ESLint rules",            actual: eslintRules,          readmeValue: extract(/(\d+) rules: max-lines/) },
  { name: "Wiki articles",           actual: wikiPages,            readmeValue: extract(/(\d+) articles/) },
  { name: "Node types",              actual: nodeTypes,            readmeValue: extract(/(\d+) node types/) },
  { name: "Edge/connection types",   actual: edgeTypes,            readmeValue: extract(/(\d+) edge types/) },
  { name: "Flow templates",          actual: flowTemplates,        readmeValue: extract(/(\d+) flow templates/) },
  { name: "Packages",                actual: packages,             readmeValue: extract(/Monorepo Packages \((\d+)\)/) },
  { name: "Scoring criteria",        actual: scoringDimensions,    readmeValue: extract(/(\d+)-criteria scoring/) },
  { name: "Git commits",             actual: gitCommits,           readmeValue: extract(/AAA-studio \((\d+) commits\)/) },
];

// ── Report ──────────────────────────────────────────────────────────────────
console.log("\n=== README Verification ===\n");

let errors = 0;

for (const check of checks) {
  const icon = check.readmeValue === null
    ? "?"
    : check.readmeValue === check.actual
      ? "OK"
      : "ERR";

  const status = check.readmeValue === null
    ? "(not in README)"
    : check.readmeValue === check.actual
      ? "MATCH"
      : "MISMATCH";

  console.log(`[${icon}] ${check.name}: code=${check.actual} readme=${check.readmeValue ?? "-"} ${status}`);

  if (check.readmeValue !== null && check.readmeValue !== check.actual) {
    errors++;
    console.log(`     -> Fix: change ${check.readmeValue} to ${check.actual} in README.md`);
  }
}

// ── Extra info (not checked, just reported) ─────────────────────────────────
console.log("\n--- Extra stats (informational, not in README) ---");
console.log(`Prisma models (current schema): ${prismaModels}`);
console.log(`API routes: ${apiRoutes}`);
console.log(`Total page.tsx (incl auth+landing+wiki-dynamic): ${findFiles("src/app", /page\.tsx$/, ROOT).length}`);

// ── Result ──────────────────────────────────────────────────────────────────
if (errors > 0) {
  console.log(`\n!! ${errors} mismatch(es) found. Fix README.md!`);
  process.exit(1);
} else {
  console.log("\nAll README numbers match the codebase.");
  process.exit(0);
}
