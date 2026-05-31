// Flow node execution logic -- extracted from route.ts for anti-monolith compliance

import { callLLM, type ProviderConfig, type LLMResponse } from "@/lib/llm/client";
import type { LLMSettings } from "@/lib/llm";
import { getProviders } from "@/lib/llm/settings";
import { estimateCost } from "@/lib/cost";
import { db } from "@/lib/db";
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
  flowId?: string,
): Promise<ExecOutput> {
  const d = node.data;
  const resolved = await resolveProvider(node, active);

  switch (node.type) {
    case "start": return { data: { started: true, timestamp: Date.now() } };
    case "end": return { data: { ...inputs, finished: true } };
    case "llm": return execLLM(d, inputs, resolved, flowId);
    case "agent": return execAgent(d, inputs, resolved, flowId);
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

async function execLLM(d: Record<string, unknown>, inputs: Record<string, unknown>, resolved: { provider: ProviderConfig; model: string; settings: LLMSettings }, flowId?: string) {
  const sys = typeof d.systemPrompt === "string" ? d.systemPrompt : "You are a helpful assistant.";
  const model = (d.model as string) || resolved.model;
  const resp = await callLLM({
    provider: resolved.provider, model,
    messages: [{ role: "system", content: sys }, { role: "user", content: extractText(inputs) }],
    temperature: (d.temperature as number) ?? resolved.settings.temperature,
    maxTokens: resolved.settings.maxTokens,
  });
  return buildLLMOutput(inputs, resp, model, flowId);
}

async function execAgent(d: Record<string, unknown>, inputs: Record<string, unknown>, resolved: { provider: ProviderConfig; model: string; settings: LLMSettings }, flowId?: string) {
  const role = typeof d.role === "string" ? d.role : "assistant";
  const model = (d.model as string) || resolved.model;
  const resp = await callLLM({
    provider: resolved.provider, model,
    messages: [{ role: "system", content: `You are ${role}.` }, { role: "user", content: extractText(inputs) }],
    temperature: resolved.settings.temperature, maxTokens: resolved.settings.maxTokens,
  });
  return { ...buildLLMOutput(inputs, resp, model, flowId), data: { ...inputs, agentResponse: resp.content } };
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

function buildLLMOutput(inputs: Record<string, unknown>, resp: LLMResponse, model: string, flowId?: string): ExecOutput {
  const usage = resp.usage ? {
    promptTokens: resp.usage.promptTokens, completionTokens: resp.usage.completionTokens,
    totalTokens: resp.usage.totalTokens,
  } : undefined;
  const cost = resp.usage ? estimateCost(resp.usage.promptTokens, resp.usage.completionTokens, model) : undefined;
  // Persist cost record asynchronously (fire-and-forget)
  if (usage && cost) persistCost(usage, cost, model, flowId).catch(() => {});
  return { data: { ...inputs, model: resp.model, response: resp.content }, model: resp.model, usage, cost };
}

/** Write a CostRecord row for analytics (non-blocking) */
async function persistCost(
  u: { promptTokens: number; completionTokens: number; totalTokens: number },
  cost: number, model: string, flowId?: string,
) {
  try {
    await db.costRecord.create({
      data: {
        executionType: 'workflow',
        inputTokens: u.promptTokens,
        outputTokens: u.completionTokens,
        totalTokens: u.totalTokens,
        costUsd: cost,
        model,
        ...(flowId ? { executionId: flowId } : {}),
      },
    });
  } catch { /* DB write failure should not break execution */ }
}
