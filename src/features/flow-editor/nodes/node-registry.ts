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

const AI = 'ai' as const;
const MGMT = 'management' as const;
const DATA = 'data' as const;
const KNOW = 'knowledge' as const;
const INTEG = 'integration' as const;
const SPEC = 'special' as const;

// Shorthand for handle definitions
const inp = (id: string, label: string, dt: NodeTypeDefinition['inputs'][0]['dataType']) =>
  ({ id, label, type: 'input' as const, dataType: dt });
const out = (id: string, label: string, dt: NodeTypeDefinition['outputs'][0]['dataType']) =>
  ({ id, label, type: 'output' as const, dataType: dt });

export const NODE_REGISTRY: NodeTypeDefinition[] = [
  // AI / LLM (5)
  { type: 'llm', category: AI, label: 'LLM', description: 'Large language model call', icon: 'Brain', colorClass: 'bg-blue-600',
    defaultData: { model: '', temperature: 0.7, maxTokens: 4096 },
    inputs: [inp('in', 'Input', 'text')],
    outputs: [out('out', 'Output', 'text')] },
  { type: 'prompt', category: AI, label: 'Prompt', description: 'Prompt template processor', icon: 'MessageSquare', colorClass: 'bg-blue-600',
    defaultData: { template: '', variables: [] },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('out', 'Output', 'text')] },
  { type: 'chain', category: AI, label: 'Chain', description: 'Sequential LLM chain', icon: 'Link2', colorClass: 'bg-blue-600',
    defaultData: { steps: 3 },
    inputs: [inp('in', 'Input', 'text')],
    outputs: [out('out', 'Output', 'text')] },
  { type: 'router', category: AI, label: 'Router', description: 'Conditional routing logic', icon: 'GitBranch', colorClass: 'bg-blue-600',
    defaultData: { routes: [{ id: 'out-0', label: 'Route 0', keywords: [] }, { id: 'out-1', label: 'Route 1', keywords: [] }], routingStrategy: 'keyword' },
    inputs: [inp('in', 'Input', 'text')],
    outputs: [out('out-0', 'Route 0', 'text'), out('out-1', 'Route 1', 'text')] },
  { type: 'rag', category: AI, label: 'RAG', description: 'Retrieval-augmented generation', icon: 'Database', colorClass: 'bg-blue-600',
    defaultData: { collectionId: '', topK: 5 },
    inputs: [inp('query', 'Query', 'query')],
    outputs: [out('out', 'Output', 'text')] },

  // Management (4)
  { type: 'agent', category: MGMT, label: 'Agent', description: 'AI agent with tools', icon: 'Bot', colorClass: 'bg-purple-600',
    defaultData: { role: 'assistant', tools: [] },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('out', 'Output', 'json')] },
  { type: 'orchestrator', category: MGMT, label: 'Orchestrator', description: 'Multi-agent orchestrator', icon: 'Users', colorClass: 'bg-purple-600',
    defaultData: { strategy: 'sequential' },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('out', 'Output', 'json')] },
  { type: 'human-in-the-loop', category: MGMT, label: 'Human-in-Loop', description: 'Human approval gate', icon: 'UserCheck', colorClass: 'bg-purple-600',
    defaultData: { approvalRequired: true },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('approved', 'Approved', 'json'), out('rejected', 'Rejected', 'json')] },
  { type: 'condition', category: MGMT, label: 'Condition', description: 'Conditional branching', icon: 'GitFork', colorClass: 'bg-purple-600',
    defaultData: { expression: '' },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('true', 'True', 'json'), out('false', 'False', 'json')] },

  // Data (4)
  { type: 'input', category: DATA, label: 'Input', description: 'Flow input data', icon: 'ArrowDownToLine', colorClass: 'bg-emerald-600',
    defaultData: { schema: {} },
    inputs: [],
    outputs: [out('out', 'Output', 'any')] },
  { type: 'output', category: DATA, label: 'Output', description: 'Flow output data', icon: 'ArrowUpFromLine', colorClass: 'bg-emerald-600',
    defaultData: { schema: {} },
    inputs: [inp('in', 'Input', 'any')],
    outputs: [] },
  { type: 'transform', category: DATA, label: 'Transform', description: 'Data transformation', icon: 'RefreshCw', colorClass: 'bg-emerald-600',
    defaultData: { transform: '' },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('out', 'Output', 'json')] },
  { type: 'filter', category: DATA, label: 'Filter', description: 'Data filter', icon: 'Filter', colorClass: 'bg-emerald-600',
    defaultData: { condition: '' },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('pass', 'Pass', 'json'), out('fail', 'Fail', 'json')] },

  // Knowledge (2)
  { type: 'embedding', category: KNOW, label: 'Embedding', description: 'Text embedding generation', icon: 'FileSearch', colorClass: 'bg-amber-600',
    defaultData: { model: 'text-embedding-3-small' },
    inputs: [inp('in', 'Text', 'text')],
    outputs: [out('out', 'Embedding', 'embedding')] },
  { type: 'vector-store', category: KNOW, label: 'Vector Store', description: 'Vector similarity search', icon: 'HardDrive', colorClass: 'bg-amber-600',
    defaultData: { collectionId: '', topK: 5 },
    inputs: [inp('query', 'Query', 'query')],
    outputs: [out('out', 'Results', 'results')] },

  // Integration (2)
  { type: 'api', category: INTEG, label: 'API Call', description: 'External API call', icon: 'Globe', colorClass: 'bg-orange-600',
    defaultData: { url: '', method: 'GET' },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('out', 'Response', 'json')] },
  { type: 'webhook', category: INTEG, label: 'Webhook', description: 'Webhook endpoint', icon: 'Webhook', colorClass: 'bg-orange-600',
    defaultData: { url: '', method: 'POST' },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('out', 'Response', 'json')] },

  // Special (3)
  { type: 'start', category: SPEC, label: 'Start', description: 'Flow entry point', icon: 'Play', colorClass: 'bg-slate-600',
    defaultData: {},
    inputs: [],
    outputs: [out('out', 'Output', 'any')] },
  { type: 'end', category: SPEC, label: 'End', description: 'Flow exit point', icon: 'Square', colorClass: 'bg-slate-600',
    defaultData: {},
    inputs: [inp('in', 'Input', 'any')],
    outputs: [] },
  { type: 'error', category: SPEC, label: 'Error', description: 'Error handler', icon: 'AlertTriangle', colorClass: 'bg-red-600',
    defaultData: { errorStrategy: 'stop' },
    inputs: [inp('in', 'Input', 'json')],
    outputs: [out('out', 'Output', 'json')] },
];

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
