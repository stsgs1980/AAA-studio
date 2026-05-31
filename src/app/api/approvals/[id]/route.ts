import { db } from '@/lib/db';
import { handleError, success, NotFound, BadRequest } from '@/lib/api-error';

type RouteParams = { params: Promise<{ id: string }> };

/** PATCH /api/approvals/:id — approve or reject */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { status, response, respondedBy } = await request.json();
    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      throw BadRequest('Status must be approved, rejected, or cancelled');
    }
    const existing = await db.approvalRequest.findUnique({ where: { id } });
    if (!existing) throw NotFound('Approval not found');
    if (existing.status !== 'pending') throw BadRequest(`Already ${existing.status}`);

    const updated = await db.approvalRequest.update({
      where: { id },
      data: { status, response: response ?? null, respondedBy: respondedBy ?? null, respondedAt: new Date() },
    });
    return success(updated);
  } catch (error) { return handleError(error); }
}
