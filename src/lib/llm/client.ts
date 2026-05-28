// 3A Studio — LLM Provider Client. HTTP calls to LLM providers (OpenAI-compatible format, Anthropic variant).

import type { LLMMessage, LLMResponse, LLMProviderId } from './types';
import { LLM_PROVIDERS } from './types';

interface ProviderCallParams {
  providerId: LLMProviderId;
  apiKey: string;
  baseUrl?: string;
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

// ---- OpenAI-compatible providers (Z.ai, OpenAI, OpenRouter) ----
async function callOpenAICompatible(params: ProviderCallParams): Promise<LLMResponse> {
  const { providerId, apiKey, model, messages, temperature, maxTokens } = params;
  const baseUrl = params.baseUrl ?? LLM_PROVIDERS[providerId].baseUrl;
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 4096,
      stream: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${providerId} API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return {
    id: data.id ?? `call-${Date.now()}`,
    content: data.choices?.[0]?.message?.content ?? '',
    model: data.model ?? model,
    finishReason: data.choices?.[0]?.finish_reason ?? 'stop',
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens ?? 0,
      completionTokens: data.usage.completion_tokens ?? 0,
      totalTokens: data.usage.total_tokens ?? 0,
    } : undefined,
  };
}

// ---- Anthropic (different format) ----
async function callAnthropic(params: ProviderCallParams): Promise<LLMResponse> {
  const { apiKey, model, messages, temperature, maxTokens } = params;
  const baseUrl = params.baseUrl ?? LLM_PROVIDERS.anthropic.baseUrl;
  const systemMsg = messages.find(m => m.role === 'system')?.content ?? '';
  const chatMsgs = messages.filter(m => m.role !== 'system');
  const res = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens ?? 4096,
      system: systemMsg || undefined,
      messages: chatMsgs.map(m => ({ role: m.role, content: m.content })),
      temperature: temperature ?? 0.7,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textBlock = data.content?.find((b: any) => b.type === 'text');
  return {
    id: data.id ?? `claude-${Date.now()}`,
    content: textBlock?.text ?? '',
    model: data.model ?? model,
    finishReason: data.stop_reason ?? 'end_turn',
    usage: data.usage ? {
      promptTokens: data.usage.input_tokens ?? 0,
      completionTokens: data.usage.output_tokens ?? 0,
      totalTokens: (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0),
    } : undefined,
  };
}

// ---- Router ----
export async function callLLM(params: ProviderCallParams): Promise<LLMResponse> {
  const { providerId } = params;
  if (!params.apiKey) {
    throw new Error('API key is not configured. Go to Settings → LLM Provider to set it up.');
  }
  switch (providerId) {
    case 'anthropic': return callAnthropic(params);
    case 'openai': case 'openrouter': case 'zai': return callOpenAICompatible(params);
    default: throw new Error(`Unknown provider: ${providerId}`);
  }
}

// ---- Test connection ----
export async function testConnection(
  providerId: LLMProviderId,
  apiKey: string,
): Promise<{ ok: boolean; model: string; latencyMs: number; error?: string }> {
  const provider = LLM_PROVIDERS[providerId];
  const model = provider.models[0]?.id;
  if (!model) return { ok: false, model: '', latencyMs: 0, error: 'No models available' };
  const start = Date.now();
  try {
    const resp = await callLLM({
      providerId, apiKey, model,
      messages: [{ role: 'user', content: 'Hi, respond with just "OK"' }],
      maxTokens: 10,
    });
    return { ok: !!resp.content, model: resp.model, latencyMs: Date.now() - start };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, model, latencyMs: Date.now() - start, error: msg };
  }
}
