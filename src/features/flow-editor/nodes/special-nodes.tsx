'use client';

import { type NodeProps } from '@xyflow/react';
import { Play, Square, AlertTriangle } from 'lucide-react';
import { BaseNode } from './base-node';
import { getNodeDefinition } from './node-registry';

export function StartNode(props: NodeProps) {
  const def = getNodeDefinition('start')!;
  return <BaseNode {...props} icon={<Play className="h-3.5 w-3.5" />} label="Start" colorClass="bg-slate-600" inputs={def.inputs} outputs={def.outputs} />;
}

export function EndNode(props: NodeProps) {
  const def = getNodeDefinition('end')!;
  return <BaseNode {...props} icon={<Square className="h-3.5 w-3.5" />} label="End" colorClass="bg-slate-600" inputs={def.inputs} outputs={def.outputs} />;
}

export function ErrorNode(props: NodeProps) {
  const def = getNodeDefinition('error')!;
  return <BaseNode {...props} icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Error" colorClass="bg-red-600" inputs={def.inputs} outputs={def.outputs} />;
}
