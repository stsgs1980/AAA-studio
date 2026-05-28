/**
 * Individual node execution handlers.
 * Each handler takes upstream inputs + node data, returns output.
 */
interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Call /api/llm proxy for real LLM response. */
export async function executeLLM(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const systemPrompt = typeof data.systemPrompt === "string"
    ? data.systemPrompt : "You are a helpful assistant.";
  const userContent = buildInputText(inputs);
  const messages: LLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];

  const res = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      temperature: data.temperature ?? 0.7,
      max_tokens: data.maxTokens ?? 4096,
    }),
  });

  if (!res.ok) throw new Error(`LLM request failed: ${res.status}`);
  const json = await res.json();
  return {
    ...inputs,
    model: data.model ?? "default",
    response: json.choices?.[0]?.message?.content ?? "",
    usage: json.usage,
  };
}

/** Execute an agent node — LLM with role context. */
export async function executeAgent(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const role = typeof data.role === "string" ? data.role : "assistant";
  const userContent = buildInputText(inputs);
  const messages: LLMMessage[] = [
    { role: "system", content: `You are ${role}. Process the input and respond.` },
    { role: "user", content: userContent },
  ];

  const res = await fetch("/api/llm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, temperature: 0.7 }),
  });

  if (!res.ok) throw new Error(`Agent LLM failed: ${res.status}`);
  const json = await res.json();
  return { ...inputs, agentResponse: json.choices?.[0]?.message?.content ?? "" };
}

/** Prompt node — template + variable substitution. */
export function executePrompt(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Record<string, unknown> {
  let template = typeof data.template === "string" ? data.template : "";
  for (const [key, val] of Object.entries(inputs)) {
    template = template.replaceAll(`{{${key}}}`, String(val ?? ""));
  }
  return { ...inputs, renderedPrompt: template };
}

/** Condition node — evaluate expression against inputs. */
export function executeCondition(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const expr = typeof data.expression === "string" ? data.expression : "true";
  return { ...inputs, conditionResult: safeEvalCondition(expr, inputs) };
}

/** Filter node — check condition, mark pass/fail. */
export function executeFilter(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const cond = typeof data.condition === "string" ? data.condition : "true";
  return { ...inputs, passed: safeEvalCondition(cond, inputs) };
}

/** Transform node — apply string/data transforms. */
export function executeTransform(
  inputs: Record<string, unknown>,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const t = typeof data.transform === "string" ? data.transform : "identity";
  const text = buildInputText(inputs);
  let out: string | unknown;
  switch (t) {
    case "uppercase": out = text.toUpperCase(); break;
    case "lowercase": out = text.toLowerCase(); break;
    case "trim": out = text.trim(); break;
    case "json_parse": try { out = JSON.parse(text); } catch { out = text; } break;
    case "json_stringify": out = JSON.stringify(inputs, null, 2); break;
    default: out = text;
  }
  return { ...inputs, transformed: out };
}

/** Extract text from upstream inputs for LLM context. */
export function buildInputText(inputs: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const val of Object.values(inputs)) {
    if (typeof val === "string") parts.push(val);
    else if (typeof val === "object" && val !== null) {
      const r = (val as Record<string, unknown>).response;
      if (typeof r === "string") parts.push(r);
    }
  }
  return parts.join("\n") || JSON.stringify(inputs);
}

/** Safely evaluate simple conditions. */
export function safeEvalCondition(expr: string, ctx: Record<string, unknown>): boolean {
  const t = expr.trim().toLowerCase();
  if (t === "true" || t === "1") return true;
  if (t === "false" || t === "0") return false;

  const eq = expr.match(/^(\w+)\s*(===|==)\s*(.+)$/);
  if (eq) return String(ctx[eq[1]] ?? "") === eq[3].trim();

  const has = expr.match(/^(\w+)\s+contains\s+(.+)$/);
  if (has) return String(ctx[has[1]] ?? "").includes(has[2].trim());

  return true;
}
