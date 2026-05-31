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
  /** For Router/Condition nodes: which output handle was selected */
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
    case "router": {
      const routes = (d.routes || []) as Array<{
        id: string; label: string; keywords?: string[]; expression?: string; targetAgentId?: string;
      }>;
      if (!routes.length) return { data: { ...inputs, routedTo: null }, selectedHandle: undefined };

      const strategy = (d.routingStrategy as string) || "llm";
      const text = extractText(inputs);
      let selectedRouteId: string | undefined;

      if (strategy === "keyword") {
        const lower = text.toLowerCase();
        const matched = routes.find(r => (r.keywords || []).some(kw => lower.includes(kw.toLowerCase())));
        selectedRouteId = matched?.id;
      } else if (strategy === "llm") {
        const categoryList = routes.map(r => r.label).join(", ");
        const sys = (d.classificationPrompt as string) ||
          `Classify the input into one of these categories: ${categoryList}. Respond with ONLY the category name, nothing else.`;
        const model = (d.model as string) || resolved.model;
        const resp = await callLLM({
          provider: resolved.provider, model,
          messages: [{ role: "system", content: sys }, { role: "user", content: text }],
          temperature: 0.1,
          maxTokens: 32,
        });
        const classification = resp.content.trim().toLowerCase();
        const matched = routes.find(r => r.label.toLowerCase() === classification);
        selectedRouteId = matched?.id;
      } else {
        // expression strategy — future: safe eval; fallback for now
        selectedRouteId = undefined;
      }

      // Fallback to default route or first route
      const fallbackId = d.fallbackRouteId as string | undefined;
      const chosen = selectedRouteId || fallbackId || routes[0]?.id;

      return {
        data: { ...inputs, routedTo: chosen, classification: chosen, routes: routes.map(r => r.label) },
        selectedHandle: chosen,
      };
    }
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
