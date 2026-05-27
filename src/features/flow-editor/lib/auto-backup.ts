import type { Node, Edge } from '@xyflow/react';
import type { FlowBackup } from '../types';

const STORAGE_KEY = '3a-studio-flow-backups';
const AUTO_BACKUP_META_KEY = '3a-studio-auto-backup-meta';
const DEBOUNCE_MS = 30_000; // 30 seconds

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Persist a flow backup to localStorage immediately. */
export function saveBackup(backup: FlowBackup): void {
  try {
    const backups = loadAllBackups();
    const idx = backups.findIndex((b) => b.flowId === backup.flowId);
    if (idx >= 0) {
      backups[idx] = backup;
    } else {
      backups.push(backup);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(backups));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/** Load all saved backups from localStorage. */
export function loadAllBackups(): FlowBackup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Schedule an auto-backup with 30s debounce. */
export function scheduleAutoBackup(
  flowId: string,
  name: string,
  nodes: Node[],
  edges: Edge[],
): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    saveBackup({
      flowId,
      name,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      savedAt: Date.now(),
    });
    localStorage.setItem(
      AUTO_BACKUP_META_KEY,
      JSON.stringify({ flowId, savedAt: Date.now() }),
    );
    debounceTimer = null;
  }, DEBOUNCE_MS);
}

/** Cancel any pending auto-backup. */
export function cancelAutoBackup(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

/** Load the most recent auto-backup metadata. */
export function loadLastAutoBackup(): FlowBackup | null {
  try {
    const raw = localStorage.getItem(AUTO_BACKUP_META_KEY);
    if (!raw) return null;
    const meta = JSON.parse(raw);
    const backups = loadAllBackups();
    return backups.find((b) => b.flowId === meta.flowId) ?? null;
  } catch {
    return null;
  }
}
