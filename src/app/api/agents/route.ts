import { db } from '@/lib/db';
import { handleError, success, created, paginate } from '@/lib/api-error';
import { agentCreateSchema, agentQuerySchema, paginationSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = agentQuerySchema.parse(Object.fromEntries(searchParams));
    const pag = paginationSchema.parse(Object.fromEntries(searchParams));
    const search = filter.search?.trim() || '';
    const group = filter.group || '';
    const status = filter.status || '';
    const includeExecutions = searchParams.get('executions') === 'true';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { role: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (group) where.roleGroup = group;
    if (status) where.status = status;

    const total = await db.agent.count({ where });
    const agents = await db.agent.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true } },
        ...(includeExecutions ? {
          executions: { select: { id: true, status: true, duration: true, startedAt: true }, take: 5, orderBy: { startedAt: 'desc' } },
        } : {}),
      },
      skip: (pag.page - 1) * pag.pageSize,
      take: pag.pageSize,
      orderBy: { createdAt: 'asc' },
    });

    return paginate(agents, total, pag.page, pag.pageSize);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = agentCreateSchema.parse(await request.json());
    const agent = await db.agent.create({
      data: {
        name: body.name,
        role: body.role?.trim() || '',
        roleGroup: body.roleGroup || 'specialist',
        formula: body.formula || '',
        avatar: body.avatar || '',
        status: body.status || 'draft',
        model: body.model || 'glm-4',
        temperature: body.temperature ?? 0.7,
        maxTokens: body.maxTokens || 4096,
        systemPrompt: body.systemPrompt || '',
        tools: JSON.stringify(body.tools || []),
        skills: JSON.stringify(body.skills || []),
        standards: JSON.stringify(body.standards || []),
        parentId: body.parentId || null,
        description: body.description || '',
      },
    });

    return created(agent);
  } catch (error) {
    return handleError(error);
  }
}
