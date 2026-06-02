// ============================================================================
// Real-time event types and channels
// ============================================================================

/** All real-time event channels in 3A Studio */
export type WsChannel =
  | 'approvals'
  | 'dashboard'
  | 'flow-execution'
  | 'agent-status'
  | 'cost-update';

/** Event payload for each channel */
export interface WsEvents {
  approvals: {
    new: { id: string; action: string; riskLevel: string };
    decided: { id: string; status: 'approved' | 'rejected' };
  };
  dashboard: {
    refresh: { reason: string };
    kpi: { metric: string; value: number };
  };
  'flow-execution': {
    started: { flowId: string; executionId: string };
    nodeComplete: { flowId: string; nodeId: string; status: string; duration: number };
    finished: { flowId: string; executionId: string; status: string };
  };
  'agent-status': {
    changed: { agentId: string; status: string };
  };
  'cost-update': {
    recorded: { model: string; tokens: number; cost: number };
  };
}

/** Type-safe event emitter helper */
export type WsEventPayload<C extends WsChannel, E extends keyof WsEvents[C]> = {
  channel: C;
  event: E;
  data: WsEvents[C][E];
};
