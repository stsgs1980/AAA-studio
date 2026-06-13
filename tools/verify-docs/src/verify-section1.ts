// ============================================================================
// verify-section1.ts -- README vs Code verification
// Compares each CheckConfig entry against the actual codebase.
// ============================================================================

import { readFileSync } from "fs";
import { join } from "path";
import type { CheckConfig, LineResult } from "./types.js";
import { resolveCheck } from "./resolve-check.js";

/**
 * Section 1: Compare README numbers against actual code.
 * Returns an array of LineResult entries and the number of errors found.
 */
export function verifySection1(
  checks: CheckConfig[],
  root: string,
  readmeContent: string
): { results: LineResult[]; errors: number } {
  const results: LineResult[] = [];
  let errors = 0;

  for (const check of checks) {
    const { actual, readme } = resolveCheck(check, root, readmeContent);

    if (check.infoOnly) {
      results.push({ status: "info", name: check.name, detail: `code=${actual ?? "?"}` });
      continue;
    }
    if (readme === null) {
      results.push({ status: "skip", name: check.name, detail: "not in README" });
      continue;
    }
    if (actual === null) {
      results.push({ status: "skip", name: check.name, detail: "can't count from source" });
      continue;
    }

    const tol = check.tolerance || 0;
    const ok = actual === readme || (tol && Math.abs(actual - readme) <= tol);
    const detail = ok && tol && actual !== readme
      ? `code=${actual} readme=${readme} MATCH (+/-${tol})`
      : ok
        ? `code=${actual} readme=${readme} MATCH`
        : `code=${actual} readme=${readme} MISMATCH -> fix: ${readme} -> ${actual}`;

    if (!ok) errors++;
    results.push({ status: ok ? "OK" : "ERR", name: check.name, detail });
  }

  return { results, errors };
}
