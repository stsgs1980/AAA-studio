// Flow node execution logic -- extracted from route.ts for anti-monolith compliance

import { callLLM, type ProviderConfig, type LLMResponse } from "@/lib/llm/client";
import type { LLMSettings } from "@/lib/llm";
import { getProviders } from "@/lib/llm/settings";
import { estimateCost } from "@/lib/cost";
import { extractText, type FlowNode } from "./flow-utils";

export interface ExecOutput {
  data: Record<string, unknown>;
  model?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  cost?: number;
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
    if (resolved) {
      return {
        provider: resolved,
        model: (d.model as string) || active.model,
        settings: active.settings,
      };
    }
  }

  return active;
}

/** Execute a single flow node. LLM/Agent nodes call the active provider. */
export async function execNode(
  node: FlowNode, inputs: Record<string, unknown>,
  active: { provider: ProviderConfig; model: string; settings: LLMSettings },
): Promise<ExecOutput> {
  const d = node.data;
  const resolved = await resolveProvider(node, active);

  switch (node.type) {
    case "start": return { data: { started: true, timestamp: Date.now() } };
    case "end": return { data: { ...inputs, finished: true } };
    case "llm": {
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
    case "agent": {
      const role = typeof d.role === "string" ? d.role : "assistant";
      const model = (d.model as string) || resolved.model;
      const resp = await callLLM({
        provider: resolved.provider, model,
        messages: [{ role: "system", content: `You are ${role}.` }, { role: "user", content: extractText(inputs) }],
        temperature: resolved.settings.temperature, maxTokens: resolved.settings.maxTokens,
      });
      return { ...buildLLMOutput(inputs, resp, model), data: { ...inputs, agentResponse: resp.content } };
    }
    case "prompt": {
      let tmpl = typeof d.template === "string" ? d.template : "";
      for (const [k, v] of Object.entries(inputs)) tmpl = tmpl.replaceAll(`{{${k}}}`, String(v ?? ""));
      return { data: { ...inputs, renderedPrompt: tmpl } };
    }
    case "transform": {
      const text = extractText(inputs);
      const t = typeof d.transform === "string" ? d.transform : "identity";
      let out = text;
      if (t === "uppercase") out = text.toUpperCase();
      else if (t === "lowercase") out = text.toLowerCase();
      else if (t === "json_stringify") out = JSON.stringify(inputs, null, 2);
      return { data: { ...inputs, transformed: out } };
    }
    case "condition": return { data: { ...inputs, conditionResult: true } };
    case "filter": return { data: { ...inputs, passed: true } };
    default: return { data: { ...inputs, type: node.type, processed: true } };
  }
}

function buildLLMOutput(
  inputs: Record<string, unknown>, resp: LLMResponse, model: string,
): ExecOutput {
  const usage = resp.usage ? {
    promptTokens: resp.usage.promptTokens, completionTokens: resp.usage.completionTokens,
    totalTokens: resp.usage.totalTokens,
  } : undefined;
  const cost = resp.usage ? estimateCost(resp.usage.promptTokens, resp.usage.completionTokens, model) : undefined;
  return { data: { ...inputs, model: resp.model, response: resp.content }, model: resp.model, usage, cost };
}
