// ============================================================================
// AAA Studio -- Scanner Types
// Types for toolkit repository analysis pipeline.
// ============================================================================

export interface ScannerFile {
  path: string;
  content: string;
  size: number;
  type: 'skill' | 'standard' | 'config' | 'code' | 'doc' | 'other';
}

export interface ParsedSkill {
  path: string;
  name: string | null;
  version: string | null;
  id: string | null;
  trigger: string[];
  sections: string[];
  hasExamples: boolean;
  hasConstraints: boolean;
  hasCodeBlocks: boolean;
  wordCount: number;
  completeness: number;
  matchedCriteria: string[];
  missedCriteria: string[];
}

export interface ParsedStandard {
  path: string;
  name: string;
  id: string | null;
  severity: 'critical' | 'warning' | 'info' | null;
  version: string | null;
  relatedIds: string[];
  sections: string[];
  hasCodeBlocks: boolean;
  hasExamples: boolean;
  wordCount: number;
}

export interface ReferenceCheck {
  id: string;
  source: string;
  resolved: boolean;
  targetPath: string | null;
}

export interface AntiPattern {
  type: 'inline_dup' | 'unregistered_std' | 'version_drift' | 'missing_examples';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  sources: string[];
}

export interface StructureSummary {
  totalFiles: number;
  totalSize: number;
  skillsCount: number;
  standardsCount: number;
  fileTypes: Record<string, number>;
  largestFiles: { path: string; size: number }[];
}

export interface ScannerEvaluation {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  dimensions: {
    completeness: number;
    references: number;
    consistency: number;
    examples: number;
    constraints: number;
  };
  criticalIssues: string[];
  recommendations: string[];
}

export interface ScannerReport {
  structure: StructureSummary;
  skills: ParsedSkill[];
  standards: ParsedStandard[];
  references: ReferenceCheck[];
  antiPatterns: AntiPattern[];
  evaluation: ScannerEvaluation | null;
  timestamp: string;
}
