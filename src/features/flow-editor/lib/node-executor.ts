import type { Node, Edge } from '@xyflow/react';
import { flowEventBus, FlowEvents } from './event-bus';

interface ExecutionResult {
  nodeId: string;
  status: 'completed' | 'failed';
  output?: Record<string, unknown>;
  error?: string;
  duration: number;
}

/**
 * Execute all flow nodes in topological order.
 * Each node output is passed downstream via a context map.
 * Stops on first failure unless continueOnError is set.
 */
export async function executeFlow(
  nodes: Node[],
  edges: Edge[],
): Promise<{ results: ExecutionResult[]; success: boolean }> {
  const sorted = topologicalSort(nodes, edges);
  const context = new Map<string, Record<string, unknown>>();
  const results: ExecutionResult[] = [];

  flowEventBus.emit(FlowEvents.FLOW_EXECUTION_START, { nodeCount: sorted.length });

  for (const nodeId of sorted) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    flowEventBus.emit(FlowEvents.NODE_EXECUTION_START, { nodeId, type: node.type });
    const start = Date.now();

    try {
      const inputs = gatherInputs(nodeId, edges, context);
      const output = await executeNode(node, inputs);
      context.set(nodeId, output);
      const duration = Date.now() - start;

      results.push({ nodeId, status: 'completed', output, duration });
      flowEventBus.emit(FlowEvents.NODE_EXECUTION_COMPLETE, {
        nodeId,
        output,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - start;
      const msg = error instanceof Error ? error.message : String(error);

      results.push({ nodeId, status: 'failed', error: msg, duration });
      flowEventBus.emit(FlowEvents.NODE_EXECUTION_ERROR, {
        nodeId,
        error: msg,
        duration,
      });
      flowEventBus.emit(FlowEvents.FLOW_EXECUTION_ERROR, { nodeId, error: msg });
      return { results, success: false };
    }
  }

  flowEventBus.emit(FlowEvents.FLOW_EXECUTION_COMPLETE, { results });
  return { results, success: true };
}

/** Execute a single node. Placeholder implementations per type. */
async function executeNode(
  node: Node,
  inputs: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const data = node.data as Record<string, unknown>;

  switch (node.type) {
    case 'start':
      return { started: true, timestamp: Date.now() };
    case 'end':
      return { finished: true, timestamp: Date.now() };
    case 'llm':
      return { ...inputs, model: data.model, response: '[LLM output placeholder]' };
    case 'transform':
      return { ...inputs, transformed: true };
    case 'condition':
      return { ...inputs, conditionResult: true };
    case 'filter':
      return { ...inputs, passed: true };
    default:
      return { ...inputs, type: node.type, processed: true };
  }
}

/** Gather outputs from all upstream nodes connected to this node. */
function gatherInputs(
  nodeId: string,
  edges: Edge[],
  context: Map<string, Record<string, unknown>>,
): Record<string, unknown> {
  const upstream = edges.filter((e) => e.target === nodeId);
  const inputs: Record<string, unknown> = {};
  for (const edge of upstream) {
    const src = context.get(edge.source);
    if (src) inputs[edge.targetHandle ?? edge.source] = src;
  }
  return inputs;
}

/** Kahn's algorithm — returns node IDs in execution order. */
function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  const inDeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const n of nodes) {
    inDeg.set(n.id, 0);
    adj.set(n.id, []);
  }
  for (const e of edges) {
    adj.get(e.source)?.push(e.target);
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
  }

  const queue = nodes
    .filter((n) => (inDeg.get(n.id) ?? 0) === 0)
    .map((n) => n.id);
  const sorted: string[] = [];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    sorted.push(cur);
    for (const nb of adj.get(cur) ?? []) {
      const d = (inDeg.get(nb) ?? 1) - 1;
      inDeg.set(nb, d);
      if (d === 0) queue.push(nb);
    }
  }

  return sorted;
}
