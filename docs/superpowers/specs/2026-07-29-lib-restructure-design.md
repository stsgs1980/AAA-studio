# src/lib/ Restructure Design

> **Status:** EXECUTED on 2026-07-29

## Problem

`src/lib/` became a junk drawer: 20 files/folders of mixed purpose — infrastructure, domain logic, shared utilities, and dead code all at the same level.

## Goal

Separate concerns within `src/lib/` by moving domain-specific modules into `src/lib/domain/`. Keep shared utilities and infrastructure at the root.

## Current → Target

```
src/lib/                          src/lib/
├── api-error.ts                  ├── api-error.ts          (keep)
├── auth.ts                       ├── auth.ts               (keep)
├── cost.ts                       ├── cost.ts               (keep)
├── crypto.ts                     ├── crypto.ts             (keep)
├── db.ts                         ├── db.ts                 (keep)
├── fetch-patch.tsx               ├── utils.ts              (keep)
├── utils.ts                      ├── i18n/                 (keep)
├── i18n/                         ├── services/             (keep)
├── llm/                          └── domain/
├── validations/                      ├── llm/
├── scanner/                          ├── validations/
├── ws/                               ├── scanner/
├── skill-export/                     ├── ws/
├── resilience/                       ├── skill-export/
├── services/                         ├── resilience/
└── standards/                        └── standards/
```

## Changes

| Action | Modules |
|--------|---------|
| Keep in `src/lib/` | `api-error.ts`, `auth.ts`, `cost.ts`, `crypto.ts`, `db.ts`, `utils.ts`, `i18n/`, `services/` |
| Move to `src/lib/domain/` | `llm/`, `validations/`, `scanner/`, `ws/`, `skill-export/`, `resilience/`, `standards/` |
| Delete | `fetch-patch.tsx` (0 importers — dead code) |

## Import Rewrites

All imports change from `@/lib/<module>/...` to `@/lib/domain/<module>/...`:

```typescript
// Before:
import { callLLM } from '@/lib/llm/client'
import { fetchWithRetry } from '@/lib/resilience/api-retry'
import { scanFilesClient } from '@/lib/scanner/client-scanner'

// After:
import { callLLM } from '@/lib/domain/llm/client'
import { fetchWithRetry } from '@/lib/domain/resilience/api-retry'
import { scanFilesClient } from '@/lib/domain/scanner/client-scanner'
```

## Affected Files (~80)

### domain/llm (18 importers)
- `src/app/api/llm/route.ts`
- `src/app/api/llm/test/route.ts`
- `src/app/api/mcp/handlers.ts`
- `src/app/api/evaluate-deep/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/flows/[id]/execute/route.ts`
- `src/app/api/flows/[id]/execute/node-exec.ts`
- `src/app/api/flows/[id]/execute/node-router.ts`
- `src/app/api/flows/[id]/execute-sse/route.ts`
- `src/app/api/workflows/[id]/execute/route.ts`
- `src/app/api/test-runs/route.ts`
- `src/app/api/self-correction/route.ts`
- `src/app/api/self-correction/correction-loop.ts`
- `src/features/flow-editor/components/config-tabs/config-tab.tsx`
- `src/features/settings/hooks/use-settings.ts`
- `src/features/settings/components/provider-row.tsx`
- `src/features/settings/components/add-provider-menu.tsx`
- `src/features/settings/components/llm-provider-card.tsx`
- `src/lib/domain/resilience/fallback-manager.ts` (internal)

### domain/validations (17 importers)
- `src/app/api/agents/route.ts`
- `src/app/api/agents/[id]/route.ts`
- `src/app/api/agents/import/route.ts`
- `src/app/api/flows/route.ts`
- `src/app/api/flows/[id]/route.ts`
- `src/app/api/skills/route.ts`
- `src/app/api/skills/[id]/route.ts`
- `src/app/api/standards/route.ts`
- `src/app/api/standards/[id]/route.ts`
- `src/app/api/knowledge/route.ts`
- `src/app/api/knowledge/[id]/route.ts`
- `src/app/api/tasks/route.ts`
- `src/app/api/tasks/[id]/route.ts`
- `src/app/api/workflows/route.ts`
- `src/app/api/workflows/[id]/route.ts`
- `src/app/api/executions/route.ts`
- `src/lib/domain/services/skill-import-service.ts` (internal)

### domain/scanner (16 importers)
- `src/app/api/scanner/evaluate/route.ts`
- `src/app/api/fetch-url/route.ts`
- `src/features/quality-analyzer/hooks/use-quality-store.ts`
- `src/features/quality-analyzer/components/scanner-skill-table.tsx`
- `src/features/quality-analyzer/components/scanner-ref-list.tsx`
- `src/features/quality-analyzer/components/scanner-issues.tsx`
- `src/features/quality-analyzer/components/file-uploader.tsx`
- `src/features/quality-analyzer/types.ts`
- Internal: `references.ts`, `parser.ts`, `heuristic.ts`, `anti-patterns.ts`, `client-scanner.ts`

### domain/ws (8 importers)
- `src/app/api/approvals/route.ts`
- `src/app/api/approvals/[id]/route.ts`
- `src/app/api/flows/[id]/execute/route.ts`
- `src/lib/domain/services/flow-execution-service.ts` (internal)
- `src/features/dashboard/hooks/use-dashboard-data.ts`
- `src/features/dashboard/hooks/use-approvals.ts`
- Internal: `server.ts`, `hooks.ts`, `events.ts`

### domain/skill-export (6 importers)
- `src/app/api/mcp/handlers.ts`
- `src/app/api/skills/export-formats/route.ts`
- `src/app/api/skills/[id]/route.ts`
- `src/app/api/skills/route.ts`
- `src/app/api/flows/[id]/execute/flow-utils.ts`

### domain/resilience (6 importers)
- `src/app/api/llm/route.ts`
- `src/app/api/flows/[id]/execute-sse/route.ts`
- `src/lib/domain/services/self-correction-service.ts` (internal)
- `src/lib/domain/services/flow-execution-service.ts` (internal)
- Internal: `fallback-manager.ts`, `circuit-breaker.ts`, `health-check.ts`, `api-retry.ts`

### domain/standards (1 importer)
- `src/app/api/standards/import/route.ts`

## Execution Order

1. Create `src/lib/domain/` directory
2. Move domain modules (mv)
3. Delete `fetch-patch.tsx`
4. Bulk update imports via sed/find-replace
5. Run `npx eslint . --max-warnings=0` — verify no broken imports
6. Run `npm run type-check` — verify TypeScript
7. Run `npm test` — verify tests pass

## Risks

- **Dynamic imports:** Some `llm/` files are imported dynamically from `client.ts` — verify paths still resolve
- **Barrel re-exports:** `llm/index.ts` barrel needs path updates internally
- **Test files:** `src/lib/*.test.ts` files stay at root (they test infrastructure), not moved
