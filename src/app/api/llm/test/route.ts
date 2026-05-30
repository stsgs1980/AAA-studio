// ============================================================================
// POST /api/llm/test -- Test LLM connection for a specific provider
// ============================================================================

import { handleError, success, BadRequest } from '@/lib/api-error';
import { getProviders, getActiveProvider } from '@/lib/llm';
import { testConnection } from '@/lib/llm/test-connection';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const providers = await getProviders();
    const targetId = body.providerId as string | undefined;

    if (!targetId) {
      const active = await getActiveProvider();
      if (!active) throw BadRequest('No active provider configured.');
      return success(await testConnection(active.provider, active.model));
    }

    const provider = providers.find(p => p.id === targetId);
    if (!provider) throw BadRequest(`Provider "${targetId}" not found.`);
    // Z.ai uses SDK (no API key needed); others require a key
    if (provider.id !== 'zai' && !provider.apiKey) throw BadRequest('API key not set for this provider.');
    if (!provider.baseUrl) throw BadRequest('Endpoint URL not set for this provider.');

    return success(await testConnection(provider, body.model as string | undefined));
  } catch (error) {
    return handleError(error);
  }
}

export { POST as GET };
