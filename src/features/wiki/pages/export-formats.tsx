import { WikiCallout } from "../components/wiki-callout";
import { WikiCodeBlock } from "../components/wiki-code-block";

export function ExportFormatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Export Formats
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share and version your agent configurations
        </p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        3A Studio supports exporting your entire agent system or individual
        agents in multiple formats. Export is useful for version control,
        team sharing, CI/CD integration, and backup.
      </p>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">
          Supported Formats
        </h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">JSON</span>
            Full fidelity export including all agent properties, edges, and scoring configs
          </li>
          <li className="flex gap-2">
            <span className="text-brand-green shrink-0">YAML</span>
            Human-readable format ideal for code review and Git diffing
          </li>
          <li className="flex gap-2">
            <span className="text-brand-purple shrink-0">Markdown</span>
            Documentation export with prompt text, hierarchy diagrams, and metadata
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">
          Code Generation
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The export system can also generate runnable code. Export an agent as a
          Python class, TypeScript module, or OpenAI function spec. This bridges
          the gap between visual design and production deployment.
        </p>
      </div>

      <WikiCallout variant="info" title="Copy from UI">
        Every configuration panel in 3A Studio has a copy button. Click it to
        copy the current agent, pipeline, or hierarchy config as JSON to your
        clipboard, no export needed.
      </WikiCallout>

      <WikiCodeBlock
        code={`{
  "version": "1.0.0",
  "exportedAt": "2025-01-15T10:30:00Z",
  "agents": [...],
  "edges": [...],
  "pipelines": [...],
  "metadata": {
    "projectName": "Customer Support System",
    "totalAgents": 12,
    "totalEdges": 18
  }
}`}
        language="json"
        title="Full system export structure"
      />
    </div>
  );
}
