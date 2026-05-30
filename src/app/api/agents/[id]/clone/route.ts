import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const original = await db.agent.findUnique({ where: { id } });
    if (!original) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

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

    return NextResponse.json(clone, { status: 201 });
  } catch (error) {
    console.error('Failed to clone agent:', error);
    return NextResponse.json({ error: 'Failed to clone agent' }, { status: 500 });
  }
}
