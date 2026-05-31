/**
 * Flow generation engine — builds ReactFlow nodes & edges from wizard answers.
 * Delegates architecture-specific building to flow-assistant-builders.
 */

import type { Node, Edge } from '@xyflow/react';
import { resetId, makeNode, makeEdge, buildLinear, buildBranching, buildParallel, buildRouter } from './flow-assistant-builders';

export interface FlowAnswers {
  goal: string;
  architecture: string;
  features: string[];
  config: string;
  flowName: string;
  flowDescription: string;
}

const SYSTEM_PROMPTS: Record<string, string> = {
  qa: 'You are a knowledgeable assistant. Answer questions accurately using available context.',
  content: 'You are a creative writing assistant. Generate high-quality content based on the request.',
  analysis: 'You are a data analyst. Analyze, classify, and extract information precisely.',
  automation: 'You are a workflow automation assistant. Execute multi-step tasks methodically.',
  chatbot: 'You are a friendly conversational AI. Help users naturally and remember context.',
  custom: 'You are a helpful assistant.',
};

const BUILDERS: Record<string, typeof buildLinear> = {
  linear: buildLinear,
  branching: buildBranching,
  parallel: buildParallel,
  router: buildRouter,
};

export function generateFlow(answers: FlowAnswers): { nodes: Node[]; edges: Edge[] } {
  resetId();
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const features = answers.features ?? [];
  const model = answers.config === 'later' ? '' : answers.config;
  const basePrompt = SYSTEM_PROMPTS[answers.goal] ?? SYSTEM_PROMPTS.custom;
  const sp = features.includes('memory')
    ? `${basePrompt} Remember conversation context across turns.`
    : basePrompt;
  const x0 = 50;
  const yMid = 250;
  const dx = 280;

  // Input node — always present
  const inputId = 'n-1';
  nodes.push(makeNode(inputId, 'input', x0, yMid, { label: 'User Input', schema: {} }));

  // Delegate to architecture builder
  const builder = BUILDERS[answers.architecture] ?? buildLinear;
  builder(nodes, edges, inputId, features, model, sp, x0, yMid, dx);

  return { nodes, edges };
}
