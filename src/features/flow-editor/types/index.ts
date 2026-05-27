import type { Node, Edge } from '@xyflow/react';
import type { NodeType, NodeCategory } from '@stsgs/shared';

/** Handle configuration for a node port */
export interface HandleConfig {
  id: string;
  label: string;
  type: 'input' | 'output';
  dataType?: string;
}

/** Node type definition for the registry */
export interface NodeTypeDefinition {
  type: NodeType;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  colorClass: string;
  defaultData: Record<string, unknown>;
  inputs: HandleConfig[];
  outputs: HandleConfig[];
}

/** Execution status of a single node */
export type NodeExecutionStatus = 'idle' | 'running' | 'completed' | 'failed';

/** Single node execution record */
export interface NodeExecution {
  id: string;
  nodeId: string;
  status: NodeExecutionStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  duration?: number;
  startedAt: number;
  completedAt?: number;
}

/** Full flow execution record */
export interface FlowExecution {
  id: string;
  flowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  nodeExecutions: NodeExecution[];
  startedAt: number;
  completedAt?: number;
  error?: string;
}

/** Auto-backup snapshot stored in localStorage */
export interface FlowBackup {
  flowId: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  savedAt: number;
}

/** Category display metadata for the sidebar */
export interface CategoryInfo {
  category: NodeCategory;
  label: string;
  colorClass: string;
}

/** All 6 node categories with display info */
export const NODE_CATEGORIES: CategoryInfo[] = [
  { category: 'ai', label: 'AI / LLM', colorClass: 'bg-blue-600' },
  { category: 'management', label: 'Management', colorClass: 'bg-purple-600' },
  { category: 'data', label: 'Data', colorClass: 'bg-emerald-600' },
  { category: 'knowledge', label: 'Knowledge', colorClass: 'bg-amber-600' },
  { category: 'integration', label: 'Integration', colorClass: 'bg-orange-600' },
  { category: 'special', label: 'Special', colorClass: 'bg-slate-600' },
];
