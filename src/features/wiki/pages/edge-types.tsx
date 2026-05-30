import { WikiCodeBlock } from "../components/wiki-code-block";

export function EdgeTypesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Edge Types</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          5 communication patterns between agents
        </p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Edges define how agents communicate within the hierarchy. Choosing the
        right edge type ensures data flows correctly and the orchestration engine
        can enforce the intended communication pattern.
      </p>

      <div className="space-y-3">
        {[
          { name: "Command", color: "text-brand-red", desc: "Directive, one-way communication. The source agent sends a task to the target. The target must execute but does not reply through this edge.", use: "Supervisor to Coordinator, Manager to Worker" },
          { name: "Sync", color: "text-brand-accent", desc: "Bidirectional handshake. Both agents exchange data and wait for acknowledgment before proceeding. Ensures consistency.", use: "Coordinators exchanging state, Workers sharing results" },
          { name: "Twin", color: "text-brand-purple", desc: "Parallel mirror agents processing the same input independently. Results are compared for consensus or diversity.", use: "Dual-path verification, ensemble decisions" },
          { name: "Delegate", color: "text-brand-green", desc: "Subtask assignment with result return. The source sends a subtask, the target processes it, and returns the output.", use: "Manager decomposing work to Workers" },
          { name: "Feedback", color: "text-brand-amber", desc: "Loop-back correction. The target sends evaluation results back to the source for iterative improvement.", use: "QA Reviewer sending corrections to a Worker" },
        ].map((edge) => (
          <div key={edge.name} className="rounded-md border border-border p-3">
            <p className={`text-sm font-semibold ${edge.color}`}>{edge.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{edge.desc}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use case: {edge.use}
            </p>
          </div>
        ))}
      </div>

      <WikiCodeBlock
        code={`{
  "edges": [
    { "from": "supervisor", "to": "coordinator-1", "type": "command" },
    { "from": "coordinator-1", "to": "manager-1", "type": "delegate" },
    { "from": "manager-1", "to": "worker-1", "type": "delegate" },
    { "from": "worker-1", "to": "manager-1", "type": "feedback" },
    { "from": "qa-reviewer", "to": "worker-1", "type": "feedback" }
  ]
}`}
        language="json"
        title="Edge graph example"
      />
    </div>
  );
}
