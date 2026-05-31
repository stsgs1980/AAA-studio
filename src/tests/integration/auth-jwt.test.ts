// Integration test: JWT sign → verify round-trip + middleware parity
// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyWithWebCrypto, decodeJWTPayload, tamperPayload } from './auth-helpers';

describe('JWT sign/verify integration', () => {
  const ORIGINAL_SECRET = process.env.AUTH_SECRET;

  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { process.env.AUTH_SECRET = ORIGINAL_SECRET; });

  it('signSession → verifySession round-trip', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    const { signSession, verifySession } = await import('@/lib/auth');

    const token = await signSession({ userId: 'admin', role: 'owner' });
    const decoded = await verifySession(token);

    expect(decoded).not.toBeNull();
    expect(decoded!.userId).toBe('admin');
    expect(decoded!.role).toBe('owner');
  });

  it('token with different secret is rejected', async () => {
    process.env.AUTH_SECRET = 'secret-alpha';
    const { signSession } = await import('@/lib/auth');
    const token = await signSession({ userId: 'user', role: 'owner' });

    vi.resetModules();
    process.env.AUTH_SECRET = 'secret-beta';
    const { verifySession } = await import('@/lib/auth');

    expect(await verifySession(token)).toBeNull();
  });

  it('jose/Web Crypto parity — middleware accepts jose-signed token', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    const { signSession } = await import('@/lib/auth');
    const token = await signSession({ userId: 'admin', role: 'owner' });

    expect(await verifyWithWebCrypto(token, 'test-integration-secret-key')).toBe(true);
    const payload = decodeJWTPayload(token);
    expect(payload.userId).toBe('admin');
  });

  it('tampered token rejected by both jose and Web Crypto', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    const { signSession, verifySession } = await import('@/lib/auth');
    const token = await signSession({ userId: 'admin', role: 'owner' });

    const tampered = tamperPayload(token, p => { p.role = 'superadmin'; });
    expect(await verifySession(tampered)).toBeNull();
    expect(await verifyWithWebCrypto(tampered, 'test-integration-secret-key')).toBe(false);
  });
});
