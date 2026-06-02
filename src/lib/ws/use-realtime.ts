'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io as socketIo, type Socket } from 'socket.io-client';
import type { WsChannel } from './events';

interface UseRealtimeOptions {
  /** Channels to subscribe to */
  channels: WsChannel[];
  /** Auto-connect (default: true) */
  enabled?: boolean;
  /** Fallback polling interval in ms when WS unavailable (0 = no fallback) */
  fallbackInterval?: number;
  /** Fallback fetch function */
  fallbackFetch?: () => Promise<void>;
}

interface UseRealtimeReturn {
  connected: boolean;
  reconnect: () => void;
}

/**
 * Real-time hook: connects to Socket.IO server, subscribes to channels.
 * Falls back to polling when WS is unavailable (e.g. Vercel deployment).
 */
export function useRealtime({
  channels,
  enabled = true,
  fallbackInterval = 0,
  fallbackFetch,
}: UseRealtimeOptions): UseRealtimeReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const socket = socketIo({
      path: '/api/ws',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 3000,
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('subscribe', channels);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.emit('unsubscribe', channels);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, channels.join(',')]);

  // Fallback polling when WS is not connected
  useEffect(() => {
    if (!enabled || connected || !fallbackInterval || !fallbackFetch) return;
    const id = setInterval(fallbackFetch, fallbackInterval);
    return () => clearInterval(id);
  }, [enabled, connected, fallbackInterval, fallbackFetch]);

  const reconnect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  return { connected, reconnect };
}

/** Subscribe to a specific event on a channel */
export function useRealtimeEvent<T>(
  channels: WsChannel[],
  eventName: string,
  handler: (data: T) => void,
  enabled = true,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const socket = socketIo({
      path: '/api/ws',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 3000,
    });

    socket.on('connect', () => {
      socket.emit('subscribe', channels);
    });

    socket.on(eventName, (payload: { data: T }) => {
      handler(payload.data);
    });

    socketRef.current = socket;

    return () => {
      socket.emit('unsubscribe', channels);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, channels.join(','), eventName]);
}
