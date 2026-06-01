// ============================================================================
// verify-readme.ts — Verify ALL docs across the workspace
// Run: bun run scripts/verify-readme.ts
//
// Checks:
//   1. AAA-studio README vs actual code
//   2. AAA-studio README vs StsDev-Wiki (numbers match)
//   3. AAA-studio README vs 3a-studio-mas donor (numbers match)
//
// Exits with code 1 if any mismatch found.
// ============================================================================

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");
const README = readFileSync(join(ROOT, "README.md"), "utf-8");

// Sibling repos (optional — skip silently if not cloned)
const WIKI = join(ROOT, "..", "StsDev-Wiki");
const DONOR = join(ROOT, "..", "3a-studio-mas");

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function safeRead(filePath: string): string | null {
  try { return readFileSync(filePath, "utf-8"); } catch { return null; }
}

function safeExec(cmd: string, cwd: string): string | null {
  try { return execSync(cmd, { cwd }).toString().trim(); } catch { return null; }
}

function extractNum(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern);
  return match ? parseInt(match[1], 10) : null;
}

// ── Truth from code ─────────────────────────────────────────────────────────

const truth = {
  dashboardScreens: findFiles("src/app/(dashboard)", /page\.tsx$/, ROOT)
    .filter((p) => !p.includes("wiki/[slug]")).length,

  prismaModels: (readFileSync(join(ROOT, "prisma/schema.prisma"), "utf-8")
    .match(/^model \w+/gm) || []).length,

  formulas: (readFileSync(join(ROOT, "packages/prompting/src/formulas/index.ts"), "utf-8")
    .match(/^\s+id: "/gm) || []).length,

  frameworks: (readFileSync(join(ROOT, "packages/prompting/src/frameworks/data.ts"), "utf-8")
    .match(/^\s+id: "/gm) || []).length,

  techniques: (readFileSync(join(ROOT, "packages/prompting/src/techniques/data.ts"), "utf-8")
    .match(/^\s+id: "/gm) || []).length,

  i18nNamespaces: (() => {
    const src = readFileSync(join(ROOT, "src/lib/i18n/translations/index.ts"), "utf-8");
    const keys = (src.match(/(\w+): \{ \.\.\.\w+[A-Z]/g) || []);
    return new Set(keys.map((k) => k.split(":")[0])).size;
  })(),

  eslintRules: (readFileSync(join(ROOT, "packages/eslint-plugin/src/index.ts"), "utf-8")
    .match(/"no-unicode-escapes"|"max-lines"|"max-use-state"|"no-cross-layer"/g) || []).length,

  wikiArticles: findFiles("src/features/wiki/pages", /\.tsx$/, ROOT).length,

  nodeTypes: (readFileSync(join(ROOT, "src/features/flow-editor/nodes/node-registry.ts"), "utf-8")
    .match(/\{ type: '/g) || []).length,

  edgeTypes: (() => {
    const src = readFileSync(join(ROOT, "src/lib/validations/flow.ts"), "utf-8");
    return (src.match(/'command'|'sync'|'twin'|'delegate'|'feedback'|'supervise'|'broadcast'/g) || []).length;
  })(),

  flowTemplates: (readFileSync(join(ROOT, "src/features/pipelines/data/flow-templates.ts"), "utf-8")
    .match(/^  id: "/gm) || []).length,

  packages: readdirSync(join(ROOT, "packages"), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .filter((d) => {
      try { return statSync(join(ROOT, "packages", d.name, "package.json")).isFile(); } catch { return false; }
    }).length,

  scoringCriteria: (() => {
    const src = readFileSync(join(ROOT, "packages/prompting/src/scoring/index.ts"), "utf-8");
    return (src.match(/^\s+(\w+): number;/gm) || []).filter((d) => !d.includes("overall")).length;
  })(),

  gitCommits: parseInt(
    execSync("git rev-list --count HEAD", { cwd: ROOT }).toString().trim(), 10,
  ),

  apiRoutes: findFiles("src/app/api", /route\.ts$/, ROOT).length,
};

// ── Donor truth (3a-studio-mas) ─────────────────────────────────────────────

const donorModels = (() => {
  const src = safeRead(join(DONOR, "prisma/schema.prisma"));
  return src ? (src.match(/^model \w+/gm) || []).length : null;
})();

// ── SECTION 1: AAA-studio README vs code ────────────────────────────────────

console.log("\n=== 1. AAA-studio README vs Code ===\n");

const readmeChecks: { name: string; actual: number; readme: number | null; tolerance?: number }[] = [
  { name: "Dashboard screens",       actual: truth.dashboardScreens,  readme: extractNum(README, /Screens \((\d+)\)/) },
  { name: "Formulas",                actual: truth.formulas,           readme: extractNum(README, /Formulas \((\d+)\)/) },
  { name: "Frameworks",              actual: truth.frameworks,         readme: extractNum(README, /Frameworks \((\d+)\)/) },
  { name: "Techniques",              actual: truth.techniques,         readme: extractNum(README, /Techniques \((\d+)\)/) },
  { name: "i18n namespaces",         actual: truth.i18nNamespaces,     readme: extractNum(README, /(\d+) namespaces/) },
  { name: "ESLint rules",            actual: truth.eslintRules,        readme: extractNum(README, /(\d+) rules: max-lines/) },
  { name: "Wiki articles",           actual: truth.wikiArticles,       readme: extractNum(README, /(\d+) articles/) },
  { name: "Node types",              actual: truth.nodeTypes,          readme: extractNum(README, /(\d+) node types/) },
  { name: "Edge/connection types",   actual: truth.edgeTypes,          readme: extractNum(README, /(\d+) edge types/) },
  { name: "Flow templates",          actual: truth.flowTemplates,      readme: extractNum(README, /(\d+) flow templates/) },
  { name: "Packages",                actual: truth.packages,           readme: extractNum(README, /Monorepo Packages \((\d+)\)/) },
  { name: "Scoring criteria",        actual: truth.scoringCriteria,    readme: extractNum(README, /(\d+)-criteria scoring/) },
  { name: "Git commits",             actual: truth.gitCommits,         readme: extractNum(README, /AAA-studio \((\d+) commits\)/), tolerance: 3 },
];

let errors = 0;

for (const c of readmeChecks) {
  if (c.readme === null) continue; // not in README
  const ok = c.readme === c.actual || (c.tolerance && Math.abs(c.actual - c.readme) <= c.tolerance);
  const tag = ok ? "OK" : "ERR";
  const detail = ok && c.tolerance && c.readme !== c.actual ? `MATCH (±${c.tolerance}: code=${c.actual})` : ok ? "MATCH" : "MISMATCH";
  console.log(`[${tag}] ${c.name}: code=${c.actual} readme=${c.readme} ${detail}`);
  if (!ok) { errors++; console.log(`     -> Fix README: ${c.readme} -> ${c.actual}`); }
}

// ── SECTION 2: Donor claim in README vs 3a-studio-mas ──────────────────────

console.log("\n=== 2. README Donor Claims vs 3a-studio-mas ===\n");

if (donorModels !== null) {
  const readmeDonorModels = extractNum(README, /Prisma Schema \((\d+) models\)/);
  console.log(`[${donorModels === readmeDonorModels ? "OK" : "ERR"}] Donor Prisma models: code=${donorModels} readme=${readmeDonorModels}`);
  if (donorModels !== readmeDonorModels) {
    errors++;
    console.log(`     -> README says donor has ${readmeDonorModels} models, but 3a-studio-mas has ${donorModels}`);
  }
} else {
  console.log("[--] 3a-studio-mas not found locally, skipping donor checks");
}

// ── SECTION 3: StsDev-Wiki vs AAA-studio README ────────────────────────────

console.log("\n=== 3. StsDev-Wiki vs AAA-studio README ===\n");

if (existsSync(WIKI)) {
  const wikiReadme = safeRead(join(WIKI, "projects/3a-studio/README.md"));
  const wikiBorrow = safeRead(join(WIKI, "projects/3a-studio/borrowing-map.md"));
  const wikiScreens = safeRead(join(WIKI, "projects/3a-studio/screens.md"));

  const wikiChecks: { label: string; source: string | null; pattern: RegExp; expected: number; isLiteral?: boolean }[] = [
    // Numbers that must match AAA-studio README
    { label: "Formulas",           source: wikiReadme,    pattern: /Formulas \((\d+)\)/,                    expected: truth.formulas },
    { label: "Frameworks",         source: wikiReadme,    pattern: /Frameworks \((\d+)\)/,                  expected: truth.frameworks },
    { label: "Techniques",         source: wikiReadme,    pattern: /Techniques \((\d+)\)/,                  expected: truth.techniques },
    { label: "Wiki articles",      source: wikiReadme,    pattern: /(\d+) статей/,                          expected: truth.wikiArticles },
    { label: "Node types (wiki)",  source: wikiReadme,    pattern: /(\d+) node types/,                      expected: truth.nodeTypes },
    { label: "Edge types (wiki)",  source: wikiReadme,    pattern: /(\d+) edge types/,                      expected: truth.edgeTypes },
    { label: "Formulas (pkg)",     source: wikiReadme,    pattern: /6-criteria scoring, (\d+) formulas/,    expected: truth.formulas },
    { label: "Donor models",       source: wikiBorrow,    pattern: /Prisma Schema \((\d+) модел\)/,         expected: donorModels ?? 0 },
    { label: "Donor models (tbl)", source: wikiReadme,    pattern: /(\d+) моделей, 33 API/,                 expected: donorModels ?? 0 },
    { label: "Commits (wiki)",     source: wikiReadme,    pattern: /AAA-studio.*?(\d+) коммит/,             expected: truth.gitCommits, isLiteral: true },
  ];

  for (const c of wikiChecks) {
    if (!c.source) { console.log(`[--] ${c.label}: file not found`); continue; }
    const found = extractNum(c.source, c.pattern);
    if (found === null) { console.log(`[--] ${c.label}: pattern not found in wiki`); continue; }
    const tolerance = c.isLiteral ? 3 : 0;
    const ok = found === c.expected || (tolerance && Math.abs(found - c.expected) <= tolerance);
    const detail = ok && tolerance && found !== c.expected ? `(±${tolerance}: code=${c.expected})` : "";
    console.log(`[${ok ? "OK" : "ERR"}] ${c.label}: wiki=${found} expected=${c.expected} ${detail}`);
    if (!ok) { errors++; console.log(`     -> Fix StsDev-Wiki: ${found} -> ${c.expected}`); }
  }
} else {
  console.log("[--] StsDev-Wiki not found locally, skipping wiki checks");
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log("\n--- Truth table (source of truth from code) ---");
console.log(`  Dashboard screens: ${truth.dashboardScreens}`);
console.log(`  Prisma models:     ${truth.prismaModels} (donor 3a-studio-mas: ${donorModels ?? "?"})`);
console.log(`  API routes:        ${truth.apiRoutes}`);
console.log(`  Formulas:          ${truth.formulas}`);
console.log(`  Frameworks:        ${truth.frameworks}`);
console.log(`  Techniques:        ${truth.techniques}`);
console.log(`  Node types:        ${truth.nodeTypes}`);
console.log(`  Edge types:        ${truth.edgeTypes}`);
console.log(`  Flow templates:    ${truth.flowTemplates}`);
console.log(`  i18n namespaces:   ${truth.i18nNamespaces}`);
console.log(`  ESLint rules:      ${truth.eslintRules}`);
console.log(`  Wiki articles:     ${truth.wikiArticles}`);
console.log(`  Packages:          ${truth.packages}`);
console.log(`  Scoring criteria:  ${truth.scoringCriteria}`);
console.log(`  Git commits:       ${truth.gitCommits}`);

if (errors > 0) {
  console.log(`\n!! ${errors} mismatch(es) found!`);
  process.exit(1);
} else {
  console.log("\nAll numbers consistent across README, code, and wiki.");
  process.exit(0);
}
