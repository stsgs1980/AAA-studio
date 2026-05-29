/**
 * Pre-built flow templates that users can clone.
 */

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: FlowCategory;
  tags: string[];
  nodes: FlowTemplateNode[];
  edges: FlowTemplateEdge[];
}

export type FlowCategory = "agent" | "pipeline" | "rag" | "multi-agent" | "transform";

export const FLOW_CATEGORIES = [
  { id: "agent",       label: "Single Agent", color: "text-brand-accent bg-brand-accent/15" },
  { id: "pipeline",    label: "Pipeline",      color: "text-brand-green bg-brand-green/15" },
  { id: "rag",         label: "RAG",           color: "text-brand-purple bg-brand-purple/15" },
  { id: "multi-agent", label: "Multi-Agent",   color: "text-brand-amber bg-brand-amber/15" },
  { id: "transform",   label: "Transform",     color: "text-brand-cyan bg-brand-cyan/15" },
] as const;

export type FlowTemplateNode = { id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> };
export type FlowTemplateEdge = { id: string; source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null };

const SIMPLE_LLM: FlowTemplate = {
  id: "simple-llm",
  name: "Simple LLM Call",
  description: "Basic single-step LLM interaction. Send a prompt, get a response. Perfect for summarization, translation, or Q&A.",
  category: "agent", tags: ["beginner", "llm", "single-step"],
  nodes: [
    { id: "s1", type: "start", position: { x: 250, y: 50 }, data: {} },
    { id: "l1", type: "llm", position: { x: 250, y: 170 }, data: { systemPrompt: "You are a helpful assistant.", temperature: 0.7 } },
    { id: "e1", type: "end", position: { x: 250, y: 290 }, data: {} },
  ],
  edges: [
    { id: "ea", source: "s1", target: "l1" },
    { id: "eb", source: "l1", target: "e1" },
  ],
};

const CHAIN_OF_THOUGHT: FlowTemplate = {
  id: "chain-of-thought",
  name: "Chain of Thought",
  description: "Two-pass reasoning: first LLM generates step-by-step reasoning, second produces a final answer. Improves accuracy on complex problems.",
  category: "pipeline", tags: ["intermediate", "reasoning", "two-step"],
  nodes: [
    { id: "s1", type: "start", position: { x: 250, y: 50 }, data: {} },
    { id: "r1", type: "llm", position: { x: 250, y: 170 }, data: { systemPrompt: "Think step by step. Break down the problem.", temperature: 0.3 } },
    { id: "a1", type: "llm", position: { x: 250, y: 290 }, data: { systemPrompt: "Based on the reasoning, provide a clear final answer.", temperature: 0.5 } },
    { id: "e1", type: "end", position: { x: 250, y: 410 }, data: {} },
  ],
  edges: [
    { id: "ea", source: "s1", target: "r1" },
    { id: "eb", source: "r1", target: "a1" },
    { id: "ec", source: "a1", target: "e1" },
  ],
};

const PROMPT_TEMPLATE_FLOW: FlowTemplate = {
  id: "prompt-template",
  name: "Prompt Template",
  description: "Compose prompts dynamically using template variables. Define a template with placeholders, then pass to LLM. Great for reusable prompt patterns.",
  category: "pipeline", tags: ["intermediate", "templating", "variables"],
  nodes: [
    { id: "s1", type: "start", position: { x: 250, y: 40 }, data: {} },
    { id: "i1", type: "input", position: { x: 250, y: 130 }, data: { schema: { topic: "", style: "formal" } } },
    { id: "p1", type: "prompt", position: { x: 250, y: 230 }, data: { template: "Write a {{style}} article about {{topic}}. Include intro, 3 key points, conclusion." } },
    { id: "l1", type: "llm", position: { x: 250, y: 340 }, data: { systemPrompt: "You are an expert content writer.", temperature: 0.7 } },
    { id: "e1", type: "end", position: { x: 250, y: 450 }, data: {} },
  ],
  edges: [
    { id: "ea", source: "s1", target: "i1" },
    { id: "eb", source: "i1", target: "p1" },
    { id: "ec", source: "p1", target: "l1" },
    { id: "ed", source: "l1", target: "e1" },
  ],
};

const MULTI_AGENT_REVIEW: FlowTemplate = {
  id: "multi-agent-review",
  name: "Multi-Agent Review",
  description: "Two agents review content from different perspectives: technical accuracy and UX clarity. Final LLM synthesizes both reviews into actionable feedback.",
  category: "multi-agent", tags: ["advanced", "review", "collaboration"],
  nodes: [
    { id: "s1", type: "start", position: { x: 250, y: 40 }, data: {} },
    { id: "t1", type: "agent", position: { x: 80, y: 160 }, data: { role: "Technical Reviewer. Focus on accuracy, correctness, edge cases." } },
    { id: "u1", type: "agent", position: { x: 420, y: 160 }, data: { role: "UX Reviewer. Focus on clarity, readability, user experience." } },
    { id: "syn", type: "llm", position: { x: 250, y: 290 }, data: { systemPrompt: "Synthesize both reviews. Highlight agreements and conflicts.", temperature: 0.5 } },
    { id: "e1", type: "end", position: { x: 250, y: 410 }, data: {} },
  ],
  edges: [
    { id: "ea", source: "s1", target: "t1" },
    { id: "eb", source: "s1", target: "u1" },
    { id: "ec", source: "t1", target: "syn" },
    { id: "ed", source: "u1", target: "syn" },
    { id: "ee", source: "syn", target: "e1" },
  ],
};

const TRANSFORM_PIPELINE: FlowTemplate = {
  id: "transform-pipeline",
  name: "Transform Pipeline",
  description: "LLM generates text, then sequential transforms: trim whitespace and JSON stringify. Demonstrates Transform node capabilities.",
  category: "transform", tags: ["beginner", "transform", "data-processing"],
  nodes: [
    { id: "s1", type: "start", position: { x: 250, y: 40 }, data: {} },
    { id: "l1", type: "llm", position: { x: 250, y: 140 }, data: { systemPrompt: "List 3 key benefits of microservices architecture.", temperature: 0.7 } },
    { id: "tr", type: "transform", position: { x: 250, y: 250 }, data: { transform: "trim" } },
    { id: "tj", type: "transform", position: { x: 250, y: 350 }, data: { transform: "json_stringify" } },
    { id: "e1", type: "end", position: { x: 250, y: 450 }, data: {} },
  ],
  edges: [
    { id: "ea", source: "s1", target: "l1" },
    { id: "eb", source: "l1", target: "tr" },
    { id: "ec", source: "tr", target: "tj" },
    { id: "ed", source: "tj", target: "e1" },
  ],
};

const RAG_PIPELINE: FlowTemplate = {
  id: "rag-pipeline",
  name: "RAG Pipeline (Stub)",
  description: "Simulated RAG: Input provides a query, Prompt injects into retrieval template, LLM answers using context.",
  category: "rag", tags: ["advanced", "rag", "knowledge"],
  nodes: [
    { id: "s1", type: "start", position: { x: 250, y: 40 }, data: {} },
    { id: "i1", type: "input", position: { x: 250, y: 130 }, data: { schema: { query: "What is the recommended error handling approach?" } } },
    { id: "p1", type: "prompt", position: { x: 250, y: 240 }, data: { template: "Context: [Retrieved documents here]\n\nQuestion: {{query}}\n\nAnswer using the context." } },
    { id: "l1", type: "llm", position: { x: 250, y: 350 }, data: { systemPrompt: "Answer questions using only the provided context.", temperature: 0.3 } },
    { id: "e1", type: "end", position: { x: 250, y: 450 }, data: {} },
  ],
  edges: [
    { id: "ea", source: "s1", target: "i1" },
    { id: "eb", source: "i1", target: "p1" },
    { id: "ec", source: "p1", target: "l1" },
    { id: "ed", source: "l1", target: "e1" },
  ],
};

export const FLOW_TEMPLATES: FlowTemplate[] = [
  SIMPLE_LLM, CHAIN_OF_THOUGHT, PROMPT_TEMPLATE_FLOW,
  MULTI_AGENT_REVIEW, TRANSFORM_PIPELINE, RAG_PIPELINE,
];
