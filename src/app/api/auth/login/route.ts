// POST /api/auth/login -- Validate credentials, issue JWT session cookie

import { NextResponse } from 'next/server';
import { signSession, SESSION_COOKIE } from '@/lib/auth';
import { handleError, BadRequest, Unauthorized } from '@/lib/api-error';

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      throw BadRequest('Username and password are required.');
    }

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      throw Unauthorized('Invalid credentials.');
    }

    const token = await signSession({ userId: 'admin', role: 'owner' });

    const res = NextResponse.json({ success: true, user: username });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    return handleError(error);
  }
}
