import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

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

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Failed to fetch agent:', error);
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.agent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const agent = await db.agent.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        role: body.role?.trim(),
        group: body.group,
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

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Failed to update agent:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await db.agent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    await db.agent.updateMany({ where: { parentId: id }, data: { parentId: null } });
    await db.agentExecution.deleteMany({ where: { agentId: id } });
    await db.agent.delete({ where: { id } });

    return NextResponse.json({ message: 'Agent deleted', id });
  } catch (error) {
    console.error('Failed to delete agent:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
