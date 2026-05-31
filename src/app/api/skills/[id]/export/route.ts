import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { handleError, NotFound } from '@/lib/api-error';
import { generateSkillMd } from './helpers';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/skills/[id]/export
 * Generates SKILL.md content from a Skill DB record + its SkillFile records.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const skill = await db.skill.findUnique({
      where: { id },
      include: { files: { orderBy: [{ order: 'asc' }, { path: 'asc' }] } },
    });
    if (!skill) throw NotFound('Skill not found');

    const tags: string[] = JSON.parse(skill.tags);
    const inputSchema: Record<string, unknown> = JSON.parse(skill.inputSchema);
    const outputSchema: Record<string, unknown> = JSON.parse(skill.outputSchema);
    const standardIds: string[] = JSON.parse(skill.standardIds);

    const linkedStandards = standardIds.length > 0
      ? await db.standard.findMany({ where: { id: { in: standardIds } }, select: { id: true, name: true } })
      : [];

    const md = generateSkillMd({
      name: skill.name,
      description: skill.description,
      category: skill.category,
      tags,
      code: skill.code,
      tests: skill.tests,
      inputSchema,
      outputSchema,
      standards: linkedStandards.map(s => s.name),
      files: skill.files.map(f => ({ path: f.path, content: f.content, language: f.language, role: f.role })),
    });

    return new NextResponse(md, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${skill.name.toLowerCase().replace(/\s+/g, "-")}-skill.md"`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
