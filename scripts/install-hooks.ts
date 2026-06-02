// install-hooks.ts — Install git hooks from scripts/git-hooks/ into .git/hooks/
// Run: bun run scripts/install-hooks.ts
// Add to package.json "postinstall" for automatic setup on every clone.

import { copyFileSync, chmodSync, existsSync, readdirSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const GIT_HOOKS_DIR = join(ROOT, ".git", "hooks");
const SOURCE_DIR = join(ROOT, "scripts", "git-hooks");

if (!existsSync(GIT_HOOKS_DIR)) {
  console.log("[hooks] .git/hooks not found — skipping (not a git repo)");
  process.exit(0);
}

if (!existsSync(SOURCE_DIR)) {
  console.log("[hooks] scripts/git-hooks/ not found — nothing to install");
  process.exit(0);
}

const hooks = readdirSync(SOURCE_DIR).filter((f) => !f.startsWith("."));

let installed = 0;
for (const hook of hooks) {
  const src = join(SOURCE_DIR, hook);
  const dest = join(GIT_HOOKS_DIR, hook);
  try {
    copyFileSync(src, dest);
    try { chmodSync(dest, 0o755); } catch { /* chmod may fail on some FS */ }
    installed++;
    console.log(`[hooks] installed: ${hook}`);
  } catch (err: any) {
    console.warn(`[hooks] failed: ${hook}: ${err.message}`);
  }
}

if (installed > 0) {
  console.log(`[hooks] ${installed} hook(s) installed. Bypass: git push --no-verify`);
}
