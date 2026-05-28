import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const group = searchParams.get('group') || '';
    const status = searchParams.get('status') || '';
    const includeExecutions = searchParams.get('executions') === 'true';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { role: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (group) where.group = group;
    if (status) where.status = status;

    const agents = await db.agent.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true } },
        ...(includeExecutions ? {
          executions: { select: { id: true, status: true, duration: true, startedAt: true }, take: 5, orderBy: { startedAt: 'desc' } },
        } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    const count = await db.agent.count({ where });

    return NextResponse.json({ agents, count });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const agent = await db.agent.create({
      data: {
        name: body.name.trim(),
        role: body.role?.trim() || '',
        group: body.group || 'specialist',
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

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
