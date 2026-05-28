// ONE-TIME migration: fix Settings table — drop `id` column, make `key` the PK.
// Uses raw SQL only (no Prisma ORM) to avoid schema mismatch issues.
// Run once, then DELETE this file.

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST() {
  try {
    const prisma = new PrismaClient();

    // Check current table structure
    const cols = await prisma.$queryRawUnsafe<{ column_name: string }[]>(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Settings' ORDER BY ordinal_position
    `);
    const colNames = cols.map(c => c.column_name);

    // Already migrated?
    if (!colNames.includes('id') && colNames.includes('key')) {
      await prisma.$disconnect();
      return NextResponse.json({ ok: true, message: 'Already migrated' });
    }

    // Need migration
    if (colNames.includes('id') && colNames.includes('key')) {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Settings" DROP CONSTRAINT IF EXISTS "Settings_pkey",
        DROP COLUMN IF EXISTS "id",
        ADD PRIMARY KEY ("key")
      `);
      await prisma.$disconnect();

      // Verify with raw query
      const rows = await prisma.$queryRawUnsafe<{ key: string; value: string }[]>(
        `SELECT key, value FROM "Settings"`
      );
      return NextResponse.json({
        ok: true,
        message: `Migrated! ${rows.length} settings preserved.`,
        keys: rows.map(r => r.key),
      });
    }

    await prisma.$disconnect();
    return NextResponse.json({
      ok: false,
      message: `Unexpected schema: columns are ${colNames.join(', ')}`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
