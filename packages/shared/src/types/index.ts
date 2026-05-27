// ============================================================================
// @stsgs/shared - Core types for 3A Studio
// ============================================================================

/** Agent role group from Zai-agent-toolkit */
export type RoleGroup =
  | "orchestrator"
  | "planner"
  | "researcher"
  | "coder"
  | "reviewer"
  | "tester"
  | "deployer"
  | "specialist";

/** Agent model configuration */
export interface AgentModel {
  id: string;
  name: string;
  role: string;
  group: RoleGroup;
  status: "active" | "inactive" | "draft";
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
  skills: string[];
  standards: string[];
  parentId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
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
  label?: string;
}

/** Pipeline execution */
export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  result?: Record<string, unknown>;
  error?: string;
}

/** Knowledge collection */
export interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Knowledge document */
export interface KnowledgeDocument {
  id: string;
  collectionId: string;
  title: string;
  content: string;
  fileType: "pdf" | "txt" | "md" | "docx";
  tags: string[];
  createdAt: Date;
}

/** Audit log entry */
export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

/** Prompt template */
export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  framework?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Skill definition */
export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  code: string;
  tests?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Standard definition */
export interface Standard {
  id: string;
  name: string;
  category: string;
  description: string;
  rules: StandardRule[];
  severity: "info" | "warning" | "error";
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StandardRule {
  id: string;
  name: string;
  description: string;
  pattern?: string;
}

/** Dashboard KPI */
export interface KpiMetric {
  label: string;
  value: number;
  change?: number;
  unit?: string;
  icon?: string;
}

/** Navigation item for sidebar */
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}
