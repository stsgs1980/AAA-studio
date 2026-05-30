import { db } from '@/lib/db';
import { handleError, success, created, BadRequest } from '@/lib/api-error';

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
    return success(logs);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, entityType, entityId, userId, details } = body;
    if (!action || !entityType) throw BadRequest('action and entityType are required');
    const log = await db.auditLog.create({
      data: { action, entityType, entityId: entityId ?? '', userId: userId ?? null, details: details ? JSON.stringify(details) : null },
    });
    return created(log);
  } catch (error) {
    return handleError(error);
  }
}
