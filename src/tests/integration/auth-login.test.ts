// Integration test: Login route handler — JWT cookie, credentials validation
// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Login route handler', () => {
  const ORIGINAL_SECRET = process.env.AUTH_SECRET;

  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { process.env.AUTH_SECRET = ORIGINAL_SECRET; });

  it('returns JWT cookie on valid credentials', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'testpass123';

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'testpass123' }),
    }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user).toBe('admin');

    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain('3a-session=');
    expect(setCookie).toContain('HttpOnly');

    // Verify the issued token
    const tokenMatch = setCookie?.match(/3a-session=([^;]+)/);
    const { verifySession } = await import('@/lib/auth');
    const decoded = await verifySession(tokenMatch![1]);
    expect(decoded!.userId).toBe('admin');
    expect(decoded!.role).toBe('owner');
  });

  it('rejects invalid credentials with 401', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'testpass123';

    const { POST } = await import('@/app/api/auth/login/route');
    const response = await POST(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrong' }),
    }));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid');
  });

  it('rejects missing fields with 400', async () => {
    process.env.AUTH_SECRET = 'test-integration-secret-key';
    const { POST } = await import('@/app/api/auth/login/route');

    const response = await POST(new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin' }),
    }));

    expect(response.status).toBe(400);
  });
});
