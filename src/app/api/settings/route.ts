import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { encrypt, decrypt } from '@/lib/crypto';

const PROVIDERS_KEY = 'llm_providers';

/** Decrypt apiKeys inside llm_providers JSON for frontend consumption */
function decryptProviders(value: string): string {
  try {
    const providers = JSON.parse(value);
    if (!Array.isArray(providers)) return value;
    const decrypted = providers.map((p: { apiKey?: string; [k: string]: unknown }) => ({
      ...p,
      apiKey: p.apiKey ? decrypt(p.apiKey) : '',
    }));
    return JSON.stringify(decrypted);
  } catch {
    return value;
  }
}

/** Encrypt apiKeys inside llm_providers JSON before DB storage */
function encryptProviders(value: string): string {
  try {
    const providers = JSON.parse(value);
    if (!Array.isArray(providers)) return value;
    const encrypted = providers.map((p: { apiKey?: string; [k: string]: unknown }) => ({
      ...p,
      apiKey: p.apiKey ? encrypt(p.apiKey) : '',
    }));
    return JSON.stringify(encrypted);
  } catch {
    return value;
  }
}

export async function GET() {
  try {
    const settings = await db.settings.findMany({ orderBy: { key: 'asc' } });
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.key === PROVIDERS_KEY && s.value
        ? decryptProviders(s.value)
        : s.value;
    });
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
      const dbValue = key === PROVIDERS_KEY ? encryptProviders(value) : value;
      try {
        await db.$executeRawUnsafe(
          `INSERT INTO "Settings" (id, key, value, "updatedAt")
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (key) DO UPDATE SET value = $3, "updatedAt" = NOW()`,
          `cfg-${key}`, key, dbValue,
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
