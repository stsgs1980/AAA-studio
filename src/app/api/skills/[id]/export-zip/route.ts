import { db } from '@/lib/db';
import { handleError, NotFound } from '@/lib/api-error';
import JSZip from 'jszip';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/skills/[id]/export-zip
 * Exports a skill as a ZIP archive containing all its SkillFile records.
 * Includes SKILL.md manifest + package.json + all files in directory structure.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const skill = await db.skill.findUnique({
      where: { id },
      include: { files: { orderBy: [{ order: 'asc' }, { path: 'asc' }] } },
    });
    if (!skill) throw NotFound('Skill not found');

    const zip = new JSZip();
    const slug = skill.name.toLowerCase().replace(/\s+/g, "-");
    const root = zip.folder(slug)!;

    // Add all SkillFile records as files
    for (const file of skill.files) {
      root.file(file.path, file.content);
    }

    // Add SKILL.md manifest
    const tags: string[] = JSON.parse(skill.tags);
    const standardIds: string[] = JSON.parse(skill.standardIds);
    const inputSchema: Record<string, unknown> = JSON.parse(skill.inputSchema);
    const outputSchema: Record<string, unknown> = JSON.parse(skill.outputSchema);

    const linkedStandards = standardIds.length > 0
      ? await db.standard.findMany({ where: { id: { in: standardIds } }, select: { name: true } })
      : [];

    const manifest = buildManifest({
      name: skill.name, description: skill.description, category: skill.category,
      tags, inputSchema, outputSchema,
      standards: linkedStandards.map(s => s.name), fileCount: skill.files.length,
    });
    root.file("SKILL.md", manifest);

    // Add package.json for Z.ai sandbox compatibility
    root.file("package.json", JSON.stringify({
      name: slug, version: "1.0.0", description: skill.description,
      category: skill.category,
      main: skill.files.find(f => f.role === "entry")?.path ?? "index.ts",
      keywords: tags,
    }, null, 2));

    const blob = await zip.generateAsync({ type: "nodebuffer" });
    return new Response(new Uint8Array(blob), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${slug}.zip"`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

function buildManifest(ctx: {
  name: string; description: string; category: string; tags: string[];
  inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown>;
  standards: string[]; fileCount: number;
}): string {
  const lines: string[] = [];
  const dl = ctx.description.split("\n").filter(l => l.trim());
  lines.push("---");
  lines.push(`name: ${ctx.name.toLowerCase().replace(/\s+/g, "-")}`);
  lines.push("version: 1.0");
  lines.push("description: >");
  if (dl.length > 0) { for (const l of dl) lines.push(`  ${l.trim()}`); }
  else { lines.push(`  ${ctx.category} skill: ${ctx.name}`); }
  lines.push("---", "");
  lines.push(`# ${ctx.name}`, "");
  if (dl.length > 0) lines.push("## Description", "", ...dl, "");
  lines.push("## Metadata", "");
  lines.push(`- **Category:** ${ctx.category}`);
  lines.push(`- **Tags:** ${ctx.tags.length > 0 ? ctx.tags.join(", ") : "none"}`);
  if (ctx.standards.length > 0) lines.push(`- **Standards:** ${ctx.standards.join(", ")}`);
  lines.push(`- **Files:** ${ctx.fileCount}`, "");
  lines.push("## Input Schema", "", "```json", JSON.stringify(ctx.inputSchema, null, 2), "```", "");
  lines.push("## Output Schema", "", "```json", JSON.stringify(ctx.outputSchema, null, 2), "```", "");
  return lines.join("\n");
}
