import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { encrypt, decrypt } from '@/lib/crypto';

const PROVIDERS_KEY = 'llm_providers';

/** Mask API key for frontend: show first 2 + **** + last 4 */
function maskKey(key: string): string {
  if (!key || key.length < 4) return '****';
  return key.slice(0, 2) + '****' + key.slice(-4);
}

/** Decrypt apiKeys inside llm_providers JSON, then mask for UI */
function decryptProviders(value: string): string {
  try {
    const providers = JSON.parse(value);
    if (!Array.isArray(providers)) return value;
    const decrypted = providers.map((p: { apiKey?: string; hasKey?: boolean; [k: string]: unknown }) => ({
      ...p,
      apiKey: p.apiKey ? maskKey(decrypt(p.apiKey)) : '',
      hasKey: !!p.apiKey,
    }));
    return JSON.stringify(decrypted);
  } catch {
    return value;
  }
}

/** Encrypt apiKeys, but preserve DB originals for masked keys (****) */
async function encryptProviders(incoming: string): Promise<string> {
  try {
    const incomingP = JSON.parse(incoming) as { id: string; apiKey?: string; [k: string]: unknown }[];
    if (!Array.isArray(incomingP)) return incoming;
    // Fetch current DB values for masked key preservation
    const row = await db.settings.findUnique({ where: { key: PROVIDERS_KEY } });
    let dbP: { id: string; apiKey?: string; [k: string]: unknown }[] = [];
    if (row?.value) { try { dbP = JSON.parse(row.value); } catch { /* */ } }
    const dbMap = new Map(dbP.map(p => [p.id, p.apiKey]));
    const encrypted = incomingP.map(p => ({
      ...p,
      apiKey: (!p.apiKey || p.apiKey.includes('****'))
        ? (dbMap.get(p.id) ?? '')
        : encrypt(p.apiKey),
    }));
    return JSON.stringify(encrypted);
  } catch {
    return incoming;
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
      const dbValue = key === PROVIDERS_KEY ? await encryptProviders(value) : value;
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
