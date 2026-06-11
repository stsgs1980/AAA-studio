import type { ScannerFile, ParsedSkill, ParsedStandard, ReferenceCheck } from './types';
import { scoreCompleteness } from './completeness';

// ---- Path normalization ----
function normPath(p: string): string {
  return p.replace(/^\.\//g, '').replace(/\/+$/g, '').replace(/\\/g, '/');
}

// ---- YAML frontmatter ----
function parseYamlFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      result[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });
  return result;
}

// ---- File classification ----
// Subdirectories with support files, NOT standalone skills
const SUPPORT_SUBDIRS = [
  'references/', 'docs/', 'evals/', 'examples/', 'scripts/',
  'assets/', 'tests/', 'templates/',
];

function isSupportFile(path: string): boolean {
  const lower = path.toLowerCase();
  return SUPPORT_SUBDIRS.some(dir => lower.includes(dir));
}

export function classifyFile(path: string, content: string): ScannerFile['type'] {
  const lower = path.toLowerCase();

  // --- Standard detection (highest priority) ---
  if (lower.includes('std-') || lower.includes('standard')) return 'standard';
  if (/STD-[A-Z]+-\d{3}/.test(content)) return 'standard';
  if (/^>\s*ID:\s*STD-/mi.test(content)) return 'standard';

  // --- Support files: exclude BEFORE skill detection ---
  // references/, docs/, evals/, examples/, scripts/ are never skills
  if (isSupportFile(lower)) {
    if (/\.(json|yaml|yml|toml|env)$/i.test(lower)) return 'config';
    if (/\.(ts|tsx|js|jsx|py|rs|go)$/i.test(lower)) return 'code';
    return lower.endsWith('.md') || lower.endsWith('.mdx') ? 'doc' : 'other';
  }

  // --- Skill detection (after support exclusion) ---
  if (lower.includes('skill') && lower.endsWith('.md')) return 'skill';
  if (lower.endsWith('/skill.md')) return 'skill';

  const fm = parseYamlFrontmatter(content);
  if (fm && (fm.id || fm.name || fm.trigger) && lower.endsWith('.md')) {
    if (fm.trigger || fm.description || fm.steps) return 'skill';
  }

  // --- Code / Config / Doc / Other ---
  if (/\.(json|yaml|yml|toml|env)$/i.test(lower)) return 'config';
  if (/\.(ts|tsx|js|jsx|py|rs|go)$/i.test(lower)) return 'code';
  if (/\.(md|mdx|txt|rst)$/i.test(lower)) return 'doc';
  return 'other';
}

export function parseSkillMarkdown(path: string, content: string): ParsedSkill {
  const fm = parseYamlFrontmatter(content);
  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const headings = body.match(/^#{2,3}\s+(.+)$/gm) ?? [];
  const sections = headings.map(h => h.replace(/^#{2,3}\s+/, '').trim());
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const sectionSet = new Set(sections.map(s => s.toLowerCase()));
  const ctx = { sections: sectionSet, frontmatter: fm, body };
  const { score: completeness, matched, missed } = scoreCompleteness(ctx);

  return {
    path, name: fm.name ?? null, version: fm.version ?? null, id: fm.id ?? null,
    trigger: (fm.trigger?.split(',') ?? []).map(t => t.trim()).filter(Boolean),
    sections, completeness, matchedCriteria: matched, missedCriteria: missed,
    hasExamples: sectionSet.has('examples') || sectionSet.has('example')
      || sectionSet.has('sample output') || sectionSet.has('demo') || body.includes('```'),
    hasConstraints: sectionSet.has('constraints') || sectionSet.has('rules')
      || sectionSet.has('warnings') || sectionSet.has('limitations')
      || /(?:warning|caution|must|should not|do not)\b/i.test(body),
    hasCodeBlocks: /```/.test(body), wordCount,
  };
}

const STD_ID_RE = /STD-[A-Z]+-\d{3}/g;
export function parseStandardMarkdown(path: string, content: string): ParsedStandard {
  const firstLine = content.split('\n').find(l => l.trim()) ?? '';
  const hMatch = firstLine.match(/^#\s+(.+)$/);
  const name = hMatch ? hMatch[1].trim() : path.split('/').pop() ?? path;
  const idMatch = content.match(/STD-[A-Z]+-\d{3}/);
  const id = idMatch ? idMatch[0] : null;
  const sevMatch = content.match(/\[?(critical|warning|info)\]?\s*:/i);
  const severity = sevMatch ? (sevMatch[1].toLowerCase() as 'critical' | 'warning' | 'info') : null;
  const verMatch = content.match(/version[:\s]+(\d+\.\d+)/i);
  const version = verMatch ? verMatch[1] : null;
  const relatedIds = [...content.matchAll(STD_ID_RE)].map(m => m[0]).filter(r => r !== id);
  const headings = content.match(/^#{2,3}\s+(.+)$/gm) ?? [];
  const sections = headings.map(h => h.replace(/^#{2,3}\s+/, '').trim());
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return {
    path, name, id, severity, version, relatedIds, sections,
    hasCodeBlocks: /```/.test(content),
    hasExamples: content.toLowerCase().includes('example'), wordCount,
  };
}
