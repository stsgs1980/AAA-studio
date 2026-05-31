// ============================================================================
// Socket.IO server — attaches to Next.js HTTP server in dev / self-hosted
// ============================================================================

import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { WsChannel, WsEvents, WsEventPayload } from './events';

let io: SocketIOServer | null = null;

/** Initialize Socket.IO server (call once from custom server or instrumentation) */
export function initWsServer(httpServer: HttpServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/api/ws',
  });

  io.on('connection', (socket) => {
    // Join channel rooms
    socket.on('subscribe', (channels: WsChannel[]) => {
      channels.forEach((ch) => socket.join(ch));
    });

    socket.on('unsubscribe', (channels: WsChannel[]) => {
      channels.forEach((ch) => socket.leave(ch));
    });

    socket.on('disconnect', () => { /* room cleanup automatic */ });
  });

  return io;
}

/** Get the Socket.IO server instance (null if not initialized) */
export function getWsServer(): SocketIOServer | null {
  return io;
}

/** Type-safe broadcast to a channel */
export function broadcast<C extends WsChannel, E extends keyof WsEvents[C]>(
  channel: C,
  event: E,
  data: WsEvents[C][E],
): void {
  const payload: WsEventPayload<C, E> = { channel, event, data };
  io?.to(channel).emit(event as string, payload);
}
