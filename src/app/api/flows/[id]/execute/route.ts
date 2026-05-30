import { db } from "@/lib/db";
import { handleError, success, NotFound, BadRequest } from "@/lib/api-error";
import { getActiveProvider } from "@/lib/llm";
import { topoSort, gatherInputs, type FlowNode, type FlowEdge } from "./flow-utils";
import { execNode } from "./node-exec";

type Params = { params: Promise<{ id: string }> };

interface NodeResult {
  nodeId: string; nodeType: string;
  status: "completed" | "failed";
  output?: Record<string, unknown>;
  error?: string; duration: number;
  model?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  cost?: number;
}

interface UsageSummary {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCost: number;
  modelsUsed: string[];
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const flow = await db.flow.findUnique({ where: { id } });
    if (!flow) throw NotFound('Flow not found');

    const nodes: FlowNode[] = JSON.parse(flow.nodes);
    const edges: FlowEdge[] = JSON.parse(flow.edges);
    if (!nodes.length) throw BadRequest('Flow has no nodes');

    const active = await getActiveProvider();
    if (!active) throw BadRequest('LLM not configured. Go to Settings to configure LLM.');

    const execution = await db.pipelineExecution.create({
      data: { flowId: id, status: "running", startedAt: new Date() },
    });

    const result = await runFlow(nodes, edges, active);

    await db.pipelineExecution.update({
      where: { id: execution.id },
      data: {
        status: result.success ? "completed" : "failed",
        result: JSON.stringify(result),
        error: result.success ? null : result.error,
        completedAt: new Date(),
      },
    });

    return success({ executionId: execution.id, ...result });
  } catch (error) {
    return handleError(error);
  }
}

async function runFlow(
  nodes: FlowNode[], edges: FlowEdge[],
  active: { provider: import('@/lib/llm').ProviderConfig; model: string; settings: import('@/lib/llm').LLMSettings },
): Promise<{ success: boolean; results: NodeResult[]; usage: UsageSummary; error?: string }> {
  const sorted = topoSort(nodes, edges);
  const ctx = new Map<string, Record<string, unknown>>();
  const results: NodeResult[] = [];
  const usage: UsageSummary = {
    totalPromptTokens: 0, totalCompletionTokens: 0,
    totalTokens: 0, totalCost: 0, modelsUsed: [],
  };

  for (const nodeId of sorted) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;
    const start = Date.now();
    try {
      const inputs = gatherInputs(nodeId, edges, ctx);
      const { data: output, model, usage: u, cost } = await execNode(node, inputs, active);
      ctx.set(nodeId, output);
      results.push({ nodeId, nodeType: node.type, status: "completed", output, duration: Date.now() - start, model, usage: u, cost });
      if (u) {
        usage.totalPromptTokens += u.promptTokens;
        usage.totalCompletionTokens += u.completionTokens;
        usage.totalTokens += u.totalTokens;
      }
      if (cost) usage.totalCost += cost;
      if (model && !usage.modelsUsed.includes(model)) usage.modelsUsed.push(model);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ nodeId, nodeType: node.type, status: "failed", error: msg, duration: Date.now() - start });
      return { success: false, results, usage, error: `Node ${nodeId}: ${msg}` };
    }
  }
  return { success: true, results, usage };
}
