#!/usr/bin/env bun
// ============================================================================
// cli.ts — Command-line interface for verify-docs
//
// Reads verify-docs.json from CWD, runs the engine, outputs results.
// Exit codes: 0 = pass, 1 = mismatch, 2 = config error
// ============================================================================

import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import { verify, registerSource } from "./engine.js";

// ── Parse args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const ci = args.includes("--ci");
const configFlag = args.find((a) => a.startsWith("--config="));
const configPath = configFlag ? configFlag.split("=")[1] : "verify-docs.json";
const root = resolve(process.cwd());

// ── Show help ──────────────────────────────────────────────────────────────
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
verify-docs — Data-driven doc consistency checker

USAGE
  verify-docs              Run with default config (verify-docs.json)
  verify-docs --ci         CI mode: skip cross-repo checks
  verify-docs --config=X   Use custom config file path

CONFIG
  Create a verify-docs.json in your project root.
  See: https://github.com/stsgs1980/Anti-hallucination-guard

SECTIONS
  1. README vs Code        Numbers in docs match actual code
  2. Cross-repo            Values consistent across sibling repos
  3. Version sync          Version matches across all docs (single source of truth)
  4. Feature status        Stub markers in docs don't contradict existing code
  5. Doc coverage          Code files are mentioned in documentation

EXIT CODES
  0  All checks consistent
  1  Mismatch found
  2  Config error

EXAMPLES
  verify-docs                                    # run with defaults
  verify-docs --ci                               # CI mode (no sibling repos)
  verify-docs --config=docs-verify.json          # custom config path
`);
  process.exit(0);
}

// ── Load config ────────────────────────────────────────────────────────────
const fullConfigPath = resolve(root, configPath);
if (!existsSync(fullConfigPath)) {
  console.error(`Config not found: ${fullConfigPath}`);
  console.error("Create a verify-docs.json in your project root.");
  console.error("See: https://github.com/stsgs1980/Anti-hallucination-guard");
  process.exit(2);
}

const config = JSON.parse(readFileSync(fullConfigPath, "utf-8"));

// ── Load project-specific plugins (optional) ───────────────────────────────
// If the project has a verify-docs.plugins.ts, it can register custom sources
const pluginPath = resolve(root, "verify-docs.plugins.ts");
if (existsSync(pluginPath)) {
  try {
    const plugin = await import(pluginPath);
    if (typeof plugin.default === "function") {
      plugin.default({ registerSource });
    }
  } catch (err: any) {
    console.warn(`[warn] Plugin load failed: ${err.message}`);
  }
}

// ── Run verification ───────────────────────────────────────────────────────
if (ci) console.log("[CI mode] Cross-repo checks will be skipped.\n");

// ── Section 1: README vs Code ──────────────────────────────────────────────
console.log("\n=== 1. README vs Code ===\n");
const result = verify(root, config, { ci });

for (const line of result.section1) {
  const tag =
    line.status === "info" ? "info"
    : line.status === "skip" ? "--"
    : line.status;
  console.log(`[${tag}] ${line.name}: ${line.detail}`);
}

// ── Section 2: Cross-repo Consistency ──────────────────────────────────────
if (result.section2.length > 0) {
  console.log("\n=== 2. Cross-repo Consistency ===\n");
  for (const line of result.section2) {
    const tag =
      line.status === "ci" ? "CI"
      : line.status === "skip" ? "--"
      : line.status;
    console.log(`[${tag}] ${line.name}: ${line.detail}`);
  }
}

// ── Section 3: Version Synchronization ─────────────────────────────────────
if (result.section3.length > 0) {
  console.log("\n=== 3. Version Synchronization ===\n");
  for (const line of result.section3) {
    const tag =
      line.status === "info" ? "info"
      : line.status === "skip" ? "--"
      : line.status;
    console.log(`[${tag}] ${line.name}: ${line.detail}`);
  }
}

// ── Section 4: Feature Status (Stub Detection) ────────────────────────────
if (result.section4.length > 0) {
  console.log("\n=== 4. Feature Status (Stub Detection) ===\n");
  for (const line of result.section4) {
    const tag =
      line.status === "info" ? "info"
      : line.status === "skip" ? "--"
      : line.status;
    console.log(`[${tag}] ${line.name}: ${line.detail}`);
  }
}

// ── Section 5: Documentation Coverage ──────────────────────────────────────
if (result.section5.length > 0) {
  console.log("\n=== 5. Documentation Coverage ===\n");
  for (const line of result.section5) {
    const tag =
      line.status === "info" ? "info"
      : line.status === "skip" ? "--"
      : line.status;
    console.log(`[${tag}] ${line.name}: ${line.detail}`);
  }
}

// ── Summary ────────────────────────────────────────────────────────────────
if (result.errors > 0) {
  console.log(`\n!! ${result.errors} mismatch(es) found!`);
  process.exit(1);
} else {
  console.log("\nAll checks consistent.");
  process.exit(0);
}
