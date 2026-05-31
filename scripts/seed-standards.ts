// ============================================================================
// Seed Standards -- reads .md files from Zai-agent-toolkit/standards/ and
// upserts them into the database with extracted rules.
// Run: npx tsx scripts/seed-standards.ts
// ============================================================================

import { PrismaClient } from "@prisma/client";
import { readdir, readFile } from "fs/promises";
import path from "path";

interface Rule {
  id: string; name: string; description: string; pattern?: string; enabled: boolean;
}

interface StandardDef {
  id: string; name: string; description: string; category: string;
  severity: "error" | "warning" | "info"; version: string; rules: Rule[];
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

/** Extract rules from ## headings and MUST/SHALL/MUST NOT requirements */
function extractRules(content: string, stdId: string): Rule[] {
  const rules: Rule[] = [];
  let ruleIdx = 0;
  const lines = content.split("\n");
  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Track section headings as rule context
    if (trimmed.startsWith("## ")) {
      currentSection = trimmed.replace(/^##+\s*/, "").trim();
      continue;
    }

    // Extract MUST / SHALL / MUST NOT / SHOULD / MUST ALWAYS requirements
    const reqMatch = trimmed.match(
      /^(?:[-*]|\d+\.)\s+(.{10,}?(?:MUST|SHALL|MUST NOT|MUST ALWAYS|SHOULD|NEVER|MAY)\s+.+)/i
    );
    if (reqMatch) {
      ruleIdx++;
      const text = reqMatch[1].replace(/\*+/g, "").trim();
      // Generate rule ID from standard ID + index
      const ruleId = `${stdId}-R${String(ruleIdx).padStart(3, "0")}`;
      rules.push({
        id: ruleId,
        name: currentSection || `Rule ${ruleIdx}`,
        description: text.length > 200 ? text.slice(0, 197) + "..." : text,
        enabled: true,
      });
    }

    // Extract regex patterns from code blocks
    const patternMatch = trimmed.match(/```(?:regex?|pattern)\s*\n?([\s\S]*?)```/);
    if (patternMatch && rules.length > 0) {
      rules[rules.length - 1].pattern = patternMatch[1].trim();
    }
  }

  return rules;
}

/** Parse a standard .md file into a StandardDef */
function parse(content: string, filename: string): StandardDef | null {
  const idMatch = content.match(/> ID:\s*(STD-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*-\d+)/);
  if (!idMatch) return null;
  const id = idMatch[1];
  const nameMatch = content.match(/^#\s+Standard:\s+(.+)/m);
  const name = nameMatch
    ? nameMatch[1].replace(/\s+v[\d.]+.*/, "").trim()
    : filename.replace(/\.md$/, "");
  const verMatch = content.match(/> Version:\s*([\d.]+)/);
  const version = verMatch ? verMatch[1] : "1.0.0";
  const sevMatch = content.match(/> Level:\s*(.+)/);
  let severity: "error" | "warning" | "info" = "info";
  if (sevMatch) {
    const tags = sevMatch[1].match(/\[([A-Z])\]/g);
    if (tags) {
      for (const t of tags) {
        const c = t.replace(/[\[\]]/g, "");
        if (c in SEV_MAP) { severity = SEV_MAP[c]; break; }
      }
    }
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
  const rules = extractRules(content, id);

  return { id, name, description, category, severity, version, rules };
}

async function main() {
  const db = new PrismaClient();
  const dir = path.resolve(process.cwd(), "Zai-agent-toolkit/standards");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  let created = 0, updated = 0, skipped = 0;
  let totalRules = 0;

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
      console.log(`  UPD   ${std.id} -> ${std.name} (${std.rules.length} rules)`);
      updated++;
    } else {
      await db.standard.create({ data: { id: std.id, ...data } });
      console.log(`  NEW   ${std.id} -> ${std.name} (${std.rules.length} rules)`);
      created++;
    }
    totalRules += std.rules.length;
  }

  console.log(`\n[seed] Done. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`);
  console.log(`[seed] Total rules extracted: ${totalRules}`);
  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
