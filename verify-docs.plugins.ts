// verify-docs.plugins.ts — Custom source resolvers for AAA-studio
//
// Register project-specific source types for verify-docs engine.

import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir);

export default function register({ registerSource }: {
  registerSource: (prefix: string, resolver: (source: string, root: string) => number | null) => void,
}) {

  // custom:packages — count workspace packages with package.json
  registerSource("custom:packages", (_source, root) => {
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

  // custom:screens — count dashboard page.tsx (excluding wiki/[slug])
  registerSource("custom:screens", (_source, root) => {
    try {
      const allPages: string[] = [];
      const find = (dir: string) => {
        const entries = readdirSync(join(root, dir), { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === "node_modules" || entry.name === ".next") continue;
          const rel = `${dir}/${entry.name}`;
          if (entry.isDirectory()) find(rel);
          else if (entry.name === "page.tsx" && !rel.includes("wiki/[slug]")) allPages.push(rel);
        }
      };
      find("src/app/(dashboard)");
      return allPages.length;
    } catch { return null; }
  });

  // custom:i18n — count unique i18n namespace keys
  registerSource("custom:i18n", (_source, root) => {
    try {
      const src = readFileSync(join(root, "src/lib/i18n/translations/index.ts"), "utf-8");
      const keys = (src.match(/(\w+): \{ \.\.\.\w+[A-Z]/g) || []);
      return new Set(keys.map((k) => k.split(":")[0])).size;
    } catch { return null; }
  });
}
