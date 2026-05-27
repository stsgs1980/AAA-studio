# 3A Studio

**Artificial. Agentic. Architecture.**

IDE for visual multi-agent systems. Build, manage and monitor AI agent flows with a drag-and-drop editor, prompt evaluation, knowledge base, and more.

## Quick Start

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Push database schema
bun run db:push

# Start development server
bun run dev
```

## Project Structure

```
3a-studio/
├── src/app/                    # Next.js 16 App Router (12 screens)
│   ├── dashboard/              # Screen 1: System overview
│   ├── editor/                 # Screen 2: Visual flow editor (React Flow)
│   ├── templates/              # Screen 3: Template gallery
│   ├── agents/                 # Screen 4: Agent CRUD
│   ├── hierarchy/              # Screen 5: Agent hierarchy graph
│   ├── pipelines/              # Screen 6: Pipeline execution
│   ├── prompt-studio/          # Screen 7: Prompt evaluation
│   ├── knowledge/              # Screen 8: Document knowledge base
│   ├── skills-page/            # Screen 9: Skill management
│   ├── standards/              # Screen 10: Standards manager
│   ├── audit/                  # Screen 11: Audit log
│   ├── settings/               # Screen 12: System settings
│   └── api/                    # API routes
├── packages/
│   ├── ui/                     # @stsgs/ui — Design system (shadcn/ui + custom)
│   ├── prompting/              # @stsgs/prompting — Prompt scoring & frameworks
│   ├── shared/                 # @stsgs/shared — Types, utils, constants
│   └── eslint-plugin/          # eslint-plugin-3a — Custom linting rules
├── prisma/                     # Database schema (SQLite)
├── docs/                       # Architecture documentation
└── standards/                  # Coding standards (read-only)
```

## Monorepo Packages

| Package | Name | Purpose |
|---------|------|---------|
| UI | `@stsgs/ui` | Design system with tokens, hooks, providers |
| Prompting | `@stsgs/prompting` | 6-criteria scoring, 20 formulas, frameworks |
| Shared | `@stsgs/shared` | Core types, utilities, navigation constants |
| ESLint | `eslint-plugin-3a` | max-lines, max-use-state, no-cross-layer |

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM + SQLite
- **State**: Zustand (client), TanStack Query (server)
- **Flow Editor**: @xyflow/react (React Flow v12)
- **Animations**: Framer Motion

## Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 0 | Monorepo setup, packages, Prisma | In Progress |
| Phase 1 | Routing & navigation | Pending |
| Phase 2 | Dead code cleanup | Pending |
| Phase 3 | Flow Editor (18 node types) | Pending |
| Phase 4 | Dashboard (metrics & API) | Pending |
| Phase 5 | Agent Management (CRUD) | Pending |
| Phase 6 | Knowledge Base | Pending |
| Phase 7 | Remaining screens | Pending |
| Phase 8 | Infrastructure (auth, i18n, tests) | Pending |

## License

TBD
