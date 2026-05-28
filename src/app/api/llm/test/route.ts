// ============================================================================
// GET /api/llm/test — Diagnostic: returns raw Z.ai response
// ============================================================================

import { NextResponse } from 'next/server';
import { getProviders } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const providers = await getProviders();
    const provider = providers.find(p => p.id === (body.providerId ?? 'zai'));
    if (!provider) return NextResponse.json({ error: 'Provider not found' });
    if (!provider.apiKey) return NextResponse.json({ error: 'No API key' });

    const model = body.model || provider.models[0]?.id || 'glm-4.7';
    const start = Date.now();

    // Direct fetch to see raw response
    const res = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${provider.apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Hi, respond with just "OK"' }],
        max_tokens: 10, stream: false,
      }),
    });

    const latency = Date.now() - start;
    const rawBody = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(rawBody); } catch { /* */ }

    const content = parsed?.choices?.[0]?.message?.content;
    const finishReason = parsed?.choices?.[0]?.finish_reason;

    return NextResponse.json({
      status: res.status,
      latency,
      content,
      finishReason,
      ok: finishReason === 'stop' || !!content,
      rawKeys: parsed ? Object.keys(parsed) : [],
      choicesKeys: parsed?.choices?.[0] ? Object.keys(parsed.choices[0]) : [],
      messageKeys: parsed?.choices?.[0]?.message ? Object.keys(parsed.choices[0].message) : [],
      rawBody: rawBody.slice(0, 500),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg });
  }
}

export { POST as GET };
