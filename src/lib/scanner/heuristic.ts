// ============================================================================
// AAA Studio -- Scanner Heuristic Evaluation
// Computes quality scores from parsed data when LLM is unavailable or fails.
// Falls back to structural analysis instead of returning all-zero.
// ============================================================================

import type {
  ScannerEvaluation, StructureSummary,
  ParsedSkill, ParsedStandard, ReferenceCheck,
} from './types';

export function heuristicEvaluation(
  structure: StructureSummary,
  skills: ParsedSkill[],
  standards: ParsedStandard[],
  references: ReferenceCheck[],
): ScannerEvaluation {
  // Completeness: avg completeness of parsed skills (0-100), scaled by coverage
  const skillCompleteness = skills.length > 0
    ? skills.reduce((sum, s) => sum + s.completeness, 0) / skills.length
    : 0;
  // Scale: what % of .md files are actually parsed as skills/standards?
  const parseCoverage = structure.totalFiles > 0
    ? ((skills.length + standards.length) / structure.totalFiles) * 100
    : 0;
  const completeness = Math.round(skillCompleteness * 0.7 + parseCoverage * 0.3);

  // References: % of references that resolve
  const referencesScore = references.length > 0
    ? Math.round((references.filter(r => r.resolved).length / references.length) * 100)
    : (references.length === 0 && skills.length > 0 ? 50 : 100);

  // Consistency: standards with IDs + skills with IDs + no orphan refs
  const stdsWithIds = standards.filter(s => s.id).length;
  const skillsWithIds = skills.filter(s => s.id).length;
  const idCoverage = (skills.length + standards.length) > 0
    ? ((stdsWithIds + skillsWithIds) / (skills.length + standards.length)) * 100
    : 0;
  const consistency = Math.round(idCoverage * 0.6 + referencesScore * 0.4);

  // Examples: % of skills/standards that have examples
  const allItems = [...skills, ...standards];
  const examplesScore = allItems.length > 0
    ? Math.round((allItems.filter(i => i.hasExamples).length / allItems.length) * 100)
    : 0;

  // Constraints: % of skills that have constraints/rules
  const constraintsScore = skills.length > 0
    ? Math.round((skills.filter(s => s.hasConstraints).length / skills.length) * 100)
    : 0;

  const overall = Math.round(
    (completeness + referencesScore + consistency + examplesScore + constraintsScore) / 5,
  );

  const grade = overall >= 80 ? 'A' as const
    : overall >= 60 ? 'B' as const
    : overall >= 40 ? 'C' as const
    : overall >= 20 ? 'D' as const
    : 'F' as const;

  const issues: string[] = [];
  const recs: string[] = [];

  // --- Per-skill concrete recommendations ---
  const lowSkills = skills.filter(s => s.completeness < 50);
  if (lowSkills.length > 0) {
    const missingByLabel: Record<string, string[]> = {};
    for (const s of lowSkills) {
      const name = s.name ?? s.path.split('/').pop() ?? s.path;
      for (const m of s.missedCriteria) {
        (missingByLabel[m] ??= []).push(name);
      }
    }
    const LABEL_HINTS: Record<string, string> = {
      description: 'Add ## Purpose or ## Description section',
      trigger: 'Add ## When to Use or ## Usage section',
      steps: 'Add ## Steps, ## Instructions, or ## Quick Start section',
      output: 'Add ## Output, ## Parameters, or ## Entry Types section',
      examples: 'Add ## Examples section or code blocks',
      constraints: 'Add ## Constraints, ## Warnings, or ## Rules section',
    };
    for (const [label, names] of Object.entries(missingByLabel)) {
      const top = names.slice(0, 5).join(', ');
      const more = names.length > 5 ? ` +${names.length - 5} more` : '';
      recs.push(`${LABEL_HINTS[label]} — missing in: ${top}${more}`);
    }
  }

  // --- Aggregate issues ---
  if (examplesScore < 30) issues.push('Most skills/standards lack worked examples');
  if (constraintsScore < 30) issues.push('Most skills lack constraints or rules');
  if (references.length > 0) {
    const broken = references.filter(r => !r.resolved);
    if (broken.length > 0) {
      issues.push(
        `${broken.length} unresolved reference(s): ${broken.slice(0, 5).map(r => r.id).join(', ')}`,
      );
    }
  }
  if (parseCoverage < 50 && structure.totalFiles > 10) {
    recs.push(
      'Many .md files are not classified as skills/standards — check file naming or add frontmatter IDs',
    );
  }
  if (skills.filter(s => s.wordCount < 50).length > skills.length * 0.3) {
    recs.push('Many skills have very short content (< 50 words) — consider expanding documentation');
  }
  if (stdsWithIds < standards.length * 0.5 && standards.length > 3) {
    recs.push('Many standards lack IDs — add STD-XXX-NNN identifiers for cross-referencing');
  }

  return {
    overall, grade,
    dimensions: {
      completeness, references: referencesScore,
      consistency, examples: examplesScore, constraints: constraintsScore,
    },
    criticalIssues: issues,
    recommendations: recs,
  };
}
