// ============================================================================
// verify-section3.ts -- Version synchronization verification
//
// Ensures that a single source-of-truth version (e.g. from manifest.json
// or package.json) matches the version stated in other documentation files.
//
// This prevents the common problem where README, ARCHITECTURE, and other
// docs each carry their own version that diverges over time.
// ============================================================================

import { existsSync } from "fs";
import { join } from "path";
import type { VersionSyncConfig, LineResult } from "./types.js";
import { safeRead } from "./resolvers.js";

/**
 * Section 3: Version synchronization.
 * Extracts version from source of truth, compares with targets.
 * Returns an array of LineResult entries and the number of errors found.
 */
export function verifySection3(
  versionSync: VersionSyncConfig | undefined,
  root: string
): { results: LineResult[]; errors: number } {
  const results: LineResult[] = [];
  let errors = 0;

  if (!versionSync) {
    return { results, errors };
  }

  // --- Step 1: Extract version from source of truth ---
  const sourcePath = versionSync.source.startsWith("file:")
    ? join(root, versionSync.source.slice(5))
    : join(root, versionSync.source);

  const sourceContent = safeRead(sourcePath);
  if (!sourceContent) {
    results.push({
      status: "ERR",
      name: "Version source",
      detail: `Cannot read source: ${versionSync.source}`
    });
    errors++;
    return { results, errors };
  }

  const sourceMatch = sourceContent.match(new RegExp(versionSync.extractPattern));
  if (!sourceMatch || !sourceMatch[1]) {
    results.push({
      status: "ERR",
      name: "Version source",
      detail: `Cannot extract version from ${versionSync.source} using pattern: ${versionSync.extractPattern}`
    });
    errors++;
    return { results, errors };
  }

  const sourceVersion = sourceMatch[1];
  results.push({
    status: "info",
    name: "Version source",
    detail: `${versionSync.source} -> v${sourceVersion}`
  });

  // --- Step 2: Check each target ---
  for (const target of versionSync.targets) {
    const targetPath = join(root, target.file);

    if (!existsSync(targetPath)) {
      results.push({
        status: "skip",
        name: target.file,
        detail: "file not found"
      });
      continue;
    }

    const targetContent = safeRead(targetPath);
    if (!targetContent) {
      results.push({
        status: "skip",
        name: target.file,
        detail: "cannot read file"
      });
      continue;
    }

    const targetMatch = targetContent.match(new RegExp(target.pattern));
    if (!targetMatch || !targetMatch[1]) {
      results.push({
        status: "skip",
        name: target.file,
        detail: `pattern not found: ${target.pattern}`
      });
      continue;
    }

    const targetVersion = targetMatch[1];
    const ok = targetVersion === sourceVersion;

    if (ok) {
      results.push({
        status: "OK",
        name: target.file,
        detail: `v${targetVersion} MATCH source`
      });
    } else {
      results.push({
        status: "ERR",
        name: target.file,
        detail: `v${targetVersion} MISMATCH -> source=v${sourceVersion}, fix: ${targetVersion} -> ${sourceVersion}`
      });
      errors++;
    }
  }

  return { results, errors };
}
