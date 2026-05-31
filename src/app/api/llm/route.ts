// ============================================================================
// POST /api/llm -- Unified LLM endpoint
// Reads active provider from DB, proxies the request.
// Applies resilience: retry on transient errors + fallback to other providers.
// ============================================================================

import { handleError, BadRequest } from '@/lib/api-error';
import { callLLM } from '@/lib/llm/client';
import { getActiveProvider, getProviders } from '@/lib/llm';
import type { LLMMessage } from '@/lib/llm';
import { withRetry } from '@/lib/resilience/api-retry';
import { FallbackManager } from '@/lib/resilience/fallback-manager';

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

    // Try with retry + fallback
    const providers = await getProviders();
    const enabledCount = providers.filter(p => p.enabled).length;

    if (enabledCount > 1) {
      // Multiple providers available -- use FallbackManager
      const fm = new FallbackManager(providers);
      try {
        const result = await fm.chat(messages, active.settings, {
          model: body.model || active.model,
          temperature: temperature ?? active.settings.temperature,
          maxTokens: max_tokens ?? active.settings.maxTokens,
        });
        return Response.json({
          id: `llm-${Date.now()}`,
          content: result.content,
          model: result.model,
          finishReason: 'stop',
          usage: result.usage,
          fallbackUsed: result.fallbackUsed,
          providerUsed: result.providerId,
        });
      } catch {
        // All providers failed through fallback -- fall through to direct call
      }
    }

    // Single provider or fallback exhausted -- use retry on active provider
    const response = await withRetry(
      () => callLLM({
        provider: active.provider,
        model: body.model || active.model,
        messages,
        temperature: temperature ?? active.settings.temperature,
        maxTokens: max_tokens ?? active.settings.maxTokens,
      }),
      { maxRetries: 2, initialDelay: 1000 }
    );

    return Response.json(response);
  } catch (error) {
    return handleError(error);
  }
}
