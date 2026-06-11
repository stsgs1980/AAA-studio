# 3A Studio — WORKFLOW

## Что это

3A Studio = IDE для визуального управления AI-агентами. Не просто UI, а единый организм, где всё крутится вокруг одной базы данных (Neon PostgreSQL).

## Архитектура (12 экранов, 4 пакета)

```
3A Studio = IDE для multi-agent systems

  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐
  │ Dashboard│  │ Flow     │  │ Prompt   │  │ Knowledge     │
  │ метрики  │  │ Editor   │  │ Studio   │  │ Base          │
  │ + API    │  │ 18 nodes │  │ 6-мерн.  │  │ collections   │
  │          │  │ ReactFlow│  │ scoring  │  │ + documents   │
  └──────────┘  └──────────┘  └──────────┘  └───────────────┘
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐
  │ Agents   │  │ Hierarchy│  │ Pipeline │  │ Templates     │
  │ CRUD     │  │ граф     │  │ Exec     │  │ галерея       │
  │ +execs   │  │ parent/  │  │ log      │  │ prompt + flow │
  │          │  │ children │  │          │  │               │
  └──────────┘  └──────────┘  └──────────┘  └───────────────┘
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐
  │ Skill    │  │ Standard │  │ Audit    │  │ Settings      │
  │ Forge    │  │ Manager  │  │ Log      │  │               │
  │ code+test│  │ rules    │  │          │  │               │
  └──────────┘  └──────────┘  └──────────┘  └───────────────┘
  ┌──────────────────────────────────────────────────────────┐
  │ Wiki — встроенная документация (14 страниц)              │
  └──────────────────────────────────────────────────────────┘

  Packages:
  @stsgs/ui (токены+тема)     @stsgs/prompting (scoring+формулы)
  @stsgs/shared (типы)        eslint-plugin-3a (3 правила)

  DB: Prisma + PostgreSQL (Neon)
  LLM: Multi-provider LLM (Z.ai SDK + API key, OpenAI, Anthropic, OpenRouter)
```

---

## Ключевое прозрение

3A Studio — это не отдельный проект. Это **новый toolkit**.

```
StsDev-Wiki (решения, ADR)
        ↓ (source of truth)
3A Studio (живая система)
  ├── Standards Manager = замена FRONTEND_STANDARD.md
  ├── Skill Forge = замена 110 папок skills/
  ├── Prompt Studio = замена prompt-engineering_sts/
  ├── Flow Editor = визуальная оркестрация агентов
  ├── Knowledge Base = замена ChromaDB (PostgreSQL!)
  └── Audit Log = замена session-log
        ↓ (экспорт)
Zai-agent-toolkit (скомпилированные скиллы для Z.ai sandbox)
```

Проблема которую решает: вместо 3 репо x 110 скиллов x ручная синхронизация — всё в ОДНОЙ базе. Изменил стандарт → везде обновилось. Создал скилл → привязал к агенту → включил в flow → запустил pipeline.

---

## Текущий статус

### Packages (все рабочие)

| Package | Статус | Содержимое |
|---------|--------|------------|
| @stsgs/prompting | ✅ Рабочий | 9 modules: scoring, formulas (10→17 techniques), frameworks (4→11), system-prompts (5), builders (4), agent-templates (12 roles), intent, comparison |
| @stsgs/shared | ✅ Рабочий | Полные типы для Agent, Skill, Standard, Flow, Knowledge, Prompt |
| @stsgs/ui | ✅ Рабочий | Design tokens (HSL), ThemeProvider, cn utility |
| eslint-plugin-3a | ✅ Рабочий | max-lines(150), max-use-state(3), no-cross-layer |

### Экраны

| Экран | Статус | Детали |
|-------|--------|--------|
| Dashboard | ✅ Живые данные | KPI, sparklines, heatmap, timeline — всё из DB, auto-refresh 30s |
| Landing | ✅ Полный | Hero, Features, Architecture, Stats, CTA, Footer, Framer Motion |
| Auth | ✅ Полный | Login/Signup/Verify/Forgot/Reset + Quick Admin button |
| Wiki | ✅ Полный | 15 статей с реальным контентом, drawer (Ctrl+K), shiki подсветка |
| Prompt Studio | ✅ Полный | 5 модулей: Write (live scoring) + Formulas (10) + Frameworks (4) + Compare (A/B) + Intent |
| Prompt Library | ✅ Полный | 15 шаблонов, 6 категорий, favorites (localStorage), Copy/Clear/Use in Studio |
| Syntax Highlighting | ✅ Полный | Общий CodeBlock (shiki github-dark), 9 языков, compact/full режимы |
| Agents | ✅ Работает | CRUD, executions, systemPrompt, **Skills/Standards picker (EntityPicker)** |
| Flow Editor | ✅ Работает | 18 nodes, ReactFlow, live execution, per-node model, usage tracking |
| Skill Forge | ✅ Rebuild | CRUD, **SkillFile (multi-file)**, file tree + editor, StandardsPicker, **ZIP export**, SKILL.md, midnight palette |
| Standards | ✅ Rebuild | CRUD, rules editor, **cross-ref validation**, unified types (@stsgs/shared), store-driven, 0 useState in detail |
| Knowledge | ✅ Работает | Upload, **TF-IDF semantic search** |
| Pipelines | ✅ Работает | **Real flow execution**, node-level drill-down |
| Hierarchy | ✅ Работает | Визуальный граф parent/child |
| Templates | ✅ Работает | 6 flow templates + prompt library, clone to editor |
| Audit Log | ✅ Работает | JSON подсветка деталей, фильтры по entity |
| Quality Analyzer | ✅ Работает | Heuristic scoring (6 dims), LLM Deep Analysis (4 rubric criteria), Standards check, GitHub/ZIP/Folder/Text input, Clear Results, 4/4 PASS on Vercel |
| Settings | ✅ Работает | Multi-provider LLM, theme/language, key masking |
| i18n | ✅ Работает | en/ru, 17 неймспейсов, интерполяция, sidebar + settings |
| Tests | ✅ 125 тестов | Unit: 90 (lib, validations, resilience), Integration: 35 (auth chain, agent CRUD, cross-ref, crypto) |

---

## QA Test Results (June 2026)

### Vercel Production — 4/4 PASS

| Input Method | Score | Status | Specificity | Structure | Constraints | Examples |
|-------------|-------|--------|-------------|-----------|-------------|----------|
| GitHub URL | 9.2 | PASS | 9 | 9 | 9 | 10 |
| ZIP Archive #1 | 9.2 | PASS | 9 | 9 | 9 | 10 |
| ZIP Archive #2 | 8.4 | PASS | 9 | 9 | 9 | 4 |
| Project Folder | 8.4 | PASS | 9 | 9 | 9 | 6 |

**Pattern:** Examples consistently lowest (4-6/10). All other dimensions 9+. QA performs static text analysis only — format-dependent parsing.

**Next step:** Epic 4 (Agent-Scanner) — QA evolves into agent with tools, decoupled from format. Test on zai-agent-toolkit (110+ skills) before building more metrics.

### Key Decisions (June 2026)

1. **No separate wireframe build** — P-MAS-architector wireframe = target spec for AAA-studio QA, NOT a separate project
2. **QA becomes agent with tools** — instead of hardcoding parsers, use agent with read_file/grep/compare tools (format-agnostic)
3. **Real data first** — test on real toolkit (110+ skills) BEFORE building Epic 5 metrics

### P-MAS Extraction (from 5 architecture documents)

Extracted and documented in `docs/P-MAS-EXTRACTION-FOR-AAA-STUDIO.md`:

- **9 quality metrics + A-F scoring** — Epic 5 (SonarMAS)
- **7 anti-pattern detectors** — Epic 5
- **VRS (verifier + rubric dual scoring)** — Epic 4 (agent-scanner)
- **Skill Classification (5 axes)** — Epic 5
- **Standard Classification (4 types)** — Epic 5
- **Agent-Scanner approach** — Epic 4 (replaces static parsing with tool-using agent)

Discarded: "Правила генерации каталога" (project-specific).

---

## Roadmap

### Phase 1 — MVP ✅ COMPLETE

- [x] Dashboard с живыми данными
- [x] Landing + Auth
- [x] Wiki (14 статей, drawer)
- [x] Prompt Studio v2 (scoring, формулы, фреймворки, compare)
- [x] Prompt Library (15 шаблонов, favorites, studio integration)
- [x] Syntax Highlighting (CodeBlock везде)
- [x] **Flow Editor → live execution** (executeNode через z-ai-web-dev-sdk)
- [x] **Standards Manager → реальные правила** (CRUD + rules editor)

### Phase 2 — Интеграции ✅ COMPLETE

- [ ] Skill Forge → выполнение кода в sandbox
- [x] Knowledge Base → TF-IDF semantic search
- [x] **Pipeline → реальный запуск flow execution** (node-level drill-down)
- [x] **Templates → flow templates (6 patterns + prompt library)**

### Phase 2.5 — Provider Intelligence 🔥 NEW

> **Стратегическое прозрение**: завтра любой LLM (DeepSeek, Groq, Gemini, Mistral, Cohere).
> Для эффективной работы агентов нужно несколько провайдеров с роутингом по задачам.

- [ ] **Provider Health API** — переписать /api/llm/debug в нормальный diagnostic endpoint
  - GET /api/llm/health: статус ВСЕХ провайдеров разом (status, latency, available models)
  - Health check: жив ли провайдер, валиден ли ключ
  - Latency benchmark: реальный round-trip (не пинг)
- [ ] **Cost Dashboard** — расходы по провайдерам (уже есть usage токенов)
- [ ] **Provider Router** — автоматический выбор провайдера по задаче
  - Дешёвый для bulk-операций
  - Быстрый для streaming
  - Умный для reasoning
- [ ] **Failover** — если основной упал → автоматически на запасной
- [ ] **Feature-порт** — любой провайдер подключается плагином, не хардкодом

Файлы: `/api/llm/debug/route.ts` → `/api/llm/health/route.ts`, `src/lib/llm/client.ts`

### Phase 3 — Prompting + Standards + Agent Templates

> **Build order**: prompting (item 3) -> standards seed (item 1) -> agent templates (item 2).
> Зависимость: standards нужны type-based шаблоны из prompting, а agent templates нужны стандарты.

#### Phase 3A — Prompting Module (item 3, текущий таск)

Замена/расширение `@stsgs/prompting` на основе исследования типологии агентов.
Что делаем (не все 20+11 формул, а только нужное):

- [x] 5 system prompt templates (Tool-Calling, Router, Specialist, Orchestrator, Evaluator)
- [x] Tool description builder (Anthropic ACI best practices)
- [x] Backstory builder (CrewAI pattern: 3-5 sentences expertise)
- [x] Evaluation rubric builder (критерии + scoring для Evaluator)
- [x] Collaboration context builder (team roster для Orchestrator+Workers)
- [x] Миграция типов из prompting-v0.0 в @stsgs/shared
- [x] Расширение frameworks: 4 -> 11
- [x] Добавление 17 техник (из 20, остальные на Phase 5)

#### Phase 3B — Standards Seed (item 1)

- [x] 17 стандартов из Zai-agent-toolkit/standards/ -> StandardRule records в DB
- [x] Каждый с pattern для автопроверки
- [x] Категории: general, prompt, agent, flow, quality, security, architecture

> **NOTE**: Infrastructure built (parse-md.ts, seed-standards.ts, import API, UI button), but DB is currently EMPTY — 0 standards seeded. Standards need quality review before seeding.

#### Phase 3C — Agent Templates (item 2)

- [x] 12 role templates (code-architect, frontend-specialist, etc.)
- [x] 5 type-based templates (Tool-Calling, Router, Specialist, Orchestrator, Evaluator)
- [ ] 7 type-based templates (ReAct, Planner, Executor, etc.) — deferred to Phase 4-5
- [x] Связка с Skills через standardIds

> **NOTE**: 7 type-based templates (ReAct, Planner, Executor, etc.) NOT done — deferred to Phase 4-5.

### Phase 3D — Мосты (экспорт)

- [x] Skill Forge -> экспорт SKILL.md для Z.ai sandbox
- [x] Skill Forge -> ZIP экспорт (SkillFile + SKILL.md + package.json)
- [ ] Standards Manager -> генерация ESLint правил из DB
- [ ] Wiki -> синхронизация с GitHub Wiki
- [ ] Prompt Studio -> экспорт промптов в разные форматы

### Phase 4 — Agent-Scanner (Epic 4) 🔥 CURRENT

> **Key insight:** QA is format-dependent (static text parsing). Agent with tools (read_file, grep, compare) works on ANY toolkit, agent, or format.

- [ ] 4.1 Smoke test: QA on zai-agent-toolkit (110+ skills) — see what breaks
- [ ] 4.2 Define agent tools for scanner (read_file, list_dir, grep, compare)
- [ ] 4.3 Build scanner agent — flow with tools in Flow Editor
- [ ] 4.4 Wire scanner into Quality Analyzer UI (replaces evaluate-deep)
- [ ] 4.5 Add cross-reference checking (skill mentions standard -> exists?)
- [ ] 4.6 Re-test on toolkit: static QA vs agent-scanner — data drives Epic 5

### Phase 5 — SonarMAS: 9-Metric Quality Engine (Epic 5)

> **Depends on Epic 4 findings.** From P-MAS wireframe Tab Quality.

- [ ] 5.1 9-metric weighted scoring engine (Skill Completeness, Standard Coverage, Cross-Ref Integrity, Anti-Pattern Score, Version Consistency, Doc Freshness, Test Coverage, Registry Alignment, Conflict Resolution)
- [ ] 5.2 Grade A-F badge + Radar chart
- [ ] 5.3 7 anti-pattern detectors (Tab Issues)
- [ ] 5.4 Skill Classification (5 axes) + Standard Classification (4 types)

### Phase 6 — Production + Advanced Agent Types

- [ ] Multi-user auth (не demo admin/admin)
- [ ] RBAC (roles/permissions)
- [ ] Versioning для standards + skills
- [ ] API rate limiting
- [ ] ReAct, Plan-and-Execute, Prompt Chaining agent types

### ⏸ Explicitly Deferred

> Вещи которые осознанно отложены — не потому что не нужны, а потому что не сейчас.

| Что | Почему отложено | Когда вернуться |
|-----|----------------|-----------------|
| Полное покрытие API routes (34/37 без тестов) | Архитектура в flux, тесты будут ломаться при каждом изменении | После стабилизации P0-2, P0-3 |
| E2E тесты (Playwright) | UI активно меняется, E2E хрупкие и дорогие в поддержке | После Phase 3 |
| Coverage reporting (@vitest/coverage-v8) | Не установлен, не критично пока тестов мало | После стабилизации тестов |
| i18n → next-intl миграция | Текущая контекстная система работает, next-intl — Phase 8.2 по master-plan | Phase 8 |
| Standards → ESLint code generation | Нужна стабильная SkillFile модель (P0-2) | После P0-2, P0-3 |

### Phase 5 — Advanced Agent Types

- [ ] Autonomous agent (open-ended loop, stop conditions)
- [ ] Parallel/Voting (multi-LLM reliability)
- [ ] Deferred techniques: Tree-of-Thought, Least-to-Most, Assumption Challenge, Output Masking, Stakeholder Simulation, Analogical Reasoning

#### Security Status

| Measure | Status | Details |
|---------|--------|---------|
| JWT Authentication | ✅ DONE | jose HS256, Edge middleware, httpOnly cookie (commit f171311) |
| API Key Encryption | ✅ DONE | AES-256-GCM, encrypt on save, decrypt on read (commit f171311) |
| Key Masking in UI | ✅ DONE | GET /api/settings returns sk-****abcd, full key only on POST (commit 1bd409a) |
| Rate Limiting | ❌ TODO | Ограничить вызовы `/api/llm` и `/api/flows/[id]/execute` (Wave 8.2) |
| Multi-user Auth | ❌ TODO | Заменить demo admin/admin на NextAuth.js / Clerk (Wave 8.1) |

---

## Проблемы которые надо решить

| Проблема | Где | Решение |
|----------|-----|---------|
| Skill Forge → Z.ai bridge | Skill Forge + /home/z/my-project/skills/ | Экспорт: DB → SKILL.md + scripts/ |
| Standards → ESLint bridge | Standards Manager + eslint-plugin-3a | ✅ DONE — генерация rules из DB → JSON config (Wave 6.6) |
| Flow Editor → Pipeline | executeNode() placeholder | Интеграция с z-ai-web-dev-sdk |
| Knowledge → RAG | KnowledgeDocument в DB | VectorStore node → реальные embeddings |
| Wiki → StsDev-Wiki | Wiki в 3A Studio | Синхронизация с GitHub Wiki |

---

## Технические правила

1. **Файлы ≤ 150 строк** — eslint-plugin-3a/max-lines
2. **≤ 3 useState на компонент** — eslint-plugin-3a/max-use-state
3. **Нет cross-layer импортов** — features не импортируют features напрямую
4. **Midnight палитра** — #0D1117 bg, #58A6FF accent, единообразно везде
5. **Shiki github-dark** — для подсветки кода во всём приложении
6. **Zustand** — всё shared state
7. **Prisma + Neon** — единственный источник данных
8. **Demo auth** — admin/admin через Quick Admin button (до Phase 4)

---

## Коммиты

| Commit | Описание |
|--------|----------|
| c954d7b | Landing + Auth system |
| e324670 | Quick Admin + Zod fix |
| 08ebd1f | Wiki + shiki syntax highlighting |
| 49f6929 | Prompt Studio v2 |
| c4b0040 | Shared CodeBlock component |
| 707c3af | Prompt Library (15 templates, favorites, studio integration) |
| 3bdbcf4 | Theme toggle fix + i18n (en/ru) + clickable chevron |
| 1bd409a | Key masking (GET /api/settings returns sk-****abcd) |
| c335476 | Standards/Skills rebuild — unified types, midnight palette, store-driven |
| cdc1e12 | feat(flow-editor): P0-2 Version History + P0-3 Data Contract |
| aacaee9 | feat(flow-editor): P0-1 Typed Connections |
| 3a873ef | fix(llm): Z.ai provider uses OpenAI format with API key, SDK as sandbox fallback |
| 55ea7c4 | feat(llm): auto-inject ZAI_API_KEY env var for Vercel deployment |
