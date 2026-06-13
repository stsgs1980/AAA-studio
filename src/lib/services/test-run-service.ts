import { db } from '@/lib/db';
import { callLLM } from '@/lib/llm/client';

/** Use LLM to judge if actual output matches expected */
async function judgeOutput(
  input: string, expected: Record<string, unknown>, actual: string,
  active: { provider: import('@/lib/llm').ProviderConfig; model: string; settings: import('@/lib/llm').LLMSettings },
) {
  try {
    const judgePrompt = `You are a test evaluator. Given:
INPUT: ${input.slice(0, 500)}
EXPECTED: ${JSON.stringify(expected).slice(0, 500)}
ACTUAL: ${actual.slice(0, 500)}

Score 0-100 how well the actual output matches the expected. Reply ONLY with JSON: {"score": <0-100>, "label": "pass"|"partial"|"fail", "reasoning": "<brief reason>"}`;

    const resp = await callLLM({
      provider: active.provider, model: active.model,
      messages: [{ role: 'user', content: judgePrompt }],
      temperature: 0.1, maxTokens: 200,
    });

    const parsed = JSON.parse(resp.content?.replace(/```json?\n?/g, '').replace(/```/g, '').trim() ?? '{}');
    return {
      score: Math.min(100, Math.max(0, parsed.score ?? 0)),
      label: parsed.label ?? 'fail',
      reasoning: parsed.reasoning ?? '',
      passed: (parsed.score ?? 0) >= 60,
    };
  } catch {
    // Fallback: simple string includes check
    const _expectedStr = JSON.stringify(expected).toLowerCase();
    const actualLower = actual.toLowerCase();
    const hasMatch = Object.values(expected).some((v) => actualLower.includes(String(v).toLowerCase()));
    return { score: hasMatch ? 50 : 0, label: hasMatch ? 'partial' : 'fail', reasoning: 'Simple string match fallback', passed: hasMatch };
  }
}

/** Execute a test run: iterate cases, call LLM, create results */
export async function executeTestRun(
  agentId: string | undefined,
  caseIds: string[] | undefined,
  active: { provider: import('@/lib/llm').ProviderConfig; model: string; settings: import('@/lib/llm').LLMSettings },
) {
  // Resolve test cases
  const where = caseIds?.length ? { id: { in: caseIds } } : { agentId };
  const cases = await db.testCase.findMany({ where });
  if (!cases.length) throw new Error('No test cases found');

  // Create test run
  const run = await db.testRun.create({
    data: { name: `Run ${new Date().toISOString()}`, agentId: agentId ?? null, totalCases: cases.length },
  });

  const start = Date.now();
  let passed = 0, failed = 0, errors = 0;

  for (const tc of cases) {
    const caseStart = Date.now();
    try {
      const input = JSON.parse(tc.input);
      const expected = JSON.parse(tc.expectedOutput);
      const textInput = typeof input === 'string' ? input : JSON.stringify(input);

      // Run through LLM
      const resp = await callLLM({
        provider: active.provider, model: active.model,
        messages: [{ role: 'user', content: textInput }],
        temperature: active.settings.temperature, maxTokens: active.settings.maxTokens,
      });

      const actual = resp.content ?? '';
      const actualOutput = { response: actual, model: resp.model };

      // Simple comparison + LLM-as-judge scoring
      const judgeResult = await judgeOutput(textInput, expected, actual, active);

      const status = judgeResult.passed ? 'passed' : 'failed';
      if (status === 'passed') passed++; else failed++;

      await db.testResult.create({
        data: {
          runId: run.id, caseId: tc.id, status,
          actualOutput: JSON.stringify(actualOutput),
          judgeScore: judgeResult.score, judgeLabel: judgeResult.label,
          judgeReasoning: judgeResult.reasoning,
          duration: Date.now() - caseStart,
        },
      });
    } catch (err) {
      errors++;
      await db.testResult.create({
        data: {
          runId: run.id, caseId: tc.id, status: 'error',
          actualOutput: '{}', judgeScore: 0, judgeLabel: 'error',
          judgeReasoning: err instanceof Error ? err.message : String(err),
          duration: Date.now() - caseStart,
          error: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }

  await db.testRun.update({
    where: { id: run.id },
    data: { status: 'completed', passedCases: passed, failedCases: failed, errorCases: errors, duration: Date.now() - start },
  });

  return { runId: run.id, total: cases.length, passed, failed, errors, duration: Date.now() - start };
}

/** List the last 20 test runs */
export async function listTestRuns() {
  return db.testRun.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
}
