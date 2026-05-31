'use client';

import { type NodeProps } from '@xyflow/react';
import { Globe, Webhook as WebhookIcon } from 'lucide-react';
import { BaseNode } from './base-node';
import { getNodeDefinition } from './node-registry';

const COLOR = 'bg-orange-600';

export function APINode(props: NodeProps) {
  const def = getNodeDefinition('api')!;
  return <BaseNode {...props} icon={<Globe className="h-3.5 w-3.5" />} label="API Call" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}

export function WebhookNode(props: NodeProps) {
  const def = getNodeDefinition('webhook')!;
  return <BaseNode {...props} icon={<WebhookIcon className="h-3.5 w-3.5" />} label="Webhook" colorClass={COLOR} inputs={def.inputs} outputs={def.outputs} />;
}
