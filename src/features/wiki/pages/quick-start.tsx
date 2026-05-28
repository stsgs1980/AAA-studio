import { WikiCallout } from "../components/wiki-callout";
import { WikiCodeBlock } from "../components/wiki-code-block";

export function QuickStartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Quick Start Guide
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Build and run your first agent in under 5 minutes
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Step 1: Create Your First Agent
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Navigate to the Agents page and click &quot;New Agent&quot;. Give it a name,
          select a role group (e.g., Execution), and choose the target LLM model.
          The system will scaffold a basic agent configuration for you.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Step 2: Write the System Prompt
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          In the Prompt Studio, compose your agent&apos;s system prompt. Use structured
          sections for Role, Context, Instructions, and Constraints. The quality
          scoring engine will evaluate your prompt in real time across six
          dimensions.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Step 3: Place in the Hierarchy
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Open the Hierarchy page and assign your agent to a layer. Workers report
          to Managers, who report to Coordinators, who report to the Supervisor.
          Connect agents with typed edges (Command, Sync, Twin, Delegate, Feedback).
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Step 4: Run Your First Execution
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Click &quot;Execute&quot; on the agent detail page. The orchestrator will route
          the request through the hierarchy, collect responses, and display the
          execution trace in real time.
        </p>
      </div>

      <WikiCallout variant="tip" title="Keyboard Shortcuts">
        Press <kbd className="rounded bg-midnight-elevated px-1.5 py-0.5 text-xs font-mono text-text-primary">Ctrl+K</kbd> to open the Wiki drawer from any page. Use
        it to quickly look up documentation without leaving your workflow.
      </WikiCallout>

      <WikiCodeBlock
        code={`{
  "name": "Research Assistant",
  "role": "execution",
  "model": "gpt-4o",
  "layer": "worker",
  "systemPrompt": "You are a research assistant...",
  "temperature": 0.7,
  "maxTokens": 4096
}`}
        language="json"
        title="Example agent config"
      />
    </div>
  );
}
