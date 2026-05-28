import { WikiCallout } from "../components/wiki-callout";
import { WikiCodeBlock } from "../components/wiki-code-block";

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Getting Started with 3A Studio
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Artificial. Agentic. Architecture.
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        3A Studio is a visual IDE for designing, orchestrating, and deploying
        multi-agent AI systems. Built on the P-MAS (Prompt-driven Multi-Agent
        System) architecture pattern, it enables teams to build complex agent
        hierarchies with intuitive drag-and-drop tools, real-time scoring, and
        automated quality assurance.
      </p>

      <WikiCallout variant="info" title="P-MAS Architecture">
        P-MAS stands for Prompt-driven Multi-Agent System. Every agent is defined
        by its system prompt, role assignment, and position in the hierarchy.
        Communication flows through typed edges, and quality is measured by
        six-dimensional scoring.
      </WikiCallout>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Core Capabilities
        </h3>
        <ul className="space-y-1.5 text-sm text-text-secondary">
          <li className="flex gap-2">
            <span className="text-brand-accent">01</span> Visual Flow Editor
            with drag-and-drop node placement
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent">02</span> 5-layer agent
            hierarchy (Supervisor to Tool)
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent">03</span> 6-dimensional prompt
            quality scoring engine
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent">04</span> Pipeline builder for
            automated multi-step workflows
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent">05</span> Knowledge base
            integration with RAG retrieval
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Who Is It For?
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          AI engineers building production agent systems, researchers
          experimenting with multi-agent architectures, and teams managing
          prompt libraries at scale. Whether you are prototyping a single agent or
          orchestrating a 50-agent fleet, 3A Studio provides the tooling to
          design, test, and deploy with confidence.
        </p>
      </div>

      <WikiCodeBlock
        code={`{
  "studio": "3A Studio",
  "pattern": "P-MAS (Prompt-driven Multi-Agent System)",
  "layers": 5,
  "edgeTypes": 5,
  "scoringDimensions": 6,
  "exportFormats": ["json", "yaml", "markdown"]
}`}
        language="json"
        title="System snapshot"
      />
    </div>
  );
}
