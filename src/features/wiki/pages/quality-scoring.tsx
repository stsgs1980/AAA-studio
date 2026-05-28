import { WikiCallout } from "../components/wiki-callout";
import { WikiCodeBlock } from "../components/wiki-code-block";

export function QualityScoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Quality Scoring
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          6 dimensions of prompt evaluation
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        Every prompt in 3A Studio is evaluated across six quality dimensions,
        each scored from 0 to 10. The scoring engine analyzes prompt structure,
        vocabulary, and pattern compliance to produce actionable scores.
      </p>

      <div className="space-y-3">
        {[
          { name: "Clarity", desc: "How clearly the prompt communicates its intent. Measures sentence simplicity, directive language, and unambiguous phrasing." },
          { name: "Specificity", desc: "How precisely the prompt defines expected behavior. Looks for concrete instructions, output formats, and edge case handling." },
          { name: "Coherence", desc: "How logically consistent the prompt is internally. Checks for contradictions, redundant instructions, and structural flow." },
          { name: "Context", desc: "How well the prompt provides necessary background. Evaluates the presence and quality of context sections and variable usage." },
          { name: "Efficiency", desc: "How concisely the prompt achieves its goal. Penalizes unnecessary verbosity while rewarding completeness." },
          { name: "Safety", desc: "How well the prompt guards against misuse. Checks for constraint sections, output format enforcement, and boundary definitions." },
        ].map((dim) => (
          <div key={dim.name} className="rounded-md border border-midnight-border p-3">
            <p className="text-sm font-medium text-brand-accent">{dim.name}</p>
            <p className="mt-1 text-sm text-text-secondary">{dim.desc}</p>
          </div>
        ))}
      </div>

      <WikiCodeBlock
        code={`{
  "scores": {
    "clarity": 8.5,
    "specificity": 7.2,
    "coherence": 9.0,
    "context": 6.8,
    "efficiency": 8.1,
    "safety": 7.5
  },
  "overall": 7.85,
  "grade": "B+",
  "recommendations": [
    "Add more specific output format constraints",
    "Include knowledge base context references",
    "Define edge case handling for empty inputs"
  ]
}`}
        language="json"
        title="Score breakdown example"
      />

      <WikiCallout variant="tip" title="Improving Low Scores">
        Click on any dimension in the Prompt Studio to see specific suggestions
        for improvement. The scoring engine provides line-level feedback on what
        to add, remove, or restructure.
      </WikiCallout>
    </div>
  );
}
