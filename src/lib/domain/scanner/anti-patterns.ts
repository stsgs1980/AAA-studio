// ============================================================================
// AAA Studio -- Anti-Pattern Detectors
// 4 detectors: Inline Dup, Unregistered STD, Version Drift, Missing Examples
// Pure structural analysis, no LLM needed.
// ============================================================================

import type { AntiPattern, ParsedSkill, ParsedStandard, ReferenceCheck } from './types';

export function detectAntiPatterns(
  skills: ParsedSkill[],
  standards: ParsedStandard[],
  refs: ReferenceCheck[],
): AntiPattern[] {
  return [
    ...detectInlineDup(skills),
    ...detectUnregisteredStd(refs),
    ...detectVersionDrift(skills, standards, refs),
    ...detectMissingExamples(skills),
  ];
}

// ---- 1. Inline Dup ----
// Skills with identical section structure AND similar word count = copy-paste
function detectInlineDup(skills: ParsedSkill[]): AntiPattern[] {
  const results: AntiPattern[] = [];
  const keyMap = new Map<string, string[]>();
  for (const s of skills) {
    const secKey = [...s.sections].sort().join('|');
    const rounded = Math.round(s.wordCount / 50) * 50;
    const key = `${secKey}:${rounded}`;
    if (secKey.length < 10) continue;
    if (!keyMap.has(key)) keyMap.set(key, []);
    keyMap.get(key)!.push(s.path);
  }
  for (const [, paths] of keyMap) {
    if (paths.length >= 2) {
      results.push({
        type: 'inline_dup', severity: 'warning',
        message: `Identical structure+size in ${paths.length} skills (likely copy-paste)`,
        sources: paths,
      });
    }
  }
  return results;
}

// ---- 2. Unregistered STD ----
// STD-IDs referenced in files but no standard defines them
function detectUnregisteredStd(refs: ReferenceCheck[]): AntiPattern[] {
  const broken = refs.filter(r => !r.resolved && r.id.startsWith('STD-'));
  if (!broken.length) return [];
  const byId = new Map<string, string[]>();
  for (const r of broken) {
    if (!byId.has(r.id)) byId.set(r.id, []);
    byId.get(r.id)!.push(r.source);
  }
  return [...byId.entries()].map(([id, sources]) => ({
    type: 'unregistered_std' as const, severity: 'critical' as const,
    message: `Standard ${id} referenced in ${sources.length} file(s) but not defined`,
    sources,
  }));
}

// ---- 3. Version Drift ----
// Skill version != referenced standard version
function detectVersionDrift(
  skills: ParsedSkill[],
  standards: ParsedStandard[],
  refs: ReferenceCheck[],
): AntiPattern[] {
  const stdVers = new Map<string, string | null>();
  for (const std of standards) if (std.id) stdVers.set(std.id, std.version);
  const skillVers = new Map<string, string | null>();
  for (const s of skills) skillVers.set(s.path, s.version);
  const results: AntiPattern[] = [];
  for (const ref of refs) {
    if (!ref.resolved || !ref.id.startsWith('STD-')) continue;
    const sv = skillVers.get(ref.source);
    const tv = stdVers.get(ref.id);
    if (sv && tv && sv !== tv) {
      results.push({
        type: 'version_drift', severity: 'warning',
        message: `${ref.source.split('/').pop()} v${sv} references ${ref.id} v${tv}`,
        sources: [ref.source],
      });
    }
  }
  return results;
}

// ---- 4. Missing Examples ----
// Skills without examples, code blocks, or demo sections
function detectMissingExamples(skills: ParsedSkill[]): AntiPattern[] {
  const missing = skills.filter(s => !s.hasExamples && !s.hasCodeBlocks);
  if (!missing.length) return [];
  const sources = missing.map(s => s.path);
  return [{
    type: 'missing_examples', severity: 'warning',
    message: `${missing.length} skill(s) lack examples or code blocks`,
    sources,
  }];
}
