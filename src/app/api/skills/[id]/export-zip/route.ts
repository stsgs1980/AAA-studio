import { db } from '@/lib/db';
import { handleError, NotFound } from '@/lib/api-error';
import { generateSkillMd } from '../export/helpers';
import JSZip from 'jszip';

type Params = { params: Promise<{ id: string }> };

/** Map SkillFile role to ZIP folder path */
const ROLE_FOLDER: Record<string, string> = {
  entry: '', code: 'src/', test: 'tests/', config: '',
  doc: '', schema: 'schemas/', script: 'scripts/',
  reference: 'references/', eval: 'evals/',
};

/** GET /api/skills/[id]/export-zip -- Exports skill as ZIP with role-based folder structure */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const skill = await db.skill.findUnique({
      where: { id },
      include: { files: { orderBy: [{ order: 'asc' }, { path: 'asc' }] } },
    });
    if (!skill) throw NotFound('Skill not found');

    const zip = new JSZip();
    const root = zip.folder(skill.slug)!;

    // Add SkillFile records to role-based folders
    for (const file of skill.files) {
      const folder = ROLE_FOLDER[file.role] ?? 'src/';
      const fullPath = folder ? `${folder}${file.path}` : file.path;
      root.file(fullPath, file.content);
    }

    // Generate unified SKILL.md
    const tags: string[] = JSON.parse(skill.tags);
    const triggers: string[] = JSON.parse(skill.triggers);
    const standardIds: string[] = JSON.parse(skill.standardIds);
    const dependencies: { skillId: string; version: string }[] = JSON.parse(skill.dependencies);
    const annotations: Record<string, boolean> = JSON.parse(skill.annotations);
    const inputSchema: Record<string, unknown> = JSON.parse(skill.inputSchema);
    const outputSchema: Record<string, unknown> = JSON.parse(skill.outputSchema);

    const linkedStandards = standardIds.length > 0
      ? await db.standard.findMany({ where: { id: { in: standardIds } }, select: { name: true } })
      : [];

    const manifest = generateSkillMd({
      name: skill.name, slug: skill.slug, version: skill.version, skillId: skill.skillId,
      description: skill.description, longDescription: skill.longDescription,
      category: skill.category, tags, triggers,
      inputSchema, outputSchema,
      standards: linkedStandards.map(s => s.name),
      compatibility: skill.compatibility, author: skill.author, license: skill.license,
      dependencies, annotations,
      code: skill.code, tests: skill.tests,
      files: skill.files.map(f => ({ path: f.path, content: f.content, language: f.language, role: f.role })),
    });
    root.file("SKILL.md", manifest);

    // Add package.json for Z.ai sandbox compatibility
    root.file("package.json", JSON.stringify({
      name: skill.slug, version: skill.version, description: skill.description,
      category: skill.category,
      main: skill.files.find(f => f.role === "entry")?.path ?? "index.ts",
      keywords: tags,
      author: skill.author, license: skill.license,
    }, null, 2));

    const blob = await zip.generateAsync({ type: "nodebuffer" });
    return new Response(new Uint8Array(blob), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${skill.slug}.zip"`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
