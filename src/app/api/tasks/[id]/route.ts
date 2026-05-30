import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';
import { taskUpdateSchema } from '@/lib/validations';

/** GET /api/tasks/[id] -- get single task */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const task = await db.task.findUnique({
      where: { id },
      include: { agent: { select: { id: true, name: true, roleGroup: true } } },
    });

    if (!task) throw NotFound('Task not found');
    return success(task);
  } catch (error) {
    return handleError(error);
  }
}

/** PATCH /api/tasks/[id] -- update task */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = taskUpdateSchema.parse(await request.json());

    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) throw NotFound('Task not found');

    const task = await db.task.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.agentId !== undefined && { agentId: body.agentId || null }),
      },
      include: { agent: { select: { id: true, name: true, roleGroup: true } } },
    });

    return success(task);
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/tasks/[id] -- delete task */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) throw NotFound('Task not found');

    await db.task.delete({ where: { id } });
    return success({ message: 'Task deleted', id });
  } catch (error) {
    return handleError(error);
  }
}
