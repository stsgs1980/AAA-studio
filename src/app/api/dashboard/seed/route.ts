import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

const SAMPLE_AGENTS = [
  { name: 'Research Analyst', role: 'Researches topics and synthesizes findings', group: 'analyst', status: 'active', model: 'gpt-4', temperature: 0.3, systemPrompt: 'You are a research analyst. Provide thorough, evidence-based analysis.' },
  { name: 'Code Reviewer', role: 'Reviews code for quality and best practices', group: 'reviewer', status: 'active', model: 'gpt-4', temperature: 0.2, systemPrompt: 'You are a senior code reviewer. Focus on correctness, performance, and readability.' },
  { name: 'Creative Writer', role: 'Generates creative content and copy', group: 'creator', status: 'draft', model: 'gpt-4', temperature: 0.9, systemPrompt: 'You are a creative writer. Write engaging, vivid content.' },
  { name: 'Data Engineer', role: 'Transforms and processes data pipelines', group: 'specialist', status: 'active', model: 'gpt-4', temperature: 0.1, systemPrompt: 'You are a data engineer. Optimize data pipelines for performance.' },
  { name: 'Product Manager', role: 'Defines requirements and priorities', group: 'orchestrator', status: 'active', model: 'gpt-4', temperature: 0.5, systemPrompt: 'You are a product manager. Balance user needs with technical constraints.' },
];

const SAMPLE_FLOWS = [
  { name: 'Research Pipeline', description: 'Multi-step research workflow', status: 'active', nodes: JSON.stringify([{ id: '1', type: 'llm', position: { x: 100, y: 100 }, data: { label: 'Research Query', prompt: 'Analyze {{topic}}' } }]), edges: JSON.stringify([]) },
  { name: 'Code Review Flow', description: 'Automated code review pipeline', status: 'draft', nodes: JSON.stringify([{ id: '1', type: 'llm', position: { x: 100, y: 100 }, data: { label: 'Analyze Code' } }]), edges: JSON.stringify([]) },
];

/** POST /api/dashboard/seed — populate DB with sample data. */
export async function POST() {
  try {
    const count = await db.agent.count();
    if (count > 0) {
      return NextResponse.json({ message: 'Database already has data', seeded: false });
    }

    const agents = await Promise.all(
      SAMPLE_AGENTS.map((a) => db.agent.create({ data: a })),
    );

    const executions = await Promise.all(
      agents.slice(0, 3).map((agent) =>
        db.agentExecution.create({
          data: {
            agentId: agent.id,
            status: 'completed',
            input: '{"query": "test"}',
            output: '{"result": "success"}',
            duration: Math.floor(Math.random() * 3000) + 500,
            tokensUsed: Math.floor(Math.random() * 2000) + 200,
          },
        }),
      ),
    );

    await Promise.all(
      SAMPLE_FLOWS.map((f) => db.flow.create({ data: f })),
    );

    return NextResponse.json({
      message: 'Database seeded successfully',
      seeded: true,
      agents: agents.length,
      executions: executions.length,
      flows: SAMPLE_FLOWS.length,
    });
  } catch (error) {
    console.error('[POST /api/dashboard/seed]', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
