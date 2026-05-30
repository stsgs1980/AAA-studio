import { WikiCallout } from "../components/wiki-callout";
import { WikiCodeBlock } from "../components/wiki-code-block";

export function PromptStructurePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Prompt Structure
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Anatomy of an effective system prompt
        </p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        In 3A Studio, every agent is driven by its system prompt. A well-structured
        prompt follows a consistent anatomy that the scoring engine can evaluate.
        Understanding this structure is essential for building high-quality agents.
      </p>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">
          Prompt Anatomy
        </h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-medium text-brand-accent shrink-0">Role</span>
            <span>Who the agent is and what authority it has</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-brand-accent shrink-0">Context</span>
            <span>Background information the agent needs to operate</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-brand-accent shrink-0">Instructions</span>
            <span>Step-by-step directives for task execution</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-brand-accent shrink-0">Constraints</span>
            <span>Boundaries, forbidden actions, and output format rules</span>
          </li>
          <li className="flex gap-2">
            <span className="font-medium text-brand-accent shrink-0">Examples</span>
            <span>Few-shot demonstrations of expected behavior</span>
          </li>
        </ul>
      </div>

      <WikiCallout variant="info" title="Context Injection">
        The orchestration engine can inject dynamic context into prompts at
        runtime, including hierarchy position, sibling agent state, knowledge
        base results, and execution history. Use template variables like
        {" {context.memory} "} and {" {context.hierarchy} "} to enable injection.
      </WikiCallout>

      <WikiCodeBlock
        code={`# Role
You are a senior code reviewer specializing in TypeScript and React.

# Context
You are part of a 3A Studio hierarchy at the Worker layer.
Your parent Manager handles the overall code review pipeline.

# Instructions
1. Analyze the provided code for correctness, performance, and style.
2. Identify any bugs, anti-patterns, or security issues.
3. Rate each issue by severity: critical, warning, suggestion.
4. Provide specific line references and fix recommendations.

# Constraints
- Only review the code provided, do not request additional files.
- Output must be valid JSON matching the review schema.
- Do not suggest refactors unrelated to the reported issues.`}
        language="markdown"
        title="Structured system prompt example"
      />
    </div>
  );
}
