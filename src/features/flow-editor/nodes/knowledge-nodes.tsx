'use client';

import { type NodeProps } from '@xyflow/react';
import { FileSearch, HardDrive } from 'lucide-react';
import { BaseNode } from './base-node';

const COLOR = 'bg-amber-600';

export function EmbeddingNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<FileSearch className="h-3.5 w-3.5" />}
      label="Embedding"
      colorClass={COLOR}
    />
  );
}

export function VectorStoreNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<HardDrive className="h-3.5 w-3.5" />}
      label="Vector Store"
      colorClass={COLOR}
    />
  );
}
