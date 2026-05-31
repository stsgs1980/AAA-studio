// ============================================================================
// @stsgs/shared - Constants
// ============================================================================

import type { RoleGroup, NodeType, NodeCategory, NavItem, ConnectionType } from "../types";

/** Role group definitions */
export const ROLE_GROUPS: Record<RoleGroup, { label: string; color: string }> = {
  orchestrator: { label: "Orchestrator", color: "hsl(280, 70%, 50%)" },
  planner: { label: "Planner", color: "hsl(200, 70%, 50%)" },
  researcher: { label: "Researcher", color: "hsl(160, 70%, 50%)" },
  coder: { label: "Coder", color: "hsl(120, 70%, 50%)" },
  reviewer: { label: "Reviewer", color: "hsl(40, 70%, 50%)" },
  tester: { label: "Tester", color: "hsl(0, 70%, 50%)" },
  deployer: { label: "Deployer", color: "hsl(320, 70%, 50%)" },
  specialist: { label: "Specialist", color: "hsl(240, 70%, 50%)" },
};

/** Node type definitions */
export const NODE_TYPES: Record<
  NodeType,
  { label: string; category: NodeCategory; color: string }
> = {
  // AI / LLM
  llm: { label: "LLM", category: "ai", color: "hsl(280, 70%, 50%)" },
  prompt: { label: "Prompt", category: "ai", color: "hsl(280, 60%, 55%)" },
  chain: { label: "Chain", category: "ai", color: "hsl(280, 50%, 60%)" },
  router: { label: "Router", category: "ai", color: "hsl(260, 70%, 50%)" },
  rag: { label: "RAG", category: "ai", color: "hsl(260, 60%, 55%)" },
  // Management
  agent: { label: "Agent", category: "management", color: "hsl(200, 70%, 50%)" },
  orchestrator: {
    label: "Orchestrator",
    category: "management",
    color: "hsl(200, 60%, 55%",
  },
  "human-in-the-loop": {
    label: "Human",
    category: "management",
    color: "hsl(200, 50%, 60%",
  },
  condition: {
    label: "Condition",
    category: "management",
    color: "hsl(180, 70%, 50%",
  },
  // Data
  input: { label: "Input", category: "data", color: "hsl(120, 70%, 50%)" },
  output: { label: "Output", category: "data", color: "hsl(120, 60%, 55%)" },
  transform: {
    label: "Transform",
    category: "data",
    color: "hsl(120, 50%, 60%",
  },
  filter: { label: "Filter", category: "data", color: "hsl(100, 70%, 50%)" },
  // Knowledge
  embedding: {
    label: "Embedding",
    category: "knowledge",
    color: "hsl(40, 70%, 50%",
  },
  "vector-store": {
    label: "VectorStore",
    category: "knowledge",
    color: "hsl(40, 60%, 55%",
  },
  // Integration
  api: { label: "API", category: "integration", color: "hsl(0, 70%, 50%)" },
  webhook: { label: "Webhook", category: "integration", color: "hsl(0, 60%, 55%)" },
  // Special
  start: { label: "Start", category: "special", color: "hsl(160, 70%, 50%)" },
  end: { label: "End", category: "special", color: "hsl(0, 0%, 40%)" },
  error: { label: "Error", category: "special", color: "hsl(0, 80%, 50%)" },
};

/** Navigation items for sidebar */
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Flow Editor", href: "/editor", icon: "Workflow" },
  { title: "Templates", href: "/templates", icon: "Layers" },
  { title: "Agents", href: "/agents", icon: "Bot" },
  { title: "Hierarchy", href: "/hierarchy", icon: "Network" },
  { title: "Pipelines", href: "/pipelines", icon: "GitBranch" },
  { title: "Prompt Studio", href: "/prompt-studio", icon: "Sparkles" },
  { title: "Knowledge Base", href: "/knowledge", icon: "BookOpen" },
  { title: "Skill Forge", href: "/skills-page", icon: "Wrench" },
  { title: "Standards", href: "/standards", icon: "Shield" },
  { title: "Audit Log", href: "/audit", icon: "ScrollText" },
  { title: "Settings", href: "/settings", icon: "Settings" },
];

/** Edge visual types */
export const EDGE_TYPES = ["smoothstep", "bezier", "straight", "animated"] as const;

/** Connection type keys */
export const CONNECTION_TYPES: ConnectionType[] = [
  "command", "sync", "twin", "delegate", "feedback", "supervise", "broadcast",
];

export {
  CONNECTION_TYPE_CONFIG,
  isDataTypeCompatible,
} from "./connection-types";

/** Cognitive formulas list */
export const COGNITIVE_FORMULAS = [
  "RTF",
  "RISE",
  "CARE",
  "STONE",
  "CREATE",
  "TRACE",
  "SCOPE",
  "PACKED",
  "CO-STAR",
  "CHAIN",
  "CARVE",
  "SPARK",
  "BRIDGE",
  "TUNE",
  "REVERSE",
  "CRAFT",
  "FUSE",
  "ALIGN",
  "PRISM",
  "FLUX",
] as const;
