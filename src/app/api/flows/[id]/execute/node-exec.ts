// Flow node execution logic -- extracted from route.ts for anti-monolith compliance

import { callLLM, type ProviderConfig, type LLMResponse } from "@/lib/llm/client";
import type { LLMSettings } from "@/lib/llm";
import { getProviders } from "@/lib/llm/settings";
import { estimateCost } from "@/lib/cost";
import { extractText, type FlowNode } from "./flow-utils";
import { safeEvalCondition } from "@/features/flow-editor/lib/node-utils";
import { execRouter } from "./node-router";

export interface ExecOutput {
  data: Record<string, unknown>;
  model?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  cost?: number;
  selectedHandle?: string;
}

/** Resolve provider config -- per-node override or fallback to active */
async function resolveProvider(
  node: FlowNode,
  active: { provider: ProviderConfig; model: string; settings: LLMSettings },
): Promise<{ provider: ProviderConfig; model: string; settings: LLMSettings }> {
  const d = node.data;
  const nodeProviderId = d.providerId as string | undefined;
  if (nodeProviderId) {
    const providers = await getProviders();
    const resolved = providers.find(p => p.id === nodeProviderId && p.enabled);
    if (resolved) return { provider: resolved, model: (d.model as string) || active.model, settings: active.settings };
  }
  return active;
}

/** Execute a single flow node. */
export async function execNode(
  node: FlowNode, inputs: Record<string, unknown>,
  active: { provider: ProviderConfig; model: string; settings: LLMSettings },
): Promise<ExecOutput> {
  const d = node.data;
  const resolved = await resolveProvider(node, active);

  switch (node.type) {
    case "start": return { data: { started: true, timestamp: Date.now() } };
    case "end": return { data: { ...inputs, finished: true } };
    case "llm": return execLLM(d, inputs, resolved);
    case "agent": return execAgent(d, inputs, resolved);
    case "prompt": return execPrompt(d, inputs);
    case "transform": return execTransform(d, inputs);
    case "condition": {
      const expr = typeof d.expression === "string" ? d.expression : "";
      const result = safeEvalCondition(expr, inputs);
      return { data: { ...inputs, conditionResult: result }, selectedHandle: result ? "true" : "false" };
    }
    case "filter": {
      const cond = typeof d.condition === "string" ? d.condition : "";
      const passed = safeEvalCondition(cond, inputs);
      return { data: { ...inputs, passed }, selectedHandle: passed ? "pass" : "fail" };
    }
    case "router": return execRouter(node, inputs, resolved);
    default: return { data: { ...inputs, type: node.type, processed: true } };
  }
}

async function execLLM(d: Record<string, unknown>, inputs: Record<string, unknown>, resolved: { provider: ProviderConfig; model: string; settings: LLMSettings }) {
  const sys = typeof d.systemPrompt === "string" ? d.systemPrompt : "You are a helpful assistant.";
  const model = (d.model as string) || resolved.model;
  const resp = await callLLM({
    provider: resolved.provider, model,
    messages: [{ role: "system", content: sys }, { role: "user", content: extractText(inputs) }],
    temperature: (d.temperature as number) ?? resolved.settings.temperature,
    maxTokens: resolved.settings.maxTokens,
  });
  return buildLLMOutput(inputs, resp, model);
}

async function execAgent(d: Record<string, unknown>, inputs: Record<string, unknown>, resolved: { provider: ProviderConfig; model: string; settings: LLMSettings }) {
  const role = typeof d.role === "string" ? d.role : "assistant";
  const model = (d.model as string) || resolved.model;
  const resp = await callLLM({
    provider: resolved.provider, model,
    messages: [{ role: "system", content: `You are ${role}.` }, { role: "user", content: extractText(inputs) }],
    temperature: resolved.settings.temperature, maxTokens: resolved.settings.maxTokens,
  });
  return { ...buildLLMOutput(inputs, resp, model), data: { ...inputs, agentResponse: resp.content } };
}

function execPrompt(d: Record<string, unknown>, inputs: Record<string, unknown>) {
  let tmpl = typeof d.template === "string" ? d.template : "";
  for (const [k, v] of Object.entries(inputs)) tmpl = tmpl.replaceAll(`{{${k}}}`, String(v ?? ""));
  return { data: { ...inputs, renderedPrompt: tmpl } };
}

function execTransform(d: Record<string, unknown>, inputs: Record<string, unknown>) {
  const text = extractText(inputs);
  const t = typeof d.transform === "string" ? d.transform : "identity";
  let out = text;
  if (t === "uppercase") out = text.toUpperCase();
  else if (t === "lowercase") out = text.toLowerCase();
  else if (t === "json_stringify") out = JSON.stringify(inputs, null, 2);
  return { data: { ...inputs, transformed: out } };
}

function buildLLMOutput(inputs: Record<string, unknown>, resp: LLMResponse, model: string): ExecOutput {
  const usage = resp.usage ? {
    promptTokens: resp.usage.promptTokens, completionTokens: resp.usage.completionTokens,
    totalTokens: resp.usage.totalTokens,
  } : undefined;
  const cost = resp.usage ? estimateCost(resp.usage.promptTokens, resp.usage.completionTokens, model) : undefined;
  return { data: { ...inputs, model: resp.model, response: resp.content }, model: resp.model, usage, cost };
}
