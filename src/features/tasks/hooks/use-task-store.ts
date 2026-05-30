import { create } from 'zustand';
import type { Task } from '../types';

interface TaskState {
  tasks: Task[];
  counts: Record<string, number>;
  loading: boolean;
  error: string | null;
  filter: { status?: string; agentId?: string; priority?: string };
  setFilter: (f: Partial<TaskState['filter']>) => void;
  fetchTasks: () => Promise<void>;
  createTask: (data: { title: string; description?: string; priority?: string; agentId?: string }) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

function buildQuery(filter: TaskState['filter']): string {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.agentId) params.set('agentId', filter.agentId);
  if (filter.priority) params.set('priority', filter.priority);
  return params.toString();
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  counts: {},
  loading: false,
  error: null,
  filter: {},

  setFilter: (f) => {
    set({ filter: { ...get().filter, ...f } });
    get().fetchTasks();
  },

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const qs = buildQuery(get().filter);
      const res = await fetch(`/api/tasks?${qs}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      set({ tasks: data.data?.tasks ?? data.tasks ?? [], counts: data.data?.counts ?? data.counts ?? {}, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  createTask: async (data) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create task');
    const task = await res.json();
    await get().fetchTasks();
    return task;
  },

  updateTask: async (id, data) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update task');
    await get().fetchTasks();
  },

  deleteTask: async (id) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
    await get().fetchTasks();
  },
}));
