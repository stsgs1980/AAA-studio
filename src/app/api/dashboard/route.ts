import { db } from '@/lib/db';
import { handleError, success } from '@/lib/api-error';
import { fetchCoreCounts, resolvePerformers, fetchHourlyExecutions, fetchHeatmap, fetchSkillDistribution } from './helpers';

export async function GET() {
  try {
    const [core, network, heatmap, formulaRows] = await Promise.all([
      fetchCoreCounts(),
      fetchHourlyExecutions(),
      fetchHeatmap(),
      fetchSkillDistribution(),
    ]);
    const performers = await resolvePerformers(core.agentPerformers);

    const a = core;
    const successRate = a.totalExecutions > 0
      ? Math.round((a.completedExecutions / a.totalExecutions) * 100) : 0;

    const avgDuration = a.completedExecutions > 0
      ? await db.agentExecution.aggregate({ where: { status: 'completed', duration: { not: null } }, _avg: { duration: true } })
      : null;

    const healthMetrics = [
      { label: 'Active Agents', value: `${a.activeAgents}/${a.totalAgents}`, percent: a.totalAgents > 0 ? Math.round((a.activeAgents / a.totalAgents) * 100) : 0, status: a.activeAgents > 0 ? 'ok' : 'warning', hasBar: true },
      { label: 'Success Rate', value: `${successRate}%`, percent: successRate, status: successRate >= 80 ? 'ok' : 'warning', hasBar: true },
      { label: 'Pipelines', value: String(a.pipelines), status: 'ok' as const },
      { label: 'Running Tasks', value: String(a.runningExecutions), status: 'ok' as const },
      { label: 'Failed Tasks', value: String(a.failedExecutions), status: (a.failedExecutions > 5 ? 'warning' : 'ok') as 'ok' | 'warning' },
    ];

    const timeline = a.recentExecutions.map((ex) => ({
      id: ex.id, time: ex.startedAt.toISOString(),
      agent: ex.agent.name, group: ex.agent.roleGroup,
      status: ex.status, duration: ex.duration, tokensUsed: ex.tokensUsed,
    }));

    return success({
      agents: { total: a.totalAgents, active: a.activeAgents, idle: a.inactiveAgents, draft: a.draftAgents },
      executions: { total: a.totalExecutions, completed: a.completedExecutions, failed: a.failedExecutions, running: a.runningExecutions, successRate },
      avgDuration: avgDuration?._avg?.duration ?? null,
      statusGroups: a.agentGroups.map((g) => ({ label: g.roleGroup, count: g._count })),
      topPerformers: performers,
      healthMetrics,
      timeline,
      networkChart: network,
      heatmap,
      formulaRows,
      meta: { skills: a.skills, pipelines: a.pipelines },
    });
  } catch (error) {
    return handleError(error);
  }
}
