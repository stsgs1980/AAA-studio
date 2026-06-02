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
// Instead of relying on the SDK's built-in config discovery (which can fail
// due to race conditions or webpack bundling), we read /etc/.z-ai-config
// ourselves and pass the parsed config to the SDK constructor.
import { readFile } from 'fs/promises';
import path from 'path';
import os from 'os';

const SDK_CONFIG_PATHS = [
  path.join(process.cwd(), '.z-ai-config'),
  path.join(os.homedir(), '.z-ai-config'),
  '/etc/.z-ai-config',
];

let _zaiSDK: unknown = null;
let _zaiSDKInitPromise: Promise<unknown> | null = null;

async function loadZaiConfig(): Promise<Record<string, unknown>> {
  for (const p of SDK_CONFIG_PATHS) {
    try {
      const raw = await readFile(p, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.baseUrl && parsed.apiKey) return parsed;
    } catch { /* next */ }
  }
  throw new Error(
    'Configuration file not found or invalid. Please create .z-ai-config in your project, home directory, or /etc.',
  );
}

async function getZaiSDK() {
  if (_zaiSDK) return _zaiSDK as { chat: { completions: { create: (b: unknown) => Promise<unknown> } } };
  if (!_zaiSDKInitPromise) {
    _zaiSDKInitPromise = Promise.all([
      import('z-ai-web-dev-sdk'),
      loadZaiConfig(),
    ]).then(([mod, config]) => {
      const Ctor = mod.default ?? mod;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return new (Ctor as any)(config);
    });
  }
  _zaiSDK = await _zaiSDKInitPromise;
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
      // Reset SDK cache so next call retries fresh
      _zaiSDK = null;
      _zaiSDKInitPromise = null;
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
