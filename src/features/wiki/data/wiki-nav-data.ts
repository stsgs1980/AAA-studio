export interface WikiNavItem {
  id: string;
  title: string;
  category: string;
  keywords: string[];
}

export const wikiCategories = [
  "Getting Started",
  "Agent Architecture",
  "Prompt Engineering",
  "Workflow Design",
  "Export & Integration",
] as const;

export const wikiNavItems: WikiNavItem[] = [
  { id: "overview", title: "Overview", category: "Getting Started", keywords: ["3a studio", "pmas", "multi-agent", "ide", "visual"] },
  { id: "quick-start", title: "Quick Start", category: "Getting Started", keywords: ["setup", "install", "first agent", "getting started", "tutorial"] },
  { id: "key-concepts", title: "Key Concepts", category: "Getting Started", keywords: ["agents", "hierarchy", "edges", "orchestration", "concepts"] },
  { id: "hierarchy-model", title: "Hierarchy Model", category: "Agent Architecture", keywords: ["layers", "supervisor", "coordinator", "manager", "worker", "levels"] },
  { id: "role-groups", title: "Role Groups", category: "Agent Architecture", keywords: ["strategy", "tactics", "execution", "control", "memory", "roles"] },
  { id: "scoring-formulas", title: "Scoring Formulas", category: "Agent Architecture", keywords: ["quality", "score", "metrics", "evaluation", "formulas"] },
  { id: "edge-types", title: "Edge Types", category: "Agent Architecture", keywords: ["command", "sync", "twin", "delegate", "feedback", "connections"] },
  { id: "prompt-structure", title: "Prompt Structure", category: "Prompt Engineering", keywords: ["system prompt", "context", "instructions", "template", "format"] },
  { id: "quality-scoring", title: "Quality Scoring", category: "Prompt Engineering", keywords: ["dimensions", "clarity", "specificity", "coherence", "6 dimensions"] },
  { id: "templates-wiki", title: "Templates", category: "Prompt Engineering", keywords: ["prebuilt", "ready", "library", "prompt templates"] },
  { id: "pipelines-wiki", title: "Pipelines", category: "Workflow Design", keywords: ["execution", "flow", "steps", "automated", "sequence"] },
  { id: "orchestration", title: "Orchestration", category: "Workflow Design", keywords: ["coordination", "multi-agent", "error handling", "retry", "governance"] },
  { id: "export-formats", title: "Export Formats", category: "Export & Integration", keywords: ["json", "yaml", "markdown", "download", "export"] },
  { id: "rest-api", title: "REST API", category: "Export & Integration", keywords: ["endpoints", "http", "requests", "authentication", "integration"] },
  { id: "quality-analyzer", title: "Quality Analyzer", category: "Workflow Design", keywords: ["qa", "testing", "analysis", "scoring", "deep analysis", "rubric", "evaluation"] },
  { id: "stsdev-vision", title: "STSDev Vision", category: "Getting Started", keywords: ["vision", "strategy", "competitive", "roadmap", "milestones"] },
];
