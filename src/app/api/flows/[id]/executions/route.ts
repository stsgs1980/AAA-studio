import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const executions = await db.pipelineExecution.findMany({
      where: { flowId: id },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(executions);
  } catch (error) {
    console.error(`[GET /api/flows/:id/executions]`, error);
    return NextResponse.json({ error: 'Failed to fetch executions' }, { status: 500 });
  }
}
