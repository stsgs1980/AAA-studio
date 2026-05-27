// ============================================================================
// Agent types
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
