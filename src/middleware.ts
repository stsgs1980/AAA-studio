// 3A Studio — Auth middleware (Edge Runtime, no jose dependency)
// Verifies JWT signature via Web Crypto API directly.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = '3a-session';

const PUBLIC_PATHS = [
  '/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify',
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.some(p => pathname === p)) return true;
  if (pathname.startsWith('/api/auth/')) return true;
  if (pathname === '/api/health') return true;
  return false;
}

/** Verify HS256 JWT using Web Crypto API (Edge-compatible) */
async function verifyJWT(
  token: string,
): Promise<{ userId: string; role: string; exp?: number } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const secret = process.env.AUTH_SECRET || 'dev-secret-change-in-production';
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    // Base64url → raw bytes
    const toBytes = (b64: string) =>
      Uint8Array.from(atob(b64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

    const sig = toBytes(parts[2]);
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const valid = await crypto.subtle.verify('HMAC', key, sig, data);
    if (!valid) return null;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    if (!payload.userId || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets & Next.js internals — always allow
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (isPublic(pathname)) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifyJWT(token);
  if (!session) {
    return pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Session expired' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
