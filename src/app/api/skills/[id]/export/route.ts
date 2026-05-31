import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { handleError, NotFound } from '@/lib/api-error';
import { generateSkillMd } from './helpers';

type Params = { params: Promise<{ id: string }> };

/** GET /api/skills/[id]/export -- Generates SKILL.md with full manifest */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const skill = await db.skill.findUnique({
      where: { id },
      include: { files: { orderBy: [{ order: 'asc' }, { path: 'asc' }] } },
    });
    if (!skill) throw NotFound('Skill not found');

    const tags: string[] = JSON.parse(skill.tags);
    const triggers: string[] = JSON.parse(skill.triggers);
    const standardIds: string[] = JSON.parse(skill.standardIds);
    const dependencies: { skillId: string; version: string }[] = JSON.parse(skill.dependencies);
    const annotations: Record<string, boolean> = JSON.parse(skill.annotations);
    const inputSchema: Record<string, unknown> = JSON.parse(skill.inputSchema);
    const outputSchema: Record<string, unknown> = JSON.parse(skill.outputSchema);

    const linkedStandards = standardIds.length > 0
      ? await db.standard.findMany({ where: { id: { in: standardIds } }, select: { id: true, name: true } })
      : [];

    const md = generateSkillMd({
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

    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${skill.slug}-skill.md"`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
