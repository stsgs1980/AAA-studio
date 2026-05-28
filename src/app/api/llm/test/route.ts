// ============================================================================
// POST /api/llm/test — Test LLM connection
// Uses provider + key from DB Settings to verify the API works.
// ============================================================================

import { NextResponse } from 'next/server';
import { getLLMSettings, isLLMConfigured, testConnection } from '@/lib/llm';

async function runTest() {
  try {
    const settings = await getLLMSettings();

    if (!isLLMConfigured(settings)) {
      return NextResponse.json({
        ok: false,
        error: 'LLM not configured. Go to Settings → LLM Provider.',
      });
    }

    const result = await testConnection(settings.providerId, settings.apiKey);

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg });
  }
}

export { runTest as POST, runTest as GET };
