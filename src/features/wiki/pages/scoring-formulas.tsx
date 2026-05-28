import { WikiCallout } from "../components/wiki-callout";
import { WikiCodeBlock } from "../components/wiki-code-block";

export function ScoringFormulasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Scoring Formulas
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Evaluate agent and prompt quality programmatically
        </p>
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        3A Studio includes a formula-based scoring engine that evaluates agents
        and prompts across multiple dimensions. Formulas are expressed as
        weighted expressions and can reference any of the six quality dimensions
        (Clarity, Specificity, Coherence, Context, Efficiency, Safety).
      </p>

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          Formula Syntax
        </h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Formulas use a simple expression language. Dimension names are
          identifiers, numeric constants are supported, and the standard
          arithmetic operators (+, -, *, /) work as expected. Parentheses
          control evaluation order.
        </p>
      </div>

      <WikiCodeBlock
        code={`// Weighted overall score
overall = (Clarity * 0.25) + (Specificity * 0.20) +
          (Coherence * 0.15) + (Context * 0.15) +
          (Efficiency * 0.10) + (Safety * 0.15)

// Custom formula for security-critical agents
securityScore = (Safety * 0.40) + (Clarity * 0.20) +
                (Specificity * 0.15) + (Coherence * 0.15) +
                (Efficiency * 0.05) + (Context * 0.05)

// Penalty-based formula (deductions for low scores)
adjustedScore = overall - max(0, (10 - Safety) * 0.5)`}
        language="text"
        title="Formula examples"
      />

      <div>
        <h3 className="mb-2 text-base font-semibold text-text-primary">
          How Formulas Are Evaluated
        </h3>
        <ul className="space-y-1.5 text-sm text-text-secondary">
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">1.</span>
            Each dimension is scored 0-10 by the evaluation engine
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">2.</span>
            Dimension scores are substituted into the formula
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">3.</span>
            The expression is evaluated with standard operator precedence
          </li>
          <li className="flex gap-2">
            <span className="text-brand-accent shrink-0">4.</span>
            Final score is clamped to [0, 10] range
          </li>
        </ul>
      </div>

      <WikiCallout variant="tip" title="Role-Specific Weights">
        Different role groups recommend different weight distributions. A
        Security agent should weight Safety at 0.35+, while an Execution agent
        should prioritize Efficiency and Specificity.
      </WikiCallout>
    </div>
  );
}
