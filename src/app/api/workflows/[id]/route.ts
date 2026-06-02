import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';
import { workflowUpdateSchema } from '@/lib/validations';

/** GET /api/workflows/[id] -- get workflow with steps */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const workflow = await db.workflow.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { order: 'asc' } },
        _count: { select: { executions: true } },
      },
    });

    if (!workflow) throw NotFound('Workflow not found');
    return success(workflow);
  } catch (error) {
    return handleError(error);
  }
}

/** PATCH /api/workflows/[id] -- update workflow */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = workflowUpdateSchema.parse(await request.json());

    const existing = await db.workflow.findUnique({ where: { id } });
    if (!existing) throw NotFound('Workflow not found');

    const workflow = await db.workflow.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.triggerType !== undefined && { triggerType: body.triggerType }),
        ...(body.triggerConfig !== undefined && { triggerConfig: JSON.stringify(body.triggerConfig) }),
        ...(body.tags !== undefined && { tags: body.tags }),
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    return success(workflow);
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/workflows/[id] -- delete workflow */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.workflow.findUnique({ where: { id } });
    if (!existing) throw NotFound('Workflow not found');

    await db.workflow.delete({ where: { id } });
    return success({ message: 'Workflow deleted', id });
  } catch (error) {
    return handleError(error);
  }
}
