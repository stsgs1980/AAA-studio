'use client';

import { type NodeProps } from '@xyflow/react';
import { Brain, MessageSquare, Link2, GitBranch, Database } from 'lucide-react';
import { BaseNode } from './base-node';
import { getNodeDefinition } from './node-registry';

const COLOR = 'bg-blue-600';

export function LLMNode(props: NodeProps) {
  const def = getNodeDefinition('llm')!;
  return <BaseNode {...props} icon={<Brain className="h-3.5 w-3.5" />} label="LLM" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function PromptNode(props: NodeProps) {
  const def = getNodeDefinition('prompt')!;
  return <BaseNode {...props} icon={<MessageSquare className="h-3.5 w-3.5" />} label="Prompt" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function ChainNode(props: NodeProps) {
  const def = getNodeDefinition('chain')!;
  return <BaseNode {...props} icon={<Link2 className="h-3.5 w-3.5" />} label="Chain" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function RouterNode(props: NodeProps) {
  const def = getNodeDefinition('router')!;
  return <BaseNode {...props} icon={<GitBranch className="h-3.5 w-3.5" />} label="Router" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function RAGNode(props: NodeProps) {
  const def = getNodeDefinition('rag')!;
  return <BaseNode {...props} icon={<Database className="h-3.5 w-3.5" />} label="RAG" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}
