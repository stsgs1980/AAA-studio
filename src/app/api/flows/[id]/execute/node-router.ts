// Router node execution logic -- extracted from node-exec.ts for anti-monolith compliance

import { callLLM, type ProviderConfig } from "@/lib/llm/client";
import type { LLMSettings } from "@/lib/llm";
import { extractText, type FlowNode } from "./flow-utils";
import type { ExecOutput } from "./node-exec";

interface RouteDef {
  id: string; label: string; keywords?: string[]; expression?: string; targetAgentId?: string;
}

/** Execute router node -- keyword, LLM, or expression strategy. */
export async function execRouter(
  node: FlowNode, inputs: Record<string, unknown>,
  resolved: { provider: ProviderConfig; model: string; settings: LLMSettings },
): Promise<ExecOutput> {
  const d = node.data;
  const routes = (d.routes || []) as RouteDef[];
  if (!routes.length) return { data: { ...inputs, routedTo: null }, selectedHandle: undefined };

  const strategy = (d.routingStrategy as string) || "llm";
  const text = extractText(inputs);
  let selectedRouteId: string | undefined;

  if (strategy === "keyword") {
    const lower = text.toLowerCase();
    const matched = routes.find(r => (r.keywords || []).some(kw => lower.includes(kw.toLowerCase())));
    selectedRouteId = matched?.id;
  } else if (strategy === "llm") {
    selectedRouteId = await classifyRoute(d, routes, text, resolved);
  }

  // Fallback to default route or first route
  const fallbackId = d.fallbackRouteId as string | undefined;
  const chosen = selectedRouteId || fallbackId || routes[0]?.id;

  return {
    data: { ...inputs, routedTo: chosen, classification: chosen, routes: routes.map(r => r.label) },
    selectedHandle: chosen,
  };
}

async function classifyRoute(
  d: Record<string, unknown>, routes: RouteDef[], text: string,
  resolved: { provider: ProviderConfig; model: string; settings: LLMSettings },
): Promise<string | undefined> {
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
  return matched?.id;
}
