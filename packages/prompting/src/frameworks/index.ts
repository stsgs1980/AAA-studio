// ============================================================================
// @stsgs/prompting - Prompting frameworks
// ============================================================================

export type FrameworkType = "structured" | "conversational" | "constraint" | "chain" | "meta";

export interface Framework {
  id: string;
  name: string;
  type: FrameworkType;
  description: string;
  sections: FrameworkSection[];
}

export interface FrameworkSection {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
}

/** Popular prompting frameworks */
export const FRAMEWORKS: Framework[] = [
  {
    id: "rtf",
    name: "Role-Task-Format",
    type: "structured",
    description: "Simple 3-part structure: assign a role, define the task, specify the output format.",
    sections: [
      { id: "role", label: "Role", placeholder: "You are a senior TypeScript developer...", required: true },
      { id: "task", label: "Task", placeholder: "Write a function that validates email addresses...", required: true },
      { id: "format", label: "Output Format", placeholder: "Return a TypeScript function with JSDoc...", required: false },
    ],
  },
  {
    id: "co-star",
    name: "CO-STAR",
    type: "structured",
    description: "Complete 6-part framework for professional prompts with tone and audience control.",
    sections: [
      { id: "context", label: "Context", placeholder: "Background information...", required: true },
      { id: "objective", label: "Objective", placeholder: "What you want to achieve...", required: true },
      { id: "style", label: "Style", placeholder: "Professional, casual, academic...", required: false },
      { id: "tone", label: "Tone", placeholder: "Formal, friendly, authoritative...", required: false },
      { id: "audience", label: "Audience", placeholder: "Who will read this...", required: false },
      { id: "response", label: "Response Format", placeholder: "Bullet points, essay, code...", required: false },
    ],
  },
  {
    id: "chain-of-thought",
    name: "Chain of Thought",
    type: "chain",
    description: "Sequential reasoning pattern that forces step-by-step thinking.",
    sections: [
      { id: "question", label: "Question / Problem", placeholder: "What needs to be solved...", required: true },
      { id: "steps", label: "Thinking Steps", placeholder: "Step 1: ... Step 2: ...", required: true },
    ],
  },
  {
    id: "few-shot",
    name: "Few-Shot Learning",
    type: "meta",
    description: "Provide examples of input/output pairs to teach the model the desired pattern.",
    sections: [
      { id: "instruction", label: "Instruction", placeholder: "Classify the sentiment of each review...", required: true },
      { id: "examples", label: "Examples", placeholder: "Review: 'Great product!' -> Positive", required: true },
      { id: "input", label: "New Input", placeholder: "Review: 'Not worth the money' -> ?", required: true },
    ],
  },
];

/** Get framework by ID */
export function getFramework(id: string): Framework | undefined {
  return FRAMEWORKS.find((f) => f.id === id);
}

/** Build prompt from framework and values */
export function buildFromFramework(
  frameworkId: string,
  values: Record<string, string>
): string {
  const framework = getFramework(frameworkId);
  if (!framework) return "";

  return framework.sections
    .filter((s) => s.required || values[s.id])
    .map((s) => {
      const value = values[s.id];
      if (!value) return `## ${s.label}\n${s.placeholder}`;
      return `## ${s.label}\n${value}`;
    })
    .join("\n\n");
}
