/**
 * API Retry with Exponential Backoff
 *
 * Provides robust retry logic for HTTP requests to external APIs.
 * Implements exponential backoff with configurable delays and retry limits.
 * Ported from p-mas donor for 3A Studio resilience layer.
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

const RETRYABLE_STATUSES = [408, 429, 500, 502, 503, 504];

function isRetryable(status: number): boolean {
  return RETRYABLE_STATUSES.includes(status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry and exponential backoff.
 * Retries on network errors and retryable HTTP status codes (408, 429, 500, 502, 503, 504).
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config: Partial<RetryConfig> = {}
): Promise<Response> {
  const cfg = { ...defaultRetryConfig, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal ?? AbortSignal.timeout(10000),
      });

      if (response.ok) {
        return response;
      }

      if (!isRetryable(response.status)) {
        throw new Error(`Non-retryable status: ${response.status}`);
      }

      const delay = Math.min(
        cfg.initialDelay * Math.pow(cfg.backoffMultiplier, attempt),
        cfg.maxDelay
      );

      console.warn(
        `[api-retry] Attempt ${attempt + 1}/${cfg.maxRetries + 1} failed with status ${response.status}. Retrying in ${delay}ms...`
      );
      await sleep(delay);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === cfg.maxRetries) {
        throw lastError;
      }

      const delay = Math.min(
        cfg.initialDelay * Math.pow(cfg.backoffMultiplier, attempt),
        cfg.maxDelay
      );

      console.warn(
        `[api-retry] Network error on attempt ${attempt + 1}/${cfg.maxRetries + 1}. Retrying in ${delay}ms...`
      );
      await sleep(delay);
    }
  }

  throw lastError ?? new Error("All retry attempts failed");
}

/**
 * Generic retry wrapper for any async function.
 * Uses the same exponential backoff strategy as fetchWithRetry.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const cfg = { ...defaultRetryConfig, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable (5xx-like errors from LLM providers)
      const msg = lastError.message;
      const isRetryableError =
        msg.includes('502') ||
        msg.includes('503') ||
        msg.includes('504') ||
        msg.includes('429') ||
        msg.includes('rate limit') ||
        msg.includes('timeout') ||
        msg.includes('ECONNRESET') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('network');

      if (!isRetryableError && attempt > 0) {
        throw lastError;
      }

      if (attempt === cfg.maxRetries) {
        throw lastError;
      }

      const delay = Math.min(
        cfg.initialDelay * Math.pow(cfg.backoffMultiplier, attempt),
        cfg.maxDelay
      );

      console.warn(
        `[api-retry] Attempt ${attempt + 1}/${cfg.maxRetries + 1} failed: ${msg}. Retrying in ${delay}ms...`
      );
      await sleep(delay);
    }
  }

  throw lastError ?? new Error("All retry attempts failed");
}
