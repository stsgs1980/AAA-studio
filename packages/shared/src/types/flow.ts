// ============================================================================
// Flow (visual pipeline) types
// ============================================================================

/** Flow node data */
export type NodeCategory =
  | "ai"
  | "management"
  | "data"
  | "knowledge"
  | "integration"
  | "special";

export type NodeType =
  | "llm"
  | "prompt"
  | "chain"
  | "router"
  | "rag"
  | "agent"
  | "orchestrator"
  | "human-in-the-loop"
  | "condition"
  | "input"
  | "output"
  | "transform"
  | "filter"
  | "embedding"
  | "vector-store"
  | "api"
  | "webhook"
  | "start"
  | "end"
  | "error";

/** Semantic connection type between nodes */
export type ConnectionType =
  | "command"
  | "sync"
  | "twin"
  | "delegate"
  | "feedback"
  | "supervise"
  | "broadcast";

/** Data type flowing through a handle/port */
export type DataType =
  | "text"
  | "json"
  | "embedding"
  | "query"
  | "results"
  | "any";

export interface FlowNode {
  id: string;
  type: NodeType;
  category: NodeCategory;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  label?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: "smoothstep" | "bezier" | "straight" | "animated";
  /** Semantic connection type — defines communication pattern */
  connectionType?: ConnectionType;
  label?: string;
}

/** Flow (visual pipeline) */
export interface Flow {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: "draft" | "active" | "archived";
  nodes: FlowNode[];
  edges: FlowEdge[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/** Flow version for history tracking */
export interface FlowVersion {
  id: string;
  flowId: string;
  version: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  description?: string;
  createdAt: Date;
}
