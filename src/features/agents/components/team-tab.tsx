'use client';
import { useState, useEffect } from 'react';
import { Users, Plus, X, GripVertical } from 'lucide-react';
interface Agent {
  id: string;
  name: string;
  role: string;
  roleGroup: string;
  status: string;
}
export function TeamTab({ agentId, roleGroup }: { agentId: string; roleGroup: string }) {
  const [children, setChildren] = useState<Agent[]>([]);
  const [available, setAvailable] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchChildren();
    fetchAvailable();
  }, [agentId]);
  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents?parentId=${agentId}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setChildren(data.data?.agents || []);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  const fetchAvailable = async () => {
    try {
      const res = await fetch(`/api/agents?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const all: Agent[] = data.data?.agents || [];
        const childIds = new Set(children.map(c => c.id));
        setAvailable(all.filter(a => a.id !== agentId && !childIds.has(a.id)));
      }
    } catch { /* ignore */ }
  };
  const addChild = async (childId: string) => {
    try {
      const res = await fetch(`/api/agents/${childId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: agentId }),
      });
      if (res.ok) {
        const agent = available.find(a => a.id === childId);
        if (agent) {
          setChildren(prev => [...prev, agent]);
          setAvailable(prev => prev.filter(a => a.id !== childId));
        }
      }
    } catch { /* ignore */ }
  };
  const removeChild = async (childId: string) => {
    try {
      const res = await fetch(`/api/agents/${childId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: null }),
      });
      if (res.ok) {
        const agent = children.find(a => a.id === childId);
        setChildren(prev => prev.filter(a => a.id !== childId));
        if (agent) setAvailable(prev => [...prev, agent]);
      }
    } catch { /* ignore */ }
  };
  if (roleGroup !== 'orchestrator') {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">Team builder is available for Orchestrator agents only</p>
      </div>
    );
  }
  const groupLabel = (g: string) => {
    const map: Record<string, string> = {
      specialist: 'Specialist', planner: 'Planner', researcher: 'Researcher',
      coder: 'Coder', reviewer: 'Reviewer', tester: 'Tester', deployer: 'Deployer',
    };
    return map[g] || g;
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-brand-purple" />
        <h3 className="text-sm font-semibold">Team Members</h3>
        <span className="text-xs text-muted-foreground">({children.length})</span>
      </div>
      {loading ? (
        <p className="text-xs text-muted-foreground animate-pulse">Loading team...</p>
      ) : children.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">No team members yet. Add agents below.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {children.map((child, i) => (
            <div key={child.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5 group">
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{child.name}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{child.role || groupLabel(child.roleGroup)}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                child.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}>{child.status}</span>
              <button onClick={() => removeChild(child.id)}
                className="opacity-0 group-hover:opacity-100 text-red-600 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Add member */}
      {available.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Add to Team</h4>
          <div className="flex flex-wrap gap-1.5">
            {available.slice(0, 20).map(a => (
              <button key={a.id} onClick={() => addChild(a.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-xs hover:border-primary/30 hover:bg-accent transition-colors">
                <Plus className="w-3 h-3" />
                {a.name}
                <span className="text-[9px] text-muted-foreground">{groupLabel(a.roleGroup)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
