// 3A Studio — OpenAI-compatible LLM provider (OpenAI, OpenRouter, custom)

import type { CallParams } from './client';
import type { LLMResponse } from './types';

export async function callOpenAI(p: CallParams): Promise<LLMResponse> {
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
