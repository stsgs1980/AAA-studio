import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST() {
  const p = new PrismaClient();
  try {
    // Test 1: Simple INSERT with explicit id
    await p.$executeRawUnsafe(
      `INSERT INTO "Settings" (id, key, value) VALUES ('cfg-test', 'test', 'hello')`
    );
    // Test 2: Read it back
    const rows = await p.$queryRawUnsafe<{ id: string; key: string; value: string }[]>(
      `SELECT * FROM "Settings"`
    );
    await p.$disconnect();
    return NextResponse.json({ ok: true, rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await p.$disconnect();
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
