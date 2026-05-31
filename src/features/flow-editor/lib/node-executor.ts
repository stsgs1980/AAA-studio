import type { Node, Edge } from "@xyflow/react";
import { flowEventBus, FlowEvents } from "./event-bus";
import { executeLLM, executeAgent, executePrompt, executeTransform, executeCondition, executeFilter } from "./node-handlers";

export interface ExecutionResult {
  nodeId: string; nodeType: string; status: "completed" | "failed" | "skipped";
  output?: Record<string, unknown>; error?: string; duration: number;
  model?: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number }; cost?: number;
}

interface NodeExecOutput {
  output: Record<string, unknown>; model?: string;
  usage?: ExecutionResult['usage']; cost?: number; selectedHandle?: string;
}

/** Execute all flow nodes in topological order with branch-aware routing. */
export async function executeFlow(
  nodes: Node[], edges: Edge[],
): Promise<{ results: ExecutionResult[]; success: boolean }> {
  const sorted = topologicalSort(nodes, edges);
  const ctx = new Map<string, Record<string, unknown>>();
  const results: ExecutionResult[] = [];
  const activeEdges = new Set(edges.map((e) => e.id));
  const reachable = new Set<string>();
  for (const n of nodes) { if (!edges.some((e) => e.target === n.id)) reachable.add(n.id); }

  flowEventBus.emit(FlowEvents.FLOW_EXECUTION_START, { nodeCount: sorted.length });
  for (const nodeId of sorted) {
    if (!reachable.has(nodeId)) {
      const n = nodes.find((x) => x.id === nodeId);
      results.push({ nodeId, nodeType: n?.type ?? "unknown", status: "skipped", duration: 0 });
      continue;
    }
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;
    flowEventBus.emit(FlowEvents.NODE_EXECUTION_START, { nodeId, type: node.type });
    const t0 = Date.now();
    try {
      const inputs = gatherInputs(nodeId, edges, ctx);
      const { output, model, usage, cost, selectedHandle } = await executeNode(node, inputs);
      ctx.set(nodeId, output);
      results.push({ nodeId, nodeType: node.type ?? "unknown", status: "completed", output, duration: Date.now() - t0, model, usage, cost });
      flowEventBus.emit(FlowEvents.NODE_EXECUTION_COMPLETE, { nodeId, output, duration: Date.now() - t0 });
      // Branch routing: deactivate non-selected edges, mark reachable downstream
      if (selectedHandle !== undefined) {
        for (const edge of edges.filter((e) => e.source === nodeId)) {
          if (edge.sourceHandle !== selectedHandle) activeEdges.delete(edge.id);
          else reachable.add(edge.target);
        }
      } else {
        for (const edge of edges.filter((e) => e.source === nodeId && activeEdges.has(e.id))) reachable.add(edge.target);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      results.push({ nodeId, nodeType: node.type ?? "unknown", status: "failed", error: msg, duration: Date.now() - t0 });
      flowEventBus.emit(FlowEvents.NODE_EXECUTION_ERROR, { nodeId, error: msg, duration: Date.now() - t0 });
      flowEventBus.emit(FlowEvents.FLOW_EXECUTION_ERROR, { nodeId, error: msg });
      return { results, success: false };
    }
  }
  flowEventBus.emit(FlowEvents.FLOW_EXECUTION_COMPLETE, { results });
  return { results, success: true };
}

async function executeNode(node: Node, inputs: Record<string, unknown>): Promise<NodeExecOutput> {
  const d = node.data as Record<string, unknown>;
  switch (node.type) {
    case "start": return { output: { started: true, timestamp: Date.now() } };
    case "end": return { output: { ...inputs, finished: true, timestamp: Date.now() } };
    case "llm": return executeLLM(inputs, d);
    case "agent": return executeAgent(inputs, d);
    case "prompt": return { output: executePrompt(inputs, d) };
    case "transform": return { output: executeTransform(inputs, d) };
    case "condition": { const r = executeCondition(inputs, d); return { output: r.output, selectedHandle: r.selectedHandle }; }
    case "filter": { const r = executeFilter(inputs, d); return { output: r.output, selectedHandle: r.selectedHandle }; }
    case "chain": return { output: { ...inputs, stepsCompleted: d.steps ?? 0 } };
    case "input": return { output: { ...(d.schema ?? {}), provided: true } };
    case "output": return { output: { ...inputs, outputCaptured: true } };
    case "error": return { output: { ...inputs, errorHandled: true, strategy: d.errorStrategy ?? "stop" } };
    default: return { output: { ...inputs, type: node.type, processed: true } };
  }
}

function gatherInputs(nodeId: string, edges: Edge[], ctx: Map<string, Record<string, unknown>>): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};
  for (const edge of edges.filter((e) => e.target === nodeId)) {
    const src = ctx.get(edge.source);
    if (src) inputs[edge.targetHandle ?? edge.source] = src;
  }
  return inputs;
}

function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  const inDeg = new Map<string, number>(); const adj = new Map<string, string[]>();
  for (const n of nodes) { inDeg.set(n.id, 0); adj.set(n.id, []); }
  for (const e of edges) { adj.get(e.source)?.push(e.target); inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1); }
  const queue = nodes.filter((n) => (inDeg.get(n.id) ?? 0) === 0).map((n) => n.id);
  const sorted: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!; sorted.push(cur);
    for (const nb of adj.get(cur) ?? []) { const d2 = (inDeg.get(nb) ?? 1) - 1; inDeg.set(nb, d2); if (d2 === 0) queue.push(nb); }
  }
  return sorted;
}
