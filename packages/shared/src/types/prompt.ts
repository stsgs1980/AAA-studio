// ============================================================================
// @stsgs/shared - Prompting types
// ============================================================================

/** Prompt template (DB entity) */
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
export interface PromptContext {
  role: string;
  domain: string;
  audience: string;
  tone: PromptTone;
  language: string;
  constraints: string[];
  outputFormat: OutputFormat;
}

export type PromptTone =
  | "professional" | "casual" | "technical"
  | "creative" | "authoritative" | "empathetic" | "neutral";

export type OutputFormat =
  | "json" | "markdown" | "plain-text" | "code"
  | "html" | "yaml" | "table" | "list" | "conversation";
export interface PromptBlock {
  layer: SystemPromptLayer;
  content: string;
  weight: number;
  optional: boolean;
}

export type SystemPromptLayer =
  | "identity" | "context" | "constraints" | "output" | "behavior";

// -- Techniques ------------------------
export interface PromptTechnique {
  id: string;
  name: string;
  description: string;
  category: TechniqueCategory;
  applicableTo: OutputFormat[];
  difficulty: "beginner" | "intermediate" | "advanced";
  example: string;
}

export type TechniqueCategory =
  | "clarity" | "reasoning" | "constraint"
  | "role-play" | "formatting" | "meta" | "chain-of-thought"
  | "architecture";

// -- Frameworks -----------------------
export interface PromptFramework {
  id: string;
  name: string;
  acronym: string;
  description: string;
  steps: FrameworkStep[];
  bestFor: string[];
  complexity: "simple" | "moderate" | "complex";
}

export interface FrameworkStep {
  label: string;
  description: string;
  required: boolean;
  placeholder: string;
}

// -- Agent Types (10 patterns) -----------------

export type AgentTypeId =
  | "tool-calling" | "router" | "specialist" | "orchestrator" | "evaluator"
  | "react" | "plan-and-execute" | "prompt-chaining"
  | "autonomous" | "parallel-voting";

export interface AgentType {
  id: AgentTypeId;
  name: string;
  phase: number;
  description: string;
  template: string;
  variables: AgentTypeVariable[];
}

export interface AgentTypeVariable {
  key: string;
  label: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

export interface AgentRole {
  id: string;
  name: string;
  systemPrompt: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  temperature: number;
  maxTokens: number;
}

// -- Builder Types -----------------------

export interface ToolDescriptionDef {
  name: string;
  description: string;
  parameters: ToolParameter[];
  whenToUse: string;
  edgeCases?: string[];
}

export interface ToolParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface BackstoryDef {
  role: string;
  expertise: string;
  approach: string;
  personality: string;
  constraints: string[];
}

export interface EvaluationCriterion {
  name: string;
  description: string;
  weight: number;
  scoringGuide: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  handoffFormat?: string;
}
