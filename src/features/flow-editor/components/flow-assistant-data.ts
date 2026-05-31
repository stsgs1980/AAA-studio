/** Flow Assistant stage definitions + flow generation logic */

export interface Choice { id: string; label: string; desc: string }
export interface Stage { id: string; title: string; question: string; multi?: boolean; choices: Choice[] }

export const STAGES: Stage[] = [
  { id: 'taskType', title: 'Goal', question: 'What task should your AI flow solve?', choices: [
    { id: 'qa', label: 'Q&A', desc: 'Answer questions from knowledge base' },
    { id: 'content', label: 'Content Generation', desc: 'Create text, summaries, translations' },
    { id: 'analysis', label: 'Data Analysis', desc: 'Analyze, classify, extract data' },
    { id: 'automation', label: 'Automation', desc: 'Automate multi-step workflows' },
    { id: 'chatbot', label: 'Chatbot', desc: 'Conversational AI agent' },
  ]},
  { id: 'audience', title: 'Audience', question: 'Who will interact with this flow?', choices: [
    { id: 'end-users', label: 'End Users', desc: 'Customers, clients, public' },
    { id: 'developers', label: 'Developers', desc: 'Technical team members' },
    { id: 'analysts', label: 'Analysts', desc: 'Business analysts, researchers' },
    { id: 'mixed', label: 'Mixed', desc: 'Various user types' },
  ]},
  { id: 'features', title: 'Features', question: 'What capabilities should your flow have?', multi: true, choices: [
    { id: 'faq', label: 'FAQ / Knowledge', desc: 'Answer from documents or KB' },
    { id: 'search', label: 'Web Search', desc: 'Search the internet for info' },
    { id: 'api', label: 'External API', desc: 'Call external services' },
    { id: 'memory', label: 'Dialog Memory', desc: 'Remember conversation context' },
    { id: 'files', label: 'File Processing', desc: 'Upload and process documents' },
    { id: 'thinking', label: 'Multi-step Thinking', desc: 'Chain-of-thought reasoning' },
  ]},
  { id: 'model', title: 'Model', question: 'Which AI model do you prefer?', choices: [
    { id: 'gpt-4o', label: 'GPT-4o', desc: 'Best overall quality' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Fast and cost-effective' },
    { id: 'claude-sonnet', label: 'Claude 3.5 Sonnet', desc: 'Strong reasoning' },
    { id: 'claude-haiku', label: 'Claude 3 Haiku', desc: 'Ultra-fast responses' },
    { id: 'later', label: 'Decide Later', desc: 'Choose after building' },
  ]},
];

import type { Node, Edge } from '@xyflow/react';

export function generateFlow(answers: Record<string, string | string[]>): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const features = (answers.features as string[]) ?? [];
  const model = answers.model === 'later' ? '' : (answers.model as string);
  nodes.push({ id: 'n-1', type: 'input', position: { x: 50, y: 250 }, data: { label: 'User Input', schema: {} } });
  let x = 300; let prev = 'n-1';
  const addNode = (id: string, type: string, label: string, data: Record<string, unknown>) => {
    nodes.push({ id, type, position: { x, y: 250 }, data: { label, ...data } });
    edges.push({ id: `e-${prev}-${id}`, source: prev, target: id, type: 'smoothstep' });
    prev = id; x += 250;
  };
  if (features.includes('search')) addNode('n-search', 'api', 'Web Search', { url: '', method: 'GET' });
  if (features.includes('api')) addNode('n-api', 'api', 'External API', { url: '', method: 'POST' });
  const isAgent = answers.taskType === 'chatbot' || answers.taskType === 'qa';
  const coreData = isAgent
    ? { role: 'assistant', tools: [], model, temperature: 0.7, maxTokens: 4096, systemPrompt: features.includes('memory') ? 'Remember conversation context.' : '' }
    : { model, temperature: 0.7, maxTokens: 4096, systemPrompt: 'You are a helpful assistant.' };
  addNode('n-core', isAgent ? 'agent' : 'llm', isAgent ? 'AI Agent' : 'LLM', coreData);
  if (features.includes('faq')) {
    nodes.push({ id: 'n-rag', type: 'rag', position: { x: x - 250, y: 50 }, data: { label: 'RAG', collectionId: '', topK: 5 } });
    edges.push({ id: 'e-1-rag', source: 'n-1', target: 'n-rag', type: 'smoothstep' });
    edges.push({ id: 'e-rag-core', source: 'n-rag', target: 'n-core', type: 'smoothstep' });
  }
  addNode('n-out', 'output', 'Response', { schema: {} });
  return { nodes, edges };
}
