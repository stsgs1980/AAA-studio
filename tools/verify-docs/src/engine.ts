// ============================================================================
// engine.ts -- Core verification engine (thin orchestrator)
//
// Delegates to:
//   resolve-check.ts    -- single check resolution
//   verify-section1.ts  -- README vs Code comparison
//   verify-section2.ts  -- cross-repo consistency
//   verify-section3.ts  -- version synchronization
//   verify-section4.ts  -- feature status (stub detection)
//   verify-section5.ts  -- documentation coverage
//
// Custom source types: register via registerSource() from resolvers.ts.
// ============================================================================

import { readFileSync } from "fs";
import { join } from "path";
import type { VerifyConfig, VerifyResult } from "./types.js";
import { registerSource } from "./resolvers.js";
import { resolveCheck } from "./resolve-check.js";
import { verifySection1 } from "./verify-section1.js";
import { verifySection2 } from "./verify-section2.js";
import { verifySection3 } from "./verify-section3.js";
import { verifySection4 } from "./verify-section4.js";
import { verifySection5 } from "./verify-section5.js";

// Re-export so existing consumers (cli.ts, init.ts) work unchanged
export type { CheckConfig, CrossRepoConfig, VerifyConfig, VerifyResult, LineResult, SourceResolver, VersionSyncConfig, VersionTarget, FeatureStatusConfig, DocCoverageConfig } from "./types.js";
export { registerSource } from "./resolvers.js";

/**
 * Run the full verification engine.
 *
 * @param root - Absolute path to the project root
 * @param config - Verification config (usually loaded from verify-docs.json)
 * @param options - Optional: { ci: true } to skip cross-repo checks
 * @returns VerifyResult with pass/fail status and detailed output
 */
export function verify(
  root: string,
  config: VerifyConfig,
  options?: { ci?: boolean }
): VerifyResult {
  const ci = options?.ci ?? false;
  const readmeContent = readFileSync(join(root, config.readme), "utf-8");

  // Section 1: README vs Code
  const { results: section1, errors: s1Errors } = verifySection1(config.checks, root, readmeContent);

  // Build actual-values lookup for cross-repo references
  const actualValues: Record<string, number> = {};
  for (const check of config.checks) {
    const { actual } = resolveCheck(check, root, readmeContent);
    if (actual !== null) actualValues[check.name] = actual;
  }

  // Section 2: Cross-repo consistency
  const { results: section2, errors: s2Errors } = verifySection2(
    config.crossRepo ?? [],
    root,
    readmeContent,
    actualValues,
    ci
  );

  // Section 3: Version synchronization
  const { results: section3, errors: s3Errors } = verifySection3(
    config.versionSync,
    root
  );

  // Section 4: Feature status (stub detection)
  const { results: section4, errors: s4Errors } = verifySection4(
    config.featureStatus,
    root
  );

  // Section 5: Documentation coverage
  const { results: section5, errors: s5Errors } = verifySection5(
    config.docCoverage,
    root
  );

  const totalErrors = s1Errors + s2Errors + s3Errors + s4Errors + s5Errors;

  return {
    passed: totalErrors === 0,
    errors: totalErrors,
    section1,
    section2,
    section3,
    section4,
    section5
  };
}
