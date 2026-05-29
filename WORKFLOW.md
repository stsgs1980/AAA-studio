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
  LLM: z-ai-web-dev-sdk через /api/llm
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
| @stsgs/prompting | ✅ Рабочий | 6 скореров, 10 формул, 4 фреймворка, intent, comparison |
| @stsgs/shared | ✅ Рабочий | Полные типы для Agent, Skill, Standard, Flow, Knowledge, Prompt |
| @stsgs/ui | ✅ Рабочий | Design tokens (HSL), ThemeProvider, cn utility |
| eslint-plugin-3a | ✅ Рабочий | max-lines(150), max-use-state(3), no-cross-layer |

### Экраны

| Экран | Статус | Детали |
|-------|--------|--------|
| Dashboard | ✅ Живые данные | KPI, sparklines, heatmap, timeline — всё из DB, auto-refresh 30s |
| Landing | ✅ Полный | Hero, Features, Architecture, Stats, CTA, Footer, Framer Motion |
| Auth | ✅ Полный | Login/Signup/Verify/Forgot/Reset + Quick Admin button |
| Wiki | ✅ Полный | 14 статей с реальным контентом, drawer (Ctrl+K), shiki подсветка |
| Prompt Studio | ✅ Полный | 5 модулей: Write (live scoring) + Formulas (10) + Frameworks (4) + Compare (A/B) + Intent |
| Prompt Library | ✅ Полный | 15 шаблонов, 6 категорий, favorites (localStorage), Copy/Clear/Use in Studio |
| Syntax Highlighting | ✅ Полный | Общий CodeBlock (shiki github-dark), 9 языков, compact/full режимы |
| Agents | ✅ Работает | CRUD, executions, systemPrompt, **Skills/Standards picker (EntityPicker)** |
| Flow Editor | ✅ Работает | 18 nodes, ReactFlow, live execution, per-node model, usage tracking |
| Skill Forge | ✅ Rebuild | CRUD, code/tests, **StandardsPicker**, SKILL.md export, **midnight palette** |
| Standards | ✅ Rebuild | CRUD, rules editor, **cross-ref validation**, unified types (@stsgs/shared), store-driven, 0 useState in detail |
| Knowledge | ✅ Работает | Upload, **TF-IDF semantic search** |
| Pipelines | ✅ Работает | **Real flow execution**, node-level drill-down |
| Hierarchy | ✅ Работает | Визуальный граф parent/child |
| Templates | ✅ Работает | 6 flow templates + prompt library, clone to editor |
| Audit Log | ✅ Работает | JSON подсветка деталей, фильтры по entity |
| Settings | ✅ Работает | Multi-provider LLM, theme/language, key masking |
| i18n | ✅ Работает | en/ru, sidebar + settings |

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
> Подробности: [docs/ROADMAP.md](docs/ROADMAP.md), [docs/PROMPTING_MODULE.md](docs/PROMPTING_MODULE.md)

#### Phase 3A — Prompting Module (item 3, текущий таск)

Замена/расширение `@stsgs/prompting` на основе исследования типологии агентов.
Что делаем (не все 20+11 формул, а только нужное):

- [ ] 5 system prompt templates (Tool-Calling, Router, Specialist, Orchestrator, Evaluator)
- [ ] Tool description builder (Anthropic ACI best practices)
- [ ] Backstory builder (CrewAI pattern: 3-5 sentences expertise)
- [ ] Evaluation rubric builder (критерии + scoring для Evaluator)
- [ ] Collaboration context builder (team roster для Orchestrator+Workers)
- [ ] Миграция типов из prompting-v0.0 в @stsgs/shared
- [ ] Расширение frameworks: 4 -> 11
- [ ] Добавление 14 техник (из 20, остальные на Phase 5)

#### Phase 3B — Standards Seed (item 1)

- [ ] 17 стандартов из Zai-agent-toolkit/standards/ -> StandardRule records в DB
- [ ] Каждый с pattern для автопроверки
- [ ] Категории: general, prompt, agent, flow, quality, security, architecture

#### Phase 3C — Agent Templates (item 2)

- [ ] 12 role templates (code-architect, frontend-specialist, etc.)
- [ ] 7 type-based templates (Tool-Calling, Router, Orchestrator, Evaluator, ReAct, Planner, Executor)
- [ ] Связка с Skills через standardIds

### Phase 3D — Мосты (экспорт)

- [x] Skill Forge -> экспорт SKILL.md для Z.ai sandbox
- [ ] Standards Manager -> генерация ESLint правил из DB
- [ ] Wiki -> синхронизация с GitHub Wiki
- [ ] Prompt Studio -> экспорт промптов в разные форматы

### Phase 4 — Production + Deferred Agent Types

- [ ] Multi-user auth (не demo admin/admin)
- [ ] RBAC (roles/permissions)
- [ ] Versioning для standards + skills
- [ ] API rate limiting
- [ ] Monitoring/logging
- [ ] ReAct agent type (Phase 4)
- [ ] Plan-and-Execute agent type (Phase 4)
- [ ] Prompt Chaining agent type (Phase 4)

### Phase 5 — Advanced Agent Types

- [ ] Autonomous agent (open-ended loop, stop conditions)
- [ ] Parallel/Voting (multi-LLM reliability)
- [ ] Deferred techniques: Tree-of-Thought, Least-to-Most, Assumption Challenge, Output Masking, Stakeholder Simulation, Analogical Reasoning

#### ⚠️ Security Hardening (критично перед публичным запуском)

> **FIXME**: Перед открытием доступа публичным пользователям необходимо реализовать:
>
> 1. **Authentication** — заменить demo admin/admin на реальную авторизацию
>    (NextAuth.js / Clerk / Auth.js). Middleware для защиты `/api/settings`, `/api/llm/*`.
>
> 2. **API Key Encryption** — ✅ DONE (AES-256-GCM, commit f171311)
>
> 3. **Key Masking в UI** — 🔥 В РАБОТЕ. GET /api/settings маскирует ключ (sk-****abcd),
>    полный ключ только при POST (сохранение).
>
> 4. **Rate Limiting** — ограничить вызовы `/api/llm` чтобы предотвратить
>    разорение через чужой ключ при компрометации сессии.
>
> Файлы: `src/lib/llm/settings.ts`, `src/app/api/settings/route.ts`,
> `src/components/settings/llm-provider-card.tsx`, `src/middleware.ts`

---

## Проблемы которые надо решить

| Проблема | Где | Решение |
|----------|-----|---------|
| Skill Forge → Z.ai bridge | Skill Forge + /home/z/my-project/skills/ | Экспорт: DB → SKILL.md + scripts/ |
| Standards → ESLint bridge | Standards Manager + eslint-plugin-3a | Генерация rules из DB → JSON config |
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
