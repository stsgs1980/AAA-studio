// ============================================================================
// verify-section5.ts -- Documentation coverage verification
//
// Scans a source directory for files, then checks whether each file
// is mentioned in a documentation file (e.g. ARCHITECTURE.md).
//
// This prevents the common problem where new modules are added to the
// codebase but never documented, causing documentation to gradually
// become incomplete and unreliable.
// ============================================================================

import { join } from "path";
import type { DocCoverageConfig, LineResult } from "./types.js";
import { findFiles, safeRead } from "./resolvers.js";

/**
 * Section 5: Documentation coverage.
 * Checks that source files are mentioned in documentation.
 * Returns an array of LineResult entries and the number of errors found.
 */
export function verifySection5(
  docCoverage: DocCoverageConfig[] | undefined,
  root: string
): { results: LineResult[]; errors: number } {
  const results: LineResult[] = [];
  let errors = 0;

  if (!docCoverage || docCoverage.length === 0) {
    return { results, errors };
  }

  for (const coverage of docCoverage) {
    const docPath = join(root, coverage.docFile);
    const docContent = safeRead(docPath);

    if (!docContent) {
      results.push({
        status: "skip",
        name: coverage.name,
        detail: `doc file not found: ${coverage.docFile}`
      });
      continue;
    }

    // Build glob regex for file matching
    const globPattern = coverage.glob || "*";
    const fileRegex = new RegExp(
      globPattern.replace(/\*/g, ".*").replace(/\./g, "\\.") + "$"
    );

    // Find all source files in the directory
    const allFiles = findFiles(coverage.sourceDir, fileRegex, root);

    // Apply exclude patterns
    const excludePatterns = coverage.excludePatterns || [];
    const filteredFiles = allFiles.filter(file => {
      const basename = file.split("/").pop() || "";
      return !excludePatterns.some(pattern => {
        // Support glob-style patterns like "*.test.js"
        const regex = new RegExp(
          pattern.replace(/\*/g, ".*").replace(/\./g, "\\.") + "$"
        );
        return regex.test(basename);
      });
    });

    if (filteredFiles.length === 0) {
      results.push({
        status: "skip",
        name: coverage.name,
        detail: `no files found in ${coverage.sourceDir} matching ${globPattern}`
      });
      continue;
    }

    // Check which files are mentioned in documentation
    const mentioned: string[] = [];
    const notMentioned: string[] = [];

    for (const file of filteredFiles) {
      // Extract just the base filename (without extension) for matching
      // Also check the full relative path for more precise matching
      const basename = file.split("/").pop() || "";
      const basenameNoExt = basename.replace(/\.[^.]+$/, "");

      // Check multiple forms: basename, basename without extension, relative path
      const isMentioned =
        docContent.includes(basename) ||
        docContent.includes(basenameNoExt) ||
        docContent.includes(file);

      if (isMentioned) {
        mentioned.push(basename);
      } else {
        notMentioned.push(basename);
      }
    }

    // Report summary
    const coveragePct = Math.round((mentioned.length / filteredFiles.length) * 100);
    const summaryDetail = `${mentioned.length}/${filteredFiles.length} files mentioned (${coveragePct}%) in ${coverage.docFile}`;

    if (notMentioned.length === 0) {
      results.push({
        status: "OK",
        name: coverage.name,
        detail: summaryDetail
      });
    } else if (coverage.requiredMention && coverage.severity === "err") {
      results.push({
        status: "ERR",
        name: coverage.name,
        detail: `${summaryDetail} -- MISSING: ${notMentioned.join(", ")}`
      });
      errors++;
    } else if (coverage.requiredMention && coverage.severity === "warn") {
      results.push({
        status: "warn",
        name: coverage.name,
        detail: `${summaryDetail} -- MISSING: ${notMentioned.join(", ")}`
      });
    } else {
      // requiredMention = false -> info-only
      results.push({
        status: "info",
        name: coverage.name,
        detail: `${summaryDetail}${notMentioned.length > 0 ? ` -- not mentioned: ${notMentioned.join(", ")}` : ""}`
      });
    }

    // Report individual missing files (for large sets, cap at 20)
    if (notMentioned.length > 0 && coverage.requiredMention) {
      const cap = notMentioned.slice(0, 20);
      for (const file of cap) {
        const status = coverage.severity === "err" ? "ERR" : "warn";
        results.push({
          status: status as "ERR" | "warn",
          name: `${coverage.name}: ${file}`,
          detail: `not mentioned in ${coverage.docFile}`
        });
        if (coverage.severity === "err") {
          errors++;
        }
      }
      if (notMentioned.length > 20) {
        results.push({
          status: "info",
          name: coverage.name,
          detail: `... and ${notMentioned.length - 20} more files not mentioned`
        });
      }
    }
  }

  return { results, errors };
}
