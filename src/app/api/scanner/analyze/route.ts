import { z } from 'zod';
import { handleError, success, BadRequest } from '@/lib/api-error';
import { callLLM } from '@/lib/llm/client';
import { getActiveProvider } from '@/lib/llm';
import type {
  ScannerFile, ScannerReport, ScannerEvaluation,
  StructureSummary, ParsedSkill, ParsedStandard, ReferenceCheck,
} from '@/lib/scanner/types';
import {
  classifyFile, parseSkillMarkdown, parseStandardMarkdown,
  extractReferences, checkReferences,
} from '@/lib/scanner/parser';

const schema = z.object({
  files: z.array(z.object({
    path: z.string(), content: z.string(), size: z.number(),
  })).min(1, 'At least one file is required'),
  evaluate: z.boolean().optional().default(false),
});

function buildStructure(files: ScannerFile[]): StructureSummary {
  const fileTypes: Record<string, number> = {};
  let totalSize = 0;
  for (const f of files) {
    fileTypes[f.type] = (fileTypes[f.type] ?? 0) + 1;
    totalSize += f.size;
  }
  return {
    totalFiles: files.length,
    totalSize,
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

async function evaluateWithLLM(
  structure: StructureSummary,
  skills: ParsedSkill[],
  standards: ParsedStandard[],
  references: ReferenceCheck[],
): Promise<ScannerEvaluation> {
  const active = await getActiveProvider();
  if (!active) throw BadRequest('No LLM provider configured');

  const dataSummary = JSON.stringify({
    structure, skillsCount: skills.length, standardsCount: standards.length,
    skills: skills.map(s => ({ name: s.name, completeness: s.completeness, wordCount: s.wordCount })),
    standards: standards.map(s => ({ name: s.name, id: s.id, severity: s.severity, wordCount: s.wordCount })),
    references: references.map(r => ({ id: r.id, resolved: r.resolved })),
    unresolvedCount: references.filter(r => !r.resolved).length,
  }, null, 2);

  const systemPrompt = [
    'You are a toolkit quality auditor. Analyze the scanner data and return ONLY valid JSON.',
    'Return this exact shape (no markdown fences, no extra text):',
    '{"overall":0-100,"grade":"A|B|C|D|F","dimensions":{',
    '"completeness":0-100,"references":0-100,"consistency":0-100,',
    '"examples":0-100,"constraints":0-100}',
    ',"criticalIssues":["..."],"recommendations":["..."]}',
  ].join('\n');

  const response = await callLLM({
    provider: active.provider, model: active.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Scanner data:\n${dataSummary.slice(0, 15000)}` },
    ],
    temperature: 0.1,
    maxTokens: 2048,
  });

  try {
    const json = JSON.parse(response.content ?? '{}');
    return {
      overall: Number(json.overall) || 0,
      grade: (['A', 'B', 'C', 'D', 'F'] as const).includes(json.grade) ? json.grade : 'F',
      dimensions: {
        completeness: Number(json.dimensions?.completeness) || 0,
        references: Number(json.dimensions?.references) || 0,
        consistency: Number(json.dimensions?.consistency) || 0,
        examples: Number(json.dimensions?.examples) || 0,
        constraints: Number(json.dimensions?.constraints) || 0,
      },
      criticalIssues: Array.isArray(json.criticalIssues) ? json.criticalIssues : [],
      recommendations: Array.isArray(json.recommendations) ? json.recommendations : [],
    };
  } catch {
    return {
      overall: 0, grade: 'F',
      dimensions: { completeness: 0, references: 0, consistency: 0, examples: 0, constraints: 0 },
      criticalIssues: ['Failed to parse LLM response'],
      recommendations: [],
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw BadRequest('Invalid input', parsed.error.flatten());

    const typedFiles: ScannerFile[] = parsed.data.files.map(f => ({
      ...f, type: classifyFile(f.path, f.content),
    }));

    const structure = buildStructure(typedFiles);
    const { skills, standards } = parseFiles(typedFiles);
    const rawRefs = extractReferences(typedFiles);
    const references = checkReferences(rawRefs, typedFiles);

    let evaluation: ScannerEvaluation | null = null;
    if (parsed.data.evaluate) {
      evaluation = await evaluateWithLLM(structure, skills, standards, references);
    }

    const report: ScannerReport = {
      structure, skills, standards, references, evaluation,
      timestamp: new Date().toISOString(),
    };

    return success(report);
  } catch (error) {
    return handleError(error);
  }
}
