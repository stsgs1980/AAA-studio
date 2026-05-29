# 3A Studio

**Artificial. Agentic. Architecture.**

IDE for visual multi-agent systems. Build, manage, and monitor AI agent flows with a drag-and-drop editor, prompt evaluation, knowledge base, and standards enforcement -- all backed by a single PostgreSQL database.

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Copy environment file
cp .env.example .env
# Edit .env — fill DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY (see below)

# 3. Generate Prisma client + push schema
bun run db:push

# 4. Start development server
bun run dev
```

**Default login**: admin / admin (configurable via `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars).

## Architecture

```
3A Studio replaces 3 repos x 110 skills x manual sync

  Standards Manager = coding standards (was FRONTEND_STANDARD.md)
  Skill Forge       = skill registry (was 110 folders)
  Prompt Studio     = prompt engineering (was prompting_sts/)
  Flow Editor       = visual orchestration (18 node types, ReactFlow)
  Knowledge Base    = document search (was ChromaDB, now PostgreSQL)
  Audit Log         = activity tracking (was session-log)
```

**Key principle**: one database, everything connected. Changed a standard -- reflected everywhere. Created a skill -- assign to agent -- wire into flow -- run pipeline.

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
| Standards Manager | /standards | CRUD, rules editor, cross-ref validation on delete |
| Audit Log | /audit | JSON-highlighted details, filter by entity |
| Settings | /settings | Multi-provider LLM, theme/language, key masking |

Additional: Landing page (/), Auth (login/signup/verify/reset), Wiki (14 articles, Ctrl+K drawer).

## Monorepo Packages

| Package | Purpose |
|---------|---------|
| `@stsgs/ui` | Design tokens (Midnight palette), ThemeProvider, cn utility |
| `@stsgs/prompting` | 6-criteria scoring, 10 formulas, 4 frameworks, intent detection, comparison |
| `@stsgs/shared` | Core types: Agent, Skill, Standard, Flow, Knowledge, Prompt, Audit |
| `eslint-plugin-3a` | 4 rules: max-lines (150), max-use-state (3), no-cross-layer, no-unicode-escapes |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
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

All cross-entity references are validated on delete (409 Conflict if referenced).

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

## Deployment

Deployed to Vercel via GitHub auto-deploy (push to `main`).

```
git push origin main
# Vercel builds and deploys automatically
# Database schema pushes via prisma db push on vercel-build
```

## License

TBD
