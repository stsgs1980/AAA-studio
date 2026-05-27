import type { ComponentType } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { NodeCategory } from '@stsgs/shared';
import type { NodeTypeDefinition } from '../types';
import { LLMNode, PromptNode, ChainNode, RouterNode, RAGNode } from './ai-nodes';
import { AgentNode, OrchestratorNode, HumanInLoopNode, ConditionNode } from './management-nodes';
import { InputNode, OutputNode, TransformNode, FilterNode } from './data-nodes';
import { EmbeddingNode, VectorStoreNode } from './knowledge-nodes';
import { APINode, WebhookNode } from './integration-nodes';
import { StartNode, EndNode, ErrorNode } from './special-nodes';

// 18 node types across 6 categories
const AI = 'ai' as const;
const MGMT = 'management' as const;
const DATA = 'data' as const;
const KNOW = 'knowledge' as const;
const INTEG = 'integration' as const;
const SPEC = 'special' as const;

export const NODE_REGISTRY: NodeTypeDefinition[] = [
  // AI / LLM (5)
  { type: 'llm', category: AI, label: 'LLM', description: 'Large language model call', icon: 'Brain', colorClass: 'bg-blue-600',
    defaultData: { model: 'gpt-4', temperature: 0.7, maxTokens: 4096 },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },
  { type: 'prompt', category: AI, label: 'Prompt', description: 'Prompt template processor', icon: 'MessageSquare', colorClass: 'bg-blue-600',
    defaultData: { template: '', variables: [] },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },
  { type: 'chain', category: AI, label: 'Chain', description: 'Sequential LLM chain', icon: 'Link2', colorClass: 'bg-blue-600',
    defaultData: { steps: 3 },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },
  { type: 'router', category: AI, label: 'Router', description: 'Conditional routing logic', icon: 'GitBranch', colorClass: 'bg-blue-600',
    defaultData: { routes: [] },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out-0', label: 'Route 0', type: 'output' }, { id: 'out-1', label: 'Route 1', type: 'output' }] },
  { type: 'rag', category: AI, label: 'RAG', description: 'Retrieval-augmented generation', icon: 'Database', colorClass: 'bg-blue-600',
    defaultData: { collectionId: '', topK: 5 },
    inputs: [{ id: 'query', label: 'Query', type: 'input' }],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },

  // Management (4)
  { type: 'agent', category: MGMT, label: 'Agent', description: 'AI agent with tools', icon: 'Bot', colorClass: 'bg-purple-600',
    defaultData: { role: 'assistant', tools: [] },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },
  { type: 'orchestrator', category: MGMT, label: 'Orchestrator', description: 'Multi-agent orchestrator', icon: 'Users', colorClass: 'bg-purple-600',
    defaultData: { strategy: 'sequential' },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },
  { type: 'human-in-the-loop', category: MGMT, label: 'Human-in-Loop', description: 'Human approval gate', icon: 'UserCheck', colorClass: 'bg-purple-600',
    defaultData: { approvalRequired: true },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'approved', label: 'Approved', type: 'output' }, { id: 'rejected', label: 'Rejected', type: 'output' }] },
  { type: 'condition', category: MGMT, label: 'Condition', description: 'Conditional branching', icon: 'GitFork', colorClass: 'bg-purple-600',
    defaultData: { expression: '' },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'true', label: 'True', type: 'output' }, { id: 'false', label: 'False', type: 'output' }] },

  // Data (4)
  { type: 'input', category: DATA, label: 'Input', description: 'Flow input data', icon: 'ArrowDownToLine', colorClass: 'bg-emerald-600',
    defaultData: { schema: {} },
    inputs: [],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },
  { type: 'output', category: DATA, label: 'Output', description: 'Flow output data', icon: 'ArrowUpFromLine', colorClass: 'bg-emerald-600',
    defaultData: { schema: {} },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [] },
  { type: 'transform', category: DATA, label: 'Transform', description: 'Data transformation', icon: 'RefreshCw', colorClass: 'bg-emerald-600',
    defaultData: { transform: '' },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },
  { type: 'filter', category: DATA, label: 'Filter', description: 'Data filter', icon: 'Filter', colorClass: 'bg-emerald-600',
    defaultData: { condition: '' },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'pass', label: 'Pass', type: 'output' }, { id: 'fail', label: 'Fail', type: 'output' }] },

  // Knowledge (2)
  { type: 'embedding', category: KNOW, label: 'Embedding', description: 'Text embedding generation', icon: 'FileSearch', colorClass: 'bg-amber-600',
    defaultData: { model: 'text-embedding-3-small' },
    inputs: [{ id: 'in', label: 'Text', type: 'input' }],
    outputs: [{ id: 'out', label: 'Embedding', type: 'output' }] },
  { type: 'vector-store', category: KNOW, label: 'Vector Store', description: 'Vector similarity search', icon: 'HardDrive', colorClass: 'bg-amber-600',
    defaultData: { collectionId: '', topK: 5 },
    inputs: [{ id: 'query', label: 'Query', type: 'input' }],
    outputs: [{ id: 'out', label: 'Results', type: 'output' }] },

  // Integration (2)
  { type: 'api', category: INTEG, label: 'API Call', description: 'External API call', icon: 'Globe', colorClass: 'bg-orange-600',
    defaultData: { url: '', method: 'GET' },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out', label: 'Response', type: 'output' }] },
  { type: 'webhook', category: INTEG, label: 'Webhook', description: 'Webhook endpoint', icon: 'Webhook', colorClass: 'bg-orange-600',
    defaultData: { url: '', method: 'POST' },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out', label: 'Response', type: 'output' }] },

  // Special (3)
  { type: 'start', category: SPEC, label: 'Start', description: 'Flow entry point', icon: 'Play', colorClass: 'bg-slate-600',
    defaultData: {},
    inputs: [],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },
  { type: 'end', category: SPEC, label: 'End', description: 'Flow exit point', icon: 'Square', colorClass: 'bg-slate-600',
    defaultData: {},
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [] },
  { type: 'error', category: SPEC, label: 'Error', description: 'Error handler', icon: 'AlertTriangle', colorClass: 'bg-red-600',
    defaultData: { errorStrategy: 'stop' },
    inputs: [{ id: 'in', label: 'Input', type: 'input' }],
    outputs: [{ id: 'out', label: 'Output', type: 'output' }] },
];

// ---------------------------------------------------------------------------
// Helpers
/** Map of node type strings to React components for ReactFlow nodeTypes. */
export function getReactFlowNodeTypes(): Record<string, ComponentType<NodeProps>> {
  return {
    llm: LLMNode, prompt: PromptNode, chain: ChainNode,
    router: RouterNode, rag: RAGNode,
    agent: AgentNode, orchestrator: OrchestratorNode,
    'human-in-the-loop': HumanInLoopNode, condition: ConditionNode,
    input: InputNode, output: OutputNode,
    transform: TransformNode, filter: FilterNode,
    embedding: EmbeddingNode, 'vector-store': VectorStoreNode,
    api: APINode, webhook: WebhookNode,
    start: StartNode, end: EndNode, error: ErrorNode,
  };
}

/** Find a single node definition by type string. */
export function getNodeDefinition(type: string): NodeTypeDefinition | undefined {
  return NODE_REGISTRY.find((n) => n.type === type);
}

/** Group all node definitions by category. */
export function getNodesByCategory(): Map<NodeCategory, NodeTypeDefinition[]> {
  const map = new Map<NodeCategory, NodeTypeDefinition[]>();
  for (const def of NODE_REGISTRY) {
    const list = map.get(def.category) ?? [];
    list.push(def);
    map.set(def.category, list);
  }
  return map;
}
