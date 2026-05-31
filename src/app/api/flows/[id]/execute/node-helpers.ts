import { db } from '@/lib/db';
import type { ExecOutput } from './node-exec';

/** Execute human-in-the-loop node — create ApprovalRequest and wait */
export async function execHITL(
  d: Record<string, unknown>, inputs: Record<string, unknown>, flowId?: string,
): Promise<ExecOutput> {
  const action = typeof d.action === 'string' ? d.action : 'Review required';
  const riskLevel = typeof d.riskLevel === 'string' ? d.riskLevel : 'medium';
  const timeoutMs = typeof d.timeoutMs === 'number' ? d.timeoutMs : 300_000;
  const expiresAt = new Date(Date.now() + timeoutMs);

  // Create approval request in DB
  const approval = await db.approvalRequest.create({
    data: {
      action,
      actionType: 'general',
      riskLevel,
      payload: JSON.stringify(inputs),
      workflowId: flowId ?? null,
      expiresAt,
    },
  });

  // Poll for approval (with 5s interval, up to timeout)
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(5000);
    const current = await db.approvalRequest.findUnique({ where: { id: approval.id } });
    if (!current || current.status === 'cancelled') {
      return { data: { ...inputs, approvalStatus: 'cancelled' }, selectedHandle: 'rejected' };
    }
    if (current.status === 'approved') {
      const resp = current.response ? JSON.parse(current.response) : {};
      return { data: { ...inputs, ...resp, approvalStatus: 'approved' }, selectedHandle: 'approved' };
    }
    if (current.status === 'rejected') {
      return { data: { ...inputs, approvalStatus: 'rejected', rejectionReason: current.response }, selectedHandle: 'rejected' };
    }
    if (current.expiresAt && current.expiresAt < new Date()) {
      await db.approvalRequest.update({ where: { id: approval.id }, data: { status: 'expired' } });
      return { data: { ...inputs, approvalStatus: 'expired' }, selectedHandle: 'rejected' };
    }
  }

  // Timeout
  await db.approvalRequest.update({ where: { id: approval.id }, data: { status: 'expired' } });
  return { data: { ...inputs, approvalStatus: 'timeout' }, selectedHandle: 'rejected' };
}

/** Write a CostRecord row for analytics (non-blocking) */
export async function persistCost(
  u: { promptTokens: number; completionTokens: number; totalTokens: number },
  cost: number, model: string, flowId?: string,
) {
  try {
    await db.costRecord.create({
      data: {
        executionType: 'workflow', inputTokens: u.promptTokens, outputTokens: u.completionTokens,
        totalTokens: u.totalTokens, costUsd: cost, model, ...(flowId ? { executionId: flowId } : {}),
      },
    });
  } catch { /* DB write failure should not break execution */ }
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
