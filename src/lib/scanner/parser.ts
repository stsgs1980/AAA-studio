// ============================================================================
// AAA Studio -- Scanner Parser
// Parses toolkit files: classify, extract skills/standards, check references.
// ============================================================================

import type { ScannerFile, ParsedSkill, ParsedStandard, ReferenceCheck } from './types';

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

export function classifyFile(path: string, content: string): ScannerFile['type'] {
  const lower = path.toLowerCase();

  // --- Standard detection (higher priority) ---
  // Path-based
  if (lower.includes('std-') || lower.includes('standard')) return 'standard';
  // Content-based: STD-XXX-NNN pattern anywhere in content
  if (/STD-[A-Z]+-\d{3}/.test(content)) return 'standard';
  // Content-based: blockquote header pattern "> ID: STD-"
  if (/^>\s*ID:\s*STD-/mi.test(content)) return 'standard';

  // --- Skill detection ---
  // Path-based: must have .md extension
  if (lower.includes('skill') && lower.endsWith('.md')) return 'skill';
  // Content-based: YAML frontmatter with common skill fields
  const fm = parseYamlFrontmatter(content);
  if (fm && (fm.id || fm.name || fm.trigger) && lower.endsWith('.md')) {
    // Has frontmatter with skill-like metadata — classify as skill
    if (fm.trigger || fm.description || fm.steps) return 'skill';
  }

  // --- Code / Config / Doc / Other ---
  if (/\.(json|yaml|yml|toml|env)$/i.test(lower)) return 'config';
  if (/\.(ts|tsx|js|jsx|py|rs|go)$/i.test(lower)) return 'code';
  if (/\.(md|mdx|txt|rst)$/i.test(lower)) return 'doc';
  return 'other';
}

// ---- Skill parser ----

const RECOMMENDED_SECTIONS = ['description', 'trigger', 'steps', 'output', 'examples', 'constraints'];

export function parseSkillMarkdown(path: string, content: string): ParsedSkill {
  const fm = parseYamlFrontmatter(content);
  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  const headings = body.match(/^#{2,3}\s+(.+)$/gm) ?? [];
  const sections = headings.map(h => h.replace(/^#{2,3}\s+/, '').trim());
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const found = new Set(sections.map(s => s.toLowerCase()));
  const completeness = Math.round(
    (RECOMMENDED_SECTIONS.filter(s => found.has(s)).length / RECOMMENDED_SECTIONS.length) * 100,
  );

  return {
    path,
    name: fm.name ?? null,
    version: fm.version ?? null,
    id: fm.id ?? null,
    trigger: (fm.trigger?.split(',') ?? []).map(t => t.trim()).filter(Boolean),
    sections,
    hasExamples: body.toLowerCase().includes('example'),
    hasConstraints: body.toLowerCase().includes('constraint') || body.toLowerCase().includes('rule'),
    hasCodeBlocks: /```/.test(body),
    wordCount,
    completeness,
  };
}

// ---- Standard parser ----

const STD_ID_RE = /STD-[A-Z]+-\d{3}/g;

export function parseStandardMarkdown(path: string, content: string): ParsedStandard {
  const firstLine = content.split('\n').find(l => l.trim().length > 0) ?? '';
  const headingMatch = firstLine.match(/^#\s+(.+)$/);
  const name = headingMatch ? headingMatch[1].trim() : path.split('/').pop() ?? path;
  const idMatch = content.match(/STD-[A-Z]+-\d{3}/);
  const id = idMatch ? idMatch[0] : null;
  const severityMatch = content.match(/\[?(critical|warning|info)\]?\s*:/i);
  const severity = severityMatch
    ? (severityMatch[1].toLowerCase() as 'critical' | 'warning' | 'info')
    : null;
  const versionMatch = content.match(/version[:\s]+(\d+\.\d+)/i);
  const version = versionMatch ? versionMatch[1] : null;
  const relatedIds = [...content.matchAll(STD_ID_RE)]
    .map(m => m[0])
    .filter(rid => rid !== id);
  const headings = content.match(/^#{2,3}\s+(.+)$/gm) ?? [];
  const sections = headings.map(h => h.replace(/^#{2,3}\s+/, '').trim());
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    path, name, id, severity, version, relatedIds,
    sections,
    hasCodeBlocks: /```/.test(content),
    hasExamples: content.toLowerCase().includes('example'),
    wordCount,
  };
}

// ---- Reference extraction & checking ----

const REF_PATTERN = /\b(STD-[A-Z]+-\d{3}|ZAI-[A-Z]+-\d{3})\b/g;

export function extractReferences(files: ScannerFile[]): { id: string; source: string }[] {
  const refs: { id: string; source: string }[] = [];
  for (const file of files) {
    let match: RegExpExecArray | null;
    const re = new RegExp(REF_PATTERN.source, REF_PATTERN.flags);
    while ((match = re.exec(file.content)) !== null) {
      refs.push({ id: match[0], source: file.path });
    }
  }
  return refs;
}

export function checkReferences(
  refs: { id: string; source: string }[],
  allFiles: ScannerFile[],
): ReferenceCheck[] {
  const idToPath = new Map<string, string>();
  for (const file of allFiles) {
    let match: RegExpExecArray | null;
    const re = new RegExp(REF_PATTERN.source, REF_PATTERN.flags);
    while ((match = re.exec(file.content)) !== null) {
      if (!idToPath.has(match[0])) idToPath.set(match[0], file.path);
    }
  }
  return refs.map(r => ({
    id: r.id,
    source: r.source,
    resolved: idToPath.has(r.id),
    targetPath: idToPath.get(r.id) ?? null,
  }));
}
