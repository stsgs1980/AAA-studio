import { handleError, success, BadRequest } from '@/lib/api-error';
import { callLLM } from '@/lib/llm/client';
import { getActiveProvider } from '@/lib/llm';
import {
  buildEvaluationRubric,
  getDefaultRubric,
} from '@stsgs/prompting';

/**
 * POST /api/evaluate-deep
 * Deep quality analysis using LLM with rubric from @stsgs/prompting.
 *
 * Accepts:
 *   text     — content to evaluate (required)
 *   context  — optional context label
 *   scenario — rubric preset: "code" | "content" | "prompt" | "design" (default: "prompt")
 *   criteria — optional custom EvaluationCriterion[] overrides the preset
 */

const OUTPUT_FORMAT = `Output STRICTLY in this format (no markdown code blocks):

## OVERALL: <score>/10 -- <PASS|WARN|FAIL>
## Summary
<2-3 sentences overall assessment>

{CRITERIA_BLOCKS}

## Critical Issues
<list any critical/blocker issues or "None">

## Recommended Fixes (prioritized)
1. <most important fix>
2. <second most important>
3. <third>`;

export async function POST(request: Request) {
  try {
    const { text, context, scenario, criteria } = await request.json();
    if (!text?.trim()) {
      throw BadRequest('Text is required');
    }

    const active = await getActiveProvider();
    if (!active) {
      throw BadRequest('No LLM provider configured. Go to Settings -> LLM Provider to add and activate a provider.');
    }

    // Build rubric from @stsgs/prompting
    const rubricCriteria = Array.isArray(criteria) && criteria.length > 0
      ? criteria
      : getDefaultRubric(scenario ?? 'prompt');

    const rubric = buildEvaluationRubric(rubricCriteria);

    // Build criteria blocks for output format
    const criteriaBlocks = rubricCriteria.map((c, i) => [
      `## ${i + 1}. ${c.name}`,
      `Score: <0-10> -- <PASS|WARN|FAIL>`,
      `Finding: <${c.description}>`,
      `Action: <what to fix>`,
    ].join('\n')).join('\n\n');

    const systemPrompt = [
      'You are a rigorous AI agent quality auditor. Analyze the provided content ',
      '(agent system prompt, configuration, documentation, or codebase) and produce a structured evaluation report.',
      '',
      rubric,
      '',
      OUTPUT_FORMAT.replace('{CRITERIA_BLOCKS}', criteriaBlocks),
    ].join('\n');

    const userMessage = context
      ? `Context: ${context}\n\n---\n\nContent to evaluate:\n${text}`
      : text;

    let response;
    try {
      response = await callLLM({
        provider: active.provider,
        model: active.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage.slice(0, 30000) },
        ],
        temperature: 0.2,
        maxTokens: 4096,
      });
    } catch (llmError) {
      const msg = llmError instanceof Error ? llmError.message : String(llmError);
      throw BadRequest(`LLM call failed: ${msg}`);
    }

    const content = response.content ?? 'No response from LLM.';

    return success({
      analysis: content,
      scenario: scenario ?? 'prompt',
      criteriaCount: rubricCriteria.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
