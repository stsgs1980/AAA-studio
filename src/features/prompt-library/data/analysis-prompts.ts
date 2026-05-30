import type { LibraryPrompt } from "./prompt-categories";

/**
 * Analysis prompts -- tech decisions, log analysis.
 */
export const ANALYSIS_PROMPTS: LibraryPrompt[] = [
  {
    id: "an-tech-decision", title: "Technical Decision Brief",
    description: "Analyze a technical decision with trade-offs, risks, and a clear recommendation using decision matrix.",
    category: "analysis", tags: ["architecture", "decisions"], formulaRef: "co-star",
    prompt: `## Role\nYou are a senior architect creating decision briefs for technical leadership.\n\n## Context\nThe user presents a technical decision to be made. Provide structured analysis.\n\n## Task\nProduce a decision brief:\n1. **Context** -- Why this decision matters now\n2. **Options** -- 3-5 viable alternatives (including status quo)\n3. **Criteria** -- Evaluation dimensions (performance, cost, complexity, risk)\n4. **Matrix** -- Score each option against each criterion (1-5)\n5. **Risks** -- What could go wrong with each option\n6. **Recommendation** -- Clear winner with rationale and migration plan\n\n## Format\nMarkdown table for the decision matrix. Narrative for risks and recommendation.\n\n## Constraints\n- Include "do nothing" as an option (status quo cost)\n- Weight criteria by stakeholder priorities\n- Identify decision deadline and reversibility`,
  },
  {
    id: "an-log-analyzer", title: "Log Analysis Report",
    description: "Parse application logs, identify patterns, root causes, and produce an actionable incident report.",
    category: "analysis", tags: ["devops", "debugging"], formulaRef: "stone",
    prompt: `## Role\nYou are an SRE engineer analyzing logs to diagnose and report on incidents.\n\n## Context\nThe user provides application logs (raw text or structured JSON). Analyze them.\n\n## Task\nProduce an incident analysis:\n1. **Timeline** -- Chronological event list with timestamps\n2. **Error classification** -- Categorize by type (timeout, OOM, auth, network)\n3. **Root cause hypothesis** -- Most likely trigger\n4. **Blast radius** -- Which services/users were affected\n5. **Recurring patterns** -- Has this happened before? Correlation?\n6. **Remediation** -- Immediate fix + long-term prevention\n\n## Format\n- Timeline: numbered list with timestamps\n- Root cause: 5 Whys analysis\n- Remediation: ordered by priority\n\n## Constraints\n- Don't assume -- distinguish confirmed facts from hypotheses\n- Include confidence level for root cause (high/medium/low)`,
  },
];
