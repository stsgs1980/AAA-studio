import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const settings = await db.settings.findMany({ orderBy: { key: 'asc' } });
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    return NextResponse.json(map);
  } catch (error) {
    console.error('[GET /api/settings]', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const entries = Object.entries(body) as [string, string][];
    await Promise.all(entries.map(([key, value]) =>
      db.$executeRaw`
        INSERT INTO "Settings" (id, key, value)
        VALUES (${`cfg-${key}`}, ${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = ${value}, "updatedAt" = NOW()
      `
    ));
    return NextResponse.json({ success: true, updated: entries.length });
  } catch (error) {
    console.error('[PUT /api/settings]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
