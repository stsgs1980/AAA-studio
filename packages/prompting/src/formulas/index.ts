// ============================================================================
// @stsgs/prompting - Cognitive formulas
// ============================================================================

export interface Formula {
  id: string;
  name: string;
  acronym: string;
  description: string;
  template: string;
  category: "structure" | "chain" | "constraint" | "meta" | "creative";
}

export const FORMULAS: Formula[] = [
  {
    id: "rtf",
    name: "Role-Task-Format",
    acronym: "RTF",
    description: "Assign a role, define the task, specify output format",
    template: "You are a {role}.\n\nTask: {task}\n\nOutput format: {format}",
    category: "structure",
  },
  {
    id: "rise",
    name: "Role-Input-Steps-Expectation",
    acronym: "RISE",
    description: "Role, input context, step-by-step instructions, expected output",
    template:
      "Role: {role}\nInput: {input}\nSteps:\n1. {step1}\n2. {step2}\nExpectation: {expectation}",
    category: "structure",
  },
  {
    id: "care",
    name: "Context-Action-Result-Example",
    acronym: "CARE",
    description: "Provide context, define action, describe result, give example",
    template:
      "Context: {context}\nAction: {action}\nResult: {result}\nExample: {example}",
    category: "structure",
  },
  {
    id: "stone",
    name: "System-Task-Objective-Notes-Example",
    acronym: "STONE",
    description: "System role, task, objective, notes/constraints, example",
    template:
      "System: {system}\nTask: {task}\nObjective: {objective}\nNotes: {notes}\nExample: {example}",
    category: "structure",
  },
  {
    id: "create",
    name: "Context-Request-Explanation-Action-Tone-Extra",
    acronym: "CREATE",
    description: "Full context setup with tone control and extras",
    template:
      "Context: {context}\nRequest: {request}\nExplanation: {explanation}\nAction: {action}\nTone: {tone}\nExtra: {extra}",
    category: "structure",
  },
  {
    id: "co-star",
    name: "Context-Objective-Style-Tone-Audience-Response",
    acronym: "CO-STAR",
    description: "Complete framework for professional prompts",
    template:
      "Context: {context}\nObjective: {objective}\nStyle: {style}\nTone: {tone}\nAudience: {audience}\nResponse: {response}",
    category: "structure",
  },
  {
    id: "chain",
    name: "Chain of Thought",
    acronym: "CHAIN",
    description: "Sequential reasoning with explicit thinking steps",
    template: "{question}\n\nThink step by step:\n1. {step1}\n2. {step2}\n...",
    category: "chain",
  },
  {
    id: "trace",
    name: "Trace Reasoning",
    acronym: "TRACE",
    description: "Trace through each possibility and evaluate",
    template: "Problem: {problem}\n\nTrace each option:\nA. {optionA} -> {outcomeA}\nB. {optionB} -> {outcomeB}\nConclusion: {conclusion}",
    category: "chain",
  },
  {
    id: "scope",
    name: "Scope-Constraints-Output-Prerequisites-Examples",
    acronym: "SCOPE",
    description: "Define boundaries, constraints, output, prerequisites, examples",
    template:
      "Scope: {scope}\nConstraints: {constraints}\nOutput: {output}\nPrerequisites: {prerequisites}\nExamples: {examples}",
    category: "constraint",
  },
  {
    id: "packed",
    name: "Purpose-Action-Context-Key details-Examples-Draft direction",
    acronym: "PACKED",
    description: "Dense prompt structure maximizing information density",
    template:
      "Purpose: {purpose}\nAction: {action}\nContext: {context}\nKey: {key}\nExamples: {examples}\nDraft: {draft}",
    category: "structure",
  },
];

/** Get formula by ID */
export function getFormula(id: string): Formula | undefined {
  return FORMULAS.find((f) => f.id === id);
}

/** Get formulas by category */
export function getFormulasByCategory(category: Formula["category"]): Formula[] {
  return FORMULAS.filter((f) => f.category === category);
}
