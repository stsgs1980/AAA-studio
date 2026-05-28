import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100'), 500);
    const entityType = url.searchParams.get('entityType');
    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('[GET /api/audit]', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, entityType, entityId, userId, details } = body;
    if (!action || !entityType) {
      return NextResponse.json({ error: 'action and entityType are required' }, { status: 400 });
    }
    const log = await db.auditLog.create({
      data: { action, entityType, entityId: entityId ?? '', userId: userId ?? null, details: details ? JSON.stringify(details) : null },
    });
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('[POST /api/audit]', error);
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 });
  }
}
