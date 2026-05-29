
---
Task ID: 3B-qa
Agent: main
Task: Build Quality Analyzer screen for evaluating prompts, agents, and configurations

Work Log:
- Created feature module: src/features/quality-analyzer/
- types.ts: InputMode, EvaluationInput, EvaluationResult, StandardsCheckResult, RubricResult
- lib/eval-helpers.ts: generateSuggestions, checkStandards, evaluateRubric (extracted from store for line limit)
- hooks/use-quality-store.ts: Zustand store with analyze() calling scorePrompt + fetch standards
- hooks/use-agent-loader.ts: fetch agents list, handle URL fetch, handle agent selection
- components/input-panel.tsx: 4 modes (text/file/url/agent), textarea, file upload, URL input, agent select
- components/score-panel.tsx: 6 dimension bars + overall score + suggestions
- components/standards-panel.tsx: pass/fail summary + rule details list
- components/rubric-panel.tsx: 4 scenarios (prompt/code/content/design), threshold control, criterion breakdown
- Page at /quality-analyzer with split layout (input left, results right)
- Added sidebar nav item (ClipboardCheck icon) + i18n (en/ru)

Stage Summary:
- Quality Analyzer now accessible at /quality-analyzer in sidebar
- User can: paste text, upload file (.txt/.md/.json/.yaml/.ts/.js/.py/.toml), paste URL for fetch, or select existing agent
- Analysis runs client-side scoring engine (6 criteria 0-10) + standards rules check from DB + rubric evaluation
- Build passes clean, pushed as 653cd2b
