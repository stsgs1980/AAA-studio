'use client';

import { type NodeProps } from '@xyflow/react';
import { FileSearch, HardDrive } from 'lucide-react';
import { BaseNode } from './base-node';
import { getNodeDefinition } from './node-registry';

const COLOR = 'bg-amber-600';

export function EmbeddingNode(props: NodeProps) {
  const def = getNodeDefinition('embedding')!;
  return <BaseNode {...props} icon={<FileSearch className="h-3.5 w-3.5" />} label="Embedding" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function VectorStoreNode(props: NodeProps) {
  const def = getNodeDefinition('vector-store')!;
  return <BaseNode {...props} icon={<HardDrive className="h-3.5 w-3.5" />} label="Vector Store" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}
