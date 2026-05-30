import { db } from '@/lib/db';
import { handleError, created, NotFound } from '@/lib/api-error';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const original = await db.agent.findUnique({ where: { id } });
    if (!original) throw NotFound('Agent not found');

    const clone = await db.agent.create({
      data: {
        name: `${original.name} (copy)`,
        role: original.role,
        roleGroup: original.roleGroup,
        formula: original.formula,
        avatar: original.avatar,
        status: 'draft',
        model: original.model,
        temperature: original.temperature,
        maxTokens: original.maxTokens,
        systemPrompt: original.systemPrompt,
        tools: original.tools,
        skills: original.skills,
        standards: original.standards,
        parentId: original.parentId,
        description: original.description,
      },
    });

    return created(clone);
  } catch (error) {
    return handleError(error);
  }
}
