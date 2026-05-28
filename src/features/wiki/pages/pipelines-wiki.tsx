import { WikiCallout } from "../components/wiki-callout";

export function PipelinesWikiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Pipelines</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Automated multi-step execution flows
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        Pipelines are automated workflows that chain multiple agents or operations
        into a sequential execution flow. Built in the Flow Editor, pipelines
        handle complex tasks that require coordination across agents, data
        transformations, and conditional branching.
      </p>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Creating Pipelines
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Open the Flow Editor and switch to Pipeline mode. Drag agent nodes onto
          the canvas, connect them with edges, and configure execution parameters.
          Use branch nodes for conditional logic and merge nodes to combine
          parallel paths.
        </p>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Execution Model
        </h3>
        <ul className="space-y-1.5 text-sm text-text-secondary">
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">Sequential</span>
            Nodes execute one after another, passing outputs forward
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">Parallel</span>
            Multiple nodes run simultaneously, results merged at a sync point
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">Conditional</span>
            Branch nodes route execution based on data or agent output
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">Retry</span>
            Failed nodes can retry with exponential backoff
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Monitoring Pipeline Runs
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Each pipeline execution is tracked with a unique run ID. View real-time
          status, node-level timing, and error traces in the Pipelines page. The
          Audit Log captures all execution events for compliance debugging.
        </p>
      </div>

      <WikiCallout variant="info" title="Pipeline Templates">
        The Templates page includes prebuilt pipeline configurations for common
        workflows like code review, data processing, and content generation.
        Use these as starting points and customize as needed.
      </WikiCallout>
    </div>
  );
}
