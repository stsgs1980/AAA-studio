// ============================================================================
// POST /api/llm/test — Test LLM connection for a specific provider
// ============================================================================

import { NextResponse } from 'next/server';
import { getProviders, getActiveProvider } from '@/lib/llm';
import { testConnection } from '@/lib/llm/test-connection';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const providers = await getProviders();
    const targetId = body.providerId as string | undefined;

    if (!targetId) {
      const active = await getActiveProvider();
      if (!active) return NextResponse.json({ ok: false, error: 'No active provider configured.' });
      return NextResponse.json(await testConnection(active.provider, active.model));
    }

    const provider = providers.find(p => p.id === targetId);
    if (!provider) return NextResponse.json({ ok: false, error: `Provider "${targetId}" not found.` });
    // Z.ai uses SDK (no API key needed); others require a key
    if (provider.id !== 'zai' && !provider.apiKey) return NextResponse.json({ ok: false, error: 'API key not set for this provider.' });
    if (!provider.baseUrl) return NextResponse.json({ ok: false, error: 'Endpoint URL not set for this provider.' });

    return NextResponse.json(await testConnection(provider, body.model as string | undefined));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg });
  }
}

export { POST as GET };
