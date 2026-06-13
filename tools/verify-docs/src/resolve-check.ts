// ============================================================================
// resolve-check.ts -- Single check resolver
// Takes a CheckConfig and returns actual + readme values.
// ============================================================================

import { join } from "path";
import type { CheckConfig } from "./types.js";
import { resolveFromRegistry, findFiles, safeRead } from "./resolvers.js";

/**
 * Resolve a single CheckConfig entry.
 * Tries registered resolvers, then file:/glob: patterns,
 * and extracts the expected value from README content.
 */
export function resolveCheck(
  check: CheckConfig,
  root: string,
  readmeContent: string
): { actual: number | null; readme: number | null } {
  let actual: number | null = resolveFromRegistry(check.source, root);

  // file: with countPattern -- count regex matches in a file
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
