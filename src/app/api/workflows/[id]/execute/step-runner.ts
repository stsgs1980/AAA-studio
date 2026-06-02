import { db } from '@/lib/db';
import type { PipelineStep } from '@prisma/client';

/** Execute workflow steps sequentially, returns final output */
export async function executeSteps(
  executionId: string,
  steps: PipelineStep[],
  input: unknown,
  provider: { provider: Parameters<typeof import('@/lib/llm/client')['callLLM']>[0]['provider']; model: string },
) {
  const { callLLM } = await import('@/lib/llm/client');

  let currentInput = input ?? {};
  const results: { step: string; status: string; duration: number }[] = [];

  // Create step execution records
  const stepExecs = await Promise.all(
    steps.map((step) =>
      db.stepExecution.create({
        data: {
          executionId,
          stepId: step.id,
          agentId: step.agentId,
          status: 'pending',
          inputData: '{}',
          outputData: '{}',
        },
      }),
    ),
  );

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepExec = stepExecs[i];
    const stepStart = Date.now();

    await db.stepExecution.update({
      where: { id: stepExec.id },
      data: { status: 'running', startedAt: new Date(), inputData: JSON.stringify(currentInput) },
    });

    try {
      const agent = step.agentId
        ? await db.agent.findUnique({ where: { id: step.agentId } })
        : null;

      const systemPrompt = agent?.systemPrompt
        ?? `You are step "${step.name}". Action: ${step.action}. Complete the task.`;

      const response = await callLLM({
        provider: provider.provider,
        model: provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: buildStepMessage(step, currentInput) },
        ],
        temperature: agent?.temperature ?? 0.3,
        maxTokens: agent?.maxTokens ?? 4096,
      });

      const output = response.content ?? '';
      let stepStatus = 'completed';
      if (step.action === 'decision' && step.condition) {
        stepStatus = evaluateCondition(step.condition, output) ? 'completed' : 'skipped';
      }

      await db.stepExecution.update({
        where: { id: stepExec.id },
        data: { status: stepStatus, outputData: JSON.stringify({ content: output }), completedAt: new Date() },
      });

      results.push({ step: step.name, status: stepStatus, duration: Date.now() - stepStart });
      currentInput = { ...currentInput, [step.name]: output };

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await db.stepExecution.update({
        where: { id: stepExec.id },
        data: { status: 'failed', error: errMsg, completedAt: new Date() },
      });
      results.push({ step: step.name, status: 'failed', duration: Date.now() - stepStart });

      // Skip remaining steps
      for (let j = i + 1; j < steps.length; j++) {
        await db.stepExecution.update({ where: { id: stepExecs[j].id }, data: { status: 'skipped' } });
      }

      return { status: 'failed' as const, failedStep: step.name, error: errMsg, results, currentInput };
    }
  }

  return { status: 'completed' as const, results, currentInput };
}

function buildStepMessage(step: PipelineStep, input: unknown): string {
  let config = {};
  try { config = JSON.parse(step.config) as Record<string, unknown>; } catch { /* */ }
  return `Step: ${step.name}\nAction: ${step.action}\nConfig: ${JSON.stringify(config)}\n\nInput:\n${JSON.stringify(input, null, 2)}`;
}

function evaluateCondition(conditionJson: string, output: string): boolean {
  try {
    const cond = JSON.parse(conditionJson) as { keyword?: string; regex?: string };
    if (cond.keyword) return output.toLowerCase().includes(cond.keyword.toLowerCase());
    if (cond.regex) { try { return new RegExp(cond.regex, 'i').test(output); } catch { return false; } }
    return true;
  } catch { return true; }
}
