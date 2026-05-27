'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AgentRecord, AgentListResponse } from '../types';
import type { RoleGroup } from '@stsgs/shared';
import { DEFAULT_FORM } from '../types';

export function useAgentStore() {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editing, setEditing] = useState<AgentRecord | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterGroup) params.set('group', filterGroup);
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/agents?${params}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data: AgentListResponse = await res.json();
      setAgents(data.agents);
    } catch {
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  }, [search, filterGroup, filterStatus]);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
    setError('');
  }, []);

  const openEdit = useCallback((agent: AgentRecord) => {
    setEditing(agent);
    setForm({
      name: agent.name, role: agent.role, group: agent.group as RoleGroup,
      status: agent.status, model: agent.model,
      temperature: agent.temperature, maxTokens: agent.maxTokens,
      systemPrompt: agent.systemPrompt, tools: agent.tools,
      skills: agent.skills, standards: agent.standards,
      parentId: agent.parentId, description: agent.description,
    });
    setShowForm(true);
    setError('');
  }, []);

  const save = useCallback(async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    try {
      setSaving(true);
      setError('');
      const body = {
        ...form,
        tools: JSON.parse(form.tools || '[]'),
        skills: JSON.parse(form.skills || '[]'),
        standards: JSON.parse(form.standards || '[]'),
      };
      const url = editing ? `/api/agents/${editing.id}` : '/api/agents';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Save failed');
      setShowForm(false);
      fetchAgents();
    } catch {
      setError('Failed to save agent');
    } finally {
      setSaving(false);
    }
  }, [editing, form, fetchAgents]);

  const remove = useCallback(async (id: string) => {
    if (!confirm('Delete this agent?')) return;
    try {
      const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchAgents();
    } catch {
      setError('Failed to delete agent');
    }
  }, [fetchAgents]);

  const clone = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/agents/${id}/clone`, { method: 'POST' });
      if (!res.ok) throw new Error();
      fetchAgents();
    } catch {
      setError('Failed to clone agent');
    }
  }, [fetchAgents]);

  const setField = useCallback(<K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  return {
    agents, loading, search, filterGroup, filterStatus,
    editing, form, showForm, saving, error,
    setSearch, setFilterGroup, setFilterStatus,
    openCreate, openEdit, save, remove, clone,
    setShowForm, setField, setError,
  };
}
