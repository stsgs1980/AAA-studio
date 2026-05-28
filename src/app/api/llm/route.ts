// ============================================================================
// POST /api/llm — Unified LLM endpoint
// Reads provider config from DB Settings, calls the selected provider.
// ============================================================================

import { NextResponse } from 'next/server';
import { callLLM, getLLMSettings, isLLMConfigured } from '@/lib/llm';
import type { LLMMessage } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: LLMMessage[] = body.messages;
    const { temperature, max_tokens, model } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 });
    }

    const settings = await getLLMSettings();

    if (!isLLMConfigured(settings)) {
      return NextResponse.json(
        {
          error: 'LLM not configured',
          message: 'Go to Settings → LLM Provider to add your API key.',
          configured: false,
        },
        { status: 422 },
      );
    }

    const response = await callLLM({
      providerId: settings.providerId,
      apiKey: settings.apiKey,
      model: model || settings.model,
      messages,
      temperature: temperature ?? settings.temperature,
      maxTokens: max_tokens ?? settings.maxTokens,
    });

    return NextResponse.json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/llm]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
