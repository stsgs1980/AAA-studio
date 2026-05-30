// 3A Studio -- LLM connection test utility

import { callLLM } from './client';
import type { ProviderConfig } from './types';

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
      maxTokens: 256,
    });
    const ok = !!resp.content || resp.finishReason === 'stop' || resp.finishReason === 'end_turn' || resp.finishReason === 'length';
    return { ok, model: resp.model, latencyMs: Date.now() - start };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, model: useModel, latencyMs: Date.now() - start, error: msg };
  }
}
