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
  See: https://github.com/stsgs1980/verify#configuration

EXIT CODES
  0  All numbers consistent
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
  console.error("See: https://github.com/stsgs1980/verify#configuration");
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

console.log("\n=== 1. README vs Code ===\n");
const result = verify(root, config, { ci });

for (const line of result.section1) {
  const tag =
    line.status === "info" ? "info"
    : line.status === "skip" ? "--"
    : line.status;
  console.log(`[${tag}] ${line.name}: ${line.detail}`);
}

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

// ── Summary ────────────────────────────────────────────────────────────────
if (result.errors > 0) {
  console.log(`\n!! ${result.errors} mismatch(es) found!`);
  process.exit(1);
} else {
  console.log("\nAll numbers consistent.");
  process.exit(0);
}
