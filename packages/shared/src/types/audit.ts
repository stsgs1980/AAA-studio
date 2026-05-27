// ============================================================================
// Audit types
// ============================================================================

/** Audit log entry */
export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}
