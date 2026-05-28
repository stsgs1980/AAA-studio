// POST /api/auth/logout — Clear session cookie

import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
