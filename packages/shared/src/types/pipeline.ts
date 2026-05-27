// ============================================================================
// Pipeline execution types
// ============================================================================

/** Pipeline execution */
export interface PipelineExecution {
  id: string;
  pipelineId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: Date;
  completedAt?: Date;
  result?: Record<string, unknown>;
  error?: string;
}
