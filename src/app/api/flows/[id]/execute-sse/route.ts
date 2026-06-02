/**
 * SSE endpoint for live flow execution progress.
 * GET /api/flows/[id]/execute-sse — streams node-by-node results.
 */
import { db } from '@/lib/db';
import { getActiveProvider } from '@/lib/llm';
import { topoSort, gatherInputs, type FlowNode, type FlowEdge } from '../execute/flow-utils';
import { execNode } from '../execute/node-exec';
import { withRetry } from '@/lib/resilience/api-retry';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const flow = await db.flow.findUnique({ where: { id } });
        if (!flow) { send('error', { message: 'Flow not found' }); controller.close(); return; }

        const nodes: FlowNode[] = JSON.parse(flow.nodes);
        const edges: FlowEdge[] = JSON.parse(flow.edges);
        if (!nodes.length) { send('error', { message: 'Empty flow' }); controller.close(); return; }

        const active = await getActiveProvider();
        if (!active) { send('error', { message: 'No LLM provider' }); controller.close(); return; }

        send('start', { nodeCount: nodes.length });

        const execution = await db.pipelineExecution.create({
          data: { flowId: id, status: 'running', startedAt: new Date() },
        });

        const sorted = topoSort(nodes, edges);
        const ctx = new Map<string, Record<string, unknown>>();
        const reachable = new Set<string>();
        for (const n of nodes) { if (!edges.some(e => e.target === n.id)) reachable.add(n.id); }
        const activeEdges = new Set(edges.map(e => e.id));

        for (const nodeId of sorted) {
          if (!reachable.has(nodeId)) { send('skip', { nodeId }); continue; }
          const node = nodes.find(n => n.id === nodeId);
          if (!node) continue;

          send('node_start', { nodeId, nodeType: node.type });
          const start = Date.now();

          try {
            const inputs = gatherInputs(nodeId, edges, ctx);
            const isLLM = ['llm', 'agent', 'router'].includes(node.type);
            const { data: output, model, usage, cost, selectedHandle } = isLLM
              ? await withRetry(() => execNode(node, inputs, active, id), { maxRetries: 2, initialDelay: 1500 })
              : await execNode(node, inputs, active, id);

            ctx.set(nodeId, output);
            send('node_done', { nodeId, nodeType: node.type, status: 'completed', duration: Date.now() - start, model, usage, cost });

            if (selectedHandle !== undefined) {
              for (const edge of edges.filter(e => e.source === nodeId)) {
                if (edge.sourceHandle !== selectedHandle) activeEdges.delete(edge.id);
                else reachable.add(edge.target);
              }
            } else {
              for (const edge of edges.filter(e => e.source === nodeId && activeEdges.has(e.id))) reachable.add(edge.target);
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            send('node_error', { nodeId, nodeType: node.type, error: msg, duration: Date.now() - start });
            await db.pipelineExecution.update({ where: { id: execution.id }, data: { status: 'failed', error: msg, completedAt: new Date() } });
            send('done', { success: false, error: msg });
            controller.close(); return;
          }
        }

        await db.pipelineExecution.update({ where: { id: execution.id }, data: { status: 'completed', completedAt: new Date() } });
        send('done', { success: true, executionId: execution.id });
      } catch (err) {
        send('error', { message: err instanceof Error ? err.message : 'Unknown error' });
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}
