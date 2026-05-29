// ============================================================================
// @stsgs/prompting - System Prompt Template Data
// ============================================================================

import type { AgentType, AgentTypeVariable } from "@stsgs/shared";

// ─── Variables ────────────────────────────────────────────────

const toolCallingVars: AgentTypeVariable[] = [
  { key: "role", label: "Role", required: true, description: "Who the agent is" },
  { key: "domain", label: "Domain", required: true, description: "Area of expertise" },
  { key: "domain_rules", label: "Domain Rules", required: false, description: "Domain-specific constraints" },
];

const routerVars: AgentTypeVariable[] = [
  { key: "categories", label: "Categories", required: true, description: "JSON array of {name, description}" },
];

const specialistVars: AgentTypeVariable[] = [
  { key: "specialty", label: "Specialty", required: true, description: "Area of deep expertise" },
  { key: "role_description", label: "Role Description", required: true, description: "Detailed expertise description" },
  { key: "backstory", label: "Backstory", required: true, description: "2-3 sentences establishing credibility (CrewAI pattern)" },
  { key: "domain_tools", label: "Domain Tools", required: false, description: "Available domain-specific tools" },
  { key: "output_format", label: "Output Format", required: false, description: "Structured output format" },
];

const orchestratorVars: AgentTypeVariable[] = [
  { key: "role", label: "Role", required: true, description: "Manager role (e.g. project lead, researcher)" },
  { key: "team", label: "Team Members", required: true, description: "JSON array of {name, description}" },
  { key: "domain", label: "Domain", required: false, description: "Problem domain" },
];

const evaluatorVars: AgentTypeVariable[] = [
  { key: "output_type", label: "Output Type", required: true, description: "What is being evaluated" },
  { key: "criteria", label: "Criteria", required: true, description: "JSON array of {name, description}" },
  { key: "threshold", label: "Threshold", required: false, defaultValue: "7", description: "Minimum score to pass (1-10)" },
];

// ─── Templates ─────────────────────────────────────────────────

export const SYSTEM_PROMPT_TEMPLATES: AgentType[] = [
  {
    id: "tool-calling", name: "Tool-Calling Agent", phase: 3,
    description: "Default agent for most tasks. Uses native function calling.",
    template:
      "You are {role} with expertise in {domain}.\n\n" +
      "You have access to tools. Use them when they help answer the user's request.\n" +
      "- Call tools when you need information you don't have.\n" +
      "- You can call multiple tools in one response if independent.\n" +
      "- After receiving tool results, reason about them before responding.\n\n" +
      "{domain_rules}\n\n" +
      "Respond conversationally, citing tool results when relevant.",
    variables: toolCallingVars,
  },
  {
    id: "router", name: "Router / Classifier", phase: 3,
    description: "Classifies input and routes to specialist agents. Short, decisive.",
    template:
      "You are a routing agent that classifies user requests.\n\n" +
      "Analyze the user's message and classify it into exactly one category.\n\n" +
      "Categories:\n{categories}\n\n" +
      "Output ONLY the category name. No explanation.\n" +
      "If unsure, choose the closest match.",
    variables: routerVars,
  },
  {
    id: "specialist", name: "Specialist (CrewAI-style)", phase: 3,
    description: "Role + Goal + Backstory. Backstory dramatically affects quality.",
    template:
      "You are a specialist in {specialty} on a team.\n\n" +
      "Role: {role_description}\nBackstory: {backstory}\n\n" +
      "You will receive specific subtasks to execute. Complete them to the best of your ability.\n\n" +
      "{domain_tools}\n\n" +
      "Focus on your area of expertise.\n" +
      "If a task is outside your expertise, say so.\n" +
      "Provide detailed, accurate results.\n\nOutput format: {output_format}",
    variables: specialistVars,
  },
  {
    id: "orchestrator", name: "Orchestrator + Workers", phase: 3,
    description: "Most powerful multi-agent pattern. Delegates, executes, synthesizes.",
    template:
      "You are a {role} manager overseeing a team of specialists.\n\n" +
      "Analyze the user's request, break it into subtasks, and delegate.\n\n" +
      "Your team members:\n{team}\n\n" +
      "Delegation protocol:\n" +
      "1. Identify which subtasks are needed.\n" +
      "2. For each subtask, select the best team member.\n" +
      "3. Delegate with a clear, specific instruction.\n" +
      "4. After all subtasks complete, synthesize results.\n\n" +
      "Delegate one subtask at a time. Each delegation should be self-contained.\n" +
      "If a result is unsatisfactory, re-delegate with better instructions.\n\n" +
      "Present the final synthesized answer to the user.",
    variables: orchestratorVars,
  },
  {
    id: "evaluator", name: "Evaluator", phase: 3,
    description: "Generates, scores against criteria, provides feedback, loops.",
    template:
      "You are a quality evaluator for {output_type}.\n\n" +
      "Evaluate the following {output_type} against these criteria:\n{criteria}\n\n" +
      "Score: [1-10]\nFeedback: [specific, actionable feedback for improvement]\n" +
      "Pass: [yes/no]\n\n" +
      "Be specific and constructive in feedback.\n" +
      "Only pass if score >= {threshold}.",
    variables: evaluatorVars,
  },
];
