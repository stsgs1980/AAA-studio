'use client';

import { type NodeProps } from '@xyflow/react';
import { Bot, Users, UserCheck, GitFork } from 'lucide-react';
import { BaseNode } from './base-node';
import { getNodeDefinition } from './node-registry';

const COLOR = 'bg-purple-600';

export function AgentNode(props: NodeProps) {
  const def = getNodeDefinition('agent')!;
  return <BaseNode {...props} icon={<Bot className="h-3.5 w-3.5" />} label="Agent" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function OrchestratorNode(props: NodeProps) {
  const def = getNodeDefinition('orchestrator')!;
  return <BaseNode {...props} icon={<Users className="h-3.5 w-3.5" />} label="Orchestrator" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function HumanInLoopNode(props: NodeProps) {
  const def = getNodeDefinition('human-in-the-loop')!;
  return <BaseNode {...props} icon={<UserCheck className="h-3.5 w-3.5" />} label="Human-in-Loop" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function ConditionNode(props: NodeProps) {
  const def = getNodeDefinition('condition')!;
  return <BaseNode {...props} icon={<GitFork className="h-3.5 w-3.5" />} label="Condition" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}
