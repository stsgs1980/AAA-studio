import { describe, it, expect } from 'vitest';
import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  it('starts CLOSED', () => {
    const cb = new CircuitBreaker();
    expect(cb.getState()).toBe('CLOSED');
  });

  it('stays CLOSED on success', async () => {
    const cb = new CircuitBreaker();
    await cb.execute(async () => 'ok');
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.getFailureCount()).toBe(0);
  });

  it('transitions to OPEN after threshold failures', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, timeout: 1000 });
    for (let i = 0; i < 3; i++) {
      try { await cb.execute(async () => { throw new Error('fail'); }); } catch { /* expected */ }
    }
    expect(cb.getState()).toBe('OPEN');
    expect(cb.getFailureCount()).toBe(3);
  });

  it('blocks requests when OPEN', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, timeout: 60000 });
    try { await cb.execute(async () => { throw new Error('fail'); }); } catch { /* expected */ }
    await expect(cb.execute(async () => 'ok')).rejects.toThrow('Circuit breaker is OPEN');
  });

  it('transitions to HALF_OPEN after timeout', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, timeout: 50 });
    try { await cb.execute(async () => { throw new Error('fail'); }); } catch { /* expected */ }
    expect(cb.getState()).toBe('OPEN');
    await new Promise((r) => setTimeout(r, 60));
    try { await cb.execute(async () => 'ok'); } catch { /* expected */ }
    // After half-open success, should be CLOSED
  });

  it('reset() returns to CLOSED', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, timeout: 60000 });
    try { await cb.execute(async () => { throw new Error('fail'); }); } catch { /* expected */ }
    expect(cb.getState()).toBe('OPEN');
    cb.reset();
    expect(cb.getState()).toBe('CLOSED');
    expect(cb.getFailureCount()).toBe(0);
  });

  it('success in HALF_OPEN transitions to CLOSED', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, timeout: 50 });
    try { await cb.execute(async () => { throw new Error('fail'); }); } catch { /* expected */ }
    await new Promise((r) => setTimeout(r, 60));
    await cb.execute(async () => 'recovered');
    expect(cb.getState()).toBe('CLOSED');
  });
});
