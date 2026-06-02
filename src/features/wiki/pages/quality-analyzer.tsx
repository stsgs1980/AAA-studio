import { WikiCallout } from "../components/wiki-callout";

const tests = [
  { n: "GitHub URL", s: 9.2, d: "Specificity 9, Structure 9, Constraints 9, Examples 10" },
  { n: "ZIP Archive #1", s: 9.2, d: "Specificity 9, Structure 9, Constraints 9, Examples 10" },
  { n: "ZIP Archive #2", s: 8.4, d: "Specificity 9, Structure 9, Constraints 9, Examples 4" },
  { n: "Project Folder", s: 8.4, d: "Specificity 9, Structure 9, Constraints 9, Examples 6" },
];

const inputs = [
  { n: "Direct Text", d: "Paste content directly into the editor for immediate analysis." },
  { n: "File Upload", d: "Upload individual files (.ts, .js, .py, .json, .yaml, .md, .toml, .cfg, .txt)." },
  { n: "ZIP Archive", d: "Client-side extraction via JSZip. Filters node_modules, __pycache__, vendor, hidden dirs." },
  { n: "GitHub URL", d: "Fetches repository contents server-side from public GitHub repositories." },
];

const criteria = [
  { n: "Specificity", d: "Presence of concrete commands, file paths, variable names, and exact values." },
  { n: "Structure", d: "Logical organization with clear sections, headings, and proper formatting." },
  { n: "Constraints", d: "Explicit rules about what must or must not be done, including edge cases." },
  { n: "Examples", d: "Worked examples demonstrating expected inputs, outputs, and patterns." },
];

const phases = [
  { p: "Phase 2 (Near)", i: "Verifier Layer, Anti-pattern detectors, Grade A-F badge" },
  { p: "Phase 3 (Medium)", i: "9-metric scoring engine, Radar chart, Standard Type classification" },
  { p: "Phase 4 (Later)", i: "Full 7-tab dashboard restructure, Skill Classification (5 axes)" },
];

const item = (n: string, d: string) => (
  <div key={n} className="rounded-md border border-border p-3">
    <p className="text-sm font-medium text-brand-accent">{n}</p>
    <p className="mt-1 text-sm text-muted-foreground">{d}</p>
  </div>
);

export function QualityAnalyzerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Quality Analyzer</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Static text analysis with heuristic scoring and LLM deep evaluation
        </p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        The Quality Analyzer evaluates prompts, code, standards, and agent
        configurations using two complementary approaches. First, a heuristic
        scoring engine computes six quality dimensions (Clarity, Specificity,
        Coherence, Context, Efficiency, Safety) in real-time on the client side.
        Second, an LLM-powered deep analysis provides expert-level evaluation
        across four rubric criteria including worked examples detection and
        constraint coverage analysis.
      </p>

      <WikiCallout variant="info" title="What QA Evaluates">
        QA performs static text analysis only. It reads the submitted content,
        evaluates structure, vocabulary, and pattern compliance. It does not
        execute code, activate skills, or test runtime behavior. Execution
        testing is planned for Epic 4 (Flow Assistant).
      </WikiCallout>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">Input Methods</h3>
        <div className="space-y-2">{inputs.map((x) => item(x.n, x.d))}</div>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">Deep Analysis Criteria (LLM)</h3>
        <div className="space-y-2">{criteria.map((x) => item(x.n, x.d))}</div>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">
          Vercel Test Results (June 2026)
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          All four input methods tested on production. Examples is the consistently
          lowest dimension (4-6/10), indicating most documents lack worked examples.
        </p>
        <div className="space-y-2">
          {tests.map((r) => (
            <div key={r.n} className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{r.n}</p>
                <p className="text-xs text-muted-foreground">{r.d}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-brand-accent">{r.s}/10</span>
                <span className="rounded bg-brand-green/20 px-2 py-0.5 text-xs font-medium text-brand-green">PASS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">
          Enhanced QA Roadmap (from P-MAS Extraction)
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Patterns from TOOLKIT_QUALITY_STANDARD and MAS Architecture docs.
          Full details: docs/P-MAS-EXTRACTION-FOR-AAA-STUDIO.md.
        </p>
        <div className="space-y-2">{phases.map((x) => item(x.p, x.i))}</div>
      </div>

      <WikiCallout variant="tip" title="Grade Scale (Planned)">
        A (90-100, production-ready), B (80-89, good), C (70-79, needs attention),
        D (60-69, problems), F (below 60, critical).
      </WikiCallout>
    </div>
  );
}
