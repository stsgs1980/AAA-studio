// 3A Studio -- Auth utilities

import { SignJWT, jwtVerify } from 'jose';

function getSecret(): Uint8Array {
  const hex = process.env.AUTH_SECRET;
  if (!hex || hex.length < 32) {
    throw new Error(
      'AUTH_SECRET not configured. Set a 64-char hex string in .env',
    );
  }
  return new TextEncoder().encode(hex);
}

const EXPIRY = '7d';

export interface SessionPayload {
  userId: string;
  role: string;
}

/** Create a signed JWT session token (server-side only) */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

/** Verify JWT via jose (server-side only) */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const p = payload as unknown as SessionPayload;
    if (!p.userId || !p.role) return null;
    return p;
  } catch {
    return null;
  }
}

/** Cookie name used for session */
export const SESSION_COOKIE = '3a-session';

/** Get the AUTH_SECRET as a string (throws if not configured) */
export function getAuthSecret(): string {
  const hex = process.env.AUTH_SECRET;
  if (!hex || hex.length < 32) {
    throw new Error('AUTH_SECRET not configured');
  }
  return hex;
}
