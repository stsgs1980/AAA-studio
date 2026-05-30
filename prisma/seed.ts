// ============================================================================
// 3A Studio -- Database Seed
// Run: bun run prisma/seed.ts  (or npx tsx prisma/seed.ts)
// ============================================================================

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

const AGENTS = [
  { name: 'Orchestrator', role: 'Coordinates all agents and manages task delegation', roleGroup: 'orchestrator', status: 'active', model: 'gpt-4', temperature: 0.3, skills: JSON.stringify(['planning', 'delegation']), systemPrompt: 'You are the orchestrator agent. Coordinate tasks between specialist agents.', formula: 'ReAct' },
  { name: 'Research Analyst', role: 'Researches topics and synthesizes findings', roleGroup: 'researcher', status: 'active', model: 'gpt-4', temperature: 0.3, skills: JSON.stringify(['web-search', 'summarization']), systemPrompt: 'You are a research analyst. Find and synthesize information.' },
  { name: 'Code Reviewer', role: 'Reviews code for quality and best practices', roleGroup: 'reviewer', status: 'active', model: 'gpt-4', temperature: 0.2, skills: JSON.stringify(['code-analysis', 'security']), systemPrompt: 'You are a senior code reviewer. Check for bugs, security issues, and best practices.' },
  { name: 'Creative Writer', role: 'Generates creative content and copy', roleGroup: 'specialist', status: 'active', model: 'gpt-4', temperature: 0.9, skills: JSON.stringify(['copywriting', 'storytelling']), systemPrompt: 'You are a creative writer. Generate engaging content.', formula: 'MoA' },
  { name: 'Data Engineer', role: 'Transforms and processes data pipelines', roleGroup: 'specialist', status: 'active', model: 'gpt-4', temperature: 0.1, skills: JSON.stringify(['sql', 'python', 'data-analysis']), systemPrompt: 'You are a data engineer. Transform and analyze data.' },
  { name: 'QA Tester', role: 'Writes and executes test plans', roleGroup: 'tester', status: 'active', model: 'gpt-4', temperature: 0.2, skills: JSON.stringify(['testing', 'automation']), systemPrompt: 'You are a QA engineer. Write and execute test plans.' },
  { name: 'DevOps Agent', role: 'Manages CI/CD and infrastructure', roleGroup: 'deployer', status: 'active', model: 'gpt-4', temperature: 0.1, skills: JSON.stringify(['docker', 'kubernetes', 'ci-cd']), systemPrompt: 'You are a DevOps specialist. Manage CI/CD and infrastructure.' },
  { name: 'Product Manager', role: 'Defines requirements and priorities', roleGroup: 'planner', status: 'active', model: 'gpt-4', temperature: 0.5, skills: JSON.stringify(['planning', 'user-research']), systemPrompt: 'You are a product manager. Define requirements and priorities.' },
  { name: 'UX Writer', role: 'Writes UI microcopy and documentation', roleGroup: 'specialist', status: 'draft', model: 'gpt-4', temperature: 0.7, skills: JSON.stringify(['copywriting', 'ux-design']), systemPrompt: 'You are a UX writer. Create clear, concise UI copy.' },
  { name: 'Security Auditor', role: 'Performs security audits and penetration tests', roleGroup: 'reviewer', status: 'draft', model: 'gpt-4', temperature: 0.1, skills: JSON.stringify(['security', 'pentesting']), systemPrompt: 'You are a security auditor. Perform security audits.' },
];

const HIERARCHY: Record<number, number | null> = {
  1: 0, 2: 0, 3: 0,   // Analyst, Reviewer, Creator under Orchestrator
  4: 7, 5: 7,          // Data Engineer, QA under Product Manager
  6: 0,                // DevOps under Orchestrator
  8: 3, 9: 2,          // UX Writer under Creator, Security under Reviewer
};

const FLOWS = [
  { name: 'Research Pipeline', description: 'Multi-step research workflow with summarization', status: 'active', nodes: JSON.stringify([{ id: 's1', type: 'start', position: { x: 250, y: 50 }, data: {} }, { id: 'i1', type: 'input', position: { x: 250, y: 150 }, data: { schema: { query: '' } } }, { id: 'l1', type: 'llm', position: { x: 250, y: 270 }, data: { systemPrompt: 'You are a research analyst.', temperature: 0.3 } }, { id: 'e1', type: 'end', position: { x: 250, y: 390 }, data: {} }]), edges: JSON.stringify([{ id: 'ea', source: 's1', target: 'i1' }, { id: 'eb', source: 'i1', target: 'l1' }, { id: 'ec', source: 'l1', target: 'e1' }]) },
  { name: 'Code Review Flow', description: 'Automated code review with security check', status: 'active', nodes: JSON.stringify([{ id: 's1', type: 'start', position: { x: 200, y: 50 }, data: {} }, { id: 'l1', type: 'llm', position: { x: 100, y: 200 }, data: { systemPrompt: 'Review code for bugs.' } }, { id: 'l2', type: 'llm', position: { x: 350, y: 200 }, data: { systemPrompt: 'Check for security issues.' } }, { id: 'e1', type: 'end', position: { x: 200, y: 350 }, data: {} }]), edges: JSON.stringify([{ id: 'ea', source: 's1', target: 'l1' }, { id: 'eb', source: 's1', target: 'l2' }, { id: 'ec', source: 'l1', target: 'e1' }, { id: 'ed', source: 'l2', target: 'e1' }]) },
  { name: 'Content Generation', description: 'Creative writing pipeline with review', status: 'draft', nodes: JSON.stringify([{ id: 's1', type: 'start', position: { x: 250, y: 50 }, data: {} }, { id: 'p1', type: 'prompt', position: { x: 250, y: 150 }, data: { template: 'Write a blog post about {{topic}}' } }, { id: 'l1', type: 'llm', position: { x: 250, y: 270 }, data: { systemPrompt: 'You are a creative writer.', temperature: 0.9 } }, { id: 'e1', type: 'end', position: { x: 250, y: 390 }, data: {} }]), edges: JSON.stringify([{ id: 'ea', source: 's1', target: 'p1' }, { id: 'eb', source: 'p1', target: 'l1' }, { id: 'ec', source: 'l1', target: 'e1' }]) },
  { name: 'Data Analysis', description: 'Automated data processing and insight extraction', status: 'active', nodes: JSON.stringify([{ id: 's1', type: 'start', position: { x: 250, y: 50 }, data: {} }, { id: 'l1', type: 'llm', position: { x: 250, y: 180 }, data: { systemPrompt: 'Analyze the data.' } }, { id: 'o1', type: 'output', position: { x: 250, y: 310 }, data: {} }, { id: 'e1', type: 'end', position: { x: 250, y: 420 }, data: {} }]), edges: JSON.stringify([{ id: 'ea', source: 's1', target: 'l1' }, { id: 'eb', source: 'l1', target: 'o1' }, { id: 'ec', source: 'o1', target: 'e1' }]) },
];

const SKILLS = [
  { name: 'Web Search', category: 'integration', description: 'Search the web for real-time information', tags: JSON.stringify(['search', 'web', 'realtime']) },
  { name: 'Code Analysis', category: 'analysis', description: 'Static analysis of source code', tags: JSON.stringify(['code', 'review', 'static']) },
  { name: 'SQL Query', category: 'data', description: 'Execute and analyze SQL queries', tags: JSON.stringify(['sql', 'database', 'query']) },
  { name: 'Prompt Scoring', category: 'evaluation', description: 'Score prompts on 6 quality dimensions', tags: JSON.stringify(['prompt', 'quality', 'scoring']) },
];

async function main() {
  const existing = await db.agent.count();
  if (existing > 0) {
    console.log('[seed] Database already has data. Skipping seed.');
    return;
  }

  console.log('[seed] Seeding database...');

  // Create agents
  const createdAgents = await Promise.all(
    AGENTS.map((a) => db.agent.create({ data: a })),
  );

  // Wire hierarchy
  for (const [childIdx, parentIdx] of Object.entries(HIERARCHY)) {
    if (parentIdx === null) continue;
    const child = createdAgents[Number(childIdx)];
    const parent = createdAgents[parentIdx];
    await db.agent.update({ where: { id: child.id }, data: { parentId: parent.id } });
  }

  // Create executions
  const STATUSES: Array<'completed' | 'failed'> = ['completed', 'completed', 'completed', 'completed', 'failed'];
  const execQueries = [
    '{"query": "Analyze market trends for AI agents in 2026"}',
    '{"query": "Review authentication module for vulnerabilities"}',
    '{"query": "Write onboarding email sequence"}',
    '{"query": "Optimize database query performance"}',
    '{"query": "Create test plan for payment module"}',
    '{"query": "Analyze user retention metrics"}',
    '{"query": "Write API documentation for flows endpoint"}',
    '{"query": "Security audit of dependency chain"}',
  ];

  const executions = [];
  for (let i = 0; i < 48; i++) {
    const agentIdx = i % createdAgents.length;
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const hoursBack = Math.random() * 24;
    const duration = Math.floor(Math.random() * 4000) + 300;
    executions.push({
      agentId: createdAgents[agentIdx].id,
      status,
      input: execQueries[agentIdx % execQueries.length],
      output: JSON.stringify({ result: status === 'completed' ? 'Analysis complete' : 'Error occurred', confidence: Math.random() }),
      duration,
      tokensUsed: Math.floor(Math.random() * 3000) + 100,
      startedAt: hoursAgo(hoursBack),
    });
  }
  await db.agentExecution.createMany({ data: executions });

  // Create flows
  await Promise.all(FLOWS.map((f) => db.flow.create({ data: f })));

  // Create pipeline executions
  const flows = await db.flow.findMany({ take: 2 });
  for (let i = 0; i < 8; i++) {
    const flow = flows[i % flows.length];
    await db.pipelineExecution.create({
      data: {
        flowId: flow.id,
        status: i < 6 ? 'completed' : 'failed',
        result: i < 6 ? JSON.stringify({ nodes: 4, duration: 2500 }) : null,
        error: i >= 6 ? 'Timeout on node l2' : null,
        startedAt: hoursAgo(Math.random() * 24),
        completedAt: i < 6 ? hoursAgo(Math.random() * 24) : null,
      },
    });
  }

  // Create skills
  await Promise.all(SKILLS.map((s) => db.skill.create({ data: s })));

  // Create knowledge collection with sample document
  const collection = await db.knowledgeCollection.create({
    data: {
      name: '3A Studio Documentation',
      description: 'Core documentation for 3A Studio platform',
      tags: JSON.stringify(['docs', '3a-studio', 'guide']),
    },
  });
  await db.knowledgeDocument.create({
    data: {
      collectionId: collection.id,
      title: 'Getting Started with 3A Studio',
      content: '# Getting Started\n\n3A Studio is an IDE for building visual multi-agent systems.\n\n## Key Concepts\n\n- **Agents**: Autonomous AI entities with specific roles\n- **Flows**: Visual pipelines connecting agents\n- **Skills**: Reusable capabilities for agents\n- **Standards**: Quality rules and constraints',
      fileType: 'md',
      tags: JSON.stringify(['getting-started', 'guide']),
    },
  });

  // Create prompt templates
  const templates = [
    { name: 'Research Task', category: 'research', content: 'You are a research analyst. Analyze the following topic: {{topic}}. Provide a structured summary with key findings, methodology, and recommendations.', variables: JSON.stringify(['topic']), framework: 'ReAct', tags: JSON.stringify(['research', 'analysis']) },
    { name: 'Code Review', category: 'code', content: 'You are a senior code reviewer. Review the following code for: 1) Bugs 2) Security issues 3) Performance 4) Best practices.\n\n```\n{{code}}\n```', variables: JSON.stringify(['code']), framework: 'Reflexion', tags: JSON.stringify(['code', 'review', 'security']) },
    { name: 'Creative Brief', category: 'creative', content: 'You are a creative writer. Write {{content_type}} about {{topic}} in a {{tone}} tone. Target audience: {{audience}}.', variables: JSON.stringify(['content_type', 'topic', 'tone', 'audience']), tags: JSON.stringify(['creative', 'writing']) },
  ];
  await Promise.all(templates.map((t) => db.promptTemplate.create({ data: t })));

  const total = await db.agent.count();
  const execCount = await db.agentExecution.count();
  console.log(`[seed] Done! Agents: ${total}, Executions: ${execCount}, Flows: ${FLOWS.length}, Skills: ${SKILLS.length}`);
}

main()
  .catch((e) => { console.error('[seed] Error:', e); process.exit(1); })
  .finally(() => db.$disconnect());
