#!/usr/bin/env bun
// ============================================================================
// init.ts — Quick setup for verify-docs in any project
//
// Run: bunx verify-docs-init
// Or:  bun run /path/to/verify/src/init.ts
//
// Creates verify-docs.json and installs git pre-push hook
// ============================================================================

import { writeFileSync, existsSync, mkdirSync, copyFileSync, chmodSync } from "fs";
import { resolve } from "path";

const root = resolve(process.cwd());

// ── Step 1: Create verify-docs.json ────────────────────────────────────────

const configPath = resolve(root, "verify-docs.json");

if (existsSync(configPath)) {
  console.log("[skip] verify-docs.json already exists");
} else {
  const defaultConfig = {
    readme: "README.md",
    checks: [
      {
        name: "Source files",
        source: "glob:src/**/*.ts",
        exclude: ["test", "spec", "__mocks__"],
        readmePattern: "(\\d+) source files"
      },
      {
        name: "Tests",
        source: "glob:src/**/*.test.ts",
        readmePattern: "(\\d+) tests"
      },
      {
        name: "Git commits",
        source: "git:HEAD",
        readmePattern: "(\\d+) commits",
        tolerance: 5
      }
    ]
  };

  writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2) + "\n");
  console.log(`[ok] Created verify-docs.json`);
}

// ── Step 2: Install git pre-push hook ──────────────────────────────────────

const gitDir = resolve(root, ".git");
const hooksDir = resolve(gitDir, "hooks");
const hookDest = resolve(hooksDir, "pre-push");

if (!existsSync(gitDir)) {
  console.log("[skip] No .git/ directory — skipping hook installation");
} else if (existsSync(hookDest)) {
  console.log("[skip] .git/hooks/pre-push already exists");
} else {
  const hookContent = `#!/usr/bin/env bash
set -euo pipefail

echo ""
echo "Verifying doc consistency before push..."
echo ""

cd "$(git rev-parse --show-toplevel)"

if command -v bun &>/dev/null; then
  bunx verify-docs
elif command -v npx &>/dev/null; then
  npx verify-docs
else
  echo "ERROR: bun or npx required"
  exit 1
fi

RESULT=$?

if [ $RESULT -ne 0 ]; then
  echo ""
  echo "PUSH BLOCKED: Document numbers don't match the code."
  echo "   Fix the numbers above, then push again."
  echo "   Or bypass with: git push --no-verify"
  echo ""
  exit 1
fi

echo ""
echo "Docs consistent - push allowed."
echo ""
exit 0
`;

  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  writeFileSync(hookDest, hookContent);
  try { chmodSync(hookDest, 0o755); } catch { /* chmod may fail on some FS */ }
  console.log("[ok] Installed .git/hooks/pre-push");
}

// ── Done ───────────────────────────────────────────────────────────────────

console.log("");
console.log("Setup complete! Now:");
console.log("  1. Edit verify-docs.json to match your project");
console.log("  2. Add numbers to your README (e.g. \"12 components\")");
console.log("  3. Run: verify-docs");
console.log("");
