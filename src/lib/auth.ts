// 3A Studio — Auth utilities

import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-change-in-production',
);

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
    .sign(SECRET);
}

/** Verify JWT via jose (server-side only) */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const p = payload as unknown as SessionPayload;
    if (!p.userId || !p.role) return null;
    return p;
  } catch {
    return null;
  }
}

/** Cookie name used for session */
export const SESSION_COOKIE = '3a-session';

/** Get the AUTH_SECRET as a string */
export function getAuthSecret(): string {
  return process.env.AUTH_SECRET || 'dev-secret-change-in-production';
}
