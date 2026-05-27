'use client';

import { type NodeProps } from '@xyflow/react';
import { Globe, Webhook } from 'lucide-react';
import { BaseNode } from './base-node';

const COLOR = 'bg-orange-600';

export function APINode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Globe className="h-3.5 w-3.5" />}
      label="API Call"
      colorClass={COLOR}
    />
  );
}

export function WebhookNode(props: NodeProps) {
  return (
    <BaseNode
      {...props}
      icon={<Webhook className="h-3.5 w-3.5" />}
      label="Webhook"
      colorClass={COLOR}
    />
  );
}
