# 3A Studio

**Artificial. Agentic. Architecture.**

IDE for visual multi-agent systems. Build, manage, and monitor AI agent flows with a drag-and-drop editor, prompt evaluation, knowledge base, and standards enforcement -- all backed by a single PostgreSQL database.

> **Active repo:** https://github.com/stsgs1980/AAA-studio (212 commits)
> **Canonical source:** https://github.com/stsgs1980/3a-studio-mas (45K LOC, full project)
> **Frozen repo:** https://github.com/stsgs1980/3a-studio (143 commits, stopped 30.05.2026)

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
  Flow Editor       = visual orchestration (20 node types, ReactFlow)
  Knowledge Base    = document search (was ChromaDB, now PostgreSQL)
  Audit Log         = activity tracking (was session-log)
        |
Zai-agent-toolkit (compiled skills export for Z.ai sandbox)
```

Changed a standard -- reflected everywhere. Created a skill -- assign to agent -- wire into flow -- run pipeline.

## Screens (19)

| Screen | Route | Description |
|--------|-------|-------------|
| Dashboard | /dashboard | KPIs, sparklines, heatmap, timeline -- live from DB, auto-refresh 30s |
| Flow Editor | /editor | 20 node types (5 AI + 4 Mgmt + 4 Data + 2 Knowledge + 2 Integration + 3 Special), ReactFlow, live execution, per-node model + usage tracking |
| Templates | /templates | 6 flow templates + prompt library, clone to editor |
| Agents | /agents | CRUD, executions, Skills/Standards EntityPicker, system prompt |
| Agent Creator | /agent-creator | Guided agent creation wizard |
| Hierarchy | /hierarchy | Visual parent/child agent graph, 7 edge types (command/sync/twin/delegate/feedback/supervise/broadcast) |
| Pipelines | /pipelines | Real flow execution, node-level drill-down |
| Workflows | /workflows | Workflow management and monitoring |
| Prompt Studio | /prompt-studio | 6 modules: Write (live scoring) + Formulas (11) + Frameworks (11) + Techniques (14) + Compare + Intent |
| Knowledge Base | /knowledge | Upload, TF-IDF semantic search |
| Skill Forge | /skills-page | CRUD, code/tests, StandardsPicker, SKILL.md export |
| Standards Manager | /standards | CRUD, rules editor, cross-ref validation |
| Audit Log | /audit | JSON-highlighted details, filter by entity |
| Settings | /settings | Multi-provider LLM, theme/language, key masking |
| Tasks | /tasks | Task tracking and management |
| Testing | /testing | Test runner, judge scoring, metrics |
| Quality Analyzer | /quality-analyzer | Quality analysis and scoring |
| Self-Correction | /self-correction | Auto-revision loop |
| Wiki | /wiki | 14 articles, Ctrl+K drawer |

Additional: Landing page (/), Auth (login/signup/verify/reset/forgot), i18n (EN/RU, 7 namespaces).

> **Note:** Approvals, Cost Monitor, Analysis, and Comparison screens are planned but not yet implemented (API routes exist for some).

## Monorepo Packages (4)

| Package | Purpose |
|---------|---------|
| `@stsgs/ui` | Design tokens (Midnight palette), ThemeProvider, cn utility |
| `@stsgs/prompting` | 6-criteria scoring, 11 formulas, 11 frameworks, 14 techniques, intent detection, comparison |
| `@stsgs/shared` | Core types: Agent, Skill, Standard, Flow, Knowledge, Prompt, Audit |
| `eslint-plugin-3a` | 4 rules: max-lines (150), max-use-state (3), no-cross-layer, no-unicode-escapes |

## Agent Typology (10 Patterns)

Based on cross-framework research (LangChain, CrewAI, AutoGen, Anthropic, OpenAI Agents SDK, Google ADK, Amazon Bedrock).

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

## Resource Map (6 Donors)

The strategic resource inventory that feeds 3A Studio.

| # | Donor | LOC | Status | What to borrow |
|---|-------|-----|--------|---------------|
| 1 | [3a-studio-mas](https://github.com/stsgs1980/3a-studio-mas) | 45,249 | SOURCE | Flow Editor (20 nodes), Prisma Schema (26 models), Prompting System, LLM Client, Diagnostics, Pipeline Middleware, Dashboard, Auth, Monorepo packages |
| 2 | [P-MAS_init](https://github.com/stsgs1980/P-MAS_init) | 54,798 | ARCHIVED | Workflow execution engine, ReactFlow hierarchy v2, Workflow Pipeline UI, 7 edge types, Resilience layer, WebSocket service |
| 3 | [MVP-Flow-Studio-Pro](https://github.com/stsgs1980/MVP-Flow-Studio-Pro) | 18,193 | ARCHIVED | 6 advanced nodes (Switch/Merge/Loop/Webhook/Variable/DataSource), 26 multi-agent templates, Template Gallery, i18n |
| 4 | [P-MAS-architector](https://github.com/stsgs1980/P-MAS-architector) | ~81,000 | ACTIVE | Orchestrator, prompt versioning, citation system, executor pipeline, 67 skills |
| 5 | [prompting-v0.0](https://github.com/stsgs1980/prompting-v0.0) | 4,304 | PACKAGE | Pure TS prompting lib: 20 techniques, 11 frameworks, 6-dim scoring, 20 formulas, 12 orchestration patterns |
| 6 | [Flow-Studio-Pro](https://github.com/stsgs1980/Flow-Studio-Pro) | ~750 | ACTIVE | 5 unique nodes (Loop, Delay, Merge, SubAgent, Search) |

**Warning:** In 3a-studio-mas, `src/lib/prompting/` contains **stubs** (random scoring). Always use `packages/prompting/` which has real heuristic implementations.

## Tech Stack

- **Framework**: Next.js 15/16 (App Router), React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + midnight theme (#0D1117 base, #58A6FF accent)
- **Database**: Prisma ORM + SQLite (local dev) / PostgreSQL Neon (Vercel deploy)
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
| `DATABASE_URL` | Yes | SQLite (local) or PostgreSQL Neon (Vercel) connection |
| `DIRECT_URL` | Vercel | PostgreSQL direct connection (migrations) |
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
6. Prisma + SQLite/Neon -- single source of truth

## Documentation

| Doc | Description |
|-----|-------------|
| [WORKFLOW.md](WORKFLOW.md) | Full workflow, architecture diagram, roadmap phases |

> **Note:** docs/AGENT_TYPES.md, docs/ROADMAP.md, docs/PROMPTING_MODULE.md, and docs/research/agent-typology-full.md are referenced but not yet created.

## Deployment

Deployed to Vercel via GitHub auto-deploy (push to `main`).

## License

TBD
