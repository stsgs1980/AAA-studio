import { db } from '@/lib/db';
import { callLLM } from '@/lib/llm/client';

type ActiveProvider = {
  provider: import('@/lib/llm').ProviderConfig;
  model: string;
  settings: import('@/lib/llm').LLMSettings;
};

/** Parse judge LLM response into structured fields */
export function parseJudgeResponse(text: string) {
  const scoreMatch = text.match(/SCORE:\s*([\d.]+)/i);
  const verdictMatch = text.match(/VERDICT:\s*(approved|needs_revision|rejected)/i);
  const reasoningMatch = text.match(/REASONING:\s*(.+)/is);
  return {
    score: scoreMatch ? parseFloat(scoreMatch[1]) : 5,
    verdict: verdictMatch ? verdictMatch[1] : 'needs_revision',
    reasoning: reasoningMatch ? reasoningMatch[1].trim() : text,
  };
}

/** Self-correction loop: revise output based on judge feedback */
export async function selfCorrect(
  sessionId: string,
  currentOutput: string,
  input: string,
  feedback: string,
  active: ActiveProvider,
  maxRetries: number,
): Promise<Record<string, unknown>> {
  let output = currentOutput;
  let lastFeedback = feedback;
  let retryCount = 0;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    retryCount++;

    const revResp = await callLLM({
      provider: active.provider, model: active.model,
      messages: [
        { role: 'system', content: 'Improve your previous response based on the feedback.' },
        { role: 'user', content: `Original input: ${input}\n\nPrevious response:\n${output}\n\nFeedback:\n${lastFeedback}\n\nImproved response:` },
      ],
      temperature: active.settings.temperature,
      maxTokens: active.settings.maxTokens,
    });
    output = revResp.content;

    const judgeResp = await callLLM({
      provider: active.provider, model: active.model,
      messages: [
        { role: 'system', content: 'Score 0-10, give verdict. Format:\nSCORE: <number>\nVERDICT: <approved|needs_revision|rejected>\nREASONING: <text>' },
        { role: 'user', content: `Input: ${input}\n\nResponse:\n${output}` },
      ],
      temperature: 0.1, maxTokens: 200,
    });

    const { score: revisionScore, verdict, reasoning } = parseJudgeResponse(judgeResp.content);
    lastFeedback = reasoning;

    const updated = await db.selfCorrectionSession.update({
      where: { id: sessionId },
      data: {
        revisedOutput: output, revisionScore, judgeVerdict: verdict,
        judgeReasoning: reasoning, retryCount,
        status: verdict === 'approved' ? 'completed' : (retryCount >= maxRetries ? 'failed' : 'revising'),
      },
    });

    if (verdict === 'approved') return updated;
  }

  return await db.selfCorrectionSession.update({
    where: { id: sessionId },
    data: { status: 'failed', retryCount, revisedOutput: output },
  });
}
