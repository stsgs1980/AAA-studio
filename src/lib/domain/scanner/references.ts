import type { ScannerFile, ReferenceCheck } from './types';

const REF_RE = /\b(STD-[A-Z]+-\d{3}|ZAI-[A-Z]+-\d{3})\b/g;

function normPath(p: string): string {
  return p.replace(/^\.\//g, '').replace(/\/+$/g, '').replace(/\\/g, '/');
}

export function extractReferences(files: ScannerFile[]): { id: string; source: string }[] {
  const seen = new Set<string>();
  const refs: { id: string; source: string }[] = [];
  for (const file of files) {
    const src = normPath(file.path);
    let m: RegExpExecArray | null;
    const re = new RegExp(REF_RE.source, REF_RE.flags);
    while ((m = re.exec(file.content)) !== null) {
      const key = `${m[0]}::${src}`;
      if (!seen.has(key)) { seen.add(key); refs.push({ id: m[0], source: src }); }
    }
  }
  return refs;
}

export function checkReferences(
  refs: { id: string; source: string }[], allFiles: ScannerFile[],
): ReferenceCheck[] {
  const stdMap = new Map<string, string>(), fallback = new Map<string, string>();
  for (const file of allFiles) {
    const fp = normPath(file.path);
    let m: RegExpExecArray | null;
    const re = new RegExp(REF_RE.source, REF_RE.flags);
    while ((m = re.exec(file.content)) !== null) {
      if (!fallback.has(m[0])) fallback.set(m[0], fp);
      const isStd = file.type === 'standard' || fp.toLowerCase().includes('/standards/');
      if (isStd && !stdMap.has(m[0])) stdMap.set(m[0], fp);
    }
  }
  const tgt = (id: string) => stdMap.get(id) ?? fallback.get(id) ?? null;
  const seen = new Set<string>();
  return refs.map(r => {
    const tp = tgt(r.id);
    const target = tp ? normPath(tp) : null;
    if (target === r.source) return null;
    const key = `${r.id}|${r.source}|${target}`;
    if (seen.has(key)) return null;
    seen.add(key);
    return { id: r.id, source: r.source, resolved: target !== null, targetPath: target };
  }).filter(Boolean) as ReferenceCheck[];
}