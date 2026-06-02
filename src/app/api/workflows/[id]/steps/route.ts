import { db } from '@/lib/db';
import { handleError, success, created, NotFound, BadRequest } from '@/lib/api-error';
import { z } from 'zod';

const stepCreateSchema = z.object({
  name: z.string().min(1).max(100),
  agentId: z.string().nullable().optional(),
  roleGroup: z.string().max(50).optional(),
  action: z.enum(['process', 'review', 'transform', 'delegate', 'broadcast', 'decision']).optional().default('process'),
  inputSchema: z.record(z.unknown()).optional().default({}),
  outputSchema: z.record(z.unknown()).optional().default({}),
  condition: z.record(z.unknown()).optional().default({}),
  fallbackStepId: z.string().nullable().optional(),
  timeout: z.number().int().min(1).optional().default(300),
  config: z.record(z.unknown()).optional().default({}),
});

/** POST /api/workflows/[id]/steps -- add step to workflow */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = stepCreateSchema.parse(await request.json());

    const workflow = await db.workflow.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'desc' }, take: 1 } },
    });

    if (!workflow) throw NotFound('Workflow not found');

    const nextOrder = workflow.steps.length > 0 ? workflow.steps[0].order + 1 : 0;

    const step = await db.pipelineStep.create({
      data: {
        workflowId: id,
        order: nextOrder,
        name: body.name,
        agentId: body.agentId ?? null,
        roleGroup: body.roleGroup ?? null,
        action: body.action,
        inputSchema: JSON.stringify(body.inputSchema),
        outputSchema: JSON.stringify(body.outputSchema),
        condition: JSON.stringify(body.condition),
        fallbackStepId: body.fallbackStepId ?? null,
        timeout: body.timeout,
        config: JSON.stringify(body.config),
      },
    });

    return created(step);
  } catch (error) {
    return handleError(error);
  }
}

/** PATCH /api/workflows/[id]/steps -- reorder steps */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { stepOrders } = await request.json() as { stepOrders: { stepId: string; order: number }[] };

    if (!Array.isArray(stepOrders)) throw BadRequest('stepOrders array required');

    const workflow = await db.workflow.findUnique({ where: { id } });
    if (!workflow) throw NotFound('Workflow not found');

    await Promise.all(
      stepOrders.map((s) => db.pipelineStep.update({ where: { id: s.stepId }, data: { order: s.order } })),
    );

    return success({ message: 'Steps reordered' });
  } catch (error) {
    return handleError(error);
  }
}
