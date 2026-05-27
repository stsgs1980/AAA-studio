import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalAgents, activeAgents, draftAgents, totalExecutions, completedExecutions, failedExecutions, recentExecutions] =
      await Promise.all([
        db.agent.count(),
        db.agent.count({ where: { status: 'active' } }),
        db.agent.count({ where: { status: 'draft' } }),
        db.agentExecution.count(),
        db.agentExecution.count({ where: { status: 'completed' } }),
        db.agentExecution.count({ where: { status: 'failed' } }),
        db.agentExecution.findMany({
          select: { id: true, status: true, duration: true, startedAt: true, agent: { select: { name: true } } },
          orderBy: { startedAt: 'desc' },
          take: 10,
        }),
      ]);

    const idleAgents = totalAgents - activeAgents - draftAgents;
    const successRate = totalExecutions > 0
      ? Math.round((completedExecutions / totalExecutions) * 100)
      : 0;
    const avgDuration = completedExecutions > 0
      ? await db.agentExecution.aggregate({ where: { status: 'completed', duration: { not: null } }, _avg: { duration: true } })
      : null;

    return NextResponse.json({
      agents: { total: totalAgents, active: activeAgents, idle: Math.max(0, idleAgents), draft: draftAgents },
      executions: { total: totalExecutions, completed: completedExecutions, failed: failedExecutions, successRate },
      avgDuration: avgDuration?._avg?.duration ?? null,
      recentExecutions,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
