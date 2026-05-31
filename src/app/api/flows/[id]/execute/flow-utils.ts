/** Topological sort + input gathering for flow execution (server-side). */

interface FlowNode { id: string; type: string; data: Record<string, unknown> }
interface FlowEdge { id: string; source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }

export function topoSort(nodes: FlowNode[], edges: FlowEdge[]): string[] {
  const inDeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const n of nodes) { inDeg.set(n.id, 0); adj.set(n.id, []); }
  for (const e of edges) { adj.get(e.source)?.push(e.target); inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1); }
  const queue = nodes.filter((n) => (inDeg.get(n.id) ?? 0) === 0).map((n) => n.id);
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

export function gatherInputs(
  nodeId: string, edges: FlowEdge[],
  ctx: Map<string, Record<string, unknown>>,
): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};
  for (const edge of edges.filter((e) => e.target === nodeId)) {
    const src = ctx.get(edge.source);
    if (src) inputs[edge.targetHandle ?? edge.source] = src;
  }
  return inputs;
}

export { extractText } from "@/lib/skill-export/text-utils";

export type { FlowNode, FlowEdge };
