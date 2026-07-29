import { describe, it, expect } from 'vitest';
import { FailureTracker, ResponseTimeMonitor } from './health-check';

describe('FailureTracker', () => {
  it('tracks consecutive failures', () => {
    const tracker = new FailureTracker(5);
    expect(tracker.getConsecutiveFailures()).toBe(0);
    tracker.recordFailure();
    tracker.recordFailure();
    tracker.recordFailure();
    expect(tracker.getConsecutiveFailures()).toBe(3);
  });

  it('resets on success', () => {
    const tracker = new FailureTracker(3);
    tracker.recordFailure();
    tracker.recordFailure();
    tracker.recordSuccess();
    expect(tracker.getConsecutiveFailures()).toBe(0);
  });

  it('calls onAlert when threshold exceeded', () => {
    const onAlert = vi.fn();
    const tracker = new FailureTracker(3, onAlert);
    tracker.recordFailure();
    tracker.recordFailure();
    tracker.recordFailure();
    expect(onAlert).toHaveBeenCalled();
  });
});

import { vi } from 'vitest';

describe('ResponseTimeMonitor', () => {
  it('tracks average response time', () => {
    const monitor = new ResponseTimeMonitor();
    monitor.record(100);
    monitor.record(200);
    monitor.record(300);
    expect(monitor.getAverage()).toBe(200);
  });

  it('respects window size', () => {
    const monitor = new ResponseTimeMonitor(2);
    monitor.record(100);
    monitor.record(200);
    monitor.record(300);
    expect(monitor.getAverage()).toBe(250);
  });
});
