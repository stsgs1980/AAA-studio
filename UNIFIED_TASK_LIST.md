# 3A Studio -- Unified numbered task list

> Principle: **check donors first** (3a-studio-mas, p-mas), take only working parts,
> after each stage project must be **runnable** (`npm run dev`, `npm run lint`)

## Current state (inventory)

### Clean repo `/home/z/my-project/3a-studio/`
- [+] Next.js 15 + TypeScript + Tailwind 4 + shadcn/ui
- [+] ESLint with custom plugin (4 rules)
- [+] Prisma schema: 30 models
- [+] `npm run build` -- passes
- [+] `npm run lint` -- 0 errors
- [+] API routes: 32 endpoints, ALL with unified error handling + Zod
- [+] 16 features, 3 packages
- [+] Auth middleware + API key encryption
- [+] Multi-provider LLM (Z.ai, OpenAI, Anthropic, OpenRouter, custom)
- [+] i18n (en/ru)
- [+] Dark/light theme

---

## Wave 0 -- Infrastructure [DONE]

### 0.1 [DONE] SQLite/PostgreSQL conflict check
### 0.2 [DONE] Prisma Schema -- 30 models
### 0.3 [DONE] API Error Handling -- all 32 routes
### 0.4 [DONE] Zod Validation -- all routes
### 0.5 [DONE] Seed Data
### 0.6 [DONE] ESLint Plugin (4 rules, no-json-column cancelled -- String+JSON is deliberate)

---

## Wave 1 -- Core API & Data Layer [DONE]

### 1.1 [DONE] Agent API -- CRUD + pagination + Zod
### 1.2 [DONE] Flow API -- CRUD + execute + Zod
### 1.3 [DONE] Skills & Standards API -- CRUD + export + import
### 1.4 [DONE] Knowledge API -- CRUD + search + document upload

---

## Wave 2 -- Feature Stores (Zustand) [DONE]

### 2.1 [DONE] Agent Store -- use-agent-store.ts
### 2.2 [DONE] Flow Store -- flow-store.ts (undo/redo deferred)
### 2.3 [DONE] Prompt Studio Store -- with live scoring
### 2.4 [DONE] Dashboard Store -- useDashboardData hook + auto-refresh
### 2.5 [DONE] Skills & Standards Stores
### 2.6 [DONE] Quality Analyzer Store

---

## Wave 3 -- UI Pages [DONE]

### 3.1 [DONE] Dashboard -- live data, KPI, sparklines, heatmap, timeline
### 3.2 [DONE] Agents -- CRUD, EntityPicker, executions
### 3.3 [DONE] Flow Editor -- ReactFlow, 18 nodes, live execution
### 3.4 [DONE] Prompt Studio -- 5 modules (Write, Formulas, Frameworks, Compare, Intent)
### 3.5 [DONE] Knowledge -- collections, documents, TF-IDF search
### 3.6 [DONE] Skills & Standards -- CRUD, rules editor, cross-ref
### 3.7 [DONE] Wiki -- 14 pages, drawer, shiki
### 3.8 [DONE] Settings -- multi-provider LLM, theme, language
### 3.9 [DONE] Landing + Auth (login/signup/verify/forgot/reset)
### 3.10 [DONE] Pipelines -- real execution, node drill-down
### 3.11 [DONE] Templates -- 6 flow templates + 15 prompt templates
### 3.12 [DONE] Hierarchy -- parent/child graph
### 3.13 [DONE] Audit Log -- JSON highlighting, filters

---

## Wave 4 -- LLM Integration [DONE]

### 4.1 [DONE] z-ai-web-dev-sdk -- /api/llm, /api/llm/test
### 4.2 [DONE] Prompt Evaluation -- /api/evaluate-deep, scoring rubric
### 4.3 [DONE] Flow Execution Engine -- /api/flows/[id]/execute, per-node provider/model, usage tracking

---

## Wave 5 -- Agent Intelligence [DONE]

> This wave makes agents ACTUALLY WORK together, not just exist as data.

### 5.1 [DONE] Task API + UI
### 5.2 [DONE] Workflow Engine
### 5.3 [DONE] Executions API (unified)
### 5.4 [DONE] Router -> Specialist Routing
- execNode: router case with keyword/LLM classification strategies
- runFlow: branch-aware execution (reachable tracking, active edges)
- RouterConfig panel: strategy picker, routes editor, keywords, fallback
### 5.5 [DONE] Self-Correction Loop
- POST /api/self-correction: generate -> judge -> self-correct loop
- GET /api/self-correction: list sessions with status counts
- UI: self-correction panel with input, session list, score comparison
### 5.6 [DONE] Team Builder (for Orchestrator)
- TeamTab component: shows child agents as team members
- Add/remove agents to/from team via parentId relationship

---

## Wave 6 -- Resilience & Polish [DONE]

### 6.1 [DONE] Resilience from donor
- Ported api-retry with exponential backoff + withRetry generic wrapper
- Ported circuit-breaker (CLOSED/OPEN/HALF_OPEN states)
- Ported fallback-manager adapted to our ProviderConfig/callLLM architecture
- Ported health-check (checkApiHealth, FailureTracker, ResponseTimeMonitor)
- Applied to /api/llm (retry + fallback), /api/flows/[id]/execute (retry on LLM nodes), /api/self-correction (retry)
- Added GET /api/health endpoint

### 6.2 [DONE] Flow Store undo/redo
- undo/redo already in flow-store.ts (history + _pushHistory)
- Added useUndoRedoKeys hook: Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y

### 6.3 [DONE] Agent Import (ZIP)
- POST /api/agents/import -- JSZip, validates against agentCreateSchema
- AgentImportDialog component: drag-drop file picker, result summary
- Import button in AgentList toolbar

### 6.4 [DONE] Hierarchy Visualization
- Tree view with drag & drop reparenting
- TreeItem extracted to feature component with HTML5 drag/drop
- onDrop calls PUT /api/agents/[id] with new parentId
- Visual feedback: ring highlight on drag over

### 6.5 [DONE] Standards -> ESLint bridge
- GET /api/standards/eslint -- converts Standard records to ESLint rules config
- Severity mapping: error->error, warning->warn, info->warn
- Categories metadata in _meta field

### 6.6 [DONE] Wiki -> GitHub sync
- GET /api/wiki/export -- generates markdown files per wiki page
- Home.md with table of contents, per-page .md with related links
- Compatible with GitHub Wiki format

### 6.7 [DONE] Prompt Export
- GET /api/prompts/export?format=json|yaml|markdown
- Exports agent system prompts in chosen format
- Optional agentId filter

---

## Wave 7 -- Quality

### 7.1 i18n -- full translations [DONE]
- [+] Split translations.ts into 8 namespace files (nav, common, settings, auth, dashboard, pages, landing, index)
- [+] Expand TranslationDict from 3 to 7 namespaces
- [+] Add tKey() interpolation support + dynamic html lang attribute
- [+] Add missing nav keys: Tasks, Workflows, Self-Correction
- [+] Complete RU translations for all pages (~310 strings)
- [+] Complete EN translations for all pages (~310 strings)
- [+] Update all 47 pages and components to use useLanguage()

### 7.2 Testing
- [+] Unit tests for lib/api-error (12 tests)
- [+] Unit tests for resilience/circuit-breaker (7 tests)
- [+] Unit tests for resilience/health-check (5 tests)
- [+] Unit tests for resilience/api-retry (4 tests)
- [+] Unit tests for validations/agent (7 tests)
- [+] Unit tests for validations/common (6 tests)
- [+] Unit tests for knowledge/lib/tf-idf (11 tests)
- [+] Existing tests: auth, crypto, db, llm/types, middleware (38 tests)
- [+] Total: 12 files, 90 tests -- ALL PASSING
- [ ] Integration tests for API routes
- [ ] E2E for key flows (agent CRUD, flow execution)

### 7.3 Documentation
- [ ] API docs (OpenAPI)
- [ ] Wiki content verification

---

## Wave 8 -- Production

### 8.1 Multi-user auth
- [ ] Replace demo admin/admin with NextAuth.js / Clerk
- [ ] RBAC (roles/permissions)

### 8.2 API Rate Limiting
- [ ] Rate limit /api/llm
- [ ] Rate limit /api/flows/[id]/execute

### 8.3 Versioning
- [ ] Versioning for standards + skills

### 8.4 Monitoring
- [ ] Logging
- [ ] Health monitoring
