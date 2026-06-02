import { z } from 'zod';
import { handleError, success, BadRequest } from '@/lib/api-error';
import { callLLM } from '@/lib/llm/client';
import { getActiveProvider } from '@/lib/llm';
import type {
  ScannerFile, ScannerReport, ScannerEvaluation,
  StructureSummary, ParsedSkill, ParsedStandard, ReferenceCheck,
} from '@/lib/scanner/types';
import { classifyFile, parseSkillMarkdown, parseStandardMarkdown, extractReferences, checkReferences } from '@/lib/scanner/parser';
import { heuristicEvaluation } from '@/lib/scanner/heuristic';
import { detectAntiPatterns } from '@/lib/scanner/anti-patterns';

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
/** Strip markdown fences (```json ... ```) and extract JSON object */
function extractJSON(raw: string): string {
  const text = raw.trim();
  const fenceMatch = text.match(/^```(?:json|JSON)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenceMatch) return fenceMatch[1].trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  return (first !== -1 && last > first) ? text.slice(first, last + 1) : text;
}

async function evaluateWithLLM(
  structure: StructureSummary,
  skills: ParsedSkill[],
  standards: ParsedStandard[],
  references: ReferenceCheck[],
): Promise<ScannerEvaluation> {
  // No LLM configured — use heuristic fallback
  const active = await getActiveProvider();
  if (!active) {
    return heuristicEvaluation(structure, skills, standards, references);
  }

  const systemPrompt = [
    'You are a toolkit quality auditor. Analyze the scanner data and return ONLY valid JSON.',
    'Return this exact shape (no markdown fences, no extra text):',
    '{"overall":0-100,"grade":"A|B|C|D|F","dimensions":{',
    '"completeness":0-100,"references":0-100,"consistency":0-100,',
    '"examples":0-100,"constraints":0-100}',
    ',"criticalIssues":["..."],"recommendations":["..."]}',
  ].join('\n');
  const summary = JSON.stringify({
    structure, skillsCount: skills.length, standardsCount: standards.length,
    skills: skills.map(s => ({ name: s.name, completeness: s.completeness, wordCount: s.wordCount })),
    standards: standards.map(s => ({ name: s.name, id: s.id, severity: s.severity, wordCount: s.wordCount })),
    references: references.map(r => ({ id: r.id, resolved: r.resolved })),
    unresolvedCount: references.filter(r => !r.resolved).length,
  }, null, 2);

  try {
    const response = await callLLM({
      provider: active.provider, model: active.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Scanner data:\n${summary.slice(0, 15000)}` },
      ],
      temperature: 0.1,
      maxTokens: 2048,
    });

    const json = JSON.parse(extractJSON(response.content ?? '{}'));
    const dims = json.dimensions ?? {};
    return {
      overall: Number(json.overall) || 0,
      grade: (['A', 'B', 'C', 'D', 'F'] as const).includes(json.grade) ? json.grade : 'F',
      dimensions: {
        completeness: Number(dims.completeness) || 0,
        references: Number(dims.references) || 0,
        consistency: Number(dims.consistency) || 0,
        examples: Number(dims.examples) || 0,
        constraints: Number(dims.constraints) || 0,
      },
      criticalIssues: Array.isArray(json.criticalIssues) ? json.criticalIssues : [],
      recommendations: Array.isArray(json.recommendations) ? json.recommendations : [],
    };
  } catch {
    // LLM call failed or returned unparseable JSON — fall back to heuristic
    return heuristicEvaluation(structure, skills, standards, references);
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
    const antiPatterns = detectAntiPatterns(skills, standards, references);

    let evaluation: ScannerEvaluation | null = null;
    if (parsed.data.evaluate) {
      evaluation = await evaluateWithLLM(structure, skills, standards, references);
    }

    const report: ScannerReport = {
      structure, skills, standards, references, antiPatterns, evaluation,
      timestamp: new Date().toISOString(),
    };

    return success(report);
  } catch (error) {
    return handleError(error);
  }
}
