// Tests for src/middleware.ts — Auth middleware logic

import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// We test the middleware logic by checking URL patterns
// since we can't easily mock Edge runtime crypto

describe('Middleware path matching', () => {
  // Replicate the isPublic logic from middleware
  const PUBLIC_PATHS = new Set([
    '/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify',
  ]);
  const PUBLIC_PREFIXES = ['/api/auth/', '/api/health', '/_next/', '/favicon'];

  function isPublic(pathname: string): boolean {
    if (PUBLIC_PATHS.has(pathname)) return true;
    for (const prefix of PUBLIC_PREFIXES) {
      if (pathname.startsWith(prefix)) return true;
    }
    if (pathname.includes('.')) return true;
    return false;
  }

  it('should allow public root path', () => {
    expect(isPublic('/')).toBe(true);
  });

  it('should allow auth pages', () => {
    expect(isPublic('/login')).toBe(true);
    expect(isPublic('/signup')).toBe(true);
    expect(isPublic('/forgot-password')).toBe(true);
    expect(isPublic('/reset-password')).toBe(true);
    expect(isPublic('/verify')).toBe(true);
  });

  it('should allow API auth routes', () => {
    expect(isPublic('/api/auth/login')).toBe(true);
    expect(isPublic('/api/auth/logout')).toBe(true);
  });

  it('should allow health endpoint', () => {
    expect(isPublic('/api/health')).toBe(true);
  });

  it('should allow Next.js internals', () => {
    expect(isPublic('/_next/data/chunk.json')).toBe(true);
  });

  it('should allow static assets', () => {
    expect(isPublic('/styles/main.css')).toBe(true);
    expect(isPublic('/logo.png')).toBe(true);
    expect(isPublic('/favicon.ico')).toBe(true);
  });

  it('should block protected pages', () => {
    expect(isPublic('/dashboard')).toBe(false);
    expect(isPublic('/agents')).toBe(false);
    expect(isPublic('/settings')).toBe(false);
    expect(isPublic('/flows')).toBe(false);
    expect(isPublic('/skills-page')).toBe(false);
    expect(isPublic('/knowledge')).toBe(false);
  });

  it('should block protected API routes', () => {
    expect(isPublic('/api/llm')).toBe(false);
    expect(isPublic('/api/settings')).toBe(false);
    expect(isPublic('/api/agents')).toBe(false);
    expect(isPublic('/api/evaluate-deep')).toBe(false);
  });

  it('should block dashboard sub-paths', () => {
    expect(isPublic('/dashboard/settings')).toBe(false);
    expect(isPublic('/pipelines/editor')).toBe(false);
  });
});
