# 3A Studio — Аудит: Доноры vs Реализация vs Планы

> Дата: 2026-06-01
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
| 8 | **FLOW_STUDIO_PRO_SPECIFICATION** | Документ | 12-screen архитектура, 18 node types, gap analysis |

---

## Что УЖЕ реализовано в 3A Studio (подтверждено аудитом кода)

### Flow Editor
- 18 node types (6 категорий: AI/LLM, Management, Data, Knowledge, Integration, Special)
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
- 30+ Prisma models
- 45+ API route files
- 25 pages (5 auth + 20 dashboard)
- 4 monorepo packages (@stsgs/shared, ui, prompting, eslint-plugin)
- 18 test files
- Wiki (11 страниц)

---

## Фичи из доноров, которых НЕТ в 3A Studio

### Критичные (P0)

| Фича | Из донора | Почему критично | Оценка |
|------|-----------|-----------------|--------|
| **6 Typed Connections** | P-MAS_init | Сейчас edges без типа. P-MAS_init имеет Command/Sync/Twin/Delegate/Supervise/Broadcast с уникальными визуальными стилями. Без этого hierarchy плоская | 1-2 дня |
| **Version History UI** | MVP-Flow-Studio-Pro | Модель FlowVersion есть в Prisma, API для версий есть, но нет UI для просмотра/восстановления предыдущих версий flow | 1 день |
| **Data Contract Visualization** | P-MAS_init | I/O schema совместимость между шагами workflow. Показывает Compatible/Incompatible/Unknown + JSON schema preview. Критично для debugging | 1 день |

### Важные (P1)

| Фича | Из донора | Почему важно | Оценка |
|------|-----------|--------------|--------|
| **Cost Monitoring Dashboard** | Модель CostRecord/LatencyAlert | Модели в Prisma лежат мёртвые — нет ни API, ни UI. LLM стоит денег — мониторинг обязателен | 1-2 дня |
| **Testing System UI** | Модель TestCase/TestRun/TestResult | Модели есть, нет API/UI. Навыки нужно тестировать | 2-3 дня |
| **HITL Approvals** | Модель ApprovalRequest | Human-in-the-loopApproval модель лежит. Важно для безопасных операций | 1 день |
| **Feedback Loop Arrows** | P-MAS_init | Визуализация fallback-петель в workflow. Визуально критично для понимания flow | 4 часа |
| **26-agent seed data** | P-MAS_init | P-MAS_init имеет богатую сид-дату: 26 агентов, 8 групп, 20 формул, 6 типов связей, 5 workflow. У нас — минимальный сид | 2 часа |
| **API Integration Tests** | Wave 7.2 | 0 route-тестов — хрупкость. Любой change может сломать API | 2 дня |

### Желательные (P2)

| Фича | Из донора | Оценка |
|------|-----------|--------|
| **Animated Flow Particles** (SVG animateMotion на edges) | P-MAS_init | 1 день |
| **WebSocket Socket.IO** | P-MAS_init | 1-2 дня (SSE уже работает) |
| **Cron Scheduling** (triggerType=schedule в модели, но нет runner) | Spec | 1 день |
| **Vector Search backend** (ноды Embedding/VectorStore есть, pgvector нет) | Spec | 3-5 дней |

### Продакшен (P3)

| Фича | Из плана | Оценка |
|------|----------|--------|
| **Multi-user Auth** (NextAuth.js / Clerk) | Wave 8.1 | 3-5 дней |
| **RBAC** (roles/permissions) | Wave 8.1 | 2-3 дня |
| **API Rate Limiting** | Wave 8.2 | 1 день |
| **Contradiction/Citation/Comparison/Interaction/Registry** | Schema-only модели | 3-5 дней |

---

## Schema-only модели БЕЗ API/UI (мёртвый груз)

| Модель | Назначение | API? | UI? |
|--------|-----------|------|-----|
| Contradiction | Обнаружение конфликтов в агентах | ❌ | ❌ |
| CitationCheck | Проверка цитат | ❌ | ❌ |
| ApprovalRequest | Human-in-the-loop | ❌ | ❌ |
| AnalysisSession | Мультиагентный анализ | ❌ | ❌ |
| CostRecord | Мониторинг стоимости | ❌ | ❌ |
| LatencyAlert | Предупреждения о задержке | ❌ | ❌ |
| FeedbackRecord | Обратная связь | ❌ | ❌ |
| ComparisonSnapshot | A/B сравнение | ❌ | ❌ |
| TestCase | Тестовые случаи | ❌ | ❌ |
| TestRun | Прогоны тестов | ❌ | ❌ |
| TestResult | Результаты тестов | ❌ | ❌ |
| InteractionLog | Лог взаимодействий | ❌ | ❌ |
| PromptHistory | История промптов | ❌ | ❌ |
| PromptRegistryEntry | Реестр промптов | ❌ | ❌ |
| KeyValueStore | Универсальное KV-хранилище | ❌ | ❌ |

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
| Wave 7 | Quality | ⚠️ Частично (i18n DONE, тесты частично, docs нет) |
| Wave 8 | Production | ❌ Не начат |
| **Wave 9** | **Donor Features + Dead Models** | 🆕 Предложение |

---

## Статус 3A-IMPLEMENTATION-PLAN (Фазы 1-4)

| Фаза | Название | Статус |
|------|----------|--------|
| Фаза 1 | Миграция Prisma — новые поля Skill | ✅ DONE (slug, version, skillId, triggers, compatibility, dependencies, annotations, author, license) |
| Фаза 2 | Единый SKILL.md формат | ✅ DONE (generate-manifest.ts, generate-zip.ts, format-adapters.ts) |
| Фаза 3 | MCP-эндпоинты | ✅ DONE (/api/mcp с JSON-RPC + SSE) |
| Фаза 4 | Починка багов + Standards Validate | ✅ DONE (Condition/Filter fixed, /api/standards/validate) |

---

## Рекомендация: Волна 9

**Название:** «Оживление мёртвых моделей + Донорные фичи»

**Цель:** Все Prisma-модели получают API + UI; ключевые донорные фичи из P-MAS_init перенесены

### Задачи (по приоритету)

| # | Задача | Приоритет | Время |
|---|--------|-----------|-------|
| 9.1 | 6 Typed Connections (edge types + визуализация) | P0 | 1-2 дня |
| 9.2 | Version History UI (FlowVersion просмотр/восстановление) | P0 | 1 день |
| 9.3 | Data Contract Visualization (I/O schema совместимость шагов) | P0 | 1 день |
| 9.4 | Cost Monitoring Dashboard (CostRecord + LatencyAlert API + UI) | P1 | 1-2 дня |
| 9.5 | Testing System (TestCase/TestRun/TestResult API + UI) | P1 | 2-3 дня |
| 9.6 | HITL Approvals (ApprovalRequest API + UI) | P1 | 1 день |
| 9.7 | Feedback Loop Arrows (визуализация fallback-петель в workflow) | P1 | 4 часа |
| 9.8 | Rich seed data из P-MAS_init (26 агентов, 8 групп, 6 типов связей) | P1 | 2 часа |
| 9.9 | Animated Flow Particles (SVG animateMotion на edges) | P2 | 1 день |
| 9.10 | WebSocket Socket.IO (real-time статус агентов) | P2 | 1-2 дня |

### Итого: ~7-12 дней

### Результат
- Все «мёртвые» Prisma-модели оживают (API + UI)
- Flow Editor получает typed connections + version history + data contracts
- P-MAS_init донорные фичи перенесены
- Monitoring (cost + latency) работает
