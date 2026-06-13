// ============================================================================
// verify-section4.ts -- Feature status verification (stub detection)
//
// Detects features that are documented as "stubs / not implemented / TODO"
// but actually have implementation files present in the codebase.
//
// This prevents the common problem where features are built incrementally
// and the documentation still says they are stubs or missing.
// ============================================================================

import { existsSync } from "fs";
import { join } from "path";
import type { FeatureStatusConfig, LineResult } from "./types.js";
import { safeRead } from "./resolvers.js";

/**
 * Section 4: Feature status / stub detection.
 * Checks whether features marked as stubs in documentation
 * actually have implementation files present.
 * Returns an array of LineResult entries and the number of errors found.
 */
export function verifySection4(
  featureStatus: FeatureStatusConfig[] | undefined,
  root: string
): { results: LineResult[]; errors: number } {
  const results: LineResult[] = [];
  let errors = 0;

  if (!featureStatus || featureStatus.length === 0) {
    return { results, errors };
  }

  for (const feature of featureStatus) {
    // --- Step 1: Check if implementation files exist ---
    const existingFiles: string[] = [];
    const missingFiles: string[] = [];

    for (const implFile of feature.implementationFiles) {
      if (existsSync(join(root, implFile))) {
        existingFiles.push(implFile);
      } else {
        missingFiles.push(implFile);
      }
    }

    const allExist = missingFiles.length === 0;
    const someExist = existingFiles.length > 0;
    const noneExist = existingFiles.length === 0;

    // --- Step 2: Check documentation for stub markers ---
    const docPath = join(root, feature.docFile);
    const docContent = safeRead(docPath);

    if (!docContent) {
      results.push({
        status: "skip",
        name: feature.name,
        detail: `doc file not found: ${feature.docFile}`
      });
      continue;
    }

    // Narrow search area if contextPattern is provided
    const searchLines = feature.contextPattern
      ? docContent.split("\n").filter(line => new RegExp(feature.contextPattern!, "i").test(line))
      : docContent.split("\n");

    const searchArea = searchLines.join("\n");

    // Check for stub markers
    const foundStubs = feature.stubPatterns.filter(pattern =>
      new RegExp(pattern, "i").test(searchArea)
    );

    // Check for implemented markers (if provided)
    const foundImplemented = feature.implementedPatterns
      ? feature.implementedPatterns.filter(pattern =>
          new RegExp(pattern, "i").test(searchArea)
        )
      : [];

    // --- Step 3: Determine status ---

    // Case A: Doc says stub, but code exists -> ERR
    if (foundStubs.length > 0 && foundImplemented.length === 0 && allExist) {
      results.push({
        status: "ERR",
        name: feature.name,
        detail: `Marked as stub (${foundStubs.join(", ")}) but ALL implementation files exist: ${existingFiles.join(", ")}`
      });
      errors++;
      continue;
    }

    // Case B: Doc says stub, some code exists -> ERR (partial implementation)
    if (foundStubs.length > 0 && foundImplemented.length === 0 && someExist) {
      results.push({
        status: "ERR",
        name: feature.name,
        detail: `Marked as stub (${foundStubs.join(", ")}) but ${existingFiles.length}/${feature.implementationFiles.length} implementation files exist: ${existingFiles.join(", ")}`
      });
      errors++;
      continue;
    }

    // Case C: Doc says implemented, but no code exists -> ERR
    if (foundImplemented.length > 0 && foundStubs.length === 0 && noneExist) {
      results.push({
        status: "ERR",
        name: feature.name,
        detail: `Marked as implemented (${foundImplemented.join(", ")}) but NO implementation files exist`
      });
      errors++;
      continue;
    }

    // Case D: Doc says stub, no code exists -> OK (honest stub)
    if (foundStubs.length > 0 && foundImplemented.length === 0 && noneExist) {
      results.push({
        status: "OK",
        name: feature.name,
        detail: `Honest stub: documented as stub, no implementation files`
      });
      continue;
    }

    // Case E: Doc says implemented, code exists -> OK
    if (foundImplemented.length > 0 && someExist) {
      results.push({
        status: "OK",
        name: feature.name,
        detail: `Implemented: documented as working, ${existingFiles.length} files exist`
      });
      continue;
    }

    // Case F: Neither stub nor implemented markers found -> info
    if (foundStubs.length === 0 && foundImplemented.length === 0) {
      if (someExist) {
        results.push({
          status: "info",
          name: feature.name,
          detail: `No status markers in docs, but ${existingFiles.length} implementation files exist`
        });
      } else {
        results.push({
          status: "info",
          name: feature.name,
          detail: `No status markers in docs, no implementation files`
        });
      }
      continue;
    }

    // Case G: Both stub and implemented markers found -> warn (ambiguous)
    if (foundStubs.length > 0 && foundImplemented.length > 0) {
      results.push({
        status: "warn",
        name: feature.name,
        detail: `Ambiguous: both stub (${foundStubs.join(", ")}) and implemented (${foundImplemented.join(", ")}) markers found`
      });
      continue;
    }
  }

  return { results, errors };
}
