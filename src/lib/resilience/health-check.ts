/**
 * Health Check Monitoring
 *
 * Proactive health monitoring for external APIs and services.
 * Tracks response times, consecutive failures, and provides
 * automated alerting when services become unhealthy.
 * Ported from p-mas donor for 3A Studio resilience layer.
 */

export interface HealthCheckResult {
  healthy: boolean;
  status?: number;
  error?: string;
  responseTime: number;
  timestamp: string;
}

export interface HealthMonitorConfig {
  checkInterval: number;
  requestTimeout: number;
  failureThreshold: number;
  windowSize: number;
  alertThreshold: number;
}

export const defaultHealthMonitorConfig: HealthMonitorConfig = {
  checkInterval: 30000,
  requestTimeout: 5000,
  failureThreshold: 3,
  windowSize: 10,
  alertThreshold: 5000,
};

/** Perform a basic health check on a URL. */
export async function checkApiHealth(
  url: string,
  timeout: number = 5000
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(timeout),
    });
    return {
      healthy: response.ok, status: response.status,
      responseTime: Date.now() - startTime, timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false, error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime, timestamp: new Date().toISOString(),
    };
  }
}

/** Check multiple endpoints in parallel. */
export async function checkMultipleEndpoints(
  endpoints: Array<{ name: string; url: string }>,
  timeout?: number
): Promise<{
  timestamp: string; overallHealthy: boolean;
  endpoints: Array<HealthCheckResult & { name: string }>;
}> {
  const checks = await Promise.all(
    endpoints.map(async (ep) => {
      const health = await checkApiHealth(ep.url, timeout);
      return { name: ep.name, ...health };
    })
  );
  return {
    timestamp: new Date().toISOString(),
    overallHealthy: checks.every((c) => c.healthy),
    endpoints: checks,
  };
}

/** Track consecutive failures and trigger alerts. */
export class FailureTracker {
  private consecutiveFailures = 0;
  private lastFailureTime: string | null = null;

  constructor(
    private readonly threshold: number = 3,
    private readonly onAlert?: (failures: number, lastTime: string | null) => void
  ) {}

  recordFailure(): void {
    this.consecutiveFailures++;
    this.lastFailureTime = new Date().toISOString();
    if (this.consecutiveFailures >= this.threshold) {
      console.warn(`[health-check] FAILURE_THRESHOLD_EXCEEDED: ${this.consecutiveFailures} failures`);
      this.onAlert?.(this.consecutiveFailures, this.lastFailureTime);
    }
  }

  recordSuccess(): void {
    if (this.consecutiveFailures > 0) {
      console.warn(`[health-check] Recovered from ${this.consecutiveFailures} failures`);
    }
    this.consecutiveFailures = 0;
  }

  getConsecutiveFailures(): number { return this.consecutiveFailures; }
}

/** Monitor response times and alert on degradation. */
export class ResponseTimeMonitor {
  private responseTimes: number[] = [];

  constructor(
    private readonly windowSize: number = 10,
    private readonly alertThreshold: number = 5000,
    private readonly onAlert?: (avgTime: number, threshold: number) => void
  ) {}

  record(responseTime: number): void {
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.windowSize) this.responseTimes.shift();
    const avg = this.getAverage();
    if (avg > this.alertThreshold) {
      console.warn(`[health-check] SLOW_RESPONSE: avg ${avg}ms > threshold ${this.alertThreshold}ms`);
      this.onAlert?.(avg, this.alertThreshold);
    }
  }

  getAverage(): number {
    if (!this.responseTimes.length) return 0;
    return this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }
}
