// ============================================================================
// Client-side scanner — runs all parsing in the browser, zero server calls.
// Produces full ScannerReport (without LLM evaluation).
// LLM evaluation is a separate optional Phase 2 via /api/scanner/evaluate.
// ============================================================================

import type {
  ScannerFile, ScannerReport, StructureSummary,
  ParsedSkill, ParsedStandard,
} from '@/lib/scanner/types';
import { classifyFile, parseSkillMarkdown, parseStandardMarkdown } from '@/lib/scanner/parser';
import { extractReferences, checkReferences } from '@/lib/scanner/references';
import { heuristicEvaluation } from '@/lib/scanner/heuristic';
import { detectAntiPatterns } from '@/lib/scanner/anti-patterns';

function buildStructure(files: ScannerFile[]): StructureSummary {
  const fileTypes: Record<string, number> = {};
  let totalSize = 0;
  for (const f of files) {
    fileTypes[f.type] = (fileTypes[f.type] ?? 0) + 1;
    totalSize += f.size;
  }
  return {
    totalFiles: files.length, totalSize,
    skillsCount: fileTypes['skill'] ?? 0,
    standardsCount: fileTypes['standard'] ?? 0,
    fileTypes,
    largestFiles: [...files].sort((a, b) => b.size - a.size)
      .slice(0, 10).map(f => ({ path: f.path, size: f.size })),
  };
}

function parseFiles(files: ScannerFile[]): {
  skills: ParsedSkill[]; standards: ParsedStandard[];
} {
  const skills: ParsedSkill[] = [];
  const standards: ParsedStandard[] = [];
  for (const file of files) {
    if (file.type === 'skill') skills.push(parseSkillMarkdown(file.path, file.content));
    else if (file.type === 'standard') standards.push(parseStandardMarkdown(file.path, file.content));
  }
  return { skills, standards };
}

/** Run full scanner pipeline in the browser. Returns report with heuristic evaluation. */
export function scanFilesClient(
  rawFiles: { path: string; content: string; size: number }[],
): ScannerReport {
  const typedFiles: ScannerFile[] = rawFiles.map(f => ({
    ...f, type: classifyFile(f.path, f.content),
  }));
  const structure = buildStructure(typedFiles);
  const { skills, standards } = parseFiles(typedFiles);
  const rawRefs = extractReferences(typedFiles);
  const references = checkReferences(rawRefs, typedFiles);
  const antiPatterns = detectAntiPatterns(skills, standards, references);
  const evaluation = heuristicEvaluation(structure, skills, standards, references);
  return {
    structure, skills, standards, references, antiPatterns, evaluation,
    timestamp: new Date().toISOString(),
  };
}

/** Build a compact summary for LLM evaluation (~5KB instead of full content). */
export function buildEvalSummary(report: ScannerReport): string {
  return JSON.stringify({
    structure: report.structure,
    skills: report.skills.map(s => ({
      name: s.name, completeness: s.completeness, wordCount: s.wordCount,
      matchedCriteria: s.matchedCriteria, missedCriteria: s.missedCriteria,
    })),
    standards: report.standards.map(s => ({
      name: s.name, id: s.id, severity: s.severity, wordCount: s.wordCount,
    })),
    references: report.references.map(r => ({ id: r.id, resolved: r.resolved })),
    unresolvedCount: report.references.filter(r => !r.resolved).length,
    antiPatterns: report.antiPatterns.map(a => ({
      type: a.type, severity: a.severity, message: a.message, sourceCount: a.sources.length,
    })),
  }, null, 2);
}