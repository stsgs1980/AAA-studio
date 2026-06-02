# 3A Studio — План реализации: Стандарты, Экспорт, MCP

> **Цель**: Превратить 3A Studio из изолированного тулкита в систему,
> совместимую с индустриальными стандартами (MCP, OpenAI Tools, A2A).

---

## Ответ на вопрос: «надо было сразу в JSON?»

**Нет.** Правильный подход — **два слоя**:

| Слой | Формат | Для кого | Пример |
|------|--------|----------|--------|
| **Manifest** | JSON / YAML frontmatter | Машины (LLM, MCP, CI/CD) | `name`, `version`, `inputSchema` |
| **Body** | Markdown | Люди (разработчики, AI-ассистенты) | Инструкции, примеры, чеклисты |

npm, VS Code, GitHub Actions — все так делают: `package.json` (машина) + `README.md` (человек).
SKILL.md = manifest (YAML frontmatter) + body (Markdown). Один файл, два слоя.

---

## Фаза 1: Миграция Prisma — новые поля Skill

### Текущая модель Skill

```prisma
model Skill {
  id           String   @id @default(cuid())
  name         String
  category     String   @default("general")
  description  String   @default("")
  inputSchema  String   @default("{}")
  outputSchema String   @default("{}")
  code         String   @default("")        // legacy
  tests        String   @default("")        // legacy
  tags         String   @default("[]")
  standardIds  String   @default("[]")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  files        SkillFile[]
}
```

### Новая модель Skill (добавить 8 полей)

```prisma
model Skill {
  id             String     @id @default(cuid())
  name           String                               // Обязательно
  slug           String       @unique                  // URL-safe: "api-retry"
  version        String       @default("1.0.0")        // SemVer
  skillId        String       @default("")              // ZAI-XXX-NNN (человекочитаемый ID)
  category       String       @default("general")
  description    String       @default("")              // Краткое (≤200 слов) — для LLM-выбора
  longDescription String      @default("")              // Полное описание для body SKILL.md
  inputSchema    String       @default("{}")            // JSON Schema
  outputSchema   String       @default("{}")            // JSON Schema — наше преимущество!
  code           String       @default("")              // legacy, не удалять
  tests          String       @default("")              // legacy, не удалять
  tags           String       @default("[]")            // JSON string[]
  triggers       String       @default("[]")            // JSON string[] — ключевые слова активации
  standardIds    String       @default("[]")            // Привязанные стандарты
  compatibility  String       @default("both")          // "both" | "sandbox" | "local"
  dependencies   String       @default("[]")            // JSON [{skillId, version}]
  annotations    String       @default("{}")            // JSON {readOnly, destructive, idempotent, openWorld}
  author         String       @default("")
  license        String       @default("MIT")
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  files          SkillFile[]
}
```

### Расширение SkillFile role

```prisma
// Было: entry | code | test | config | doc | schema
// Стало:
enum SkillFileRole {
  entry       // Точка входа (main/index)
  code        // Исходный код
  test        // Тесты
  config      // Конфигурация
  doc         // Документация
  schema      // Схема данных
  script      // Исполняемый скрипт (было scripts/ в тулките)
  reference   // Справочный материал (было references/ в тулките)
  eval        // Сценарий оценки (было evals/ в тулките)
}
```

### Маппинг role → папка при экспорте

| role | Папка в ZIP | Описание |
|------|-------------|----------|
| `entry` | корень (`src/index.ts`) | Точка входа |
| `code` | `src/` | Исходный код |
| `test` | `tests/` | Тесты |
| `config` | корень | Конфигурация |
| `doc` | корень | Документация |
| `schema` | `schemas/` | JSON Schema файлы |
| `script` | `scripts/` | Исполняемые скрипты |
| `reference` | `references/` | Справочные материалы |
| `eval` | `evals/` | Сценарии оценки |

### Задачи Фазы 1

| # | Задача | Файл | Сложность |
|---|--------|------|-----------|
| 1.1 | Добавить поля в Prisma schema | `prisma/schema.prisma` | 🟢 |
| 1.2 | Создать миграцию | `npx prisma migrate dev` | 🟢 |
| 1.3 | Обновить Zod-схему валидации | `src/lib/validations/skill.ts` | 🟢 |
| 1.4 | Обновить сид-данные | `prisma/seed.ts` | 🟡 |
| 1.5 | Обновить API routes (create/update) | `src/app/api/skills/` | 🟡 |
| 1.6 | Обновить UI-формы (SkillDetail, SkillForm) | `src/features/skills/` | 🟡 |
| 1.7 | Автогенерация slug из name | в API create | 🟢 |

---

## Фаза 2: Единый SKILL.md формат

### Канонический формат SKILL.md

```markdown
---
# === MANIFEST (для машин) ===
name: api-retry
slug: api-retry
version: 1.2.0
skillId: ZAI-HEALTH-002
description: >
  Retry logic with exponential backoff, jitter, and configurable
  max attempts for resilient API calls
category: infrastructure
compatibility: both
triggers:
  - api retry
  - exponential backoff
  - circuit breaker
  - resilience
tags:
  - retry
  - resilience
  - api
annotations:
  readOnlyHint: false
  destructiveHint: false
  idempotentHint: true
  openWorldHint: false
dependencies:
  - skillId: ZAI-HEALTH-001
    version: ">=1.0.0"
standards:
  - STD-RESILIENCE-001
author: STS
license: MIT
---

# API Retry

## Description

Retry logic with exponential backoff, jitter, and configurable max attempts.
Designed for resilient API calls that handle transient failures gracefully.

## Input Schema

​```json
{
  "type": "object",
  "properties": {
    "url": { "type": "string", "description": "API endpoint URL" },
    "maxRetries": { "type": "number", "default": 3 }
  },
  "required": ["url"]
}
​```

## Output Schema

​```json
{
  "type": "object",
  "properties": {
    "status": { "type": "number" },
    "data": { "type": "object" },
    "attempts": { "type": "number" }
  }
}
​```

## Instructions

Step-by-step guide for using this skill...

## Checklist

- [ ] Configure maxRetries based on SLA requirements
- [ ] Set appropriate jitter range
- [ ] Monitor circuit breaker state

## Anti-Patterns

- Don't retry on 4xx errors (except 429)
- Don't use without circuit breaker for external APIs
```

### Унификация экспорта — одна функция

**Проблема**: Сейчас `helpers.ts::generateSkillMd()` и `export-zip/route.ts::buildManifest()` — ДВЕ РАЗНЫЕ функции, которые генерируют РАЗНЫЙ SKILL.md.

**Решение**: Один источник правды — `src/lib/skill-export/generate-manifest.ts`:

```typescript
// Единая функция генерации SKILL.md
export function generateSkillManifest(skill: SkillWithFiles): string {
  // YAML frontmatter из полей модели
  // Body: Description + Schemas + Instructions + Checklist
}

// Единая функция генерации ZIP
export function generateSkillZip(skill: SkillWithFiles): Promise<Buffer> {
  // Использует generateSkillManifest() для SKILL.md
  // Файлы по папкам в зависимости от role
  // + package.json
}
```

### Конвертация в форматы

```typescript
// skill-format-adapter.ts
export function toOpenAITools(skill: Skill): OpenAIToolDef { ... }
export function toMCPTools(skill: Skill): MCPToolDef { ... }
export function toA2ASkills(agent: Agent): A2ASkillDef[] { ... }
```

| Целевой формат | Функция | Поля |
|----------------|---------|------|
| **OpenAI Tools** | `toOpenAITools()` | name, description, parameters (inputSchema) |
| **MCP Tools** | `toMCPTools()` | name, description, inputSchema, annotations |
| **A2A Agent Card** | `toA2ACard()` | name, description, skills[], capabilities |

### Задачи Фазы 2

| # | Задача | Файл | Сложность |
|---|--------|------|-----------|
| 2.1 | Создать `src/lib/skill-export/generate-manifest.ts` | Новый | 🟡 |
| 2.2 | Создать `src/lib/skill-export/generate-zip.ts` | Новый | 🟡 |
| 2.3 | Создать `src/lib/skill-export/format-adapters.ts` | Новый | 🟡 |
| 2.4 | Переписать `/api/skills/[id]/export` → use generate-manifest | Существующий | 🟢 |
| 2.5 | Переписать `/api/skills/[id]/export-zip` → use generate-zip | Существующий | 🟢 |
| 2.6 | Добавить экспорт в OpenAI/MCP формат | Новый API route | 🟡 |
| 2.7 | Удалить дублирующий `buildManifest()` | export-zip/route.ts | 🟢 |

---

## Фаза 3: MCP-эндпоинты

MCP (Model Context Protocol) — самый важный стандарт для совместимости.
Каждый навык из 3A Studio автоматически становится MCP-инструментом.

### Архитектура MCP в 3A Studio

```
┌──────────────┐    JSON-RPC     ┌──────────────────────┐
│  MCP Client  │◄───────────────►│  3A Studio MCP Server│
│  (Claude,    │   /api/mcp      │                      │
│   Cursor,    │                 │  POST /api/mcp       │
│   GPT, etc)  │                 │  ┌────────────────┐  │
└──────────────┘                 │  │ Route Handler  │  │
                                 │  │   ↓            │  │
                                 │  │ Method Router  │  │
                                 │  │   ↓            │  │
                                 │  │ skills/agents  │  │
                                 │  │ DB queries     │  │
                                 │  └────────────────┘  │
                                 └──────────────────────┘
```

### MCP API Route: `/api/mcp/route.ts`

Один эндпоинт, обрабатывающий JSON-RPC сообщения:

```typescript
// POST /api/mcp
// Body: { jsonrpc: "2.0", id: 1, method: "...", params: {...} }

export async function POST(req: Request) {
  const { method, params, id } = await req.json()

  switch (method) {
    case "initialize":    return handleInitialize(id)
    case "tools/list":    return handleToolsList(id, params)
    case "tools/call":    return handleToolsCall(id, params)
    case "resources/list": return handleResourcesList(id, params)
    case "resources/read": return handleResourcesRead(id, params)
    case "prompts/list":  return handlePromptsList(id, params)
    case "prompts/get":   return handlePromptsGet(id, params)
    default:              return jsonRpcError(id, -32601, "Method not found")
  }
}
```

### MCP Methods — реализация

| Method | Что возвращает | Источник данных |
|--------|---------------|-----------------|
| `initialize` | `{capabilities: {tools: {listChanged: true}, resources: {subscribe: true}}}` | Конфигурация |
| `tools/list` | Все Skills как MCP Tool definitions | `prisma.skill.findMany()` → `toMCPTools()` |
| `tools/call` | Выполнить навык (вызов LLM через flow) | `/api/flows/[id]/execute` или `/api/llm` |
| `resources/list` | Knowledge collections как ресурсы | `prisma.knowledgeCollection.findMany()` |
| `resources/read` | Документ из коллекции | `prisma.knowledgeDocument.findUnique()` |
| `prompts/list` | Prompt templates как MCP Prompts | `prisma.promptTemplate.findMany()` |
| `prompts/get` | Разрешённый шаблон промпта | `prisma.promptTemplate.findUnique()` |

### Пример `tools/list` response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "api-retry",
        "description": "Retry logic with exponential backoff for resilient API calls",
        "inputSchema": {
          "type": "object",
          "properties": {
            "url": { "type": "string", "description": "API endpoint URL" },
            "maxRetries": { "type": "number", "default": 3 }
          },
          "required": ["url"]
        },
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        }
      }
    ]
  }
}
```

### Задачи Фазы 3

| # | Задача | Файл | Сложность |
|---|--------|------|-----------|
| 3.1 | Создать `/api/mcp/route.ts` — JSON-RPC handler | Новый | 🟡 |
| 3.2 | Реализовать `initialize` + `tools/list` | В route.ts | 🟢 |
| 3.3 | Реализовать `tools/call` (через LLM/flow) | В route.ts | 🟠 |
| 3.4 | Реализовать `resources/list` + `resources/read` | В route.ts | 🟢 |
| 3.5 | Реализовать `prompts/list` + `prompts/get` | В route.ts | 🟢 |
| 3.6 | Добавить MCP-совместимость в Settings UI | Настройки | 🟡 |
| 3.7 | Тест: MCP tools/list → валидный JSON-RPC | Vitest | 🟢 |

---

## Фаза 4: Починка багов + Standards Validate

### 4.1 Починка Condition + Filter на сервере

**Баг**: `node-exec.ts` всегда возвращает `conditionResult: true` / `passed: true`.

**Фикс**: Импортировать `safeEvalCondition()` из `node-utils.ts` в серверный executor.

```typescript
// node-exec.ts — БЫЛО:
case "condition": return { data: { ...inputs, conditionResult: true } };
case "filter": return { data: { ...inputs, passed: true } };

// СТАЛО:
case "condition": {
  const result = safeEvalCondition(inputs, node.data.expression);
  return { data: { ...inputs, conditionResult: result } };
}
case "filter": {
  const result = safeEvalCondition(inputs, node.data.expression);
  return { data: { ...inputs, passed: result } };
}
```

### 4.2 Standards → /api/standards/validate

Новый эндпоинт для проверки кода по стандартам:

```typescript
// POST /api/standards/validate
// Body: { code: string, language: string, standardIds?: string[] }
// Response: { results: [{ standardId, ruleId, passed, message }] }

export async function POST(req: Request) {
  const { code, language, standardIds } = validateInput(req)

  const standards = standardIds
    ? await prisma.standard.findMany({ where: { id: { in: standardIds } } })
    : await prisma.standard.findMany()

  const results = standards.flatMap(standard =>
    parseRules(standard.rules)
      .filter(rule => rule.pattern && rule.enabled)
      .map(rule => ({
        standardId: standard.id,
        ruleId: rule.id,
        ruleName: rule.name,
        passed: !new RegExp(rule.pattern).test(code),  // pattern = что ЗАПРЕЩЕНО
        message: rule.description
      }))
  )

  return NextResponse.json({ results })
}
```

### Задачи Фазы 4

| # | Задача | Файл | Сложность |
|---|--------|------|-----------|
| 4.1 | Починить Condition node в node-exec.ts | Существующий | 🟢 |
| 4.2 | Починить Filter node в node-exec.ts | Существующий | 🟢 |
| 4.3 | Создать `/api/standards/validate` | Новый route | 🟡 |
| 4.4 | UI: Кнопка "Validate" в SkillDetail | Существующий | 🟡 |
| 4.5 | Тесты для validate endpoint | Новый | 🟢 |

---

## Порядок реализации

```
Фаза 1 (Prisma)     ████████░░  1-2 дня
Фаза 2 (SKILL.md)   █████████░  2-3 дня
Фаза 3 (MCP)        ████████░░  2-3 дня
Фаза 4 (Баги)       ████░░░░░░  1 день
```

**Рекомендация**: Начать с Фазы 4 (баги) — это быстро и оживит Flow Editor,
затем Фаза 1 (Prisma) — фундамент для всего остального.

---

## Итоговая карта компетенций 3A Studio

После реализации всех фаз:

```
3A Studio
├── Skill Manifest (package.json + MCP annotations)
│   ├── name, version, slug, skillId
│   ├── inputSchema + outputSchema (JSON Schema)
│   ├── triggers, dependencies, annotations
│   └── compatibility, author, license
│
├── Export Formats
│   ├── SKILL.md (manifest + body)        ← Единая функция
│   ├── ZIP (skill folder structure)       ← По role → папки
│   ├── OpenAI Tools (function calling)    ← format-adapters
│   ├── MCP Tools (JSON-RPC)              ← /api/mcp
│   └── A2A Agent Card (discovery)        ← format-adapters
│
├── MCP Server
│   ├── tools/list     → Skills из DB
│   ├── tools/call     → Вызов через LLM
│   ├── resources/list → Knowledge Collections
│   ├── resources/read → Knowledge Documents
│   ├── prompts/list   → Prompt Templates
│   └── prompts/get    → Разрешённый шаблон
│
└── Standards Validation
    ├── Pattern execution (regex)
    ├── /api/standards/validate
    └── Skill → Standards compliance check
```

**Это превращает 3A Studio из закрытого тулкита в открытую платформу,
совместимую с любой AI-системой, поддерживающей MCP.**
