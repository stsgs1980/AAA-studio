# P-MAS → AAA-studio: Extraction Reference

> Создано: 2026-06-03
> Назначение: Конкретные паттерны и концепции из P-MAS документов, применимые к AAA-studio
> Исходники: TOOLKIT_QUALITY_STANDARD.md, Архитектура MAS, Wiki-структура, P-MAS-architector-v3-wireframe.html

---

## 1. Quality Metrics для Deep Analysis

**Источник:** TOOLKIT_QUALITY_STANDARD.md §4, wireframe Tab 6 "Quality"
**Куда в AAA-studio:** `src/app/api/evaluate-deep/route.ts`, `src/features/quality-analyzer/`
**Статус:** Частично реализовано (текущий 4-критериальный рубрикатор). Усилить.

### 1.1 Девять метрик (9-metric scoring system)

| # | Метрика | Формула | Цель | Порог | Вес | Направление |
|---|---------|---------|------|-------|------|-------------|
| 1 | Reference Integrity | `(resolved refs / total refs) * 100` | 100% | 100% | 20% | Higher=better |
| 2 | Registry Accuracy | `(matching entries / total) * 100` | 100% | 100% | 15% | Higher=better |
| 3 | Version Consistency | `(matching versions / sources) * 100` | 100% | 100% | 15% | Higher=better |
| 4 | SSoT Coverage | `(single-source rules / total) * 100` | >95% | >90% | 15% | Higher=better |
| 5 | Enforcement Consistency | `(consistent level pairs / checked) * 100` | 100% | 100% | 10% | Higher=better |
| 6 | Template Compliance | `(passing templates / total) * 100` | >90% | >75% | 10% | Higher=better |
| 7 | Conflict Documentation | `(pairs in matrix / known pairs) * 100` | >95% | >80% | 10% | Higher=better |
| 8 | Duplication Factor | `avg copies per rule across files` | <1.3 | <1.5 | 5% | Lower=better |
| 9 | Orphan Rate | `(files w/o registry / total files) * 100` | 0% | <5% | 5% | Lower=better |

### 1.2 Grade Scale (A-F)

| Grade | Баллы | Значение | Цвет (AAA-studio) |
|-------|-------|----------|-------------------|
| A | 90-100 | Production-ready | green |
| B | 80-89 | Good quality | cyan/blue |
| C | 70-79 | Needs attention | amber |
| D | 60-69 | Problems accumulating | orange |
| F | <60 | Critical issues | red |

### 1.3 Что реализовать в AAA-studio

1. Добавить опциональный "Quality Mode" в evaluate-deep — расчёт 9 метрик поверх текста
2. Добавить Grade badge (A-F) в DeepAnalysisPanel
3. Добавить Radar Chart (recharts/d3) для визуализации 9 метрик
4. Weighted scoring: `overall = sum(metric_value * weight)`

---

## 2. Anti-Pattern Detectors

**Источник:** TOOLKIT_QUALITY_STANDARD.md §6, wireframe Page "Anti-Patterns"
**Куда в AAA-studio:** Новый блок в evaluate-deep + отдельный детектор-модуль
**Статус:** Не реализовано. Новая функциональность.

### 2.1 Семь детекторов (адаптировано для AAA-studio)

| # | Anti-Pattern | Severity | Метод детекции | Как адаптировать для QA |
|---|-------------|----------|-----------------|------------------------|
| 1 | Inline Duplication | [C] | Normalized text hash | Искать одинаковые правила в разных файлах/блоках |
| 2 | Unregistered Reference | [C] | Файловый список vs упоминания | Проверить что каждый STD-* упомянут в индексе |
| 4 | Version Mismatch | [C] | Extract version, compare | Искать version/v1.x в разных местах текста |
| 5 | Inconsistent Status | [W] | Status field vs content | Искать DEPRECATED/FROZEN в одном месте но не в другом |
| 6 | Missing Conflict Analysis | [W] | Entity ID vs cross-references | Проверить что новые сущности не конфликтуют |
| 7 | Template Without References | [W] | Grep for "STD-" pattern | Искать template-файлы без ссылок на стандарты |
| 8 | Rule Parameter Differs | [C] | Key-value extraction + compare | Искать одинаковые правила с разными значениями |

### 2.2 Что реализовать

1. Создать `src/lib/quality/anti-patterns.ts` — 7 детекторов
2. Интегрировать в evaluate-deep как дополнительный блок анализа
3. Показывать в DeepAnalysisPanel как "Anti-Patterns Found" секцию
4. Каждый детектор: `name, severity, evidence, fix`

---

## 3. VRS (Verifier-Rubric Score) — двухуровневая оценка

**Источник:** Wiki §3.5
**Куда в AAA-studio:** `src/app/api/evaluate-deep/route.ts`
**Статус:** Усилить текущий рубрикатор

### 3.1 Концепция

Текущий Deep Analysis использует только LLM-рубрику (qualitative). VRS добавляет:

- **Verifier Layer** — детерминированные проверки (regex, structure, keyword presence)
- **Rubric Layer** — LLM экспертная оценка (уже реализовано)
- **Combined Score:** `verifier_rate >= 80% AND rubric_mean >= 2.5 (на 4-балльной шкале)`

### 3.2 Что реализовать

1. Добавить verifier-функции в `src/lib/eval-helpers.ts`:
   - `hasSections(text)` — есть ли заголовки/секции
   - `hasExamples(text)` — есть ли примеры кода
   - `hasConstraints(text)` — есть ли MUST/NEVER/FORBIDDEN
   - `hasSpecificCommands(text)` — есть ли конкретные команды/пути
   - `meetsLengthStandards(text)` — достаточная ли длина (min 500 chars для промпта)
2. Показывать verifier_score рядом с rubric_score в DeepAnalysisPanel
3. Порог: FAIL если verifier < 60%

---

## 4. Skill Classification — 5 осей

**Источник:** Wiki §2, wireframe Tab 1 "Skills"
**Куда в AAA-studio:** Enhanced agent analysis в QA
**Статус:** Не реализовано. Среднесрочная задача.

### 4.1 Пять осей классификации

| Ось | Значения | Как детектировать |
|-----|---------|-------------------|
| Interaction Type | Instructional / Executable / Hybrid | Keyword scan + LLM |
| Functional Role | Domain / Solution / Integration / Orchestration / Utility | LLM classification |
| Safety Level | L0 Read-only / L1 Sandboxed / L2 Approved / L3 Autonomous | Explicit markers |
| Activation Mode | Passive / Active / Hybrid | Trigger keywords |
| I/O Type | Stream / Request-Response / Event / Interactive | Pattern analysis |

### 4.2 Что реализовать

1. Добавить classification prompt в evaluate-deep (для mode=agent)
2. Показывать теги в DeepAnalysisPanel при анализе агента
3. Использовать для кастомизации рубрикатора

---

## 5. Standard Classification — 4 типа

**Источник:** Wiki §5, wireframe Tab 2 "Standards"
**Куда в AAA-studio:** Enhanced standard analysis
**Статус:** Не реализовано.

### 5.1 Четыре типа

| Type | Ключевые слова | Компоненты для проверки |
|------|---------------|----------------------|
| TECHNICAL | metric, threshold, linter, code | metric, code-example, linter, exception |
| MANAGEMENT | RACI, SLA, escalation, owner | RACI, escalation, SLA, consequence |
| COMPLIANCE | audit, evidence, control, regulation | external mapping, evidence, audit procedure |
| GUIDANCE | best practice, recommended | recommendations, guidelines |

### 5.2 Что реализовать

1. Автодетекция типа при анализе стандартов
2. Разные рубрики для разных типов
3. Показывать тип как badge

---

## 6. Analysis Pipeline — текущий vs целевой

| Текущий (AAA-studio) | Целевой (P-MAS) |
|---------------------|-----------------|
| 4 tab: Scores, Deep, Standards, Rubric | 7 tabs: Overview, Skills, Standards, Issues, Tools, Integration, Quality |
| 3 input: text, file, url (+agent) | 3 input: folder, zip, github |
| Client-side scoring + LLM deep | Parse -> Classify -> Audit -> Score pipeline |
| No anti-pattern detection | 10 anti-pattern detectors |
| No grade system | A-F grade with 9 weighted metrics |
| No radar chart | Radar chart visualization |

### Эволюция по приоритету

- **Phase 1 (done):** ZIP upload, Clear Results, scenario pass-through
- **Phase 2 (near):** Anti-pattern detectors, Verifier layer, Grade A-F
- **Phase 3 (medium):** 9-metric scoring, Radar chart, Enhanced classification
- **Phase 4 (later):** Full 7-tab dashboard restructure

---

## 7. 3-Phase Roadmap

**Источник:** Архитектура MAS

- **Фаза 1 (текущий):** Монолит — одна QA-страница с рубрикой + LLM
- **Фаза 2 (следующий):** Разделение — Guardian как отдельный `/api/audit` endpoint
- **Фаза 3 (дальняя):** Полная MAS — только при >100 анализируемых агентов

---

## 8. Execution Protocol (Anti-Hallucination)

**Источник:** wireframe "Execution Protocol" page

### Что взять сейчас

- **Evidence chain:** каждый результат evaluate-deep сохранять с input hash + timestamp
- **HITL trigger:** при score < 60% или FAIL — предупреждать юзера
- **Recovery:** при ошибке LLM — retry с уточнённым промптом (частично реализовано)

---

## 9. P-MAS Task Cascade — маппинг на AAA-studio

| P-MAS Epic | 8 Epics / 83 Tasks / 68.5h | Соответствие в AAA-studio |
|-----------|---------------------------|--------------------------|
| EPIC 1: Foundation (100%) | Prisma, API, pages | Реализовано |
| EPIC 2: Quality Scoring (100%) | 9 metrics, A-F, anti-patterns | **Частично — нужен 9-metric engine** |
| EPIC 3: SSoT Hierarchy (87%) | L0-L3, conflict zones | Нет — новое |
| EPIC 4: Seed Agents (40%) | 5 agents, XYFlow, workflows | Частично — Agents CRUD есть |
| EPIC 5: Classification (100%) | 5-axis skill, 4-type standard | Нет — новое |
| EPIC 6: Recommendations (67%) | R1-R18 checkers | Нет — новое |
| EPIC 7: verify-docs (0%) | Engine embed, plugins, CI | Частично — verify package есть |
| EPIC 8: Polish (0%) | Performance, responsive, docs | Постоянно |

---

## 10. Concrete Action Items

### Немедленно (Epic 3: QA Verify)

- [ ] Добавить Verifier Layer (5 детерминированных проверок) в evaluate-deep
- [ ] Показывать Verifier Rate рядом с LLM Score в DeepAnalysisPanel
- [ ] Добавить Grade A-F badge в DeepAnalysisPanel
- [ ] Анти-паттерн детектор #1 (Inline Duplication) и #4 (Version Mismatch)

### Ближайшая перспектива (Epic 4: Enhanced QA)

- [ ] Реализовать 7 anti-pattern детекторов
- [ ] Standard Type classification (TECHNICAL/MANAGEMENT/COMPLIANCE/GUIDANCE)
- [ ] Radar chart для метрик (recharts)
- [ ] Разные рубрики для разных scenario (уже частично)

### Среднесрочная (Epic 5: Flow Assistant)

- [ ] Guardian как отдельный API endpoint `/api/audit`
- [ ] Evidence chain (сохранять input hash + result)
- [ ] Skill Classification (5 осей) при анализе агентов
- [ ] HITL trigger при низком score
