import { db } from '@/lib/db';

interface CoreCounts {
  totalAgents: number; activeAgents: number; draftAgents: number; inactiveAgents: number;
  totalExecutions: number; completedExecutions: number; failedExecutions: number; runningExecutions: number;
  recentExecutions: { id: string; status: string; duration: number | null; tokensUsed: number | null; startedAt: Date; agent: { name: string; roleGroup: string } }[];
  agentGroups: { roleGroup: string; _count: number }[];
  agentPerformers: { agentId: string; _count: number; _avg: { duration: number | null } }[];
  pipelines: number; skills: number;
}

export async function fetchCoreCounts(): Promise<CoreCounts> {
  const [
    totalAgents, activeAgents, draftAgents, inactiveAgents,
    totalExecutions, completedExecutions, failedExecutions, runningExecutions,
    recentExecutions, agentGroups, agentPerformers, pipelines, skills,
  ] = await Promise.all([
    db.agent.count(),
    db.agent.count({ where: { status: 'active' } }),
    db.agent.count({ where: { status: 'draft' } }),
    db.agent.count({ where: { status: 'inactive' } }),
    db.agentExecution.count(),
    db.agentExecution.count({ where: { status: 'completed' } }),
    db.agentExecution.count({ where: { status: 'failed' } }),
    db.agentExecution.count({ where: { status: 'running' } }),
    db.agentExecution.findMany({
      select: { id: true, status: true, duration: true, tokensUsed: true, startedAt: true, completedAt: true, agent: { select: { name: true, roleGroup: true } } },
      orderBy: { startedAt: 'desc' },
      take: 20,
    }),
    db.agent.groupBy({ by: ['roleGroup'], _count: true }),
    db.agentExecution.groupBy({ by: ['agentId'], where: { status: 'completed' }, _count: true, _avg: { duration: true }, orderBy: { _count: { agentId: 'desc' } }, take: 5 }),
    db.flow.count(),
    db.skill.count(),
  ]);
  return { totalAgents, activeAgents, draftAgents, inactiveAgents, totalExecutions, completedExecutions, failedExecutions, runningExecutions, recentExecutions, agentGroups, agentPerformers, pipelines, skills };
}

export interface PerformerInfo { name: string; roleGroup: string; tasks: number; avgDuration: number }

export async function resolvePerformers(
  raw: CoreCounts['agentPerformers'],
): Promise<PerformerInfo[]> {
  if (raw.length === 0) return [];
  const ids = raw.map((p) => p.agentId);
  const agents = await db.agent.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, roleGroup: true } });
  const map = Object.fromEntries(agents.map((a) => [a.id, a]));
  return raw
    .map((p) => {
      const a = map[p.agentId];
      return a ? { name: a.name, roleGroup: a.roleGroup, tasks: p._count, avgDuration: Math.round((p._avg.duration ?? 0) / 100) / 10 } : null;
    })
    .filter(Boolean) as PerformerInfo[];
}

export interface HourlyBucket { hourlyLabels: string[]; apiCalls: number[]; failures: number[]; peak: number; avg: number }

export async function fetchHourlyExecutions(): Promise<HourlyBucket> {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const execs = await db.agentExecution.findMany({ where: { startedAt: { gte: since } }, select: { startedAt: true, status: true } });

  const hourlyLabels: string[] = [];
  const apiCalls: number[] = [];
  const failures: number[] = [];

  for (let i = 0; i < 24; i++) {
    const bucketStart = new Date(since.getTime() + i * 60 * 60 * 1000);
    const bucketEnd = new Date(bucketStart.getTime() + 60 * 60 * 1000);
    hourlyLabels.push(bucketStart.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }));
    const inBucket = execs.filter((e) => e.startedAt >= bucketStart && e.startedAt < bucketEnd);
    apiCalls.push(inBucket.length);
    failures.push(inBucket.filter((e) => e.status === 'failed').length);
  }

  const peak = Math.max(...apiCalls, 1);
  const avg = apiCalls.length > 0 ? Math.round(apiCalls.reduce((a, b) => a + b, 0) / apiCalls.length * 10) / 10 : 0;
  return { hourlyLabels, apiCalls, failures, peak, avg };
}

export interface HeatmapData { groups: string[]; density: number[][]; maxDensity: number }

export async function fetchHeatmap(): Promise<HeatmapData> {
  const allAgents = await db.agent.findMany({ select: { id: true, roleGroup: true, parentId: true } });
  const groups = [...new Set(allAgents.map((a) => a.roleGroup))];
  const density = groups.map(() => groups.map(() => 0));

  for (const agent of allAgents) {
    if (!agent.parentId) continue;
    const parent = allAgents.find((a) => a.id === agent.parentId);
    if (!parent) continue;
    const pi = groups.indexOf(parent.roleGroup);
    const ci = groups.indexOf(agent.roleGroup);
    if (pi >= 0 && ci >= 0) density[pi][ci]++;
  }

  return { groups, density, maxDensity: Math.max(...density.flat().filter((d) => d > 0), 1) };
}

export async function fetchSkillDistribution(): Promise<{ name: string; agents: string; category: string }[]> {
  const agents = await db.agent.findMany({ select: { skills: true } });
  const counts: Record<string, number> = {};
  for (const a of agents) {
    try {
      for (const s of JSON.parse(a.skills) as string[]) counts[s] = (counts[s] ?? 0) + 1;
    } catch { /* skip */ }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, agents: `${count} agent${count !== 1 ? 's' : ''}`, category: 'Custom' }))
    .sort((a, b) => b.agents.localeCompare(a.agents));
}
