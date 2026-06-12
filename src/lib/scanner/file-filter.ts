// ============================================================================
// file-filter.ts — Unified file exclusion rules for all upload paths
//
// Single source of truth used by:
//   - file-uploader.tsx (ZIP, folder, single file)
//   - fetch-url/route.ts (GitHub URL)
// ============================================================================

/** Directory segments to skip entirely */
export const SKIP_DIRS = new Set([
  "node_modules", "__pycache__", "vendor",
  "dist", "build", "coverage", ".cache", ".output",
  ".nuxt", ".turbo",
]);

/** Exact filenames to skip (lock files, env, etc.) */
export const SKIP_FILES = new Set([
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "bun.lock", "bun.lockb",
  ".env", ".env.local", ".env.production", ".env.example",
  "next-env.d.ts", "tsconfig.tsbuildinfo",
  ".tsbuildinfo", ".DS_Store",
  "dev.log", "opencode.json",
  // Setup / config files — not analysis targets
  "package.json", "package-manager.json", ".npmrc", ".yarnrc",
  "tsconfig.json", "tsconfig.*.json", "jsconfig.json",
  "next.config.js", "next.config.mjs", "next.config.ts",
  "tailwind.config.js", "tailwind.config.ts", "postcss.config.js", "postcss.config.mjs",
  "eslint.config.js", "eslint.config.mjs", "eslint.config.cjs", ".eslintrc.json", ".eslintrc.js", ".eslintrc.yml",
  ".prettierrc", ".prettierrc.json", ".prettierrc.js", ".prettierrc.yml",
  "jest.config.js", "jest.config.ts", "vitest.config.ts", "playwright.config.ts",
  // Infra / deploy files
  "Dockerfile", "docker-compose.yml", "docker-compose.yaml", ".dockerignore",
  "vercel.json", "netlify.toml", "railway.json", "fly.toml",
  "Makefile", "Procfile", ".gitignore", ".gitattributes",
  // Meta / documentation noise
  "README.md", "README.rst", "README.txt",
  "CHANGELOG.md", "CHANGES.md", "HISTORY.md",
  "LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE",
  "CONTRIBUTING.md", "AUTHORS.md", "CODE_OF_CONDUCT.md",
  "SECURITY.md", ".npmignore",
  // Prisma schema (not a skill/standard)
  "schema.prisma",
]);

/** Binary extensions to skip */
const BINARY_EXT = /\.(png|jpe?g|gif|svg|ico|bmp|webp|woff2?|ttf|eot|mp[34]|wav|zip|tar|gz|exe|dll|so|dylib)$/i;

/** Max file size in bytes (500 KB) */
export const MAX_FILE_SIZE = 500_000;

/**
 * Returns true if the file path should be excluded from analysis.
 *
 * Rules:
 * - Any path segment starts with "." (.git, .next, .vscode, etc.)
 * - Any path segment is in SKIP_DIRS (node_modules, dist, build, etc.)
 * - Filename matches SKIP_FILES (lock files, .env, package.json, configs, Dockerfile, README, LICENSE, etc.)
 * - File has a binary extension
 * - File exceeds MAX_FILE_SIZE (only when size is provided)
 */
export function shouldSkipFile(
  path: string,
  size?: number,
): boolean {
  const segments = path.split("/");

  // Dot-dirs: .git, .next, .vscode, .github, etc.
  if (segments.some((s) => s.startsWith("."))) return true;

  // Build/dist/cache dirs
  if (segments.some((s) => SKIP_DIRS.has(s))) return true;

  const fileName = segments.pop() ?? path;

  // Exact filename or glob-pattern matches
  if (SKIP_FILES.has(fileName)) return true;
  // Wildcard patterns: tsconfig.*.json, eslint.config.*, tailwind.config.*, next.config.*
  if (/^tsconfig\..+\.json$/.test(fileName)) return true;
  if (/^(eslint|tailwind|postcss)\.config\.[cm]?[jt]s$/.test(fileName)) return true;
  if (/^next\.config\.[mjt]s$/.test(fileName)) return true;

  // Binary extensions
  if (BINARY_EXT.test(fileName)) return true;

  // Size limit (only when caller provides it)
  if (size !== undefined && size > MAX_FILE_SIZE) return true;

  return false;
}