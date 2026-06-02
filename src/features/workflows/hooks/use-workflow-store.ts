import { create } from 'zustand';
import type { Workflow } from '../types';

interface WorkflowState {
  workflows: Workflow[];
  current: Workflow | null;
  loading: boolean;
  error: string | null;
  fetchWorkflows: () => Promise<void>;
  fetchWorkflow: (id: string) => Promise<void>;
  createWorkflow: (data: { name: string; description?: string; triggerType?: string }) => Promise<Workflow>;
  addStep: (workflowId: string, data: { name: string; agentId?: string; action?: string }) => Promise<void>;
  executeWorkflow: (id: string, input?: unknown) => Promise<unknown>;
  deleteWorkflow: (id: string) => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  current: null,
  loading: false,
  error: null,

  fetchWorkflows: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/workflows');
      if (!res.ok) throw new Error('Failed to fetch workflows');
      const data = await res.json();
      set({ workflows: data.data ?? data.workflows ?? [], loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchWorkflow: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/workflows/${id}`);
      if (!res.ok) throw new Error('Failed to fetch workflow');
      const data = await res.json();
      set({ current: data.data ?? data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createWorkflow: async (data) => {
    const res = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create workflow');
    const workflow = await res.json();
    await get().fetchWorkflows();
    return workflow;
  },

  addStep: async (workflowId, data) => {
    const res = await fetch(`/api/workflows/${workflowId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add step');
    await get().fetchWorkflow(workflowId);
  },

  executeWorkflow: async (id, input) => {
    const res = await fetch(`/api/workflows/${id}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    if (!res.ok) throw new Error('Failed to execute workflow');
    return res.json();
  },

  deleteWorkflow: async (id) => {
    const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete workflow');
    await get().fetchWorkflows();
  },
}));
