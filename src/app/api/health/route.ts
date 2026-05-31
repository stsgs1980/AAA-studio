// ============================================================================
// GET /api/health -- System health check
// Returns provider health, circuit breaker states, and system metrics.
// ============================================================================

import { handleError, success } from '@/lib/api-error';
import { getProviders, getActiveProvider } from '@/lib/llm';
import { checkApiHealth } from '@/lib/resilience/health-check';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [providers, active] = await Promise.all([
      getProviders(),
      getActiveProvider(),
    ]);

    // Check health of enabled providers that have a baseUrl
    const providerChecks = await Promise.all(
      providers
        .filter(p => p.enabled && p.baseUrl)
        .map(async (p) => {
          try {
            const health = await checkApiHealth(p.baseUrl, 5000);
            return {
              id: p.id,
              name: p.name,
              enabled: p.enabled,
              healthy: health.healthy,
              responseTime: health.responseTime,
              status: health.status,
              error: health.error,
            };
          } catch {
            return {
              id: p.id, name: p.name, enabled: p.enabled,
              healthy: false, responseTime: -1, status: null, error: 'Health check failed',
            };
          }
        })
    );

    // Database connectivity check
    let dbHealthy = true;
    try {
      await db.$queryRaw`SELECT 1`;
    } catch {
      dbHealthy = false;
    }

    return success({
      status: dbHealthy && providerChecks.every(p => p.healthy) ? 'healthy' : 'degraded',
      activeProvider: active ? { id: active.provider.id, name: active.provider.name, model: active.model } : null,
      providers: providerChecks,
      database: { healthy: dbHealthy },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleError(error);
  }
}
