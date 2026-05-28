import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { callLLM, getLLMSettings, isLLMConfigured } from "@/lib/llm";
import { topoSort, gatherInputs, extractText, type FlowNode, type FlowEdge } from "./flow-utils";

type Params = { params: Promise<{ id: string }> };

interface NodeResult {
  nodeId: string; nodeType: string;
  status: "completed" | "failed";
  output?: Record<string, unknown>;
  error?: string; duration: number;
}

/**
 * POST /api/flows/[id]/execute
 * Execute a saved flow using the configured LLM provider.
 */
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const flow = await db.flow.findUnique({ where: { id } });
    if (!flow) return NextResponse.json({ error: "Flow not found" }, { status: 404 });

    const nodes: FlowNode[] = JSON.parse(flow.nodes);
    const edges: FlowEdge[] = JSON.parse(flow.edges);
    if (!nodes.length) return NextResponse.json({ error: "Flow has no nodes" }, { status: 400 });

    const llmSettings = await getLLMSettings();
    if (!isLLMConfigured(llmSettings)) {
      return NextResponse.json(
        { error: 'LLM not configured', message: 'Go to Settings → LLM Provider to add your API key.' },
        { status: 422 },
      );
    }

    const execution = await db.pipelineExecution.create({
      data: { flowId: id, status: "running", startedAt: new Date() },
    });

    const result = await runFlow(nodes, edges, llmSettings);

    await db.pipelineExecution.update({
      where: { id: execution.id },
      data: {
        status: result.success ? "completed" : "failed",
        result: JSON.stringify(result),
        error: result.success ? null : result.error,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ executionId: execution.id, ...result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/flows/:id/execute]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function runFlow(
  nodes: FlowNode[],
  edges: FlowEdge[],
  settings: { providerId: string; apiKey: string; model: string; temperature: number; maxTokens: number },
): Promise<{ success: boolean; results: NodeResult[]; error?: string }> {
  const sorted = topoSort(nodes, edges);
  const ctx = new Map<string, Record<string, unknown>>();
  const results: NodeResult[] = [];

  for (const nodeId of sorted) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;
    const start = Date.now();
    try {
      const inputs = gatherInputs(nodeId, edges, ctx);
      const output = await execNode(node, inputs, settings);
      ctx.set(nodeId, output);
      results.push({ nodeId, nodeType: node.type, status: "completed", output, duration: Date.now() - start });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ nodeId, nodeType: node.type, status: "failed", error: msg, duration: Date.now() - start });
      return { success: false, results, error: `Node ${nodeId}: ${msg}` };
    }
  }
  return { success: true, results };
}

async function execNode(
  node: FlowNode,
  inputs: Record<string, unknown>,
  settings: { providerId: string; apiKey: string; model: string; temperature: number; maxTokens: number },
): Promise<Record<string, unknown>> {
  const d = node.data;
  switch (node.type) {
    case "start": return { started: true, timestamp: Date.now() };
    case "end": return { ...inputs, finished: true };
    case "llm": {
      const sys = typeof d.systemPrompt === "string" ? d.systemPrompt : "You are a helpful assistant.";
      const resp = await callLLM({
        providerId: settings.providerId as 'zai' | 'openai' | 'anthropic' | 'openrouter',
        apiKey: settings.apiKey,
        model: (d.model as string) || settings.model,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: extractText(inputs) },
        ],
        temperature: (d.temperature as number) ?? settings.temperature,
        maxTokens: settings.maxTokens,
      });
      return { ...inputs, model: resp.model, response: resp.content };
    }
    case "agent": {
      const role = typeof d.role === "string" ? d.role : "assistant";
      const resp = await callLLM({
        providerId: settings.providerId as 'zai' | 'openai' | 'anthropic' | 'openrouter',
        apiKey: settings.apiKey,
        model: settings.model,
        messages: [
          { role: "system", content: `You are ${role}.` },
          { role: "user", content: extractText(inputs) },
        ],
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
      });
      return { ...inputs, agentResponse: resp.content };
    }
    case "prompt": {
      let tmpl = typeof d.template === "string" ? d.template : "";
      for (const [k, v] of Object.entries(inputs)) tmpl = tmpl.replaceAll(`{{${k}}}`, String(v ?? ""));
      return { ...inputs, renderedPrompt: tmpl };
    }
    case "transform": {
      const text = extractText(inputs);
      const t = typeof d.transform === "string" ? d.transform : "identity";
      let out = text;
      if (t === "uppercase") out = text.toUpperCase();
      else if (t === "lowercase") out = text.toLowerCase();
      else if (t === "json_stringify") out = JSON.stringify(inputs, null, 2);
      return { ...inputs, transformed: out };
    }
    case "condition": return { ...inputs, conditionResult: true };
    case "filter": return { ...inputs, passed: true };
    default: return { ...inputs, type: node.type, processed: true };
  }
}
