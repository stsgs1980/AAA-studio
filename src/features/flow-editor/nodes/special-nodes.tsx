'use client';

import { type NodeProps } from '@xyflow/react';
import { Play, Square, AlertTriangle } from 'lucide-react';
import { BaseNode } from './base-node';

const COLOR = 'bg-slate-600';

export function StartNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Play className="h-3.5 w-3.5" />}
      label="Start"
      colorClass={COLOR}
      showInput={false}
    />
  );
}

export function EndNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Square className="h-3.5 w-3.5" />}
      label="End"
      colorClass={COLOR}
      showOutput={false}
    />
  );
}

export function ErrorNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<AlertTriangle className="h-3.5 w-3.5" />}
      label="Error"
      colorClass="bg-red-600"
    />
  );
}
