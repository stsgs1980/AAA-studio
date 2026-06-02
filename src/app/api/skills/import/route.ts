/**
 * POST /api/skills/import -- Import skills from SKILL.md or ZIP
 * Accepts: multipart/form-data with .md or .zip file.
 * - .md: Parses YAML frontmatter + body, creates skill
 * - .zip: Extracts SKILL.md + code files, creates skill with files
 */

import { handleError, created, BadRequest } from '@/lib/api-error';
import { db } from '@/lib/db';
import { skillCreateSchema } from '@/lib/validations';
import JSZip from 'jszip';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) throw BadRequest('No file provided. Upload .md or .zip.');

    if (file.name.endsWith('.md')) return await importMarkdown(await file.text());
    if (file.name.endsWith('.zip')) return await importZip(Buffer.from(await file.arrayBuffer()));
    throw BadRequest('Only .md and .zip files accepted.');
  } catch (error) { return handleError(error); }
}

async function importMarkdown(content: string) {
  const parsed = parseSkillMd(content);
  const validated = skillCreateSchema.parse({ name: parsed.name, ...parsed.frontmatter });
  const skill = await upsertSkill(validated);
  return created({ message: `Imported skill: ${skill.name}`, skill });
}

async function importZip(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const mdEntry = zip.file('SKILL.md') || Object.values(zip.files).find((f) => !f.dir && f.name.endsWith('SKILL.md'));
  if (!mdEntry) throw BadRequest('ZIP must contain a SKILL.md file.');
  const mdContent = await mdEntry.async('string');
  const parsed = parseSkillMd(mdContent);
  const validated = skillCreateSchema.parse({ name: parsed.name, ...parsed.frontmatter });
  const skill = await upsertSkill(validated);
  // Import files from ZIP
  let fileCount = 0;
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir || path.endsWith('SKILL.md') || path.endsWith('package.json')) continue;
    const cleanPath = path.replace(/^[^/]+\//, ''); // strip top-level folder
    if (!cleanPath) continue;
    const fileContent = await entry.async('string');
    await db.skillFile.create({ data: { skillId: skill.id, path: cleanPath, content: fileContent, language: detectLang(cleanPath), role: detectRole(cleanPath), order: fileCount } });
    fileCount++;
  }
  return created({ message: `Imported skill: ${skill.name} with ${fileCount} file(s)`, skill, fileCount });
}

/** Parse SKILL.md — extract YAML frontmatter + name from first heading */
function parseSkillMd(content: string): { name: string; frontmatter: Record<string, unknown> } {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter: Record<string, unknown> = {};
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (kv) {
        const [, key, raw] = kv;
        if (raw === '>' || raw === '|') continue; // skip block scalars
        frontmatter[key] = raw;
      }
    }
  }
  const h1 = content.match(/^#\s+(.+)$/m);
  const name = (frontmatter.name as string) || h1?.[1] || 'Imported Skill';
  return { name, frontmatter: { ...frontmatter, name } };
}

async function upsertSkill(validated: Record<string, unknown>) {
  const slug = (validated.slug as string) || String(validated.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const existing = await db.skill.findUnique({ where: { slug } });
  if (existing) return await db.skill.update({ where: { id: existing.id }, data: buildData(validated, slug) });
  return await db.skill.create({ data: buildData(validated, slug) });
}

function buildData(v: Record<string, unknown>, slug: string) {
  return {
    name: v.name as string, slug, version: (v.version as string) || '1.0.0',
    skillId: (v.skillId as string) || '', category: (v.category as string) || 'general',
    description: (v.description as string) || '', longDescription: (v.longDescription as string) || '',
    inputSchema: JSON.stringify(v.inputSchema ?? {}), outputSchema: JSON.stringify(v.outputSchema ?? {}),
    code: '', tests: '', tags: JSON.stringify(v.tags ?? []), triggers: JSON.stringify(v.triggers ?? []),
    standardIds: JSON.stringify(v.standardIds ?? []), compatibility: (v.compatibility as string) || 'both',
    dependencies: JSON.stringify(v.dependencies ?? []), annotations: JSON.stringify(v.annotations ?? {}),
    author: (v.author as string) || '', license: (v.license as string) || 'MIT',
  };
}

function detectLang(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = { ts: 'typescript', tsx: 'typescript', js: 'javascript', py: 'python', json: 'json', yaml: 'yaml', yml: 'yaml', md: 'markdown', sh: 'bash' };
  return map[ext] ?? 'text';
}

function detectRole(path: string): string {
  if (path.startsWith('tests/') || path.includes('.test.') || path.includes('.spec.')) return 'test';
  if (path === 'README.md' || path.startsWith('docs/')) return 'doc';
  if (path.startsWith('config/')) return 'config';
  if (path.includes('schema')) return 'schema';
  if (path === 'index.ts' || path === 'main.ts' || path.startsWith('src/index')) return 'entry';
  if (path.startsWith('scripts/')) return 'script';
  return 'code';
}
