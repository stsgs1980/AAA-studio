type EventCallback = (data: unknown) => void;

interface Subscription {
  callback: EventCallback;
  once: boolean;
}

/**
 * Simple pub/sub event bus for flow node execution.
 * Lightweight alternative to Redux middleware for cross-component events.
 */
export class EventBus {
  private events = new Map<string, Subscription[]>();

  /** Subscribe to an event. Returns an unsubscribe function. */
  subscribe(event: string, callback: EventCallback): () => void {
    const subs = this.events.get(event) ?? [];
    subs.push({ callback, once: false });
    this.events.set(event, subs);
    return () => this.off(event, callback);
  }

  /** Subscribe to an event, auto-unsubscribe after first emission. */
  once(event: string, callback: EventCallback): () => void {
    const subs = this.events.get(event) ?? [];
    subs.push({ callback, once: true });
    this.events.set(event, subs);
    return () => this.off(event, callback);
  }

  /** Emit an event with optional data payload. */
  emit(event: string, data?: unknown): void {
    const subs = this.events.get(event);
    if (!subs) return;
    const toRemove: Subscription[] = [];
    for (const sub of subs) {
      sub.callback(data);
      if (sub.once) toRemove.push(sub);
    }
    if (toRemove.length > 0) {
      const remaining = subs.filter((s) => !toRemove.includes(s));
      if (remaining.length > 0) {
        this.events.set(event, remaining);
      } else {
        this.events.delete(event);
      }
    }
  }

  /** Unsubscribe a specific callback from an event. */
  off(event: string, callback: EventCallback): void {
    const subs = this.events.get(event);
    if (!subs) return;
    this.events.set(event, subs.filter((s) => s.callback !== callback));
  }

  /** Remove all subscriptions. */
  clear(): void {
    this.events.clear();
  }
}

/** Global event bus singleton for flow execution events. */
export const flowEventBus = new EventBus();

/** Predefined event names used throughout the flow editor. */
export const FlowEvents = {
  NODE_EXECUTION_START: 'node:execution:start',
  NODE_EXECUTION_COMPLETE: 'node:execution:complete',
  NODE_EXECUTION_ERROR: 'node:execution:error',
  FLOW_EXECUTION_START: 'flow:execution:start',
  FLOW_EXECUTION_COMPLETE: 'flow:execution:complete',
  FLOW_EXECUTION_ERROR: 'flow:execution:error',
  NODE_SELECTED: 'node:selected',
  NODE_DESELECTED: 'node:deselected',
  FLOW_SAVED: 'flow:saved',
  FLOW_LOADED: 'flow:loaded',
} as const;
