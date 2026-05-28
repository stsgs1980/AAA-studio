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
| Agents | ✅ Работает | CRUD, executions, systemPrompt с markdown preview |
| Flow Editor | ⚠️ Скелет | 18 nodes, ReactFlow, topological sort, но executeNode = placeholder |
| Skill Forge | ⚠️ UI есть | CRUD, JSON подсветка, но без выполнения кода |
| Standards | ⚠️ UI есть | CRUD + toggle rules, но "Edit via API to add rules" |
| Knowledge | ⚠️ UI есть | Upload, но без vector search |
| Pipelines | ⚠️ UI есть | Execution log, но без реального запуска |
| Hierarchy | ⚠️ UI есть | Визуальный граф parent/child |
| Audit Log | ✅ Работает | JSON подсветка деталей, фильтры по entity |
| Settings | ⚠️ UI есть | Базовая страница |

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

### Phase 2 — Интеграции (в процессе)

- [ ] Skill Forge → выполнение кода в sandbox
- [ ] Knowledge Base → vector embeddings + RAG
- [x] **Pipeline → реальный запуск flow execution** (node-level drill-down)
- [ ] Templates → flow templates (не только prompt)

### Phase 3 — Мосты (экспорт)

- [ ] Skill Forge → экспорт SKILL.md для Z.ai sandbox
- [ ] Standards Manager → генерация ESLint правил из DB
- [ ] Wiki → синхронизация с GitHub Wiki
- [ ] Prompt Studio → экспорт промптов в разные форматы

### Phase 4 — Production

- [ ] Multi-user auth (не demo admin/admin)
- [ ] RBAC (roles/permissions)
- [ ] Versioning для standards + skills
- [ ] API rate limiting
- [ ] Monitoring/logging

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
