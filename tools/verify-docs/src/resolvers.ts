// ============================================================================
// resolvers.ts -- Built-in source resolvers and registration for verify-docs
// ============================================================================

import { execSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { SourceResolver } from "./types.js";

// ── Resolver registry ──────────────────────────────────────────────────────

const resolvers: Map<string, SourceResolver> = new Map();

// ── Built-in source resolvers ──────────────────────────────────────────────

resolvers.set("git:HEAD", (_source: string, root: string) => {
  try {
    // Skip on shallow clone -- history is incomplete
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

/** Get the resolver registry (for testing or advanced use) */
export function getResolvers(): Map<string, SourceResolver> {
  return resolvers;
}

// ── File system helpers ───────────────────────────────────────────────────

/** Recursively find files matching a regex pattern */
export function findFiles(dir: string, pattern: RegExp, root: string): string[] {
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

/** Safely read a file, returning null if it doesn't exist */
export function safeRead(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

/** Try to resolve a source using registered resolvers (longest prefix match first) */
export function resolveFromRegistry(source: string, root: string): number | null {
  const matchingPrefix = Array.from(resolvers.keys())
    .filter((prefix) => source === prefix || source.startsWith(prefix))
    .sort((a, b) => b.length - a.length)[0];

  if (matchingPrefix) {
    return resolvers.get(matchingPrefix)!(source, root);
  }
  return null;
}
