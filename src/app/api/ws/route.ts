// ============================================================================
// WebSocket upgrade endpoint — informs client about WS availability
// ============================================================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** GET /api/ws — health check: is WS server running? */
export async function GET() {
  // Socket.IO handles /api/ws path via its own HTTP upgrade
  // This route exists as a fallback status check
  return NextResponse.json({
    available: false,
    transport: 'polling-fallback',
    message: 'WebSocket not available (Vercel deployment). Using SSE/polling fallback.',
  });
}
