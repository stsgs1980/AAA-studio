# 3A Studio — Единый нумерованный список задач

> Принцип: **сначала проверяем доноров** (3a-studio-mas, p-mas), берём только рабочее,
> после каждого этапа проект должен быть **запускаемым** (`npm run dev`, `npm run lint`)

## Текущее состояние (инвентарь)

### Чистое репо `/home/z/my-project/3a-studio/`
- ✅ Next.js 15 + TypeScript + Tailwind 4 + shadcn/ui
- ✅ ESLint с кастомным плагином `3a/max-lines`, `3a/max-use-state`, `3a/no-cross-layer`, `3a/no-unicode-escapes`
- ✅ Prisma schema: 12 моделей (Agent, AgentExecution, Flow, FlowVersion, PipelineExecution, PromptTemplate, KnowledgeCollection, KnowledgeDocument, Skill, Standard, AuditLog, Settings)
- ✅ `npm run build` — проходит
- ✅ `npm run lint` — 0 ошибок, 7 предупреждений (только в тестах)
- ✅ API routes: 32 endpoint
- ✅ Features: agent-creator, agents, auth, dashboard, flow-editor, knowledge, landing, pipelines, prompt-library, prompt-studio, quality-analyzer, skills, standards, wiki
- ✅ Пакеты: @stsgs/ui, @stsgs/shared, @stsgs/prompting
- ⚠️ Prisma schema меньше чем у донора (нет Task, Workflow, Testing, Citation, SelfCorrection и др.)

### Донор 1: `/home/z/my-project/3a-studio-mas/` (622 файла)
- Prisma: 30+ моделей — Task, Workflow, PipelineStep, WorkflowExecution, StepExecution, AgentMessage, InteractionLog, PromptHistory, PromptVersion, PromptRegistryEntry, Contradiction, AgentImport, KeyValueStore, TestCase, TestRun, TestResult, CitationCheck, ApprovalRequest, ComparisonSnapshot, AnalysisSession, CostRecord, LatencyAlert, SelfCorrectionSession, FeedbackRecord
- API routes: 33 endpoint (добавлены /tasks, /self-correction, /executions)
- Features: agents, auth, dashboard, flow-editor, knowledge, landing, pipelines, prompt-library, prompt-studio, standards, wiki
- Нет: agent-creator, quality-analyzer, skills (как отдельных features)

### Донор 2: `/home/z/my-project/p-mas/` (80 файлов)
- Hierarchy, workflow components
- API: иерархия агентов
- Минимальный, но рабочая часть

---

## Wave 0 — Инфраструктура (проект запускаемый)

### 0.1 ✅ Проверка SQLite/PostgreSQL конфликта
- Результат: конфликта НЕТ, чистый Prisma ORM

### 0.2 Prisma Schema — дополнить из донора
**Донор**: 3a-studio-mas/prisma/schema.prisma
- [ ] Добавить Task model (из 3a-studio-mas)
- [ ] Добавить Workflow + PipelineStep + WorkflowExecution + StepExecution + AgentMessage (из 3a-studio-mas)
- [ ] Добавить PromptVersion + PromptHistory (из 3a-studio-mas)
- [ ] Добавить TestCase + TestRun + TestResult (из 3a-studio-mas)
- [ ] Добавить SelfCorrectionSession (из 3a-studio-mas)
- [ ] Добавить CostRecord + LatencyAlert (из 3a-studio-mas)
- [ ] Обновить Agent model: formula, twinId, avatar (из 3a-studio-mas)
- [ ] Добавить Skill.standardIds (если нет)
- [ ] `npx prisma db push` — проверить что БД обновляется
- [ ] `npx next build` — проверить что билд проходит

### 0.3 API Error Handling
**Донор**: проверить 3a-studio-mas/src/app/api/ — есть ли общий error wrapper
- [ ] Найти/создать `src/lib/api-error.ts` — общий класс AppError
- [ ] Найти/создать `src/lib/api-response.ts` — helpers: success(), error(), paginate()
- [ ] Обновить все API routes использовать единый формат ответа
- [ ] Проверить `npm run build`

### 0.4 Zod Validation Schemas
**Донор**: проверить 3a-studio-mas/src/features/*/types.ts и p-mas
- [ ] Найти готовые Zod schemas у доноров
- [ ] Создать `src/lib/validations/` — schemas для Agent, Flow, Skill, Standard, Knowledge
- [ ] Подключить к API routes
- [ ] Проверить `npm run build`

### 0.5 Seed Data
**Донор**: 3a-studio-mas/scripts/, 3a-studio/scripts/seed-standards.ts
- [ ] Найти готовый seed у доноров
- [ ] Создать `prisma/seed.ts` — демо-данные для Dashboard
- [ ] Проверить `bun run db:seed`

### 0.6 ESLint Plugin — починка
**Донор**: packages/eslint-plugin/ — уже есть в чистом репо
- [ ] Проверить что кастомные правила работают (`3a/max-lines`, etc.)
- [ ] Добавить правило `3a/no-json-column` (предупреждать о String для JSON)
- [ ] Проверить `npm run lint`

---

## Wave 1 — Core API & Data Layer

### 1.1 Agent API — полный CRUD
**Донор**: 3a-studio-mas/src/app/api/agents/ — уже есть
- [ ] Проверить что текущие routes работают
- [ ] Добавить валидацию через Zod
- [ ] Добавить пагинацию
- [ ] Проверить через curl

### 1.2 Flow API — CRUD + Execute
**Донор**: 3a-studio-mas/src/app/api/flows/ — уже есть
- [ ] Проверить execute route
- [ ] Добавить versioning
- [ ] Добавить валидацию

### 1.3 Skills & Standards API
**Донор**: 3a-studio/src/app/api/skills/, standards/ — уже есть
- [ ] Проверить CRUD
- [ ] Добавить export endpoint
- [ ] Добавить import для Standards

### 1.4 Knowledge API
**Донор**: 3a-studio/src/app/api/knowledge/ — уже есть
- [ ] Проверить CRUD + search
- [ ] Добавить document upload

### 1.5 Новые API из донора
**Донор**: 3a-studio-mas/src/app/api/
- [ ] /tasks — CRUD (из 3a-studio-mas)
- [ ] /self-correction — CRUD (из 3a-studio-mas)
- [ ] /executions — list (из 3a-studio-mas)

---

## Wave 2 — Feature Stores (Zustand)

### 2.1 Agent Store
**Донор**: 3a-studio-mas/src/features/agents/ — hooks/use-agent-store.ts
- [ ] Перенести/проверить store
- [ ] Подключить к API

### 2.2 Flow Store
**Донор**: 3a-studio/src/features/flow-editor/store/flow-store.ts — уже есть
- [ ] Проверить что store работает с ReactFlow
- [ ] Добавить undo/redo

### 2.3 Prompt Studio Store
**Донор**: 3a-studio/src/features/prompt-studio/store/ — уже есть
- [ ] Проверить store
- [ ] Подключить scoring

### 2.4 Dashboard Store
**Донор**: 3a-studio/src/features/dashboard/ — hooks/use-dashboard-data.ts
- [ ] Проверить data hooks
- [ ] Добавить real-time обновления

### 2.5 Skills & Standards Stores
**Донор**: 3a-studio/src/features/skills/store/, standards/store/
- [ ] Перенести/проверить stores

### 2.6 Quality Analyzer Store
**Донор**: 3a-studio/src/features/quality-analyzer/ — hooks/
- [ ] Перенести/проверить store

---

## Wave 3 — UI Pages (рендеринг)

### 3.1 Dashboard Page
**Донор**: 3a-studio/src/app/(dashboard)/dashboard/ — уже есть
- [ ] Проверить рендеринг
- [ ] Подключить к реальным данным через API
- [ ] KPI cards, activity timeline, network chart

### 3.2 Agents Page
**Донор**: 3a-studio/src/app/(dashboard)/agents/ — уже есть
- [ ] Проверить agent list/table
- [ ] CRUD через модалки
- [ ] Agent Creator wizard

### 3.3 Flow Editor Page
**Донор**: 3a-studio/src/app/(dashboard)/editor/ — уже есть
- [ ] Проверить ReactFlow canvas
- [ ] Node palette (drag panel)
- [ ] Config panel (IO schema, execution)

### 3.4 Prompt Studio Page
**Донор**: 3a-studio/src/app/(dashboard)/prompt-studio/ — уже есть
- [ ] Проверить tabs: Write, Frameworks, Formulas, Compare
- [ ] Scoring panel

### 3.5 Knowledge Page
**Донор**: 3a-studio/src/app/(dashboard)/knowledge/ — уже есть
- [ ] Проверить collections list
- [ ] Document viewer

### 3.6 Skills & Standards Pages
**Донор**: 3a-studio/src/app/(dashboard)/skills-page/, standards/ — уже есть
- [ ] Проверить списки
- [ ] CRUD формы

### 3.7 Wiki Page
**Донор**: 3a-studio/src/app/(dashboard)/wiki/ — уже есть
- [ ] Проверить sidebar navigation
- [ ] Проверить content rendering

### 3.8 Settings Page
**Донор**: 3a-studio/src/app/(dashboard)/settings/ — уже есть
- [ ] LLM provider cards
- [ ] Connection test

---

## Wave 4 — LLM Integration

### 4.1 z-ai-web-dev-sdk Chat Completions
- [ ] Настроить SDK в backend
- [ ] `/api/llm` route — проксирование чата
- [ ] `/api/llm/test` — тест подключения

### 4.2 Prompt Evaluation (Quality Analyzer)
- [ ] `/api/evaluate-deep` — глубокая оценка промпта
- [ ] Scoring rubric из @stsgs/prompting
- [ ] Результаты в UI

### 4.3 Flow Execution Engine
- [ ] `/api/flows/[id]/execute` — запуск flow
- [ ] node-exec.ts — выполнение узлов
- [ ] Результаты в PipelineExecution

---

## Wave 5 — Advanced Features

### 5.1 Pipeline Engine (Workflow)
**Донор**: 3a-studio-mas — Task, Workflow модели
- [ ] Workflow CRUD
- [ ] Step execution
- [ ] Agent messages

### 5.2 Self-Correction Loop
**Донор**: 3a-studio-mas — SelfCorrectionSession
- [ ] API route
- [ ] UI panel

### 5.3 Agent Import
**Донор**: 3a-studio-mas — AgentImport model
- [ ] ZIP upload
- [ ] Parse agents from archive

### 5.4 Hierarchy Visualization
**Донор**: p-mas — hierarchy components
- [ ] Tree view
- [ ] Drag & drop

---

## Wave 6 — Polish & Quality

### 6.1 i18n
**Донор**: 3a-studio/src/lib/i18n/ — уже есть
- [ ] RU/EN translations
- [ ] Language switcher

### 6.2 Testing
- [ ] Unit tests для lib/
- [ ] Integration tests для API routes
- [ ] E2E для ключевых flows

### 6.3 Documentation
- [ ] API docs (OpenAPI?)
- [ ] Wiki content verification
