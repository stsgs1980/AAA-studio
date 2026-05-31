/** Generate SKILL.md content from skill data + files */

interface ExportCtx {
  name: string; description: string; category: string; tags: string[];
  code: string; tests: string;
  inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown>;
  standards: string[];
  files: { path: string; content: string; language: string; role: string }[];
}

export function generateSkillMd(ctx: ExportCtx): string {
  const lines: string[] = [];
  const descLines = ctx.description.split("\n").filter((l) => l.trim());

  // YAML frontmatter
  lines.push("---");
  lines.push(`name: ${ctx.name.toLowerCase().replace(/\s+/g, "-")}`);
  lines.push("version: 1.0");
  lines.push("description: >");
  if (descLines.length > 0) {
    for (const dl of descLines) lines.push(`  ${dl.trim()}`);
  } else {
    lines.push(`  ${ctx.category} skill: ${ctx.name}`);
  }
  lines.push("---");
  lines.push("");
  lines.push(`# ${ctx.name}`);
  lines.push("");

  if (descLines.length > 0) {
    lines.push("## Description", "", ...descLines, "");
  }

  // Metadata
  lines.push("## Metadata", "");
  lines.push(`- **Category:** ${ctx.category}`);
  lines.push(`- **Tags:** ${ctx.tags.length > 0 ? ctx.tags.join(", ") : "none"}`);
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
