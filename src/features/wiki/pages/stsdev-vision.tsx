"use client";

import { WikiCallout } from "../components/wiki-callout";

const competitors = [
  { name: "Anthropic", what: "MCP protocol, Claude tool-use API", gap: "No skill format, no quality scoring, no agent toolkit management" },
  { name: "LangChain", what: "Python tool wrappers, chain composition", gap: "No skill files, no ID system, no cross-reference checking, no quality metrics" },
  { name: "Dify", what: "Visual workflow builder, prebuilt agent templates", gap: "No custom skill SDK, no scanner, no anti-pattern detection" },
  { name: "n8n", what: "Workflow automation, integration nodes", gap: "Not agent-oriented, no skill management, no quality engine" },
  { name: "Flowise", what: "No-code LLM flow builder", gap: "No code ownership, no skill ecosystem, no quality metrics" },
];

const advantages = [
  { title: "Skill SDK with ID System", desc: "ZAI-<DOMAIN>-<NUMBER> IDs for every skill. Cross-reference checker validates links between skills and standards. No other platform has this." },
  { title: "Quality Engine (SonarMAS)", desc: "6-dimension heuristic scoring + LLM evaluation. Per-skill completeness, reference validation, anti-pattern detection. Analog: SonarQube for code, but for AI agent toolkits." },
  { title: "Scanner with Structural Analysis", desc: "Format-independent parser: YAML frontmatter, content-based classification, section extraction. Works on any markdown-based toolkit, not just our format." },
  { title: "Anti-Monolith Architecture", desc: "Every module <=150 lines. Extracted components, not god-files. Scalable from 34 skills to 1000+ without rewrite." },
  { title: "Progressive Disclosure (L1/L2/L3)", desc: "Skills load in 3 levels: metadata only (50 tokens), full instructions (<5000), references on demand. Optimizes token usage for large toolkits." },
];

const milestones = [
  { period: "Done", items: ["34 skills with ID system", "Quality Analyzer (4 input methods)", "Scanner with heuristic + LLM eval", "Cross-reference checker", "Pre-commit validation (planned)"] },
  { period: "3 months", items: ["Working application release", "Complete SonarMAS (9 metrics, radar chart)", "Anti-pattern detectors (7 types)", "Skill classification (5 axes)", "Pre-commit hook for completeness <50%"] },
  { period: "6-12 months", items: ["Build agents for business", "Build companies without employees (or minimal)", "Multi-toolkit scanner (any agent repo)", "Skill marketplace / registry"] },
];

const lessons = [
  { fail: "Scanner showed Grade F / all zeros", learned: "LLM returned ```json-wrapped response. JSON.parse failed silently. Fixed: extractJSON() with fence stripping + heuristic fallback." },
  { fail: "88 skills detected, all completeness = 0", learned: "Classifier treated references/, docs/, evals/ as skills. Fixed: path-based exclusion before content-based detection." },
  { fail: "Completeness criteria didn't match real sections", learned: "Skills use 'Purpose' not 'Description', 'When to Use' not 'Trigger'. Fixed: 20+ section aliases." },
  { fail: "Error swallowing in catch blocks", learned: "`.catch(() => set({ isScanning: false }))` hid all errors. Fixed: surface errors as criticalIssues in UI." },
];

const card = (title: string, desc: string) => (
  <div key={title} className="rounded-md border border-border p-3">
    <p className="text-sm font-medium text-brand-accent">{title}</p>
    <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
  </div>
);

export function StsdevVisionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">STSDev Vision</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Global goals, competitive landscape, and technical advantages
        </p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        AAA Studio is not a toy project. It is infrastructure for AI agent ecosystems
        that does not exist anywhere else. The goal: build the SonarQube of AI agent
        toolkits. A quality engine that scans any agent repository, scores skills and
        standards, detects anti-patterns, and provides actionable recommendations.
        We are two people. We build for 50 agents in 3 months.
      </p>

      <WikiCallout variant="warning" title="Non-Negotiable Principle">
        We win when we commit. No half-measures. If we took the fight — we finish it.
        This applies to every skill, every feature, every fix. Done is better than
        perfect, but "almost done" is not done.
      </WikiCallout>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">Competitive Landscape</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Five major players. Each has strengths. None has what we are building.
        </p>
        <div className="space-y-2">
          {competitors.map((c) => (
            <div key={c.name} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.what}</p>
              <p className="mt-1 text-xs text-brand-green">Gap: {c.gap}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">Technical Advantages</h3>
        <p className="text-sm text-muted-foreground mb-3">
          What we have that nobody else does. Not marketing — working code.
        </p>
        <div className="space-y-2">{advantages.map((a) => card(a.title, a.desc))}</div>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">Milestones</h3>
        <div className="space-y-4">
          {milestones.map((m) => (
            <div key={m.period}>
              <p className="text-sm font-medium text-brand-accent mb-2">{m.period}</p>
              <ul className="space-y-1">
                {m.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-foreground">What Broke and What We Learned</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Every failure is a step forward. Here is the record.
        </p>
        <div className="space-y-2">
          {lessons.map((l) => (
            <div key={l.fail} className="rounded-md border border-border p-3">
              <p className="text-sm font-medium text-red-400">{l.fail}</p>
              <p className="mt-1 text-xs text-brand-green">{l.learned}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
