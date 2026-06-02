/** Generate SKILL.md content from skill data + files -- unified format */

interface ExportCtx {
  name: string; slug: string; version: string; skillId: string;
  description: string; longDescription: string; category: string;
  tags: string[]; triggers: string[];
  inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown>;
  standards: string[];
  compatibility: string; author: string; license: string;
  dependencies: { skillId: string; version: string }[];
  annotations: Record<string, boolean>;
  code: string; tests: string;
  files: { path: string; content: string; language: string; role: string }[];
}

export function generateSkillMd(ctx: ExportCtx): string {
  const lines: string[] = [];
  const descLines = ctx.description.split("\n").filter((l) => l.trim());

  // YAML frontmatter
  lines.push("---");
  lines.push(`name: ${ctx.slug}`);
  lines.push(`version: ${ctx.version}`);
  if (ctx.skillId) lines.push(`skillId: ${ctx.skillId}`);
  lines.push("description: >");
  if (descLines.length > 0) {
    for (const dl of descLines) lines.push(`  ${dl.trim()}`);
  } else {
    lines.push(`  ${ctx.category} skill: ${ctx.name}`);
  }
  lines.push(`category: ${ctx.category}`);
  lines.push(`compatibility: ${ctx.compatibility}`);
  if (ctx.triggers.length > 0) {
    lines.push("triggers:");
    for (const t of ctx.triggers) lines.push(`  - ${t}`);
  }
  if (ctx.tags.length > 0) {
    lines.push("tags:");
    for (const t of ctx.tags) lines.push(`  - ${t}`);
  }
  if (Object.keys(ctx.annotations).length > 0) {
    lines.push("annotations:");
    for (const [k, v] of Object.entries(ctx.annotations)) lines.push(`  ${k}: ${v}`);
  }
  if (ctx.dependencies.length > 0) {
    lines.push("dependencies:");
    for (const d of ctx.dependencies) lines.push(`  - skillId: ${d.skillId}`, `    version: "${d.version}"`);
  }
  if (ctx.standards.length > 0) {
    lines.push("standards:");
    for (const s of ctx.standards) lines.push(`  - ${s}`);
  }
  if (ctx.author) lines.push(`author: ${ctx.author}`);
  lines.push(`license: ${ctx.license}`);
  lines.push("---");
  lines.push("");

  // Markdown body
  lines.push(`# ${ctx.name}`, "");

  if (ctx.longDescription) {
    lines.push("## Description", "", ctx.longDescription, "");
  } else if (descLines.length > 0) {
    lines.push("## Description", "", ...descLines, "");
  }

  // Metadata
  lines.push("## Metadata", "");
  lines.push(`- **Category:** ${ctx.category}`);
  lines.push(`- **Version:** ${ctx.version}`);
  if (ctx.skillId) lines.push(`- **Skill ID:** ${ctx.skillId}`);
  lines.push(`- **Compatibility:** ${ctx.compatibility}`);
  if (ctx.tags.length > 0) lines.push(`- **Tags:** ${ctx.tags.join(", ")}`);
  if (ctx.triggers.length > 0) lines.push(`- **Triggers:** ${ctx.triggers.join(", ")}`);
  if (ctx.standards.length > 0) lines.push(`- **Standards:** ${ctx.standards.join(", ")}`);
  if (ctx.files.length > 0) lines.push(`- **Files:** ${ctx.files.length}`);
  lines.push("");

  // Schemas
  lines.push("## Input Schema", "", "```json", JSON.stringify(ctx.inputSchema, null, 2), "```", "");
  lines.push("## Output Schema", "", "```json", JSON.stringify(ctx.outputSchema, null, 2), "```", "");

  // Legacy code/tests (only if no SkillFile records exist)
  if (ctx.code.trim() && ctx.files.length === 0) {
    lines.push("## Implementation", "", "```", ctx.code.trim(), "```", "");
  }
  if (ctx.tests.trim() && ctx.files.length === 0) {
    lines.push("## Tests", "", "```", ctx.tests.trim(), "```", "");
  }

  // Multi-file section
  if (ctx.files.length > 0) {
    lines.push("## Files", "");
    for (const file of ctx.files) {
      lines.push(`### \`${file.path}\``, "");
      lines.push(`Role: ${file.role} | Language: ${file.language}`, "");
      lines.push("```" + mapLang(file.language));
      lines.push(file.content.trim() || "(empty file)");
      lines.push("```", "");
    }
  }

  return lines.join("\n");
}

function mapLang(language: string): string {
  const map: Record<string, string> = {
    typescript: "typescript", javascript: "javascript", python: "python",
    json: "json", yaml: "yaml", markdown: "markdown", bash: "bash", text: "",
  };
  return map[language] ?? "";
}
