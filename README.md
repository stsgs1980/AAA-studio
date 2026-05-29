# 3A Studio

**Artificial. Agentic. Architecture.**

IDE for visual multi-agent systems. Build, manage, and monitor AI agent flows with a drag-and-drop editor, prompt evaluation, knowledge base, and standards enforcement -- all backed by a single PostgreSQL database.

## Quick Start

```bash
bun install
cp .env.example .env
bun run db:push
bun run dev
```

Default login: admin / admin.

## Architecture

3A Studio replaces 3 repos x 110 skills x manual sync with **one database**.

```
StsDev-Wiki (solutions, ADR)
        |
3A Studio (living system)
  Standards Manager = coding standards (was FRONTEND_STANDARD.md)
  Skill Forge       = skill registry (was 110 folders)
  Prompt Studio     = prompt engineering (was prompting_sts/)
  Flow Editor       = visual orchestration (18 node types, ReactFlow)
  Knowledge Base    = document search (was ChromaDB, now PostgreSQL)
  Audit Log         = activity tracking (was session-log)
        |
Zai-agent-toolkit (compiled skills export for Z.ai sandbox)
```

Changed a standard -- reflected everywhere. Created a skill -- assign to agent -- wire into flow -- run pipeline.

## Screens (12)

| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | /dashboard | KPIs, sparklines, heatmap, timeline -- live from DB, auto-refresh 30s |
| Flow Editor | /editor | 18 node types, ReactFlow, live execution, per-node model + usage tracking |
| Templates | /templates | 6 flow templates + prompt library, clone to editor |
| Agents | /agents | CRUD, executions, Skills/Standards EntityPicker, system prompt |
| Hierarchy | /hierarchy | Visual parent/child agent graph |
| Pipelines | /pipelines | Real flow execution, node-level drill-down |
| Prompt Studio | /prompt-studio | 5 modules: Write (live scoring) + Formulas (10) + Frameworks (4) + Compare + Intent |
| Knowledge Base | /knowledge | Upload, TF-IDF semantic search |
| Skill Forge | /skills-page | CRUD, code/tests, StandardsPicker, SKILL.md export |
| Standards Manager | /standards | CRUD, rules editor, cross-ref validation |
| Audit Log | /audit | JSON-highlighted details, filter by entity |
| Settings | /settings | Multi-provider LLM, theme/language, key masking |

Additional: Landing page (/), Auth (login/signup/verify/reset), Wiki (14 articles, Ctrl+K drawer).

## Monorepo Packages (4)

| Package | Purpose |
|---------|---------|
| `@stsgs/ui` | Design tokens (Midnight palette), ThemeProvider, cn utility |
| `@stsgs/prompting` | 6-criteria scoring, 10 formulas, 4 frameworks, intent detection, comparison |
| `@stsgs/shared` | Core types: Agent, Skill, Standard, Flow, Knowledge, Prompt, Audit |
| `eslint-plugin-3a` | 4 rules: max-lines (150), max-use-state (3), no-cross-layer, no-unicode-escapes |

## Agent Typology (10 Patterns)

Based on cross-framework research (LangChain, CrewAI, AutoGen, Anthropic, OpenAI Agents SDK, Google ADK, Amazon Bedrock). See [docs/AGENT_TYPES.md](docs/AGENT_TYPES.md) for full details.

| # | Pattern | Core Idea | Phase |
|---|---------|-----------|-------|
| 1 | **Tool-Calling** | Native function calling, default agent | Phase 3 |
| 2 | **Router** | Classify input, route to specialist | Phase 3 |
| 3 | **Specialist** (CrewAI) | Role + Goal + Backstory persona | Phase 3 |
| 4 | **Orchestrator + Workers** | Break task, delegate, synthesize | Phase 3 |
| 5 | **Evaluator** | Generate, score, feedback loop | Phase 3 |
| 6 | ReAct | Thought/Action/Observation loop | Phase 4 |
| 7 | Plan-and-Execute | Plan once, execute steps, re-plan | Phase 4 |
| 8 | Autonomous | Open-ended loop with tools, stop conditions | Phase 5 |
| 9 | Parallel/Voting | Multiple LLM calls, aggregate | Phase 5 |
| 10 | Prompt Chaining | Sequential LLM calls with gates | Phase 4 |

Phase 3 focuses on types 1-5. These cover the majority of real-world multi-agent scenarios.

## Resource Map (7 Items)

The strategic resource inventory that feeds 3A Studio. See [docs/ROADMAP.md](docs/ROADMAP.md) for dependencies and phases.

| # | Resource | Source | Status |
|---|----------|--------|--------|
| 1 | 17 coding standards | Zai-agent-toolkit/standards/ | Pending -- Phase 3A (after prompting) |
| 2 | 12 agent role templates | Zai-agent-toolkit + new type-based | Pending -- Phase 3A |
| 3 | 20 techniques + 11 frameworks | prompting-v0.0/ | Pending -- Phase 3A (current task) |
| 4 | WebSocket service | New build | Later -- Phase 2.5 |
| 5 | Circuit breaker + retry | prompting-v0.0/ + New | Later -- Phase 2.5 |
| 6 | 110+ skills seed | Zai-agent-toolkit/skills/ | Later -- Phase 3 |
| 7 | Anti-monolith CLI scanner | New build | Later -- Phase 4 |

**Build order (dependency chain):** 3 (prompting) -> 1 (standards) -> 2 (agent templates) -> 6 (skills) -> rest

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + midnight theme (#0D1117 base, #58A6FF accent)
- **Database**: Prisma ORM + PostgreSQL (Neon)
- **State**: Zustand
- **Flow Editor**: @xyflow/react (React Flow v12)
- **Auth**: jose JWT + Edge middleware + httpOnly cookies
- **LLM**: z-ai-web-dev-sdk (multi-provider with mock fallback)
- **Code Highlighting**: shiki (github-dark)
- **Animations**: Framer Motion

## Entity Relationships

```
Standard <--(standardIds)--> Skill <--(skills)--> Agent --> Flow --> PipelineExecution
Standard <----(standards)--- Agent
Agent --> AgentExecution
Agent --> AgentHierarchy (parent/child)
Flow --> FlowVersion
KnowledgeCollection --> KnowledgeDocument
```

All cross-entity references validated on delete (409 Conflict if referenced).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection (pooler) |
| `DIRECT_URL` | Yes | PostgreSQL direct connection (migrations) |
| `AUTH_SECRET` | Yes | JWT signing secret (64-char hex) |
| `ENCRYPTION_KEY` | Yes | AES-256-GCM key for API key encryption (64-char hex) |
| `ADMIN_USERNAME` | No | Demo login username (default: admin) |
| `ADMIN_PASSWORD` | No | Demo login password (default: admin) |
| `ZAI_API_KEY` | No | Z.ai SDK API key |
| `ZAI_BASE_URL` | No | Z.ai SDK base URL |

## Development Rules

1. Files <= 150 lines (`eslint-plugin-3a/max-lines`)
2. Max 3 useState per component (`eslint-plugin-3a/max-use-state`)
3. No cross-layer imports (`eslint-plugin-3a/no-cross-layer`)
4. Midnight palette -- consistent dark theme across all screens
5. Zustand for all shared state
6. Prisma + Neon -- single source of truth

## Documentation

| Doc | Description |
|-----|-------------|
| [WORKFLOW.md](WORKFLOW.md) | Full workflow, architecture diagram, roadmap phases |
| [docs/AGENT_TYPES.md](docs/AGENT_TYPES.md) | 10 agent patterns with templates, comparative matrix |
| [docs/ROADMAP.md](docs/ROADMAP.md) | 7-item resource map with build order and dependencies |
| [docs/PROMPTING_MODULE.md](docs/PROMPTING_MODULE.md) | Prompting module status, gap analysis, migration plan |
| [docs/research/agent-typology-full.md](docs/research/agent-typology-full.md) | Full 700-line research report (7 frameworks, academic refs) |

## Deployment

Deployed to Vercel via GitHub auto-deploy (push to `main`).

## License

TBD
