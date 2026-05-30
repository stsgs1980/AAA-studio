// Tests for src/lib/auth.ts — JWT session management
// Note: jose uses Web Crypto API which requires node environment, not jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('auth module', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should use dev secret as fallback when AUTH_SECRET is not set', async () => {
    const originalSecret = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;
    const { getAuthSecret } = await import('@/lib/auth');
    expect(getAuthSecret()).toBe('dev-secret-change-in-production');
    process.env.AUTH_SECRET = originalSecret;
  });

  it('should use AUTH_SECRET when set', async () => {
    process.env.AUTH_SECRET = 'my-custom-secret';
    const { getAuthSecret } = await import('@/lib/auth');
    expect(getAuthSecret()).toBe('my-custom-secret');
    process.env.AUTH_SECRET = undefined as unknown as string;
  });

  it('should have SESSION_COOKIE set to 3a-session', async () => {
    const { SESSION_COOKIE } = await import('@/lib/auth');
    expect(SESSION_COOKIE).toBe('3a-session');
  });

  it('should return null for invalid token format', async () => {
    const { verifySession } = await import('@/lib/auth');
    expect(await verifySession('')).toBeNull();
    expect(await verifySession('not.enough')).toBeNull();
    expect(await verifySession('a.b.c')).toBeNull(); // valid format but invalid sig
  });

  it('should return null for malformed JWT parts', async () => {
    const { verifySession } = await import('@/lib/auth');
    // Too many parts
    expect(await verifySession('a.b.c.d')).toBeNull();
    // Non-base64 characters
    expect(await verifySession('!!!.!!!.!!!')).toBeNull();
  });
});
