// ============================================================================
// MD Standard File Parser
// ============================================================================

import type { StandardRule } from "@stsgs/shared";
import { generateRuleId } from "@stsgs/shared";

export interface StandardDef {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: "error" | "warning" | "info";
  version: string;
  rules: StandardRule[];
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

function parseSeverity(raw: string): "error" | "warning" | "info" {
  const m = raw.match(/\[([A-Z])\]/g);
  if (!m) return "info";
  for (const tag of m) {
    const code = tag.replace(/[[\]]/g, "");
    if (code in SEV_MAP) return SEV_MAP[code];
  }
  return "info";
}

function makePattern(text: string): string | undefined {
  const q = text.match(/`([^`]+)`/);
  if (q) return q[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return undefined;
}

const IMP_RE = /^(?:Always|Never|Must|Do not|Don't|Ensure|Use|Avoid|Prefer|Require|No)\b/i;

function extractRules(lines: string[]): StandardRule[] {
  const rules: StandardRule[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const h3 = line.match(/^###\s+\d+\.\d+\.\s+(.+)/);
    if (h3) {
      const heading = h3[1].replace(/\*+/g, "").trim();
      if (!heading || seen.has(heading)) continue;
      seen.add(heading);
      const body: string[] = [];
      for (let j = i + 1; j < lines.length; j++) {
        const bl = lines[j].trim();
        if (bl.startsWith("### ") || bl.startsWith("## ") || bl === "---") break;
        if (bl) body.push(bl);
      }
      rules.push({
        id: generateRuleId(), name: heading.slice(0, 60),
        description: body.slice(0, 3).join(" ").slice(0, 200) || heading,
        pattern: makePattern(heading), enabled: true,
      });
      continue;
    }
    if ((line.startsWith("- ") || /^\d+\.\s/.test(line)) && IMP_RE.test(line)) {
      const content = line.replace(/^[-\d.\s]+/, "").trim().replace(/\*+/g, "");
      if (!content || content.length < 10 || seen.has(content)) continue;
      seen.add(content);
      rules.push({
        id: generateRuleId(), name: content.slice(0, 60), description: content,
        pattern: makePattern(content), enabled: true,
      });
    }
  }
  return rules;
}

function extractDescription(text: string): string {
  const lines = text.split("\n");
  let bodyStart = 0;
  let pastMeta = false;
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
  const desc = parts.join(" ").replace(/\*+/g, "").trim();
  return desc.length > 500 ? desc.slice(0, 500) + "..." : desc || "No description provided.";
}

export function parseStandardFile(content: string, filename: string): StandardDef | null {
  const idMatch = content.match(/> ID:\s*(STD-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*-\d+)/);
  if (!idMatch) { console.warn(`[parse-md] No ID in ${filename}, skipping`); return null; }
  const id = idMatch[1];
  const nameMatch = content.match(/^#\s+Standard:\s+(.+)/m);
  const rawName = nameMatch ? nameMatch[1].replace(/\s+v[\d.]+.*/, "").trim() : "";
  const name = rawName || filename.replace(/\.md$/, "");
  const verMatch = content.match(/> Version:\s*([\d.]+)/);
  const version = verMatch ? verMatch[1] : "1.0.0";
  const sevMatch = content.match(/> Level:\s*(.+)/);
  const severity = sevMatch ? parseSeverity(sevMatch[1]) : "info";
  const pfxMatch = id.match(/^STD-([A-Z0-9]+)-/);
  const category = CATEGORY_MAP[pfxMatch?.[1] ?? "META"] || "general";
  const description = extractDescription(content);
  const rules = extractRules(content.split("\n"));
  return { id, name, description, category, severity, version, rules };
}
