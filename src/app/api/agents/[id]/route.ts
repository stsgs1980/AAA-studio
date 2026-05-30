import { db } from '@/lib/db';
import { handleError, success, created, NotFound } from '@/lib/api-error';
import { agentUpdateSchema } from '@/lib/validations';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const agent = await db.agent.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, status: true } },
        executions: { orderBy: { startedAt: 'desc' }, take: 20 },
      },
    });

    if (!agent) throw NotFound('Agent not found');

    return success(agent);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = agentUpdateSchema.parse(await request.json());

    const existing = await db.agent.findUnique({ where: { id } });
    if (!existing) throw NotFound('Agent not found');

    const agent = await db.agent.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        role: body.role?.trim(),
        roleGroup: body.roleGroup,
        formula: body.formula,
        avatar: body.avatar,
        status: body.status,
        model: body.model,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        systemPrompt: body.systemPrompt,
        tools: body.tools !== undefined ? JSON.stringify(body.tools) : undefined,
        skills: body.skills !== undefined ? JSON.stringify(body.skills) : undefined,
        standards: body.standards !== undefined ? JSON.stringify(body.standards) : undefined,
        parentId: body.parentId,
        description: body.description,
      },
    });

    return success(agent);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.agent.findUnique({ where: { id } });
    if (!existing) throw NotFound('Agent not found');

    await db.agent.updateMany({ where: { parentId: id }, data: { parentId: null } });
    await db.agentExecution.deleteMany({ where: { agentId: id } });
    await db.agent.delete({ where: { id } });

    return success({ message: 'Agent deleted', id });
  } catch (error) {
    return handleError(error);
  }
}
