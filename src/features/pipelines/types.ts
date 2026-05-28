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
  model?: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  cost?: number;
}

export interface UsageSummary {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCost: number;
  modelsUsed: string[];
}

export interface ExecutionResult {
  executionId: string;
  success: boolean;
  results: NodeResult[];
  usage?: UsageSummary;
  error?: string;
}
