import { db } from '@/lib/db';
import { handleError, success, BadRequest, NotFound } from '@/lib/api-error';
import { getActiveProvider } from '@/lib/llm';
import { executeSteps } from './step-runner';

/** POST /api/workflows/[id]/execute -- run workflow steps sequentially */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { input } = await request.json().catch(() => ({}));

    const workflow = await db.workflow.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    if (!workflow) throw NotFound('Workflow not found');
    if (workflow.steps.length === 0) throw BadRequest('Workflow has no steps');

    const active = await getActiveProvider();
    if (!active) throw BadRequest('No LLM provider configured');

    const execution = await db.workflowExecution.create({
      data: {
        workflowId: id,
        status: 'running',
        input: JSON.stringify(input ?? {}),
        taskContext: JSON.stringify({ workflowName: workflow.name }),
      },
    });

    const result = await executeSteps(execution.id, workflow.steps, input, active);

    await db.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: result.status,
        completedAt: new Date(),
        output: JSON.stringify(result.currentInput),
        ...(result.status === 'failed' && { error: `Step "${result.failedStep}" failed: ${result.error}` }),
      },
    });

    return success({
      executionId: execution.id,
      status: result.status,
      ...(result.status === 'failed' && { failedStep: result.failedStep, error: result.error }),
      results: result.results,
      output: result.currentInput,
    });
  } catch (error) {
    return handleError(error);
  }
}
