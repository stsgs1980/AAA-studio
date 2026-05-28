// ============================================================================
// POST /api/llm/test — Test LLM connection for a specific provider
// Reads providers from DB, tests the requested one.
// ============================================================================

import { NextResponse } from 'next/server';
import { getProviders, getActiveProvider } from '@/lib/llm';
import { testConnection } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const providers = await getProviders();

    // If providerId specified in body, test that specific provider
    let targetId = body.providerId as string | undefined;

    // Otherwise test the active one
    if (!targetId) {
      const active = await getActiveProvider();
      if (!active) {
        return NextResponse.json({ ok: false, error: 'No active provider configured.' });
      }
      return NextResponse.json(
        await testConnection(active.provider, active.model),
      );
    }

    // Find provider by id
    const provider = providers.find(p => p.id === targetId);
    if (!provider) {
      return NextResponse.json({ ok: false, error: `Provider "${targetId}" not found.` });
    }
    if (!provider.apiKey) {
      return NextResponse.json({ ok: false, error: 'API key not set for this provider.' });
    }
    if (!provider.baseUrl) {
      return NextResponse.json({ ok: false, error: 'Endpoint URL not set for this provider.' });
    }

    const model = body.model as string | undefined;
    return NextResponse.json(await testConnection(provider, model));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg });
  }
}

export { POST as GET };
