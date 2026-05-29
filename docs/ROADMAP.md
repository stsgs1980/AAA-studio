# 3A Studio -- Resource Map & Roadmap

Strategic resource inventory that feeds 3A Studio. What we have, where it comes from, build order, and dependencies.

---

## 7-Item Resource Map

| # | Resource | Source | Count | Target | Phase |
|---|----------|--------|-------|--------|-------|
| 1 | Coding standards | Zai-agent-toolkit/standards/ | 17 | StandardRule records in DB | 3B |
| 2 | Agent templates | Zai-agent-toolkit/ + new type-based | 12+7 | System prompt templates | 3C |
| 3 | Prompting engine | prompting-v0.0/ + research | 20 techniques + 11 frameworks | @stsgs/prompting upgrade | **3A** |
| 4 | WebSocket service | New build | 1 | Real-time pipeline events | 2.5 |
| 5 | Circuit breaker + retry | prompting-v0.0/ + New | 2 patterns | Provider resilience | 2.5 |
| 6 | Skills seed | Zai-agent-toolkit/skills/ | 110+ | Skill records in DB | 3 |
| 7 | Anti-monolith CLI scanner | New build | 1 | eslint-plugin-3a enhancement | 4 |

---

## Build Order (Dependency Chain)

```
Phase 3A: Prompting (item 3)        <-- ТЕКУЩИЙ ТАСК
  |
  +---> Phase 3B: Standards (item 1)
  |       Standards seed нужен engine из prompting для type-based правил
  |
  +---> Phase 3C: Agent Templates (item 2)
  |       Templates нужны standardIds из standards seed
  |
  +---> Phase 3: Skills (item 6)
  |       Skills нужны agent templates для связки
  |
  +---> Phase 3D: Bridges (export)

Phase 2.5: WebSocket (4) + Circuit Breaker (5)  <-- параллельно с 3A-3C

Phase 4: Anti-monolith CLI (7) + deferred agent types
```

**Why this order:**
- Prompting must come first: standards generation needs type-based prompt templates, agent templates need prompting builders
- Standards before templates: agent templates reference standards via standardIds
- Templates before skills: skills are assigned to agents which use templates
- WebSocket + circuit breaker are independent of the prompting chain

---

## Phase 3A: Prompting Module (Current Task)

### What we're building

NOT all 20 techniques + 11 frameworks. Based on agent typology research, we need:

**5 system prompt templates** (one per agent type):
1. Tool-Calling -- default agent, native function calling
2. Router -- classify input, route to specialist
3. Specialist (CrewAI) -- role + goal + backstory
4. Orchestrator + Workers -- delegate, synthesize
5. Evaluator -- generate, score, feedback loop

**4 builders** (compose prompts from parts):
1. Tool description builder -- Anthropic ACI best practices (tool descriptions are as important as system prompts)
2. Backstory builder -- CrewAI pattern, 3-5 sentences of expertise
3. Evaluation rubric builder -- criteria + scoring for Evaluator agents
4. Collaboration context builder -- team roster + delegation protocol

**Plus migration work:**
- Types from prompting-v0.0 -> @stsgs/shared
- Frameworks: 4 -> 11 (add RISE, CREATE, CARE, TRACE, SCOPE, PACKED, STONE, RAG, CHAIN)
- Techniques: add 14 from prompting-v0.0 (6 deferred to Phase 5)

### What we're NOT building (yet)

- ReAct, Plan-and-Execute, Autonomous, Parallel/Voting templates (Phase 4-5)
- Tree-of-Thought, Least-to-Most, Assumption Challenge, Analogical Reasoning, Output Masking, Stakeholder Simulation (Phase 5)
- Orchestration patterns (sequential, parallel, mesh) -- Phase 4
- Resilience (circuit breaker, retry) -- Phase 2.5

### Source material

| Source | Location | What we take |
|--------|----------|--------------|
| Agent typology research | docs/research/agent-typology-full.md | 10 patterns, system prompt templates, best practices |
| Agent types summary | docs/AGENT_TYPES.md | Phase 3 types (1-5), templates, comparative matrix |
| prompting-v0.0 (legacy) | prompting-v0.0/ | Types, 20 techniques, 11 frameworks, 12 role templates |
| Current module | packages/prompting/ | 10 formulas, 4 frameworks, 6 scorers -- keep and upgrade |
| Prompting module plan | docs/PROMPTING_MODULE.md | Gap analysis, file size budget, split strategy |

---

## Phase 3B: Standards Seed

17 standards from Zai-agent-toolkit/standards/ converted to StandardRule records:
- Each with name, description, category, severity, pattern (regex for auto-check)
- Categories: general, prompt, agent, flow, quality, security, architecture
- StandardRule.pattern enables automatic validation in agents and flows

---

## Phase 3C: Agent Templates

**12 role templates** (from prompting-v0.0, Specialist type):
code-architect, frontend-specialist, code-reviewer, debug-detective, technical-writer, test-engineer, data-analyst, security-auditor, ux-consultant, devops-engineer, api-designer, prompt-engineer

**7 type-based templates** (new, from agent typology research):
type-tool-calling, type-router, type-specialist, type-orchestrator, type-evaluator, type-react (Phase 4), type-planner (Phase 4)

---

## Deferred Items

| Item | Phase | Why deferred |
|------|-------|--------------|
| WebSocket service | 2.5 | Independent of prompting chain, needs provider work first |
| Circuit breaker + retry | 2.5 | Provider Intelligence prerequisite |
| 110+ skills seed | 3 | Needs standards + templates first |
| Anti-monolith CLI | 4 | Enhancement, not blocking |
| ReAct agent type | 4 | Outdated for modern models with native tool-calling |
| Plan-and-Execute type | 4 | Variation of Orchestrator pattern |
| Prompt Chaining type | 4 | Workflow pattern, not agent pattern |
| Autonomous agent | 5 | Too complex, needs trusted environment |
| Parallel/Voting type | 5 | Production scale, reliability focus |
| 6 deferred techniques | 5 | Complex reasoning, not needed for Phase 3-4 agent types |

---

## Related Documentation

| Doc | Link | Content |
|-----|------|---------|
| Agent Typology | [docs/AGENT_TYPES.md](AGENT_TYPES.md) | 10 patterns, templates, comparative matrix |
| Prompting Module Plan | [docs/PROMPTING_MODULE.md](PROMPTING_MODULE.md) | Gap analysis, migration plan, file budget |
| Full Research Report | [docs/research/agent-typology-full.md](research/agent-typology-full.md) | 700 lines, 7 frameworks, academic refs |
| WORKFLOW | [WORKFLOW.md](../WORKFLOW.md) | Architecture, roadmap phases, technical rules |
