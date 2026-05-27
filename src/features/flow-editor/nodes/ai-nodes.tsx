'use client';

import { type NodeProps } from '@xyflow/react';
import {
  Brain,
  MessageSquare,
  Link2,
  GitBranch,
  Database,
} from 'lucide-react';
import { BaseNode } from './base-node';

const COLOR = 'bg-blue-600';

export function LLMNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Brain className="h-3.5 w-3.5" />}
      label="LLM"
      colorClass={COLOR}
    />
  );
}

export function PromptNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<MessageSquare className="h-3.5 w-3.5" />}
      label="Prompt"
      colorClass={COLOR}
    />
  );
}

export function ChainNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Link2 className="h-3.5 w-3.5" />}
      label="Chain"
      colorClass={COLOR}
    />
  );
}

export function RouterNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<GitBranch className="h-3.5 w-3.5" />}
      label="Router"
      colorClass={COLOR}
    />
  );
}

export function RAGNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Database className="h-3.5 w-3.5" />}
      label="RAG"
      colorClass={COLOR}
    />
  );
}
