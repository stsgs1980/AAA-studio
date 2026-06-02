// Shared test helpers for auth integration tests
// @vitest-environment node

/** Verify a JWT token using Web Crypto API (mirrors middleware verifyJWT) */
export async function verifyWithWebCrypto(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const toBytes = (b64: string) =>
    Uint8Array.from(atob(b64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

  const sig = toBytes(parts[2]);
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  return crypto.subtle.verify('HMAC', key, sig, data);
}

/** Decode JWT payload without verification (for test assertions only) */
export function decodeJWTPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
}

/** Tamper with JWT payload, return modified token */
export function tamperPayload(token: string, modifier: (payload: Record<string, unknown>) => void): string {
  const parts = token.split('.');
  const payload = decodeJWTPayload(token);
  modifier(payload);
  const tamperedPayload = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${parts[0]}.${tamperedPayload}.${parts[2]}`;
}
