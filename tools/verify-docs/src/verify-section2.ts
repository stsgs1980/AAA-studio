// ============================================================================
// verify-section2.ts -- Cross-repo consistency verification
// Compares values from sibling repos against expected values.
// ============================================================================

import { existsSync } from "fs";
import { join } from "path";
import type { CrossRepoConfig, LineResult } from "./types.js";
import { safeRead } from "./resolvers.js";

/**
 * Section 2: Cross-repo consistency checks.
 * Skipped in CI mode (no sibling repos available).
 * Returns an array of LineResult entries and the number of errors found.
 */
export function verifySection2(
  crossRepo: CrossRepoConfig[],
  root: string,
  readmeContent: string,
  actualValues: Record<string, number>,
  ci: boolean
): { results: LineResult[]; errors: number } {
  const results: LineResult[] = [];
  let errors = 0;

  for (const cross of crossRepo) {
    if (ci) {
      results.push({ status: "ci", name: cross.name, detail: "skipped (no sibling repos in CI)" });
      continue;
    }

    const repoPath = join(root, cross.repo);
    if (!existsSync(repoPath)) {
      results.push({ status: "skip", name: cross.name, detail: `${cross.repo} not found` });
      continue;
    }

    const filePath = join(
      repoPath,
      cross.source.startsWith("file:") ? cross.source.slice(5) : cross.source
    );
    const content = safeRead(filePath);
    if (!content) {
      results.push({ status: "skip", name: cross.name, detail: "can't read file" });
      continue;
    }

    let crossValue: number | null = null;
    if (cross.filePattern) {
      if (cross.filePattern.startsWith("extract:")) {
        const pat = cross.filePattern.slice(8);
        const match = content.match(new RegExp(pat));
        crossValue = match ? parseInt(match[1], 10) : null;
      } else {
        crossValue = (content.match(new RegExp(cross.filePattern, "gm")) || []).length;
      }
    }

    if (crossValue === null) {
      results.push({ status: "skip", name: cross.name, detail: "pattern not found" });
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
      results.push({ status: "skip", name: cross.name, detail: "no expected value" });
      continue;
    }

    const tol = cross.tolerance || 0;
    const okMatch = crossValue === expected || (tol && Math.abs(crossValue - expected) <= tol);
    const detail = okMatch && tol && crossValue !== expected
      ? `value=${crossValue} expected=${expected} (+/-${tol})`
      : okMatch
        ? `value=${crossValue} expected=${expected} MATCH`
        : `value=${crossValue} expected=${expected} MISMATCH -> fix: ${crossValue} -> ${expected}`;

    if (!okMatch) errors++;
    results.push({ status: okMatch ? "OK" : "ERR", name: cross.name, detail });

    // Make this value available for subsequent cross-repo checks
    if (crossValue !== null) actualValues[cross.name] = crossValue;
  }

  return { results, errors };
}
