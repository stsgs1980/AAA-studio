export interface Flow {
  id: string;
  name: string;
  description: string;
  status: string;
  version: number;
  nodes: string;
  edges: string;
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: string;
  flowId: string;
  status: "pending" | "running" | "completed" | "failed";
  result: string | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface NodeResult {
  nodeId: string;
  nodeType: string;
  status: "completed" | "failed";
  output?: Record<string, unknown>;
  error?: string;
  duration: number;
}

export interface ExecutionResult {
  executionId: string;
  success: boolean;
  results: NodeResult[];
  error?: string;
}
