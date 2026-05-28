// ONE-TIME migration: fix Settings table primary key
// Drops `id` column, makes `key` the primary key.
// Run once, then delete this file.

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Step 1: Check if migration needed (does `id` column exist?)
    const hasIdCol = await db.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Settings' AND column_name = 'id'
    `);
    if (!Array.isArray(hasIdCol) || hasIdCol.length === 0) {
      return NextResponse.json({ ok: true, message: 'Already migrated — no `id` column' });
    }

    // Step 2: Drop PK constraint, id column, add PK on key
    await db.$executeRawUnsafe(`
      ALTER TABLE "Settings" DROP CONSTRAINT "Settings_pkey",
      DROP COLUMN "id",
      ADD PRIMARY KEY ("key")
    `);

    // Step 3: Verify
    const rows = await db.settings.findMany();
    return NextResponse.json({
      ok: true,
      message: `Migrated! ${rows.length} settings preserved.`,
      keys: rows.map(r => r.key),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
