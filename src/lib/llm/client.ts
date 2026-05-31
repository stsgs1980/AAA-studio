// 3A Studio -- LLM Provider Client. Routes to correct provider implementation.

import type { LLMMessage, LLMResponse, ProviderConfig } from './types';
export type { LLMResponse, ProviderConfig } from './types';

export interface CallParams {
  provider: ProviderConfig;
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

// ---- Z.ai SDK (sandbox-only, uses SDK directly without API key) ----
let _zaiSDK: unknown = null;
let _zaiSDKAvailable: boolean | null = null;

async function getZaiSDK() {
  if (!_zaiSDKAvailable) {
    const mod = await import('z-ai-web-dev-sdk');
    _zaiSDK = await (mod.default ?? mod).create();
    _zaiSDKAvailable = true;
  }
  return _zaiSDK as { chat: { completions: { create: (b: unknown) => Promise<unknown> } } };
}

async function callZaiSDK(p: CallParams): Promise<LLMResponse> {
  const sdk = await getZaiSDK();
  const { model, messages, temperature, maxTokens } = p;
  const body = {
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: temperature ?? 0.7,
    max_tokens: maxTokens ?? 4096,
    ...(model ? { model } : {}),
  };
  const data = await sdk.chat.completions.create(body) as Record<string, unknown>;
  const choices = data.choices as Array<{ message: { content: string | null }; finish_reason: string }> | undefined;
  const usage = data.usage as { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;
  return {
    id: (data.id as string) ?? `zai-${Date.now()}`,
    content: choices?.[0]?.message?.content ?? '',
    model: (data.model as string) ?? model,
    finishReason: choices?.[0]?.finish_reason ?? 'stop',
    usage: usage ? {
      promptTokens: usage.prompt_tokens ?? 0,
      completionTokens: usage.completion_tokens ?? 0,
      totalTokens: usage.total_tokens ?? 0,
    } : undefined,
  };
}

// ---- Router ----
export async function callLLM(params: CallParams): Promise<LLMResponse> {
  const { provider } = params;

  if (provider.id === 'zai') {
    // Z.ai with API key → use OpenAI-compatible endpoint (works on Vercel)
    if (provider.apiKey) {
      const { callOpenAI } = await import('./openai');
      return callOpenAI(params);
    }
    // No API key → try SDK (sandbox mode), fall back to OpenAI format if SDK unavailable
    try {
      return await callZaiSDK(params);
    } catch (sdkError) {
      _zaiSDKAvailable = false;
      const msg = sdkError instanceof Error ? sdkError.message : String(sdkError);
      throw new Error(
        `Z.ai SDK unavailable (${msg}). ` +
        'Go to Settings → LLM Provider to add a Z.ai API key for production use.',
        { cause: sdkError },
      );
    }
  }

  if (!provider.apiKey) {
    throw new Error('API key is not configured. Go to Settings -> LLM Provider to set it up.');
  }

  if (provider.format === 'anthropic') {
    const { callAnthropic } = await import('./anthropic');
    return callAnthropic(params);
  }

  const { callOpenAI } = await import('./openai');
  return callOpenAI(params);
}
