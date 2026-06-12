# 3A Studio — Diagram Changelog

> **Purpose**: Complete audit trail of all changes to PlantUML diagrams.
> Every modification to a `.puml` file MUST be recorded here.

---

## Changelog Format

Each entry follows this format:
```
## [DATE] — Session: [SESSION_ID]
### [DIAGRAM_ID] v[OLD] -> v[NEW]
- **Type**: modified | created | deprecated | archived | restored
- **Scope**: [what changed]
- **Details**: [specific changes made]
- **Reason**: [why the change was needed]
```

---

## 2026-06-12 — Session: S1-bootstrap

### 01-flow-execution-server v0.0 -> v1.0
- **Type**: created
- **Scope**: Initial diagram creation with full server-side flow execution
- **Details**: Documented POST /api/flows/[id]/execute path including topoSort, node execution loop, all node types (LLM, agent, router, condition, HITL, prompt/transform/start/end), retry logic, cost tracking, branching, WS events
- **Reason**: Baseline documentation of the server-side execution pipeline
- **Author**: AI Agent

### 02-flow-execution-client-sse v0.0 -> v1.0
- **Type**: created
- **Scope**: Initial diagram creation with dual-path execution (client + SSE)
- **Details**: Documented Path A (client-side execution with EventBus) and Path B (SSE server-side execution), including all node handler types, branch routing, store updates
- **Reason**: Baseline documentation of the client-side and SSE execution paths
- **Author**: AI Agent

### 03-self-correction-loop v0.0 -> v1.0
- **Type**: created
- **Scope**: Initial diagram creation with self-correction API flow
- **Details**: Documented POST /api/self-correction including initial generation, judge evaluation (score 0-10, verdict parsing), revision loop with maxRetries, session persistence in DB
- **Reason**: Baseline documentation of the self-correction mechanism
- **Author**: AI Agent

### 04-websocket-architecture v0.0 -> v1.0
- **Type**: created
- **Scope**: Initial diagram creation with WS/SSE architecture analysis
- **Details**: Documented all 5 WS channels (approvals=ACTIVE, dashboard=ACTIVE, flow-execution=DEAD, agent-status=DEAD, cost-update=DEAD), SSE alternative path, polling fallback, identified dead code
- **Reason**: Baseline documentation and audit of real-time communication architecture
- **Author**: AI Agent

---

## 2026-06-12 — Session: S2-metadata-system

### DIAGRAM-REGISTRY.md v0.0 -> v1.0
- **Type**: created
- **Scope**: Global diagram registry and session protocol documentation
- **Details**: Created registry with metadata format spec, changelog format, inventory table, naming conventions, diagram relationships map, session start/end protocol
- **Reason**: Establish a session-based mechanism for tracking diagram creation, modification, and documentation changes across AI agent sessions
- **Author**: AI Agent

### DIAGRAM-CHANGELOG.md v0.0 -> v1.0
- **Type**: created
- **Scope**: This changelog file
- **Details**: Created with initial S1-bootstrap entries retroactively documenting the creation of all 4 diagrams, plus this S2 entry
- **Reason**: Central audit trail for all diagram modifications
- **Author**: AI Agent

### 01-flow-execution-server v1.0 -> v1.1
- **Type**: modified
- **Scope**: Added metadata header and changelog legend
- **Details**: Added METADATA block (id, title, version, status, dates, author, diagramType, scope, dependencies, tags). Added versioned changelog in legend block.
- **Reason**: Apply the new metadata and versioning system
- **Author**: AI Agent

### 02-flow-execution-client-sse v1.0 -> v1.1
- **Type**: modified
- **Scope**: Added metadata header and changelog legend
- **Details**: Same metadata and changelog additions as 01
- **Reason**: Apply the new metadata and versioning system
- **Author**: AI Agent

### 03-self-correction-loop v1.0 -> v1.1
- **Type**: modified
- **Scope**: Added metadata header and changelog legend
- **Details**: Same metadata and changelog additions as 01
- **Reason**: Apply the new metadata and versioning system
- **Author**: AI Agent

### 04-websocket-architecture v1.0 -> v1.1
- **Type**: modified
- **Scope**: Added metadata header and changelog legend
- **Details**: Same metadata and changelog additions as 01
- **Reason**: Apply the new metadata and versioning system
- **Author**: AI Agent