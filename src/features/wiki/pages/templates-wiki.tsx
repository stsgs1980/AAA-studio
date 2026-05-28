import { WikiCallout } from "../components/wiki-callout";
import { WikiCodeBlock } from "../components/wiki-code-block";

export function TemplatesWikiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Templates</h2>
        <p className="mt-1 text-sm text-text-muted">
          Prebuilt prompt templates for common agent patterns
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        3A Studio ships with a library of prebuilt prompt templates organized by
        role group and use case. Templates provide a starting point that you can
        customize, or use as-is for standard agent types.
      </p>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Built-in Categories
        </h3>
        <ul className="space-y-1.5 text-sm text-text-secondary">
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">Code</span>
            Code Writer, Code Reviewer, Refactoring Agent
          </li>
          <li className="flex gap-2">
            <span className="text-brand-green shrink-0">Data</span>
            Data Analyst, ETL Agent, Report Generator
          </li>
          <li className="flex gap-2">
            <span className="text-brand-purple shrink-0">Research</span>
            Research Assistant, Literature Reviewer, Summarizer
          </li>
          <li className="flex gap-2">
            <span className="text-brand-amber shrink-0">DevOps</span>
            CI/CD Agent, Monitoring Agent, Incident Responder
          </li>
          <li className="flex gap-2">
            <span className="text-brand-cyan shrink-0">Communication</span>
            Translator, Email Composer, Meeting Notes Agent
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Using Templates
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          When creating a new agent, select a template from the Templates page or
          the agent creation dialog. The template pre-fills the system prompt,
          role group, model settings, and scoring formula. Edit any field before
          saving.
        </p>
      </div>

      <WikiCallout variant="tip" title="Custom Templates">
        Create your own templates by clicking &quot;Save as Template&quot; on any agent.
        Custom templates are stored in your workspace and can be shared with
        team members through the export system.
      </WikiCallout>

      <WikiCodeBlock
        code={`{
  "templateId": "code-writer-v2",
  "name": "Code Writer",
  "category": "Code",
  "roleGroup": "execution",
  "layer": "worker",
  "defaultModel": "gpt-4o",
  "promptTemplate": "...",
  "scoringFormula": "overall = Clarity*0.25 + Specificity*0.25 + ..."
}`}
        language="json"
        title="Template structure"
      />
    </div>
  );
}
