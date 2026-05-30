# 3A Studio -- Unified numbered task list

> Principle: **check donors first** (3a-studio-mas, p-mas), take only working parts,
> after each stage project must be **runnable** (`npm run dev`, `npm run lint`)

## Current state (inventory)

### Clean repo `/home/z/my-project/3a-studio/`
- [+] Next.js 15 + TypeScript + Tailwind 4 + shadcn/ui
- [+] ESLint with custom plugin `3a/max-lines`, `3a/max-use-state`, `3a/no-cross-layer`, `3a/no-unicode-escapes`
- [+] Prisma schema: 30 models (see schema.prisma)
- [+] `npm run build` -- passes
- [+] `npm run lint` -- 0 errors, 7 warnings (tests only)
- [+] API routes: 32 endpoints
- [+] Features: agent-creator, agents, auth, dashboard, flow-editor, knowledge, landing, pipelines, prompt-library, prompt-studio, quality-analyzer, skills, standards, wiki
- [+] Packages: @stsgs/ui, @stsgs/shared, @stsgs/prompting
- [~] Some donor components not yet verified for rendering

### Donor 1: `/home/z/my-project/3a-studio-mas/` (~280 src files)
- Prisma: 30+ models
- API routes: 33 endpoints (added /tasks, /self-correction, /executions)
- Features: agents, auth, dashboard, flow-editor, knowledge, landing, pipelines, prompt-library, prompt-studio, standards, wiki
- Missing: agent-creator, quality-analyzer, skills (as separate features)
- Components: hierarchy (full), workflows, testing, citation, approval, comparison, cost-monitor, feedback, self-correction, task-input, paginator

### Donor 2: `/home/z/my-project/p-mas/` (80 files)
- Hierarchy, workflow components
- API: agent hierarchy
- Lib: api-retry, circuit-breaker, fallback-manager, health-check, resilience
- Minimal but working

---

## Wave 0 -- Infrastructure (project runnable)

### 0.1 [DONE] SQLite/PostgreSQL conflict check
- Result: NO conflict, pure Prisma ORM

### 0.2 [DONE] Prisma Schema -- merged from donor
- [+] Task model (from 3a-studio-mas)
- [+] Workflow + PipelineStep + WorkflowExecution + StepExecution + AgentMessage (from 3a-studio-mas)
- [+] PromptVersion + PromptHistory + PromptRegistryEntry (from 3a-studio-mas)
- [+] TestCase + TestRun + TestResult (from 3a-studio-mas)
- [+] SelfCorrectionSession (from 3a-studio-mas)
- [+] CostRecord + LatencyAlert (from 3a-studio-mas)
- [+] Agent model: formula, twinId, avatar (from 3a-studio-mas)
- [+] Skill.standardIds
- [+] Contradiction, AgentImport, KeyValueStore, InteractionLog
- [+] CitationCheck, ApprovalRequest, ComparisonSnapshot, AnalysisSession, FeedbackRecord
- [~] `npx prisma db push` -- needs verification with real data
- [+] `npm run build` -- passes

### 0.3 [DONE] API Error Handling
- [+] `src/lib/api-error.ts` -- AppError class + handleError + success/created/paginate
- [+] Zod + Prisma error detection
- [+] ALL 32 API routes use unified error handling
### 0.4 [DONE] Zod Validation Schemas
- [+] `src/lib/validations/agent.ts` -- Agent schemas (create, update, query)
- [+] `src/lib/validations/flow.ts` -- Flow, Skill, Standard schemas
- [+] `src/lib/validations/common.ts` -- Knowledge, Document, PromptTemplate, Task, Workflow, Pagination
- [+] `src/lib/validations/index.ts` -- barrel export
- [+] ALL API routes wired with Zod + error handling
- [+] `npm run build` passes, `npm run lint` 0 errors

### 0.5 [DONE] Seed Data
- [+] `prisma/seed.ts` -- demo data with 10 agents, hierarchy, 48 executions, 4 flows, 4 skills
- [+] `bun run db:seed` works
- [+] Dashboard seed/reset API routes

### 0.6 ESLint Plugin
- [+] Custom rules work (`3a/max-lines`, `3a/max-use-state`, `3a/no-cross-layer`, `3a/no-unicode-escapes`)
- [ ] Rule `3a/no-json-column` (warn about String for JSON)
- [+] `npm run lint` -- 0 errors

---

## Wave 1 -- Core API & Data Layer

### 1.1 Agent API -- full CRUD
**Donor**: 3a-studio-mas/src/app/api/agents/ -- already exists
- [ ] Verify current routes work
- [ ] Add Zod validation
- [ ] Add pagination
- [ ] Test via curl

### 1.2 Flow API -- CRUD + Execute
**Donor**: 3a-studio-mas/src/app/api/flows/ -- already exists
- [ ] Verify execute route
- [ ] Add versioning
- [ ] Add validation

### 1.3 Skills & Standards API
**Donor**: 3a-studio/src/app/api/skills/, standards/ -- already exists
- [ ] Verify CRUD
- [ ] Add export endpoint
- [ ] Add import for Standards

### 1.4 Knowledge API
**Donor**: 3a-studio/src/app/api/knowledge/ -- already exists
- [ ] Verify CRUD + search
- [ ] Add document upload

### 1.5 New API from donor
**Donor**: 3a-studio-mas/src/app/api/
- [ ] /tasks -- CRUD (from 3a-studio-mas)
- [ ] /self-correction -- CRUD (from 3a-studio-mas)
- [ ] /executions -- list (from 3a-studio-mas)

---

## Wave 2 -- Feature Stores (Zustand)

### 2.1 Agent Store
**Donor**: 3a-studio-mas/src/features/agents/hooks/use-agent-store.ts
- [ ] Port/verify store
- [ ] Connect to API

### 2.2 Flow Store
**Donor**: 3a-studio/src/features/flow-editor/store/flow-store.ts -- already exists
- [ ] Verify store works with ReactFlow
- [ ] Add undo/redo

### 2.3 Prompt Studio Store
**Donor**: 3a-studio/src/features/prompt-studio/store/ -- already exists
- [ ] Verify store
- [ ] Connect scoring

### 2.4 Dashboard Store
**Donor**: 3a-studio/src/features/dashboard/hooks/use-dashboard-data.ts
- [ ] Verify data hooks
- [ ] Add real-time updates

### 2.5 Skills & Standards Stores
**Donor**: 3a-studio/src/features/skills/store/, standards/store/
- [ ] Port/verify stores

### 2.6 Quality Analyzer Store
**Donor**: 3a-studio/src/features/quality-analyzer/hooks/
- [ ] Port/verify store

---

## Wave 3 -- UI Pages (rendering)

### 3.1 Dashboard Page
**Donor**: 3a-studio/src/app/(dashboard)/dashboard/ -- already exists
- [ ] Verify rendering
- [ ] Connect to real data via API
- [ ] KPI cards, activity timeline, network chart

### 3.2 Agents Page
**Donor**: 3a-studio/src/app/(dashboard)/agents/ -- already exists
- [ ] Verify agent list/table
- [ ] CRUD via modals
- [ ] Agent Creator wizard

### 3.3 Flow Editor Page
**Donor**: 3a-studio/src/app/(dashboard)/editor/ -- already exists
- [ ] Verify ReactFlow canvas
- [ ] Node palette (drag panel)
- [ ] Config panel (IO schema, execution)

### 3.4 Prompt Studio Page
**Donor**: 3a-studio/src/app/(dashboard)/prompt-studio/ -- already exists
- [ ] Verify tabs: Write, Frameworks, Formulas, Compare
- [ ] Scoring panel

### 3.5 Knowledge Page
**Donor**: 3a-studio/src/app/(dashboard)/knowledge/ -- already exists
- [ ] Verify collections list
- [ ] Document viewer

### 3.6 Skills & Standards Pages
**Donor**: 3a-studio/src/app/(dashboard)/skills-page/, standards/ -- already exists
- [ ] Verify lists
- [ ] CRUD forms

### 3.7 Wiki Page
**Donor**: 3a-studio/src/app/(dashboard)/wiki/ -- already exists
- [ ] Verify sidebar navigation
- [ ] Verify content rendering

### 3.8 Settings Page
**Donor**: 3a-studio/src/app/(dashboard)/settings/ -- already exists
- [ ] LLM provider cards
- [ ] Connection test

---

## Wave 4 -- LLM Integration

### 4.1 z-ai-web-dev-sdk Chat Completions
- [ ] Configure SDK in backend
- [ ] `/api/llm` route -- chat proxy
- [ ] `/api/llm/test` -- connection test

### 4.2 Prompt Evaluation (Quality Analyzer)
- [ ] `/api/evaluate-deep` -- deep prompt evaluation
- [ ] Scoring rubric from @stsgs/prompting
- [ ] Results in UI

### 4.3 Flow Execution Engine
- [ ] `/api/flows/[id]/execute` -- run flow
- [ ] node-exec.ts -- execute nodes
- [ ] Results in PipelineExecution

---

## Wave 5 -- Advanced Features

### 5.1 Pipeline Engine (Workflow)
**Donor**: 3a-studio-mas -- Task, Workflow models
- [ ] Workflow CRUD
- [ ] Step execution
- [ ] Agent messages

### 5.2 Self-Correction Loop
**Donor**: 3a-studio-mas -- SelfCorrectionSession
- [ ] API route
- [ ] UI panel

### 5.3 Agent Import
**Donor**: 3a-studio-mas -- AgentImport model
- [ ] ZIP upload
- [ ] Parse agents from archive

### 5.4 Hierarchy Visualization
**Donor**: p-mas -- hierarchy components
- [ ] Tree view
- [ ] Drag & drop

---

## Wave 6 -- Polish & Quality

### 6.1 i18n
**Donor**: 3a-studio/src/lib/i18n/ -- already exists
- [ ] RU/EN translations
- [ ] Language switcher

### 6.2 Testing
- [ ] Unit tests for lib/
- [ ] Integration tests for API routes
- [ ] E2E for key flows

### 6.3 Documentation
- [ ] API docs (OpenAPI?)
- [ ] Wiki content verification
