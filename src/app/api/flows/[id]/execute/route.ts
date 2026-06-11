import { db } from "@/lib/db";
import { handleError, success, NotFound, BadRequest } from "@/lib/api-error";
import { getActiveProvider } from "@/lib/llm";
import { executeFlow } from "@/lib/services/flow-execution-service";
import { emitFlowStarted, emitFlowFinished, emitDashboardRefresh } from "@/lib/ws/hooks";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const flow = await db.flow.findUnique({ where: { id } });
    if (!flow) throw NotFound('Flow not found');

    const nodes = JSON.parse(flow.nodes);
    const edges = JSON.parse(flow.edges);
    if (!nodes.length) throw BadRequest('Flow has no nodes');

    const active = await getActiveProvider();
    if (!active) throw BadRequest('LLM not configured. Go to Settings to configure LLM.');

    const execution = await db.pipelineExecution.create({
      data: { flowId: id, status: "running", startedAt: new Date() },
    });

    emitFlowStarted(id, execution.id);

    const result = await executeFlow(id, nodes, edges, active);

    await db.pipelineExecution.update({
      where: { id: execution.id },
      data: {
        status: result.success ? "completed" : "failed",
        result: JSON.stringify(result),
        error: result.success ? null : result.error,
        completedAt: new Date(),
      },
    });

    emitFlowFinished(id, execution.id, result.success ? 'completed' : 'failed');
    emitDashboardRefresh('flow-execution');

    return success({ executionId: execution.id, ...result });
  } catch (error) {
    return handleError(error);
  }
}
