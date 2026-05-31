/**
 * Individual node execution handlers.
 * Each handler takes upstream inputs + node data, returns enriched output.
 */
import { buildInputText, safeEvalCondition } from './node-utils';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface UsageData {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** Extract usage from /api/llm response (supports both snake_case and camelCase). */
function parseUsage(json: Record<string, unknown>): UsageData | undefined {
  const u = json.usage as Record<string, unknown> | undefined;
  if (!u) return undefined;
  return {
    promptTokens: (u.prompt_tokens ?? u.promptTokens ?? 0) as number,
    completionTokens: (u.completion_tokens ?? u.completionTokens ?? 0) as number,
    totalTokens: (u.total_tokens ?? u.totalTokens ?? 0) as number,
  };
}

/** Extract content string from OpenAI-format response */
function extractContent(json: Record<string, unknown>): string {
  const choices = json.choices as Array<{ message?: { content?: string } }> | undefined;
  return choices?.[0]?.message?.content ?? '';
}

/** Call /api/llm proxy for real LLM response. Passes per-node model override. */
export async function executeLLM(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<{ output: Record<string, unknown>; model?: string; usage?: UsageData }> {
  const sys = typeof data.systemPrompt === 'string' ? data.systemPrompt : 'You are a helpful assistant.';
  const model = typeof data.model === 'string' ? data.model : undefined;
  const messages: LLMMessage[] = [
    { role: 'system', content: sys },
    { role: 'user', content: buildInputText(inputs) },
  ];

  const body: Record<string, unknown> = {
    messages, temperature: data.temperature ?? 0.7, max_tokens: data.maxTokens ?? 4096,
  };
  if (model) body.model = model;

  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`LLM request failed: ${res.status}`);
  const json = await res.json() as Record<string, unknown>;

  const usedModel = (json.model as string) || model || 'default';
  const usage = parseUsage(json);
  const content = extractContent(json);

  return { output: { ...inputs, model: usedModel, response: content, usage }, model: usedModel, usage };
}

/** Execute an agent node -- LLM with role context. */
export async function executeAgent(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<{ output: Record<string, unknown>; model?: string; usage?: UsageData }> {
  const role = typeof data.role === 'string' ? data.role : 'assistant';
  const model = typeof data.model === 'string' ? data.model : undefined;
  const messages: LLMMessage[] = [
    { role: 'system', content: `You are ${role}. Process the input and respond.` },
    { role: 'user', content: buildInputText(inputs) },
  ];

  const body: Record<string, unknown> = { messages, temperature: 0.7 };
  if (model) body.model = model;

  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Agent LLM failed: ${res.status}`);
  const json = await res.json() as Record<string, unknown>;

  const usedModel = (json.model as string) || model || 'default';
  const usage = parseUsage(json);
  const content = extractContent(json);

  return { output: { ...inputs, agentResponse: content }, model: usedModel, usage };
}

/** Prompt node -- template + variable substitution. */
export function executePrompt(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Record<string, unknown> {
  let template = typeof data.template === 'string' ? data.template : '';
  for (const [key, val] of Object.entries(inputs)) {
    template = template.replaceAll(`{{${key}}}`, String(val ?? ''));
  }
  return { ...inputs, renderedPrompt: template };
}

/** Condition node -- evaluate expression against inputs. */
export function executeCondition(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): { output: Record<string, unknown>; selectedHandle: string } {
  const expr = typeof data.expression === 'string' ? data.expression : '';
  const result = safeEvalCondition(expr, inputs);
  return { output: { ...inputs, conditionResult: result }, selectedHandle: result ? 'true' : 'false' };
}

/** Filter node -- check condition, mark pass/fail. */
export function executeFilter(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): { output: Record<string, unknown>; selectedHandle: string } {
  const cond = typeof data.condition === 'string' ? data.condition : '';
  const passed = safeEvalCondition(cond, inputs);
  return { output: { ...inputs, passed }, selectedHandle: passed ? 'pass' : 'fail' };
}

/** Transform node -- apply string/data transforms. */
export function executeTransform(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const t = typeof data.transform === 'string' ? data.transform : 'identity';
  const text = buildInputText(inputs);
  let out: string | unknown;
  switch (t) {
    case 'uppercase': out = text.toUpperCase(); break;
    case 'lowercase': out = text.toLowerCase(); break;
    case 'trim': out = text.trim(); break;
    case 'json_parse': try { out = JSON.parse(text); } catch { out = text; } break;
    case 'json_stringify': out = JSON.stringify(inputs, null, 2); break;
    default: out = text;
  }
  return { ...inputs, transformed: out };
}
