# AGENT_RULES.md - AAA Studio

> Version: 1.0.0
> Last Updated: 2026-07-02
> Stack-specific rules. Complements global AGENTS.md.

**SESSION START:**
1. Read global AGENTS.md (~/.config/opencode/AGENTS.md)
2. Read this file (full)
3. Read worklog.md (last 10 entries) (if exists)
4. Read README.md (Section 15 - Agent Rules)
5. Scan project structure (ls -la src/ packages/)

---

## 1. Project Identity

- **Type:** app
- **Purpose:** IDE for visual multi-agent systems (Artificial. Agentic. Architecture.)
- **Stack:** Next.js 15.3, React 19, TypeScript 5.8, Prisma 6.8.2, Neon PostgreSQL, Socket.IO, Zustand, Radix UI, pnpm workspaces

---

## 2. Commands

### Package Manager
- **Type:** pnpm (lockfile is bun.lockb - uses pnpm workspaces with bun runtime)
- **Install:** `pnpm install`

### Development
- **Dev server:** `pnpm run dev` (Turbopack enabled, default port)
- **Build:** `pnpm run build`
- **Start production:** `pnpm run start`

### Quality
- **Lint:** `pnpm run lint`
- **Type check:** `pnpm run type-check`
- **Test:** `pnpm run test` (Vitest)
- **Test watch:** `pnpm run test:watch`
- **Coverage:** `pnpm run test:coverage`
- **Verify:** `pnpm run verify` (verify-docs)

### Database
- **Type:** PostgreSQL (Neon)
- **ORM:** Prisma 6.8.2
- **Schema path:** `prisma/schema.prisma`
- **Adapter:** `@prisma/adapter-neon`
- **Migration flow:**
  - `pnpm run db:push` (push schema to DB)
  - `pnpm run db:migrate` (create migration)
  - `pnpm run db:generate` (generate client)
  - `pnpm run db:studio` (Prisma Studio)
  - `pnpm run db:seed` (seed with Bun)

---

## 3. Architecture

- **Pattern:** FSD + monorepo packages/
- **Layers:** `tokens/` -> `ui/` -> `sections/` -> `features/` -> `hooks/` -> `providers/`
- **Boundary rules:** Import only downward, never upward. Deep imports prohibited.
- **Barrel exports:** Mandatory per module. Explicit exports, not `export *` for 10+ files.
- **Packages structure:**
  - `packages/verify-docs/` - documentation consistency checker
  - `packages/` - other monorepo packages
- **What differs from typical structure:**
  - Monorepo with packages/ (not standard single-app Next.js)
  - Turbopack enabled for faster dev
  - Neon PostgreSQL (not SQLite as per global default)

---

## 4. Environment Variables

| Variable | Purpose | Required | Default |
|----------|---------|----------|---------|
| DATABASE_URL | PostgreSQL connection string (Neon) | Yes | - |
| AUTH_SECRET | JWT signing secret (64-char hex) | Yes | - |
| ADMIN_USERNAME | Admin username | No | admin |
| ADMIN_PASSWORD | Admin password | No | admin |
| ENCRYPTION_KEY | AES-256-GCM encryption key (64-char hex) | Yes | - |
| ZAI_API_KEY | Z.ai SDK API key | No | - |
| ZAI_BASE_URL | Z.ai SDK base URL | No | - |

---

## 5. Gotchas

- **Postinstall script:** Runs `prisma generate && bun run scripts/install-hooks.ts`
- **Vercel build:** Uses `vercel-build` script: `prisma db push --skip-generate && next build`
- **Workspace config:** `pnpm-workspace.yaml` defines packages: `packages/*`
- **pnpm onlyBuiltDependencies:** Prisma, sharp, unrs-resolver must be prebuilt
- **Submodule:** `anti-hallucination-guard/` is git submodule - do NOT modify directly
- **Lockfile confusion:** bun.lockb exists but project uses pnpm workspaces

---

## 6. README.md Requirements

**Section 15 (Agent Rules) is MANDATORY** in README.md because this file exists:

```markdown
## Agent Rules

Any AI agent working on this project MUST read and follow `AGENT_RULES.md` before performing any operations.
```

**Section 17 (Stack Signature) is REQUIRED** because this is an app repo:

```markdown
---
Built with: Next.js 15.3 + React 19 + TypeScript 5.8 + Prisma 6.8.2 + Neon PostgreSQL + Socket.IO + Zustand + Radix UI
```

---

## 7. Deviations from Global Default Stack

| Global Default | Project Reality | Reason |
|----------------|-----------------|--------|
| bun install | pnpm install | Monorepo workspaces require pnpm |
| npx next dev | pnpm run dev (Turbopack) | Turbopack provides faster dev builds |
| SQLite | PostgreSQL (Neon) | Multi-agent orchestration requires cloud DB |
| No monorepo | FSD + packages/ | Shared packages across workspace (verify-docs, etc.) |
| Standard Next.js build | vercel-build script | Custom build flow for Vercel deployment |
| No postinstall script | Runs prisma generate + install-hooks | Ensures Prisma client and git hooks are set up |

---

## 8. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-02 | Initial AGENT_RULES.md for AAA Studio |