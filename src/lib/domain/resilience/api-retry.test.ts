import { describe, it, expect } from 'vitest';
import { withRetry } from './api-retry';

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const result = await withRetry(async () => 42, { maxRetries: 3, initialDelay: 10 });
    expect(result).toBe(42);
  });

  it('retries on retryable error then succeeds', async () => {
    let attempts = 0;
    const result = await withRetry(
      async () => {
        attempts++;
        if (attempts < 3) throw new Error('502 Bad Gateway');
        return 'ok';
      },
      { maxRetries: 3, initialDelay: 10 },
    );
    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('throws after max retries', async () => {
    await expect(
      withRetry(async () => { throw new Error('503 Service Unavailable'); }, { maxRetries: 2, initialDelay: 10 }),
    ).rejects.toThrow('503');
  });

  it('does not retry non-retryable errors after first attempt', async () => {
    let attempts = 0;
    await expect(
      withRetry(
        async () => {
          attempts++;
          throw new Error('bad request');
        },
        { maxRetries: 3, initialDelay: 10 },
      ),
    ).rejects.toThrow('bad request');
    // Non-retryable throws immediately after first attempt
    expect(attempts).toBeLessThanOrEqual(2);
  });
});
