// ============================================================================
// Seed Standards -- reads .md files from Zai-agent-toolkit/standards/ and
// upserts them into the database via the parse-md parser.
// Run: npx tsx scripts/seed-standards.ts
// ============================================================================

import { PrismaClient } from "@prisma/client";
import { readdir, readFile } from "fs/promises";
import path from "path";

// Inline the parser logic (script runs outside Next.js path alias resolution)
// Instead of importing parse-md.ts, we duplicate the core parse logic here
// to avoid tsx path alias issues. The canonical source is src/lib/standards/parse-md.ts.

interface StandardDef {
  id: string; name: string; description: string; category: string;
  severity: "error" | "warning" | "info"; version: string;
  rules: { id: string; name: string; description: string; pattern?: string; enabled: boolean }[];
}

const CATEGORY_MAP: Record<string, string> = {
  FE: "architecture", SEC: "security", AGENT: "agent",
  ERR: "quality", TEST: "quality", GIT: "general",
  DOC: "general", A11Y: "architecture", ENV: "security",
  ARCH: "architecture", META: "general",
};
const SEV_MAP: Record<string, "error" | "warning" | "info"> = {
  C: "error", W: "warning", I: "info",
};

function parse(content: string, filename: string): StandardDef | null {
  const idMatch = content.match(/> ID:\s*(STD-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*-\d+)/);
  if (!idMatch) return null;
  const id = idMatch[1];
  const nameMatch = content.match(/^#\s+Standard:\s+(.+)/m);
  const name = nameMatch ? nameMatch[1].replace(/\s+v[\d.]+.*/, "").trim() : filename.replace(/\.md$/, "");
  const verMatch = content.match(/> Version:\s*([\d.]+)/);
  const version = verMatch ? verMatch[1] : "1.0.0";
  const sevMatch = content.match(/> Level:\s*(.+)/);
  let severity: "error" | "warning" | "info" = "info";
  if (sevMatch) {
    const tags = sevMatch[1].match(/\[([A-Z])\]/g);
    if (tags) for (const t of tags) { const c = t.replace(/[\[\]]/g, ""); if (c in SEV_MAP) { severity = SEV_MAP[c]; break; } }
  }
  const pfx = id.match(/^STD-([A-Z0-9]+)-/)?.[1] ?? "META";
  const category = CATEGORY_MAP[pfx] || "general";

  // Description: first paragraph after metadata
  const lines = content.split("\n");
  let bodyStart = 0, pastMeta = false;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i].trim();
    if (ln.startsWith(">")) { pastMeta = true; continue; }
    if (pastMeta) { bodyStart = ln === "" ? i + 1 : i; break; }
  }
  const parts: string[] = [];
  for (let i = bodyStart; i < Math.min(lines.length, 200); i++) {
    const ln = lines[i].trim();
    if (ln.startsWith("## ") || ln === "---") break;
    if (ln && !ln.startsWith(">") && !ln.startsWith("#")) parts.push(ln);
    if (parts.length > 0 && ln === "") break;
  }
  const description = parts.join(" ").replace(/\*+/g, "").trim() || "No description.";

  return { id, name, description, category, severity, version, rules: [] };
}

async function main() {
  const db = new PrismaClient();
  const dir = path.resolve(process.cwd(), "Zai-agent-toolkit/standards");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  let created = 0, updated = 0, skipped = 0;

  console.log(`[seed] Found ${files.length} .md files in ${dir}\n`);

  for (const file of files) {
    const content = await readFile(path.join(dir, file), "utf-8");
    const std = parse(content, file);
    if (!std) { console.warn(`  SKIP ${file}: no STD-ID found`); skipped++; continue; }

    const existing = await db.standard.findUnique({ where: { id: std.id } });
    const data = {
      name: std.name, category: std.category, description: std.description,
      rules: JSON.stringify(std.rules), severity: std.severity, version: std.version,
    };

    if (existing) {
      await db.standard.update({ where: { id: std.id }, data });
      console.log(`  UPD   ${std.id} -> ${std.name}`);
      updated++;
    } else {
      await db.standard.create({ data: { id: std.id, ...data } });
      console.log(`  NEW   ${std.id} -> ${std.name}`);
      created++;
    }
  }

  console.log(`\n[seed] Done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
