/**
 * 3A Studio -- Resilience Layer
 *
 * Unified exports for the API resilience toolkit.
 * Provides retry logic, circuit breaker, health checking, and fallback management.
 *
 * Usage:
 *   import { fetchWithRetry, withRetry, CircuitBreaker, checkApiHealth, FallbackManager } from '@/lib/resilience';
 */

export { fetchWithRetry, withRetry, defaultRetryConfig } from "./api-retry";
export type { RetryConfig } from "./api-retry";

export { CircuitBreaker, defaultCircuitBreakerConfig } from "./circuit-breaker";
export type { CircuitState, CircuitBreakerConfig } from "./circuit-breaker";

export {
  checkApiHealth,
  checkMultipleEndpoints,
  FailureTracker,
  ResponseTimeMonitor,
  defaultHealthMonitorConfig,
} from "./health-check";
export type { HealthCheckResult, HealthMonitorConfig } from "./health-check";

export { FallbackManager } from "./fallback-manager";
export type { FallbackResult } from "./fallback-manager";
