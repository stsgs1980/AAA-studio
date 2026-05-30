// 3A Studio -- Anthropic LLM provider (Claude API format)

import type { CallParams } from './client';
import type { LLMResponse } from './types';

export async function callAnthropic(p: CallParams): Promise<LLMResponse> {
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
