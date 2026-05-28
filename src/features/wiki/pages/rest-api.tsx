import { WikiCallout } from "../components/wiki-callout";
import { WikiCodeBlock } from "../components/wiki-code-block";

export function RestApiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">REST API</h2>
        <p className="mt-1 text-sm text-text-muted">
          HTTP endpoints for external integration
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        3A Studio exposes a REST API for programmatic access to agents, flows,
        executions, and knowledge bases. Use the API to integrate with CI/CD
        pipelines, custom dashboards, or external tools.
      </p>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Authentication
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          All API requests require a Bearer token in the Authorization header.
          Generate API tokens from the Settings page. Tokens are scoped to your
          workspace and can be revoked at any time.
        </p>
        <WikiCodeBlock
          code={`Authorization: Bearer <your-api-token>`}
          language="text"
          title="Auth header format"
        />
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Key Endpoints
        </h3>
        <div className="space-y-2 text-sm text-text-secondary">
          <p><code className="text-brand-accent font-mono">GET /api/agents</code> &mdash; List all agents</p>
          <p><code className="text-brand-accent font-mono">POST /api/agents</code> &mdash; Create an agent</p>
          <p><code className="text-brand-accent font-mono">GET /api/agents/:id</code> &mdash; Get agent details</p>
          <p><code className="text-brand-accent font-mono">POST /api/flows/:id/executions</code> &mdash; Execute a flow</p>
          <p><code className="text-brand-accent font-mono">GET /api/knowledge</code> &mdash; List knowledge bases</p>
          <p><code className="text-brand-accent font-mono">GET /api/audit</code> &mdash; Query audit log</p>
        </div>
      </div>

      <WikiCodeBlock
        code={`# Create a new agent
curl -X POST /api/agents \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Reviewer","role":"control","model":"gpt-4o"}'

# Execute a pipeline
curl -X POST /api/flows/flow-123/executions \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"input":"Review this code..."}'`}
        language="bash"
        title="API usage examples"
      />

      <WikiCallout variant="warning" title="Rate Limits">
        API requests are rate-limited to 100 requests per minute per workspace.
        Batch operations and webhooks are available for high-throughput
        scenarios.
      </WikiCallout>
    </div>
  );
}
