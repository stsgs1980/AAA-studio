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

## Wave 6 -- Resilience & Polish (CURRENT)

### 6.1 Resilience from donor
**Donor**: p-mas/src/lib/ -- api-retry, circuit-breaker, fallback-manager, health-check
- [ ] Port api-retry with exponential backoff
- [ ] Port circuit-breaker
- [ ] Port fallback-manager
- [ ] Port health-check
- [ ] Apply to /api/llm and /api/flows/[id]/execute

### 6.2 Flow Store undo/redo
- [ ] Implement undo/redo in flow-store.ts
- [ ] Keyboard shortcuts Ctrl+Z / Ctrl+Shift+Z

### 6.3 Agent Import (ZIP)
**Donor**: 3a-studio-mas -- AgentImport model
- [ ] ZIP upload endpoint
- [ ] Parse agents from archive
- [ ] Import UI

### 6.4 Hierarchy Visualization
**Donor**: p-mas -- hierarchy components
- [ ] Tree view (not just graph)
- [ ] Drag & drop reparenting

### 6.5 Standards -> ESLint bridge
- [ ] Generate ESLint rules from Standards DB records
- [ ] Export as JSON config

### 6.6 Wiki -> GitHub sync
- [ ] Sync wiki pages to GitHub Wiki

### 6.7 Prompt Export
- [ ] Export prompts in multiple formats (Markdown, YAML, JSON)

---

## Wave 7 -- Quality

### 7.1 i18n -- full translations
- [ ] Complete RU translations for all pages
- [ ] Complete EN translations for all pages

### 7.2 Testing
- [ ] Unit tests for lib/ (auth, crypto, llm, api-error)
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
