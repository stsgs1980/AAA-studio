import { db } from '@/lib/db';
import { topoSort, gatherInputs, type FlowNode, type FlowEdge } from '@/app/api/flows/[id]/execute/flow-utils';
import { execNode } from '@/app/api/flows/[id]/execute/node-exec';
import { withRetry } from '@/lib/resilience/api-retry';
import { emitNodeComplete } from '@/lib/ws/hooks';

export interface NodeResult {
  nodeId: string; nodeType: string;
  status: 'completed' | 'failed';
  output?: Record<string, unknown>;
  error?: string; duration: number;
  model?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  cost?: number;
}

export interface UsageSummary {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCost: number;
  modelsUsed: string[];
}

export interface ExecutionResult {
  success: boolean;
  results: NodeResult[];
  usage: UsageSummary;
  error?: string;
}

/** Execute a flow: run all nodes in topological order, return results */
export async function executeFlow(
  flowId: string,
  nodes: FlowNode[],
  edges: FlowEdge[],
  active: { provider: import('@/lib/llm').ProviderConfig; model: string; settings: import('@/lib/llm').LLMSettings },
): Promise<ExecutionResult> {
  const sorted = topoSort(nodes, edges);
  const ctx = new Map<string, Record<string, unknown>>();
  const results: NodeResult[] = [];
  const usage: UsageSummary = {
    totalPromptTokens: 0, totalCompletionTokens: 0,
    totalTokens: 0, totalCost: 0, modelsUsed: [],
  };

  // Branch-aware: track which edges are active.
  // Start nodes (no incoming edges) are always reachable.
  // After Router/Condition, only the selected branch stays active.
  const activeEdges = new Set(edges.map((e) => e.id));
  const reachable = new Set<string>();

  // Mark start nodes as reachable
  for (const node of nodes) {
    const hasIncoming = edges.some((e) => e.target === node.id);
    if (!hasIncoming) reachable.add(node.id);
  }

  for (const nodeId of sorted) {
    // Skip nodes on inactive branches
    if (!reachable.has(nodeId)) continue;

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;
    const start = Date.now();
    try {
      const inputs = gatherInputs(nodeId, edges, ctx);
      // LLM-calling nodes (llm, agent, router) get retry on transient failures
      const isLLMNode = ['llm', 'agent', 'router'].includes(node.type);
      const { data: output, model, usage: u, cost, selectedHandle } = isLLMNode
        ? await withRetry(() => execNode(node, inputs, active, flowId), { maxRetries: 2, initialDelay: 1500 })
        : await execNode(node, inputs, active, flowId);
      ctx.set(nodeId, output);
      results.push({ nodeId, nodeType: node.type, status: 'completed', output, duration: Date.now() - start, model, usage: u, cost });
      emitNodeComplete(flowId, nodeId, 'completed', Date.now() - start);
      if (u) {
        usage.totalPromptTokens += u.promptTokens;
        usage.totalCompletionTokens += u.completionTokens;
        usage.totalTokens += u.totalTokens;
      }
      if (cost) usage.totalCost += cost;
      if (model && !usage.modelsUsed.includes(model)) usage.modelsUsed.push(model);

      // Branch-aware: if node selected a specific output handle,
      // deactivate edges from other handles and mark only reachable downstream nodes
      if (selectedHandle !== undefined) {
        for (const edge of edges.filter((e) => e.source === nodeId)) {
          if (edge.sourceHandle !== selectedHandle) {
            activeEdges.delete(edge.id);
          } else {
            // Mark target as reachable
            reachable.add(edge.target);
          }
        }
      } else {
        // No routing decision — all downstream edges stay active
        for (const edge of edges.filter((e) => e.source === nodeId && activeEdges.has(e.id))) {
          reachable.add(edge.target);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ nodeId, nodeType: node.type, status: 'failed', error: msg, duration: Date.now() - start });
      return { success: false, results, usage, error: `Node ${nodeId}: ${msg}` };
    }
  }
  return { success: true, results, usage };
}
