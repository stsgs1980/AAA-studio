# 3A Studio — AI Agent Workflow

Internal reference for session continuity. Not project documentation — **how the agent works**.

## Feature Development Pipeline (7-phase)

```
Discovery → Explore → Questions → Architecture → Implement → Review → Summary
```

1. **Discovery** — read task, classify type (doc/chart/web/data), check what exists
2. **Explore** — read relevant files, understand current state, identify constraints
3. **Questions** — ask user if ambiguous (but minimize back-and-forth)
4. **Architecture** — plan changes, identify files, estimate scope
5. **Implement** — code, test, iterate
6. **Review** — self-check: anti-monolith rules, type safety, no hardcodes
7. **Summary** — update worklog.md, commit, push

## Confidence Scoring

When reviewing code or suggesting changes — only report findings with **≥80% confidence**. Below that = noise.

## Code Standards (flexible)

These are **guidelines**, not dogma. Discuss if they don't fit:

- Files ≤150 lines, components ≤3 useState
- Zustand for shared state (not hook-based stores)
- Semantic Tailwind tokens (bg-card, text-muted-foreground) — no hardcoded hex
- HSL CSS variables for theming (globals.css @theme + .dark{})
- try/catch + res.ok on every fetch call
- Skeleton loading states on every data-fetching page

## What NOT to do

- Don't blindly follow FRONTEND_STANDARD if it conflicts with pragmatism
- Don't create abstractions "for future use" (YAGNI)
- Don't rush architecture decisions — ask first
- Don't push without build verification
- Don't overwrite files without reading them first

## Session Continuity

Every session MUST:
1. Read `/worklog.md` to understand what was done
2. Check `git log --oneline -10` for recent commits
3. Append work record to worklog.md before session ends
4. Commit and push all changes

## Key Decisions Log

| Decision | Why | When |
|----------|-----|------|
| Plain PrismaClient (no Neon adapter) | @prisma/adapter-neon v7 incompatible with Prisma v6 | Task 6 |
| Zustand over hook-based stores | useAgentStore was broken — hook called conditionally | Task 7 |
| bun.lock over pnpm-lock.yaml | bun updates bun.lock automatically, pnpm-lock was stale | Task 6 |
| HSL CSS variables | shadcn standard, ThemeProvider uses class attribute | Task 8 |
| Flexible FRONTEND_STANDARD | User directive — standard may be raw/harmful, discuss before following | Task 8 |
| Universal LLM Provider | Internal API unreachable from Vercel. User provides own API key for any provider. | Task 13 |
| Settings-based LLM config | Provider + key stored in DB Settings table, read by /api/llm at runtime. | Task 13 |

## Technical Debt

### 🔴 Security: API Key Protection (before public release)
- [ ] **Auth** — NextAuth/Clerk to gate /api/settings and Settings page
- [ ] **Encrypt key in DB** — AES encrypt on write, decrypt only server-side for LLM call
- [ ] **Mask key in UI** — show `sk-...xxxx` (last 4 chars), never return full key to browser
- [ ] **Rate-limit /api/llm** — prevent abuse on public deployment

### 🟡 Improvements
- [ ] **Streaming** — SSE for LLM responses (currently request-response only)
- [ ] **Per-node model** — let each flow node override the default model
- [ ] **Usage tracking** — log token usage per execution in PipelineExecution
- [ ] **Provider health** — auto-detect failing provider and notify user
