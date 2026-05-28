import { WikiCallout } from "../components/wiki-callout";
import { WikiCodeBlock } from "../components/wiki-code-block";

export function HierarchyModelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Hierarchy Model
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          5-layer agent organization
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        3A Studio uses a 5-layer hierarchy to enforce clear delegation and
        separation of concerns. Each layer has specific responsibilities,
        authority boundaries, and communication patterns with adjacent layers.
      </p>

      <WikiCodeBlock
        code={`         [Supervisor]          L5 - Governance & Strategy
              /            \\
      [Coordinator]    [Coordinator]    L4 - Cross-team Routing
          /      \\        /      \\
    [Manager] [Manager] [Manager]     L3 - Task Decomposition
       /    \\      /    \\
   [Worker] [Worker] [Worker]        L2 - Single-task Execution
      |        |        |
   [Tool]   [Tool]   [Tool]          L1 - Atomic Functions`}
        language="text"
        title="Hierarchy diagram"
      />

      <div className="grid gap-4">
        {[
          { layer: "L5 Supervisor", desc: "Top-level governance. Defines system goals, approves execution plans, and handles escalation. Only one Supervisor per system." },
          { layer: "L4 Coordinator", desc: "Routes requests across teams. Manages cross-functional dependencies and ensures consistency between Manager groups." },
          { layer: "L3 Manager", desc: "Decomposes high-level tasks into subtasks. Assigns work to Workers, monitors progress, and aggregates results." },
          { layer: "L2 Worker", desc: "Executes a single task using its system prompt and available tools. The most common agent type in a hierarchy." },
          { layer: "L1 Tool", desc: "Atomic function calls with no reasoning. Tools are invoked by Workers and return structured data responses." },
        ].map((item) => (
          <div key={item.layer} className="rounded-md border border-midnight-border p-3">
            <p className="mb-1 text-sm font-medium text-brand-accent">
              {item.layer}
            </p>
            <p className="text-sm text-text-secondary">{item.desc}</p>
          </div>
        ))}
      </div>

      <WikiCallout variant="tip" title="Flexibility">
        Not every system needs all 5 layers. A simple chatbot might only use
        Worker + Tool. The hierarchy is a guideline, not a mandate. Build only
        the layers your use case requires.
      </WikiCallout>

      <WikiCodeBlock
        code={`{
  "layers": {
    "supervisor": { "maxAgents": 1, "role": "strategy" },
    "coordinator": { "maxAgents": 5, "role": "tactics" },
    "manager": { "maxAgents": 20, "role": "control" },
    "worker": { "maxAgents": 100, "role": "execution" },
    "tool": { "maxAgents": 500, "role": "execution" }
  }
}`}
        language="json"
        title="Hierarchy config"
      />
    </div>
  );
}
