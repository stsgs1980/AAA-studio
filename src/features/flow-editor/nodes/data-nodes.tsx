'use client';

import { type NodeProps } from '@xyflow/react';
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Filter } from 'lucide-react';
import { BaseNode } from './base-node';
import { getNodeDefinition } from './node-registry';

const COLOR = 'bg-emerald-600';

export function InputNode(props: NodeProps) {
  const def = getNodeDefinition('input')!;
  return <BaseNode {...props} icon={<ArrowDownToLine className="h-3.5 w-3.5" />} label="Input" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function OutputNode(props: NodeProps) {
  const def = getNodeDefinition('output')!;
  return <BaseNode {...props} icon={<ArrowUpFromLine className="h-3.5 w-3.5" />} label="Output" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function TransformNode(props: NodeProps) {
  const def = getNodeDefinition('transform')!;
  return <BaseNode {...props} icon={<RefreshCw className="h-3.5 w-3.5" />} label="Transform" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function FilterNode(props: NodeProps) {
  const def = getNodeDefinition('filter')!;
  return <BaseNode {...props} icon={<Filter className="h-3.5 w-3.5" />} label="Filter" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}
