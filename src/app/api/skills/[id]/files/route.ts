import { db } from '@/lib/db';
import { handleError, success, created, NotFound } from '@/lib/api-error';
import { z } from 'zod';

type Params = { params: Promise<{ id: string }> };

const fileCreateSchema = z.object({
  path: z.string().min(1, 'Path is required').max(255),
  content: z.string().optional().default(''),
  language: z.enum([
    'typescript', 'javascript', 'python', 'json',
    'yaml', 'markdown', 'text', 'bash',
  ]).optional(),
  role: z.enum([
    'entry', 'code', 'test', 'config', 'doc', 'schema',
  ]).optional(),
});

/**
 * GET /api/skills/[id]/files
 * List all files for a skill.
 * Auto-migrates legacy code/tests fields to SkillFile on first access.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const skill = await db.skill.findUnique({
      where: { id },
      include: { files: { orderBy: [{ order: 'asc' }, { path: 'asc' }] } },
    });
    if (!skill) throw NotFound('Skill not found');

    // Auto-migrate: if skill has code/tests but no files, create default files
    if (skill.files.length === 0 && (skill.code.trim() || skill.tests.trim())) {
      await migrateLegacyFiles(id, skill.code, skill.tests);
      const refreshed = await db.skillFile.findMany({
        where: { skillId: id },
        orderBy: [{ order: 'asc' }, { path: 'asc' }],
      });
      return success(refreshed);
    }

    return success(skill.files);
  } catch (error) {
    return handleError(error);
  }
}

/** Create default SkillFile records from legacy code/tests strings */
async function migrateLegacyFiles(skillId: string, code: string, tests: string) {
  const files: { path: string; content: string; language: string; role: string; order: number }[] = [];

  if (code.trim()) {
    files.push({ path: "src/index.ts", content: code, language: "typescript", role: "entry", order: 0 });
  }
  if (tests.trim()) {
    files.push({ path: "tests/index.test.ts", content: tests, language: "typescript", role: "test", order: 1 });
  }

  for (const f of files) {
    await db.skillFile.create({ data: { skillId, ...f } });
  }
}

/**
 * POST /api/skills/[id]/files
 * Add a new file to a skill.
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = fileCreateSchema.parse(await request.json());

    const skill = await db.skill.findUnique({ where: { id } });
    if (!skill) throw NotFound('Skill not found');

    const language = body.language ?? detectLang(body.path);
    const role = body.role ?? detectRole(body.path);

    const maxFile = await db.skillFile.findFirst({
      where: { skillId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = (maxFile?.order ?? -1) + 1;

    const file = await db.skillFile.create({
      data: { skillId: id, path: body.path, content: body.content, language, role, order },
    });
    return created(file);
  } catch (error) {
    return handleError(error);
  }
}

function detectLang(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    mjs: 'javascript', py: 'python', json: 'json', yaml: 'yaml', yml: 'yaml',
    md: 'markdown', sh: 'bash', bash: 'bash',
  };
  return map[ext] ?? 'text';
}

function detectRole(path: string): string {
  if (path.startsWith('tests/') || path.includes('.test.') || path.includes('.spec.')) return 'test';
  if (path === 'README.md' || path.startsWith('docs/')) return 'doc';
  if (path.startsWith('config/') || path.endsWith('.config.')) return 'config';
  if (path.includes('schema') || path.endsWith('.schema.json')) return 'schema';
  if (path === 'index.ts' || path === 'main.ts' || path === 'src/index.ts') return 'entry';
  return 'code';
}
