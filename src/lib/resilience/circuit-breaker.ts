/**
 * Circuit Breaker Pattern
 *
 * Prevents cascading failures by stopping requests to a service
 * that has repeatedly failed. After a timeout period, allows
 * a "half-open" probe request to test if the service has recovered.
 *
 * States: CLOSED (normal) -> OPEN (blocking) -> HALF_OPEN (probing) -> CLOSED
 * Ported from p-mas donor for 3A Studio resilience layer.
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
}

export const defaultCircuitBreakerConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  timeout: 60000, // 60 seconds
};

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private state: CircuitState = "CLOSED";

  constructor(
    private readonly config: CircuitBreakerConfig = defaultCircuitBreakerConfig
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.lastFailureTime && Date.now() - this.lastFailureTime < this.config.timeout) {
        throw new Error("Circuit breaker is OPEN - service unavailable");
      }
      this.state = "HALF_OPEN";
      console.warn("[circuit-breaker] Transitioning to HALF_OPEN");
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = "CLOSED";
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state !== "CLOSED") {
      console.warn("[circuit-breaker] Transitioning to CLOSED (recovered)");
    }
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = "OPEN";
      console.warn(
        `[circuit-breaker] OPEN after ${this.failureCount} consecutive failures`
      );
    }
  }
}
