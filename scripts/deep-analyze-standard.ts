import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();

  const content = fs.readFileSync('Zai-agent-toolkit/standards/FRONTEND_STANDARD.md', 'utf8');

  const EVAL_PROMPT = `You are a rigorous AI agent quality auditor. Analyze the provided content and produce a structured evaluation report.

For each criterion below, give:
- Score: 0-10
- Status: PASS if >=7, WARN if 4-6, FAIL if <4
- Finding: one sentence
- Action: concrete fix

Output STRICTLY in this format:

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

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: EVAL_PROMPT },
      { role: 'user', content: 'Context: This is a coding standard from Zai-agent-toolkit meant to be used as a StandardRule in 3A Studio.\n\n---\n\n' + content.slice(0, 15000) }
    ],
    temperature: 0.2,
    max_tokens: 4096,
  });

  console.log(completion.choices[0]?.message?.content);
}

main().catch(console.error);
