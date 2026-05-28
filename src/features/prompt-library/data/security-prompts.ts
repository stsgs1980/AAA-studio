import type { LibraryPrompt } from "./prompt-categories";

/**
 * Security prompts — pentest plans, incident response.
 */
export const SECURITY_PROMPTS: LibraryPrompt[] = [
  {
    id: "sec-pentest", title: "Penetration Test Plan",
    description: "Generate a structured penetration test plan with attack vectors, tools, and reporting template.",
    category: "security", tags: ["pentest", "offensive"], formulaRef: "CHAIN",
    prompt: `## Role\nYou are a penetration tester creating a structured test plan.\n\n## Context\nThe user describes a target application or system. Create a test plan.\n\n## Task\nProduce a penetration test plan:\n1. **Scope** — In-scope assets, out-of-scope, rules of engagement\n2. **Recon** — OSINT steps, subdomain enumeration, tech fingerprint\n3. **Attack vectors** — Web (OWASP Top 10), API, network, social\n4. **Methodology** — Tools per phase (Burp, Nmap, ffuf, nuclei)\n5. **Evidence template** — How to document findings\n6. **Reporting** — Executive summary + technical findings format\n\n## Format\nNumbered phases. Tools as tables. Finding template as a reusable block.\n\n## Constraints\n- Only legal, authorized testing methodologies\n- Include a "stop rules" section for safety\n- Prioritize by exploitability and business impact`,
  },
  {
    id: "sec-incident-response", title: "Incident Response Playbook",
    description: "Create an incident response runbook with roles, communication templates, and post-mortem structure.",
    category: "security", tags: ["ir", "compliance"], formulaRef: "SCOPE",
    prompt: `## Role\nYou are an incident response lead creating a playbook for security incidents.\n\n## Context\nThe user describes their organization. Create a tailored IR playbook.\n\n## Task\nProduce a playbook covering:\n1. **Severity levels** — SEV1-SEV4 definitions with response SLAs\n2. **Roles** — IC, communicator, scribe, tech lead, executive liaison\n3. **Detection** — Alert thresholds, monitoring sources, false positive rate\n4. **Containment** — Immediate actions per severity (checklist)\n5. **Communication** — Internal updates, customer notification, press template\n6. **Recovery** — Verification steps, monitoring increase, all-clear criteria\n7. **Post-mortem** — Blameless timeline, 5 Whys, action items, follow-up\n\n## Format\nChecklists for each phase. Templates for communication.\n\n## Constraints\n- Time-boxed actions (do X within 15 min, Y within 1 hour)\n- Decision trees for escalation\n- Compliance considerations (GDPR notification within 72h)`,
  },
];
