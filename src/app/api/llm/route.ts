// ============================================================================
// POST /api/llm -- Unified LLM endpoint
// Reads active provider from DB, proxies the request.
// ============================================================================

import { handleError, BadRequest } from '@/lib/api-error';
import { callLLM } from '@/lib/llm/client';
import { getActiveProvider } from '@/lib/llm';
import type { LLMMessage } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: LLMMessage[] = body.messages;
    const { temperature, max_tokens } = body;

    if (!messages?.length) {
      throw BadRequest('messages required');
    }

    const active = await getActiveProvider();
    if (!active) {
      throw BadRequest('LLM not configured. Go to Settings -> LLM Provider to add your API key.');
    }

    const response = await callLLM({
      provider: active.provider,
      model: body.model || active.model,
      messages,
      temperature: temperature ?? active.settings.temperature,
      maxTokens: max_tokens ?? active.settings.maxTokens,
    });

    return Response.json(response);
  } catch (error) {
    return handleError(error);
  }
}
