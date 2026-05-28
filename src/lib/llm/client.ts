// 3A Studio — LLM Provider Client. HTTP calls to LLM providers.

import type { LLMMessage, LLMResponse, ProviderConfig } from './types';

interface CallParams {
  provider: ProviderConfig;
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

// ---- OpenAI-compatible providers (Z.ai, OpenAI, OpenRouter, custom) ----
async function callOpenAI(p: CallParams): Promise<LLMResponse> {
  const { provider, model, messages, temperature, maxTokens } = p;
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.apiKey}` },
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
    throw new Error(`${provider.name} API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return {
    id: data.id ?? `call-${Date.now()}`,
    content: data.choices?.[0]?.message?.content ?? null,
    model: data.model ?? model,
    finishReason: data.choices?.[0]?.finish_reason ?? 'stop',
    usage: data.usage ? {
      promptTokens: data.usage.prompt_tokens ?? 0,
      completionTokens: data.usage.completion_tokens ?? 0,
      totalTokens: data.usage.total_tokens ?? 0,
    } : undefined,
  };
}

// ---- Anthropic format ----
async function callAnthropic(p: CallParams): Promise<LLMResponse> {
  const { provider, model, messages, temperature, maxTokens } = p;
  const systemMsg = messages.find(m => m.role === 'system')?.content ?? '';
  const chatMsgs = messages.filter(m => m.role !== 'system');
  const res = await fetch(`${provider.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model, max_tokens: maxTokens ?? 4096,
      system: systemMsg || undefined,
      messages: chatMsgs.map(m => ({ role: m.role, content: m.content })),
      temperature: temperature ?? 0.7,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${provider.name} API ${res.status}: ${body.slice(0, 200)}`);
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
export async function callLLM(params: CallParams): Promise<LLMResponse> {
  const { provider } = params;
  if (!provider.apiKey) {
    throw new Error('API key is not configured. Go to Settings → LLM Provider to set it up.');
  }
  switch (provider.format) {
    case 'anthropic': return callAnthropic(params);
    case 'openai': return callOpenAI(params);
    default: return callOpenAI(params);
  }
}

// ---- Test connection ----
export async function testConnection(
  provider: ProviderConfig,
  model?: string,
): Promise<{ ok: boolean; model: string; latencyMs: number; error?: string }> {
  const useModel = model || provider.models[0]?.id;
  if (!useModel) return { ok: false, model: '', latencyMs: 0, error: 'No model selected' };
  const start = Date.now();
  try {
    const resp = await callLLM({
      provider, model: useModel,
      messages: [{ role: 'user', content: 'Hi, respond with just "OK"' }],
      maxTokens: 10,
    });
    // If the API returned successfully (no throw), connection is good even if content is empty
    const ok = resp.finishReason === 'stop' || resp.finishReason === 'end_turn' || !!resp.content;
    return { ok, model: resp.model, latencyMs: Date.now() - start };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, model: useModel, latencyMs: Date.now() - start, error: msg };
  }
}
