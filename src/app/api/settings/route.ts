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
    for (const [key, value] of entries) {
      try {
        await db.$executeRawUnsafe(
          `INSERT INTO "Settings" (id, key, value)
           VALUES ($1, $2, $3)
           ON CONFLICT (key) DO UPDATE SET value = $3, "updatedAt" = NOW()`,
          `cfg-${key}`, key, value,
        );
      } catch (e) {
        console.error(`[PUT /api/settings] Failed for key=${key}:`, e);
        return NextResponse.json({ error: `Failed to save key "${key}"` }, { status: 500 });
      }
    }
    return NextResponse.json({ success: true, updated: entries.length });
  } catch (error) {
    console.error('[PUT /api/settings]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
