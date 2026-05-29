# 3A Studio -- Prompting Module Status

Current state, gaps, and migration plan for `packages/prompting` and `prompting-v0.0`.

---

## Current State

### `packages/prompting` (active, in codebase)

| Module | File | Contents | Status |
|--------|------|----------|--------|
| Formulas | `src/formulas/index.ts` | 10 formulas (RTF, RISE, CARE, STONE, CREATE, CO-STAR, CHAIN, TRACE, SCOPE, PACKED) | OK, basic |
| Frameworks | `src/frameworks/index.ts` | 4 frameworks (RTF, CO-STAR, Chain-of-Thought, Few-Shot) with buildFromFramework() | Thin, needs expansion |
| Scoring | `src/scoring/scorers.ts` | 6 scoring functions (clarity, specificity, structure, completeness, creativity, actionability) | OK |
| Scoring helpers | `src/scoring/helpers.ts` | clamp utility | OK |
| Intent | `src/intent/index.ts` | (exists, not audited this session) | Unknown |
| Comparison | `src/comparison/index.ts` | (exists, not audited this session) | Unknown |
| Barrel | `src/index.ts` | Re-exports all modules | OK |

### `prompting-v0.0` (reference, not in active build)

| Module | File | Contents | Action Needed |
|--------|------|----------|---------------|
| Types | `core/types.ts` | Full type system: PromptContext, PromptBlock, PromptTechnique, PromptFramework, AgentRole, FlowTemplate, OrchestrationPattern, RetryConfig, CircuitState | Migrate types to shared |
| Techniques | `core/techniques.ts` | 20 techniques with categories, difficulty, examples | Select subset, migrate |
| Frameworks | `core/frameworks.ts` | 11 frameworks (RTF, RISE, CREATE, CARE, TRACE, SCOPE, PACKED, STONE, CO-STAR, RAG, CHAIN) with bestFor and complexity | Replace active version |
| System Prompt | `core/system-prompt.ts` | System prompt builder | Migrate |
| Agent Templates | `templates/agent-templates.ts` | 12 agent roles (code-architect, frontend-specialist, code-reviewer, debug-detective, technical-writer, test-engineer, data-analyst, security-auditor, ux-consultant, devops-engineer, api-designer, prompt-engineer) | These are role-based, not type-based -- need mapping |
| Flow Templates | `templates/flow-templates.ts` | Flow step templates | Evaluate for Phase 4 |
| Intent Templates | `templates/intent-templates.ts` | Intent-based prompt templates | Evaluate |
| Orchestration | `agents/orchestration.ts` | OrchestrationPattern type with topology (sequential, parallel, hierarchical, mesh, round-robin) | Evaluate for Phase 3 |
| Resilience | `agents/resilience.ts` | RetryConfig, CircuitState, CircuitBreaker | Phase 2.5 (Provider Intelligence) |
| Cognitive Formulas | `agents/cognitive-formulas.ts` | CognitiveFormula type with categories (bias-mitigation, reasoning-enhancement, creativity-boost, etc.) | Evaluate |
| Evaluation | `evaluation/scoring.ts` | PromptScore, Grade (S/A/B/C/D/F), ScoreDimension | Compare with active scoring |
| Blind Compare | `evaluation/blind-compare.ts` | BlindCompareResult for A/B prompt comparison | Evaluate |
| Benchmark | `evaluation/benchmark.ts` | BenchmarkResult, BenchmarkCheck | Evaluate |

---

## Gap Analysis

### What the active module is MISSING vs prompting-v0.0

1. **Rich type system** -- PromptContext, PromptBlock, SystemPromptLayer, OutputFormat, PromptTone
2. **Techniques** -- 20 techniques with examples (active has none, just formulas which overlap)
3. **Full frameworks** -- 11 vs 4 (missing: RISE, CREATE, CARE, TRACE, SCOPE, PACKED, STONE, RAG, CHAIN)
4. **Agent role templates** -- 12 pre-built system prompts (active has none)
5. **Orchestration patterns** -- sequential, parallel, hierarchical, mesh, round-robin (active has none)
6. **Resilience** -- circuit breaker, retry config (active has none)
7. **Evaluation** -- grade system (S/A/B/C/D/F), blind compare, benchmark (active has numeric scoring only)
8. **System prompt builder** -- composable prompt blocks by layer (active has buildFromFramework only)

---

## Migration Plan

### Phase 3A: Types + Core (no UI changes)

**Goal:** Bring `packages/prompting` up to feature parity with `prompting-v0.0/core` and `prompting-v0.0/types`.

**Steps:**

1. **Migrate types** from `prompting-v0.0/core/types.ts` to `packages/shared/src/types/prompt.ts`:
   - PromptContext, PromptTone, OutputFormat
   - PromptBlock, SystemPromptLayer
   - PromptTechnique, TechniqueCategory
   - PromptFramework, FrameworkStep
   - AgentRole
   - FlowStep, FlowTemplate, FlowValidation
   - OrchestrationPattern, OrchestrationStep
   - RetryConfig, CircuitState, ResilienceResult

2. **Replace formulas** in `packages/prompting/src/formulas/index.ts`:
   - Keep the 10 formulas but upgrade their type to use new PromptFormula interface
   - Add `category` field matching TechniqueCategory where applicable

3. **Replace frameworks** in `packages/prompting/src/frameworks/index.ts`:
   - Replace 4 thin frameworks with 11 full frameworks from prompting-v0.0
   - Each has: id, name, acronym, description, steps (with placeholders), bestFor, complexity
   - Keep `getFramework()` and `buildFromFramework()` API

4. **Add techniques** as new module `packages/prompting/src/techniques/index.ts`:
   - Select subset of 20 techniques relevant to 3A Studio agent building
   - See "Technique Selection" section below
   - Export: `getTechniques()`, `getTechnique(id)`, `getTechniquesForFormat()`

5. **Add agent templates** as new module `packages/prompting/src/agent-templates/index.ts`:
   - Select subset of 12 roles, add new type-based templates
   - See "Agent Template Selection" section below

### Technique Selection for 3A Studio

From the 20 techniques in prompting-v0.0, select those relevant to agent building:

| Technique | Keep? | Why |
|-----------|-------|-----|
| Explicit Instruction | YES | Foundation of all agent prompts |
| Role Assignment | YES | Core of Specialist type |
| Few-Shot Learning | YES | Examples for tool usage |
| Chain of Thought | YES | Reasoning for complex agents |
| Structured Output | YES | JSON/typed outputs for agents |
| Self-Consistency | YES | For Evaluator agents |
| Assumption Challenge | LATER | Phase 5 autonomous agents |
| Analogical Reasoning | NO | Creative tasks, not core agent building |
| Negative Constraint | YES | Guardrails for all agent types |
| Token Budget | YES | Cost control for production agents |
| Output Masking | LATER | Security-specific use cases |
| Adversarial Reviewer | YES | For Evaluator / Code Review agents |
| Stakeholder Simulation | NO | Creative, not agent building |
| Delimiter Pattern | YES | Prompt formatting best practice |
| XML Tag Structure | YES | Prompt formatting for complex agents |
| Meta-Prompting | YES | Prompt optimization for agent templates |
| Prompt Chaining | YES | Workflow/pipeline pattern |
| Tree of Thought | LATER | Phase 5 complex reasoning |
| Least-to-Most | LATER | Phase 5 complex reasoning |
| Plan and Solve | YES | Plan-and-Execute type |

**Phase 3 subset:** 14 techniques. Remaining 6 deferred to Phase 5.

### Agent Template Selection for 3A Studio

From the 12 roles in prompting-v0.0 plus new type-based templates:

**Existing roles (keep all, they map to Specialist type):**
- code-architect, frontend-specialist, code-reviewer, debug-detective
- technical-writer, test-engineer, data-analyst, security-auditor
- ux-consultant, devops-engineer, api-designer, prompt-engineer

**New type-based templates (add):**
- `type-tool-calling` -- default agent template (type 1)
- `type-router` -- routing agent template (type 2)
- `type-orchestrator` -- orchestrator template (type 4)
- `type-evaluator` -- evaluator with rubric (type 5)
- `type-react` -- ReAct format (type 6, Phase 4)
- `type-planner` -- plan-and-execute planner (type 7, Phase 4)
- `type-executor` -- plan-and-execute executor (type 7, Phase 4)

---

## Dependency Map

```
Types (prompt.ts)
  |
  +-- Formulas (existing, upgrade types)
  +-- Frameworks (existing, replace content)
  +-- Techniques (new, migrate subset from v0.0)
  +-- Agent Templates (new, existing roles + type templates)
  +-- Scoring (existing, keep)
  +-- Orchestration (new, migrate from v0.0, Phase 3B)
  +-- Resilience (new, migrate from v0.0, Phase 2.5)
  +-- Evaluation (upgrade, add Grade system)
```

---

## File Size Budget

Anti-monolith rule: files <= 150 lines.

| Module | Estimated Lines | Split needed? |
|--------|----------------|---------------|
| types/prompt.ts | ~150 | No, borderline |
| formulas/index.ts | ~120 | No |
| frameworks/index.ts | ~200 | Yes -- split into `frameworks/index.ts` + `frameworks/data.ts` |
| techniques/index.ts | ~200 | Yes -- split into `techniques/index.ts` + `techniques/data.ts` |
| agent-templates/index.ts | ~200 | Yes -- split into `agent-templates/index.ts` + `agent-templates/data.ts` |
| scoring/ | ~100 total | No |
| orchestration/ | ~100 | No |
| resilience/ | ~100 | No |

Splitting pattern: `data.ts` contains the arrays, `index.ts` contains types and getter functions.
