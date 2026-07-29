/** Format adapters -- convert 3A Studio Skill into OpenAI/MCP/A2A formats. */

interface SkillData {
  name: string; slug: string; version: string; skillId: string;
  category: string; description: string;
  inputSchema: Record<string, unknown>; outputSchema: Record<string, unknown>;
  triggers: string[]; tags: string[];
  compatibility: string; dependencies: { skillId: string; version: string }[];
  annotations: Record<string, boolean>; author: string; license: string;
}

// -- OpenAI Function Calling --
// https://platform.openai.com/docs/guides/function-calling

export interface OpenAIToolDef {
  type: "function"; function: { name: string; description: string; parameters: Record<string, unknown> };
}

export function toOpenAITools(skill: SkillData): OpenAIToolDef {
  return { type: "function", function: { name: skill.slug.replace(/-/g, "_"), description: skill.description || `${skill.category}: ${skill.name}`, parameters: skill.inputSchema } };
}

export function toOpenAIToolsArray(skills: SkillData[]): OpenAIToolDef[] { return skills.map(toOpenAITools); }

// -- MCP (Model Context Protocol) Tool format --
// https://spec.modelcontextprotocol.io/specification/basic/tools/

export interface MCPAnnotation { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean; }
export interface MCPToolDef { name: string; description: string; inputSchema: Record<string, unknown>; annotations?: MCPAnnotation; }

export function toMCPTools(skill: SkillData): MCPToolDef {
  const a = skill.annotations;
  const has = a && (a.readOnlyHint !== undefined || a.destructiveHint !== undefined || a.idempotentHint !== undefined || a.openWorldHint !== undefined);
  return {
    name: skill.slug, description: skill.description || `${skill.category}: ${skill.name}`, inputSchema: skill.inputSchema,
    ...(has ? { annotations: { readOnlyHint: a.readOnlyHint ?? false, destructiveHint: a.destructiveHint ?? false, idempotentHint: a.idempotentHint ?? false, openWorldHint: a.openWorldHint ?? false } } : {}),
  };
}

export function toMCPToolsArray(skills: SkillData[]): MCPToolDef[] { return skills.map(toMCPTools); }

// -- A2A (Agent-to-Agent) Agent Card --
// https://github.com/google/A2A

export interface A2ASkillDef { id: string; name: string; description: string; tags: string[]; }
export interface A2ACard {
  name: string; description: string; url: string; version: string;
  capabilities: { streaming: boolean; pushNotifications: boolean; stateTransitionHistory: boolean };
  skills: A2ASkillDef[]; provider: { organization: string; url: string };
}

export function toA2ACard(agent: { name: string; role: string; description: string; skills: SkillData[] }): A2ACard {
  return {
    name: agent.name, description: agent.description || agent.role, url: "", version: "1.0.0",
    capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
    skills: agent.skills.map((s) => ({ id: s.slug, name: s.name, description: s.description, tags: [...s.tags, ...s.triggers] })),
    provider: { organization: "3A Studio", url: "https://github.com/stsgs1980/AAA-studio" },
  };
}

/** Parse DB record to SkillData */
export function parseSkillToData(s: {
  name: string; slug: string; version: string; skillId: string;
  category: string; description: string;
  inputSchema: string; outputSchema: string;
  triggers: string; tags: string;
  compatibility: string; dependencies: string;
  annotations: string; author: string; license: string;
}): SkillData {
  return {
    name: s.name, slug: s.slug, version: s.version, skillId: s.skillId,
    category: s.category, description: s.description,
    inputSchema: JSON.parse(s.inputSchema), outputSchema: JSON.parse(s.outputSchema),
    triggers: JSON.parse(s.triggers), tags: JSON.parse(s.tags),
    compatibility: s.compatibility, dependencies: JSON.parse(s.dependencies),
    annotations: JSON.parse(s.annotations), author: s.author, license: s.license,
  };
}
