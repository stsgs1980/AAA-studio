import { db } from '@/lib/db';
import { handleError, success, BadRequest } from '@/lib/api-error';
import { emitApprovalNew } from '@/lib/ws/hooks';

/** GET /api/approvals — list approvals (default: pending) */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? 'pending';
    const where = status === 'all' ? {} : { status };
    const approvals = await db.approvalRequest.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 50,
    });
    return success(approvals.map((a) => ({ ...a, payload: JSON.parse(a.payload) })));
  } catch (error) { return handleError(error); }
}

/** POST /api/approvals — create approval request */
export async function POST(request: Request) {
  try {
    const { action, actionType, riskLevel, payload, agentId, workflowId, stepId, expiresAt } = await request.json();
    if (!action) throw BadRequest('Action is required');
    const approval = await db.approvalRequest.create({
      data: {
        action, actionType: actionType ?? 'general', riskLevel: riskLevel ?? 'medium',
        payload: JSON.stringify(payload ?? {}), agentId: agentId ?? null,
        workflowId: workflowId ?? null, stepId: stepId ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    emitApprovalNew(approval.id, action, riskLevel ?? 'medium');
    return success(approval, 201);
  } catch (error) { return handleError(error); }
}
