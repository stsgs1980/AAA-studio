/** Architecture builders for flow generation — one per topology. */
import type { Node, Edge } from '@xyflow/react';

let _id = 0;
const uid = (prefix: string) => `${prefix}-${++_id}`;

export function makeNode(id: string, type: string, x: number, y: number, data: Record<string, unknown>): Node {
  return { id, type, position: { x, y }, data: { label: data.label ?? type, ...data } };
}

export function makeEdge(src: string, tgt: string, srcHandle?: string): Edge {
  return { id: `e-${src}-${tgt}${srcHandle ? '-' + srcHandle : ''}`, source: src, target: tgt, type: 'smoothstep', sourceHandle: srcHandle || undefined };
}

export function resetId() { _id = 0; }

export function buildLinear(nodes: Node[], edges: Edge[], inputId: string, features: string[], model: string, sp: string, x0: number, y: number, dx: number) {
  let x = x0 + dx;
  let prev = inputId;

  if (features.includes('faq')) {
    const ragId = uid('n');
    nodes.push(makeNode(ragId, 'rag', x, y, { label: 'RAG', collectionId: '', topK: 5 }));
    edges.push(makeEdge(prev, ragId)); prev = ragId; x += dx;
  }
  if (features.includes('search')) {
    const sid = uid('n');
    nodes.push(makeNode(sid, 'api', x, y, { label: 'Web Search', url: '', method: 'GET' }));
    edges.push(makeEdge(prev, sid)); prev = sid; x += dx;
  }
  if (features.includes('api')) {
    const aid = uid('n');
    nodes.push(makeNode(aid, 'api', x, y, { label: 'External API', url: '', method: 'POST' }));
    edges.push(makeEdge(prev, aid)); prev = aid; x += dx;
  }

  const isAgent = features.includes('memory') || features.includes('thinking');
  const coreId = uid('n');
  const coreData = isAgent
    ? { label: 'AI Agent', role: 'assistant', tools: [], model, temperature: 0.7, maxTokens: 4096, systemPrompt: sp }
    : { label: 'LLM', model, temperature: 0.7, maxTokens: 4096, systemPrompt: sp };
  nodes.push(makeNode(coreId, isAgent ? 'agent' : 'llm', x, y, coreData));
  edges.push(makeEdge(prev, coreId)); prev = coreId; x += dx;

  if (features.includes('transform')) {
    const tid = uid('n');
    nodes.push(makeNode(tid, 'transform', x, y, { label: 'Transform', transform: '' }));
    edges.push(makeEdge(prev, tid)); prev = tid; x += dx;
  }
  if (features.includes('approval')) {
    const hid = uid('n');
    nodes.push(makeNode(hid, 'human-in-the-loop', x, y, { label: 'Human Approval', approvalRequired: true }));
    edges.push(makeEdge(prev, hid, 'out'));
    const outId = uid('n');
    nodes.push(makeNode(outId, 'output', x + dx, y, { label: 'Response', schema: {} }));
    edges.push(makeEdge(hid, outId, 'approved'));
    return;
  }

  const outId = uid('n');
  nodes.push(makeNode(outId, 'output', x, y, { label: 'Response', schema: {} }));
  edges.push(makeEdge(prev, outId));
}

export function buildBranching(nodes: Node[], edges: Edge[], inputId: string, features: string[], model: string, sp: string, x0: number, y: number, dx: number) {
  const cx = x0 + dx;
  const condId = uid('n');
  nodes.push(makeNode(condId, 'condition', cx, y, { label: 'Condition', expression: '' }));
  edges.push(makeEdge(inputId, condId));

  const coreX = cx + dx;
  const topY = y - 130;
  const botY = y + 130;

  const tId = uid('n');
  nodes.push(makeNode(tId, 'llm', coreX, topY, { label: 'Path A (True)', model, temperature: 0.7, maxTokens: 4096, systemPrompt: sp }));
  edges.push(makeEdge(condId, tId, 'true'));

  const fId = uid('n');
  nodes.push(makeNode(fId, 'llm', coreX, botY, { label: 'Path B (False)', model, temperature: 0.7, maxTokens: 4096, systemPrompt: 'You are an alternative handler for unmatched cases.' }));
  edges.push(makeEdge(condId, fId, 'false'));

  if (features.includes('faq')) {
    const ragId = uid('n');
    nodes.push(makeNode(ragId, 'rag', coreX - dx / 2, topY - 110, { label: 'RAG', collectionId: '', topK: 5 }));
    edges.push(makeEdge(inputId, ragId));
    edges.push(makeEdge(ragId, condId));
  }

  const mergeX = coreX + dx;
  const outId = uid('n');
  nodes.push(makeNode(outId, 'output', mergeX, y, { label: 'Response', schema: {} }));
  edges.push(makeEdge(tId, outId));
  edges.push(makeEdge(fId, outId));
}

export function buildParallel(nodes: Node[], edges: Edge[], inputId: string, _features: string[], model: string, sp: string, x0: number, y: number, dx: number) {
  const ax = x0 + dx;
  const topY = y - 130;
  const botY = y + 130;

  const a1 = uid('n');
  nodes.push(makeNode(a1, 'agent', ax, topY, { label: 'Agent A', role: 'assistant', tools: [], model, temperature: 0.7, maxTokens: 4096, systemPrompt: sp }));
  edges.push(makeEdge(inputId, a1));

  const a2 = uid('n');
  nodes.push(makeNode(a2, 'agent', ax, botY, { label: 'Agent B', role: 'assistant', tools: [], model, temperature: 0.7, maxTokens: 4096, systemPrompt: 'You are a second perspective. Provide an alternative view or complementary analysis.' }));
  edges.push(makeEdge(inputId, a2));

  const mergeX = ax + dx;
  const mergeId = uid('n');
  nodes.push(makeNode(mergeId, 'llm', mergeX, y, { label: 'Synthesize', model, temperature: 0.5, maxTokens: 4096, systemPrompt: 'Combine both agent outputs into a coherent response.' }));
  edges.push(makeEdge(a1, mergeId));
  edges.push(makeEdge(a2, mergeId));

  const outId = uid('n');
  nodes.push(makeNode(outId, 'output', mergeX + dx, y, { label: 'Response', schema: {} }));
  edges.push(makeEdge(mergeId, outId));
}

export function buildRouter(nodes: Node[], edges: Edge[], inputId: string, _features: string[], model: string, sp: string, x0: number, y: number, dx: number) {
  const rx = x0 + dx;
  const rId = uid('n');
  nodes.push(makeNode(rId, 'router', rx, y, {
    label: 'Smart Router', routingStrategy: 'keyword',
    routes: [{ id: 'out-0', label: 'General', keywords: ['help', 'what', 'how'] }, { id: 'out-1', label: 'Technical', keywords: ['code', 'debug', 'error'] }],
    classificationPrompt: 'Classify into General or Technical.',
    fallbackRouteId: 'out-0',
  }));
  edges.push(makeEdge(inputId, rId));

  const hx = rx + dx;
  const topY = y - 130;
  const botY = y + 130;

  const h1 = uid('n');
  nodes.push(makeNode(h1, 'agent', hx, topY, { label: 'General Handler', role: 'assistant', tools: [], model, temperature: 0.7, maxTokens: 4096, systemPrompt: sp }));
  edges.push(makeEdge(rId, h1, 'out-0'));

  const h2 = uid('n');
  nodes.push(makeNode(h2, 'agent', hx, botY, { label: 'Technical Handler', role: 'assistant', tools: [], model, temperature: 0.7, maxTokens: 4096, systemPrompt: 'You are a technical expert. Help with code, debugging, and technical issues.' }));
  edges.push(makeEdge(rId, h2, 'out-1'));

  const outId = uid('n');
  nodes.push(makeNode(outId, 'output', hx + dx, y, { label: 'Response', schema: {} }));
  edges.push(makeEdge(h1, outId));
  edges.push(makeEdge(h2, outId));
}
