// ============================================================================
// POST /api/llm — Unified LLM endpoint
// Reads active provider from DB, proxies the request.
// ============================================================================

import { NextResponse } from 'next/server';
import { callLLM, getActiveProvider } from '@/lib/llm';
import type { LLMMessage } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: LLMMessage[] = body.messages;
    const { temperature, max_tokens } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 });
    }

    const active = await getActiveProvider();
    if (!active) {
      return NextResponse.json(
        { error: 'LLM not configured', message: 'Go to Settings → LLM Provider to add your API key.', configured: false },
        { status: 422 },
      );
    }

    const response = await callLLM({
      provider: active.provider,
      model: body.model || active.model,
      messages,
      temperature: temperature ?? active.settings.temperature,
      maxTokens: max_tokens ?? active.settings.maxTokens,
    });

    return NextResponse.json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/llm]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
