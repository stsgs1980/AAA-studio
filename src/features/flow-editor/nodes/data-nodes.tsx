'use client';

import { type NodeProps } from '@xyflow/react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { BaseNode } from './base-node';

const COLOR = 'bg-emerald-600';

export function InputNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<ArrowDownToLine className="h-3.5 w-3.5" />}
      label="Input"
      colorClass={COLOR}
      showInput={false}
    />
  );
}

export function OutputNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<ArrowUpFromLine className="h-3.5 w-3.5" />}
      label="Output"
      colorClass={COLOR}
      showOutput={false}
    />
  );
}

export function TransformNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<RefreshCw className="h-3.5 w-3.5" />}
      label="Transform"
      colorClass={COLOR}
    />
  );
}

export function FilterNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Filter className="h-3.5 w-3.5" />}
      label="Filter"
      colorClass={COLOR}
    />
  );
}
