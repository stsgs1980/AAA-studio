// ============================================================================
// @stsgs/shared - Core types for 3A Studio
// Re-exports from domain modules
// ============================================================================

export type { RoleGroup, AgentModel } from "./agent";
export type {
  NodeCategory, NodeType, FlowNode, FlowEdge, Flow, FlowVersion,
  ConnectionType, DataType,
} from "./flow";
export type { PipelineExecution } from "./pipeline";
export type { KnowledgeCollection, KnowledgeDocument } from "./knowledge";
export type { PromptTemplate } from "./prompt";
export type {
  PromptContext, PromptTone, OutputFormat, PromptBlock, SystemPromptLayer,
  PromptTechnique, TechniqueCategory,
  PromptFramework, FrameworkStep,
  AgentTypeId, AgentType, AgentTypeVariable,
  AgentRole,
  ToolDescriptionDef, ToolParameter,
  BackstoryDef,
  EvaluationCriterion,
  TeamMember,
} from "./prompt";
export type { Skill, SkillFile, SkillFileLanguage, SkillFileRole } from "./skill";
export { SKILL_FILE_ROLES, SKILL_FILE_LANGUAGES, detectLanguage, detectRole } from "./skill";
export type { Standard, StandardRule, StandardSeverity, StandardCategory } from "./standard";
export { SEVERITY_OPTIONS, STANDARD_CATEGORIES, SKILL_CATEGORIES, generateRuleId } from "./standard";
export type { KpiMetric, NavItem } from "./dashboard";
export type { AuditEntry } from "./audit";
