import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    const p = new PrismaClient();
    const cols = await p.$queryRawUnsafe<{ column_name: string; data_type: string; column_default: string | null }[]>(
      `SELECT column_name, data_type, column_default
       FROM information_schema.columns
       WHERE table_name = 'Settings' ORDER BY ordinal_position`
    );
    const rows = await p.$queryRawUnsafe<{ id: string; key: string; value: string }[]>(
      `SELECT * FROM "Settings"`
    );
    const constraints = await p.$queryRawUnsafe<{ constraint_name: string; column_name: string }[]>(
      `SELECT tc.constraint_name, kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
       WHERE tc.table_name = 'Settings'`
    );
    await p.$disconnect();
    return NextResponse.json({ columns: cols, rows, constraints });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
