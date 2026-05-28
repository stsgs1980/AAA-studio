import { WikiCallout } from "../components/wiki-callout";

export function OrchestrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Orchestration
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Multi-agent coordination and governance
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        The orchestration engine is the runtime backbone of 3A Studio. It manages
        request routing across the agent hierarchy, enforces communication
        patterns defined by edges, handles failures gracefully, and ensures
        governance rules are respected at every step.
      </p>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Coordination Patterns
        </h3>
        <ul className="space-y-1.5 text-sm text-text-secondary">
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">Fan-out</span>
            One Coordinator dispatches tasks to multiple Managers in parallel
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">Fan-in</span>
            Multiple Workers report results to a single Manager for aggregation
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">Daisy chain</span>
            Sequential handoff through a linear chain of agents
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">Consensus</span>
            Twin agents process independently, results compared for agreement
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Error Handling
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          When an agent fails, the orchestrator evaluates the error severity and
          applies the configured strategy: retry with backoff, fallback to a
          backup agent, escalate to the parent layer, or abort the pipeline. All
          errors are logged to the Audit Log with full context.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Retry Logic
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Retries use exponential backoff starting at 1 second with a configurable
          max (default 3 retries, 10s max backoff). Transient errors (rate limits,
          timeouts) are retried automatically. Permanent errors (invalid input,
          auth failure) are escalated immediately.
        </p>
      </div>

      <WikiCallout variant="warning" title="Governance Rules">
        The Supervisor can define governance rules that override agent behavior.
        These include max token budgets, allowed tool sets, output size limits,
        and mandatory approval gates for high-risk operations.
      </WikiCallout>
    </div>
  );
}
