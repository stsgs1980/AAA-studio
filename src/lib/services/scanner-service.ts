import { callLLM } from '@/lib/llm/client';
import { getActiveProvider } from '@/lib/llm';
import type { ScannerEvaluation } from '@/lib/scanner/types';

/** Strip markdown fences (```json ... ```) and extract JSON object */
function extractJSON(raw: string): string {
  const text = raw.trim();
  const fenceMatch = text.match(/^```(?:json|JSON)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenceMatch) return fenceMatch[1].trim();
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  return (first !== -1 && last > first) ? text.slice(first, last + 1) : text;
}

/** Evaluate pre-built scanner summary with LLM. Accepts the compact JSON from client. */
export async function evaluateSummary(summaryJson: string): Promise<ScannerEvaluation> {
  const active = await getActiveProvider();
  if (!active) throw new Error('No LLM provider configured');
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
      { role: 'user', content: `Scanner data:\n${summaryJson.slice(0, 15000)}` },
    ],
    temperature: 0.1, maxTokens: 2048,
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
}