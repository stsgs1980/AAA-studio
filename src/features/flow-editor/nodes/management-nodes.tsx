'use client';

import { type NodeProps } from '@xyflow/react';
import { Bot, Users, UserCheck, GitFork } from 'lucide-react';
import { BaseNode } from './base-node';

const COLOR = 'bg-purple-600';

export function AgentNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Bot className="h-3.5 w-3.5" />}
      label="Agent"
      colorClass={COLOR}
    />
  );
}

export function OrchestratorNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Users className="h-3.5 w-3.5" />}
      label="Orchestrator"
      colorClass={COLOR}
    />
  );
}

export function HumanInLoopNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<UserCheck className="h-3.5 w-3.5" />}
      label="Human-in-Loop"
      colorClass={COLOR}
    />
  );
}

export function ConditionNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<GitFork className="h-3.5 w-3.5" />}
      label="Condition"
      colorClass={COLOR}
    />
  );
}
