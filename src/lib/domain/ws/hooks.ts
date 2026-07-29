// ============================================================================
// Server-side broadcast helpers — emit events from API routes
// ============================================================================

import { broadcast } from './server';

/** Notify about new HITL approval request */
export function emitApprovalNew(id: string, action: string, riskLevel: string) {
  broadcast('approvals', 'new', { id, action, riskLevel });
}

/** Notify about approval decision */
export function emitApprovalDecided(id: string, status: 'approved' | 'rejected') {
  broadcast('approvals', 'decided', { id, status });
}

/** Notify dashboard to refresh KPIs */
export function emitDashboardRefresh(reason: string) {
  broadcast('dashboard', 'refresh', { reason });
}

/** Notify flow execution started */
export function emitFlowStarted(flowId: string, executionId: string) {
  broadcast('flow-execution', 'started', { flowId, executionId });
}

/** Notify individual node completion during execution */
export function emitNodeComplete(flowId: string, nodeId: string, status: string, duration: number) {
  broadcast('flow-execution', 'nodeComplete', { flowId, nodeId, status, duration });
}

/** Notify flow execution finished */
export function emitFlowFinished(flowId: string, executionId: string, status: string) {
  broadcast('flow-execution', 'finished', { flowId, executionId, status });
}

/** Notify agent status change */
export function emitAgentStatusChanged(agentId: string, status: string) {
  broadcast('agent-status', 'changed', { agentId, status });
}

/** Notify cost record */
export function emitCostRecorded(model: string, tokens: number, cost: number) {
  broadcast('cost-update', 'recorded', { model, tokens, cost });
}
