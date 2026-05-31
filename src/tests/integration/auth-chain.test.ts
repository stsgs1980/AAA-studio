// Integration test: Auth chain — JWT sign → verify → middleware verifyJWT parity
// Tests the full auth lifecycle: signSession → verifySession (jose) → middleware verifyJWT (Web Crypto)
// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Auth chain integration', () => {
  const ORIGINAL_SECRET = process.env.AUTH_SECRET;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.AUTH_SECRET = ORIGINAL_SECRET;
  });

  it('signSession → verifySession round-trip returns original payload', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    const { signSession, verifySession } = await import('@/lib/auth');

    const payload = { userId: 'admin', role: 'owner' };
    const token = await signSession(payload);
    const decoded = await verifySession(token);

    expect(decoded).not.toBeNull();
    expect(decoded!.userId).toBe('admin');
    expect(decoded!.role).toBe('owner');
  });

  it('signSession → verifySession with different role', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    const { signSession, verifySession } = await import('@/lib/auth');

    const payload = { userId: 'user-123', role: 'admin' };
    const token = await signSession(payload);
    const decoded = await verifySession(token);

    expect(decoded).not.toBeNull();
    expect(decoded!.userId).toBe('user-123');
    expect(decoded!.role).toBe('admin');
  });

  it('token signed with one secret is rejected by verifySession with different secret', async () => {
    // Sign with secret A
    process.env.AUTH_SECRET = 'secret-alpha';
    const { signSession } = await import('@/lib/auth');
    const token = await signSession({ userId: 'user', role: 'owner' });

    // Verify with secret B (reset modules to reinitialize)
    vi.resetModules();
    process.env.AUTH_SECRET = 'secret-beta';
    const { verifySession } = await import('@/lib/auth');
    const decoded = await verifySession(token);

    expect(decoded).toBeNull();
  });

  it('middleware verifyJWT accepts token created by signSession (jose/Web Crypto parity)', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    const { signSession } = await import('@/lib/auth');

    const token = await signSession({ userId: 'admin', role: 'owner' });

    // Replicate middleware's verifyJWT logic (Web Crypto API)
    const parts = token.split('.');
    expect(parts.length).toBe(3);

    const secret = 'test-integration-secret-key';
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
    const valid = await crypto.subtle.verify('HMAC', key, sig, data);

    expect(valid).toBe(true);

    // Verify payload content
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    expect(payload.userId).toBe('admin');
    expect(payload.role).toBe('owner');
  });

  it('tampered token is rejected by both verifySession and middleware verifyJWT', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    const { signSession, verifySession } = await import('@/lib/auth');

    const token = await signSession({ userId: 'admin', role: 'owner' });
    const parts = token.split('.');

    // Tamper with the payload (change role from 'owner' to 'superadmin')
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    payload.role = 'superadmin';
    const tamperedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    // verifySession should reject
    expect(await verifySession(tamperedToken)).toBeNull();

    // Middleware verifyJWT should also reject
    const secret = 'test-integration-secret-key';
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
    const data = new TextEncoder().encode(`${parts[0]}.${tamperedPayload}`);
    const valid = await crypto.subtle.verify('HMAC', key, sig, data);

    expect(valid).toBe(false);
  });

  it('login route handler returns JWT cookie on valid credentials', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'testpass123';

    const { POST } = await import('@/app/api/auth/login/route');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'testpass123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user).toBe('admin');

    // Verify cookie is set
    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain('3a-session=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Path=/');

    // Extract token from cookie and verify it
    const tokenMatch = setCookie?.match(/3a-session=([^;]+)/);
    expect(tokenMatch).not.toBeNull();

    const { verifySession } = await import('@/lib/auth');
    const decoded = await verifySession(tokenMatch![1]);
    expect(decoded).not.toBeNull();
    expect(decoded!.userId).toBe('admin');
    expect(decoded!.role).toBe('owner');
  });

  it('login route handler rejects invalid credentials', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'testpass123';

    const { POST } = await import('@/app/api/auth/login/route');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrong' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const body = await response.json();
    expect(body.error).toContain('Invalid');
  });

  it('login route handler rejects missing fields', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    const { POST } = await import('@/app/api/auth/login/route');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
