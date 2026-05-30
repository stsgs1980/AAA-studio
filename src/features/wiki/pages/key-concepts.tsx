import { WikiCallout } from "../components/wiki-callout";

export function KeyConceptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Key Concepts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The building blocks of 3A Studio
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">Agents</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Agents are autonomous units defined by a system prompt, a role group, and
          a target LLM. Each agent has configurable parameters (temperature,
          max tokens, model selection) and belongs to exactly one hierarchy layer.
          Agents communicate through typed edges and can be composed into
          complex workflows.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">
          Role Groups
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          3A Studio organizes agents into 8 role groups: Strategy, Tactics,
          Execution, Control, Memory, Communication, Interface, and Security.
          Role groups determine an agent&apos;s functional domain and influence
          prompt templates, available tools, and scoring weights.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">
          Hierarchy Layers
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The 5-layer hierarchy enforces clear delegation: Supervisor (top-level
          governance), Coordinator (cross-team routing), Manager (task
          decomposition), Worker (single-task execution), and Tool (atomic
          function calls). Each layer has defined boundaries for authority and
          data access.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">Edges</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Edges define how agents communicate. There are 5 types: Command
          (directive, one-way), Sync (bidirectional handshake), Twin (parallel
          mirror agents), Delegate (subtask assignment), and Feedback (loop-back
          correction). Edge types enforce specific communication patterns and
          data contracts.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">
          Orchestration Engine
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The orchestrator manages request routing, error handling, retries, and
          governance across the entire hierarchy. It interprets the edge graph to
          determine execution order, collects responses, and applies quality gates
          before returning final results.
        </p>
      </div>

      <WikiCallout variant="info" title="Learn More">
        Each concept has its own dedicated page in this wiki. Use the sidebar
        navigation to explore Agent Architecture, Prompt Engineering, and Workflow
        Design sections for deeper coverage.
      </WikiCallout>
    </div>
  );
}
