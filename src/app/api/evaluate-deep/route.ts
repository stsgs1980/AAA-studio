import { NextResponse } from 'next/server';
import { getActiveProvider, callLLM } from '@/lib/llm';
import { isDbReady } from '@/lib/db';

const EVAL_SYSTEM_PROMPT = `You are a rigorous AI agent quality auditor. Analyze the provided content (agent system prompt, configuration, documentation, or codebase) and produce a structured evaluation report.

For each criterion below, give:
- Score: 0-10
- Status: PASS if >=7, WARN if 4-6, FAIL if <4
- Finding: one sentence
- Action: concrete fix

Output STRICTLY in this format (no markdown code blocks):

## OVERALL: <score>/10 -- <PASS|WARN|FAIL>
## Summary
<2-3 sentences overall assessment>

## 1. Purpose & Scope
Score: <0-10> -- <PASS|WARN|FAIL>
Finding: <what you found>
Action: <what to fix>

## 2. Clarity & Unambiguity
Score: <0-10> -- <PASS|WARN|FAIL>
Finding: <what you found>
Action: <what to fix>

## 3. Completeness
Score: <0-10> -- <PASS|WARN|FAIL>
Finding: <what you found>
Action: <what to fix>

## 4. Consistency
Score: <0-10> -- <PASS|WARN|FAIL>
Finding: contradictions, duplicates, or mismatches found
Action: <what to fix>

## 5. Actionability
Score: <0-10> -- <PASS|WARN|FAIL>
Finding: can an agent actually follow these instructions?
Action: <what to fix>

## 6. Error Handling & Edge Cases
Score: <0-10> -- <PASS|WARN|FAIL>
Finding: are failures, ambiguity, and edge cases addressed?
Action: <what to fix>

## 7. Security & Constraints
Score: <0-10> -- <PASS|WARN|FAIL>
Finding: are boundaries, permissions, and safety rules defined?
Action: <what to fix>

## 8. Documentation Quality
Score: <0-10> -- <PASS|WARN|FAIL>
Finding: is documentation sufficient for maintenance?
Action: <what to fix>

## Critical Issues
<list any critical/blocker issues or "None">

## Recommended Fixes (prioritized)
1. <most important fix>
2. <second most important>
3. <third>`;

export async function POST(request: Request) {
  try {
    // Early guard: if DB is down, no LLM config can be read
    if (!isDbReady()) {
      return NextResponse.json(
        { error: 'Database is not available. Please ensure DATABASE_URL is configured correctly in .env' },
        { status: 503 },
      );
    }

    const { text, context } = await request.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const active = await getActiveProvider();
    if (!active) {
      return NextResponse.json(
        { error: 'No LLM provider configured. Go to Settings → LLM Provider to add and activate a provider.' },
        { status: 400 },
      );
    }

    const userMessage = context
      ? `Context: ${context}\n\n---\n\nContent to evaluate:\n${text}`
      : text;

    const response = await callLLM({
      provider: active.provider,
      model: active.model,
      messages: [
        { role: 'system', content: EVAL_SYSTEM_PROMPT },
        { role: 'user', content: userMessage.slice(0, 30000) },
      ],
      temperature: 0.2,
      maxTokens: 4096,
    });

    const content = response.content ?? 'No response from LLM.';

    return NextResponse.json({ analysis: content });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Evaluation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
