# 3A Studio — Аудит: Доноры vs Реализация vs Планы

> Дата: 2026-06-12 (обновлено)
> Цель: Полный сравнительный анализ — что есть в донорах, что реализовано, что отсутствует

---

## 8 Доноров (полный список)

| # | Донор | Источник | Что уникального |
|---|-------|----------|-----------------|
| 1 | **P-mas-studio** | GitHub stsgs1980 | Dashboard 12+ секций, hierarchy v2 (animated edges, flow particles), workflow pipeline UI, prompt-studio, 50 shadcn/ui компонентов |
| 2 | **P-MAS-architector** | GitHub stsgs1980 | @stsgs/prompting (формулы, скоринг, фреймворки), 60+ skills, 14 standards, 23 model configs |
| 3 | **P-MAS_init** | GitHub stsgs1980 | 26 агентов / 8 групп / 20 формул, 6 typed connections (Command/Sync/Twin/Delegate/Supervise/Broadcast), WebSocket Socket.IO сервис, watchdog, Caddy reverse proxy, Data Contract Visualization, governance framework |
| 4 | **Flow-Studio-Pro** | Локально | React Flow v12 паттерны, EventBus, NodeExecutor, Zustand store |
| 5 | **MVP-Flow-Studio-Pro** | Локально | LLMProvider, Version History, Template Gallery UI |
| 6 | **prompting-v0.0** | Локально | 20 когнитивных формул, blind comparison, intent detection |
| 7 | **Zai-agent-toolkit** | GitHub v2.0.5 | 19 стандартов, agent templates, dashboard-integration |
| 8 | **FLOW_STUDIO_PRO_SPECIFICATION** | Документ | 12-screen архитектура, 20 node types (текущее состояние), gap analysis |

---

## Что УЖЕ реализовано в 3A Studio (подтверждено аудитом кода)

### Flow Editor
- 20 node types (6 категорий: AI/LLM 5, Management 4, Data 4, Knowledge 2, Integration 2, Special 3)
- Drag & drop из панели на холст
- Config Panel (6 табов: config, execution, io-schema, router-config, template-picker, + Duplicate/Delete)
- Command Palette (Ctrl+K, cmdk, 19 команд в 4 группах)
- Flow Assistant Wizard (5 стадий: Goal→Architecture→Features→Config→Review, 4 builder'а)
- SSE Live Execution (GET /api/flows/[id]/execute-sse, события start/node_start/node_done/node_error/skip/done)
- Undo/Redo (50 шагов, Ctrl+Z/Ctrl+Y)
- Auto-backup (30s debounce, localStorage)
- Keyboard shortcuts (Ctrl+D duplicate, Delete/Backspace delete node)
- Custom edges (smoothstep)

### MCP Server
- POST (JSON-RPC) + GET (SSE transport) + DELETE (session close)
- tools/list, tools/call, resources/list, resources/read, prompts/list, prompts/get
- Skill execution (sandboxed JS + LLM fallback)
- Knowledge collections как MCP resources
- Prompt templates как MCP prompts

### Skill Export
- OpenAI Function Calling format
- MCP Tool format
- A2A Agent Card format
- SKILL.md (Markdown)
- ZIP (skill folder structure)
- Prompt export (JSON/YAML/Markdown)
- Wiki export (GitHub Markdown)

### Prompt Studio
- 5 модулей: Write, Compare, Formulas, Frameworks, Intent
- 6-критериальный scoring (clarity, specificity, structure, completeness, creativity, actionability)
- 10 когнитивных формул (RTF, RISE, CARE, STONE, CREATE, CO-STAR, CHAIN, TRACE, SCOPE, PACKED)
- Intent detection с confidence badge
- Side-by-side comparison

### Multi-provider LLM
- Z.ai (SDK), OpenAI, Anthropic, OpenRouter + custom
- Encrypted API keys (AES-256-GCM)
- Resilience: Retry (exponential backoff), Circuit Breaker, Fallback Manager, Health Check
- Cost estimation (14+ моделей)

### Knowledge Base
- TF-IDF search engine (custom, cosine similarity)
- Collection CRUD, Document CRUD
- Search API

### Self-Correction
- Generate → Judge → Revise loop
- Configurable max retries
- Score comparison

### Prompt Templates
- 8 built-in (Summarizer, Translator, Code Reviewer, Sentiment, Conversational, Step-by-Step, Creative Writer, Data Extractor)
- CRUD API
- Template Picker в ConfigTab

### Auth
- JWT login/logout (jose, HS256)
- httpOnly cookie (7d)
- Edge middleware для защищённых маршрутов
- requireAdmin() guard на /api/dashboard/reset и /seed

### i18n
- EN/RU, 8 namespaces (pages, auth, nav, settings, dashboard, landing, common, index)
- Key interpolation, auto-detection

### Infrastructure
- 37 Prisma models
- 66 API route files
- 26 pages (5 auth + 1 root + 20 platform)
- 5 monorepo packages (@stsgs/shared, ui, prompting, eslint-plugin, verify-docs submodule)
- 20 test files
- Wiki (15 страниц)

---

## Фичи из доноров, которых НЕТ в 3A Studio

### Критичные (P0) — все DONE

| Фича | Из донора | Статус | Когда |
|------|-----------|--------|-------|
| **6 Typed Connections** | P-MAS_init | ✅ DONE (Command/Sync/Twin/Delegate/Supervise/Broadcast) | Wave 7.5 |
| **Version History UI** | MVP-Flow-Studio-Pro | ✅ DONE (FlowVersion list panel + preview diff + restore) | Wave 7.5 |
| **Data Contract Visualization** | P-MAS_init | ✅ DONE (I/O schema совместимость, Compatible/Incompatible/Unknown) | Wave 7.5 |

### Важные (P1) — 5/6 DONE

| Фича | Из донора | Статус | Когда |
|------|-----------|--------|-------|
| **Cost Monitoring Dashboard** | CostRecord/LatencyAlert | ✅ DONE (API + UI) | Wave 7.5 |
| **Testing System UI** | TestCase/TestRun/TestResult | ✅ DONE (API + UI) | Wave 7.5 |
| **HITL Approvals** | ApprovalRequest | ✅ DONE (API + UI) | Wave 7.5 |
| **Feedback Loop Arrows** | P-MAS_init | ✅ DONE (SVG curved arrows) | Wave 7.5 |
| **26-agent seed data** | P-MAS_init | ✅ DONE (Rich seed data) | Wave 7.5 |
| **API Integration Tests** | Wave 7.2 / cascade F1.4 | ❌ TODO — хрупкость, нужен coverage | — |

### Желательные (P2) — 2/4 DONE

| Фича | Из донора | Статус |
|------|-----------|--------|
| **Animated Flow Particles** (SVG animateMotion на edges) | P-MAS_init | ✅ DONE |
| **WebSocket Socket.IO** | P-MAS_init | ✅ DONE (SSE transport) |
| **Cron Scheduling** (triggerType=schedule в модели, но нет runner) | Spec | ❌ TODO |
| **Vector Search backend** (ноды Embedding/VectorStore есть, pgvector нет) | Spec | ❌ TODO |

### Продакшен (P3)

| Фича | Из плана | Оценка |
|------|----------|--------|
| **Multi-user Auth** (NextAuth.js / Clerk) | Wave 8.1 | 3-5 дней |
| **RBAC** (roles/permissions) | Wave 8.1 | 2-3 дня |
| **API Rate Limiting** | Wave 8.2 | 1 день |
| **Contradiction/Citation/Comparison/Interaction/Registry** | Schema-only модели | 3-5 дней |

---

## Schema-only модели БЕЗ API/UI (мёртвый груз — 9 из 37)

| Модель | Назначение | API? | UI? |
|--------|-----------|------|-----|
| Contradiction | Обнаружение конфликтов в агентах | ❌ | ❌ |
| CitationCheck | Проверка цитат | ❌ | ❌ |
| AnalysisSession | Мультиагентный анализ | ❌ | ❌ |
| FeedbackRecord | Обратная связь | ❌ | ❌ |
| ComparisonSnapshot | A/B сравнение | ❌ | ❌ |
| InteractionLog | Лог взаимодействий | ❌ | ❌ |
| PromptHistory | История промптов | ❌ | ❌ |
| PromptRegistryEntry | Реестр промптов | ❌ | ❌ |
| KeyValueStore | Универсальное KV-хранилище | ❌ | ❌ |

> 6 моделей из оригинального списка получили API+UI в Wave 7.5: ApprovalRequest, CostRecord, LatencyAlert, TestCase, TestRun, TestResult.

---

## Статус волн (UNIFIED_TASK_LIST.md)

| Волна | Название | Статус |
|-------|----------|--------|
| Wave 0 | Infrastructure | ✅ DONE |
| Wave 1 | Core API & Data Layer | ✅ DONE |
| Wave 2 | Feature Stores (Zustand) | ✅ DONE |
| Wave 3 | UI Pages | ✅ DONE |
| Wave 4 | LLM Integration | ✅ DONE |
| Wave 5 | Agent Intelligence | ✅ DONE |
| Wave 6 | Resilience & Polish | ✅ DONE |
| Wave 7 | Quality | ✅ DONE (i18n, тесты, docs, anti-monolith рефакторинг) |
| Wave 8 | Production | ❌ Не начат |
| **Wave 7.5** | **Donor Features + Dead Models** | ✅ DONE |

---

## Статус 3A-IMPLEMENTATION-PLAN (Фазы 1-4)

| Фаза | Название | Статус |
|------|----------|--------|
| Фаза 1 | Миграция Prisma — новые поля Skill | ✅ DONE (slug, version, skillId, triggers, compatibility, dependencies, annotations, author, license) |
| Фаза 2 | Единый SKILL.md формат | ✅ DONE (generate-manifest.ts, generate-zip.ts, format-adapters.ts) |
| Фаза 3 | MCP-эндпоинты | ✅ DONE (/api/mcp с JSON-RPC + SSE) |
| Фаза 4 | Починка багов + Standards Validate | ✅ DONE (Condition/Filter fixed, /api/standards/validate) |

---

## Рекомендация: Волна 9 (актуальные задачи)

**Название:** «Оживление 9 schema-only моделей + Production»

**Цель:** Оставшиеся 9 Prisma-моделей без API/UI получить реализацию; подготовка к продакшену

### Задачи (по приоритету)

| # | Задача | Приоритет | Из cascade-state.json |
|---|--------|-----------|----------------------|
| 9.1 | API Integration Tests — cover critical routes | P1 | F1.4 |
| 9.2 | Multi-user Auth — replace demo admin/admin | P1 | F1.1 |
| 9.3 | API Rate Limiting for /api/llm and /api/flows | P1 | F1.2 |
| 9.4 | Standards seeding — 19 reviewed standards into DB | P1 | F1.3 |
| 9.5 | Oживить 9 schema-only моделей (API + UI) | P2 | — |
| 9.6 | Cron Scheduling runner (triggerType=schedule) | P2 | — |
| 9.7 | Vector Search backend (pgvector) | P2 | — |
| 9.8 | RBAC (roles/permissions) | P3 | — |
| 9.9 | Agent-Scanner: QA на zai-agent-toolkit (110+ skills) | P2 | F2.1 |
| 9.10 | 9-Metric Quality Engine (SonarMAS) | P2 | F2.2 |
| 9.11 | Advanced Agent Types (ReAct, Plan-and-Execute, etc.) | P2 | F2.3 |

> Задачи 9.1-9.4 привязаны к cascade-state.json (P1). Задачи 9.5-9.8 — новые, добавлены из текущего аудита.

### Результат
- 9 оставшихся «мёртвых» моделей получают API + UI
- Production readiness: multi-user auth, rate limiting, RBAC
- Advanced agent intelligence: SonarMAS quality engine, scanner

---

## Quality Audit of Zai-agent-toolkit Standards (2026-06-01)

19 стандартов проанализированы через heuristic scoring (average 7.9/10) и LLM deep analysis:

- **16/19 PASS** (8/10): стандарты хорошего качества
- **2/19 WARN** (7/10): MARKDOWN_STANDARD, README_TEMPLATE — нужно улучшение
- **1/19 FAIL** (5/10): стандарт с критическими проблемами
- **Critical**: GITHUB_STANDARD содержит противоречие между §3.1 (запрещает force push) и §5.4 (разрешает --lease)
- **FRONTEND_STANDARD** §10.4 обрывается на середине предложения
- **Decision**: стандарты НЕ сидированы в БД — нужен ручной quality review перед seeding
