// verify-docs.plugins.ts — Example custom source resolvers
//
// This file registers project-specific source types for verify-docs.
// Place it in your project root alongside verify-docs.json.

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

export default function register({ registerSource }: {
  registerSource: (prefix: string, resolver: (source: string, root: string) => number | null) => void
}) {

  // custom:packages — count workspace packages with package.json
  registerSource("custom:packages", (_source: string, root: string) => {
    try {
      return readdirSync(join(root, "packages"), { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("."))
        .filter((d) => {
          try { return statSync(join(root, "packages", d.name, "package.json")).isFile(); }
          catch { return false; }
        })
        .length;
    } catch { return null; }
  });

  // custom:screens — count Next.js dashboard pages (excluding dynamic routes)
  registerSource("custom:screens", (_source: string, root: string) => {
    const results: string[] = [];
    const dir = join(root, "src/app/(dashboard)");
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith("[") && !entry.name.startsWith(".")) {
          try {
            statSync(join(dir, entry.name, "page.tsx"));
            results.push(entry.name);
          } catch { /* no page.tsx */ }
        }
      }
    } catch { return null; }
    return results.length;
  });

  // custom:i18n — count unique i18n namespace keys
  registerSource("custom:i18n", (_source: string, root: string) => {
    try {
      const src = readFileSync(join(root, "src/lib/i18n/translations/index.ts"), "utf-8");
      const keys = (src.match(/(\w+): \{ \.\.\.\w+[A-Z]/g) || []);
      return new Set(keys.map((k) => k.split(":")[0])).size;
    } catch { return null; }
  });
}
