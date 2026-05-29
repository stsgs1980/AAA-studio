// POST /api/auth/login — Validate credentials, issue JWT session cookie

import { NextResponse } from 'next/server';
import { signSession, SESSION_COOKIE } from '@/lib/auth';

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 },
      );
    }

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 },
      );
    }

    const token = await signSession({ userId: 'admin', role: 'owner' });

    const res = NextResponse.json({ success: true, user: username });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}
