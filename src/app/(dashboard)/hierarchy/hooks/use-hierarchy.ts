'use client';

import { useState, useCallback, useEffect } from 'react';
import type { TreeNode } from '@/features/hierarchy/components/tree-item';

interface HierarchyStats {
  total: number;
  roots: number;
  maxDepth: number;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface Translations {
  common: Record<string, string>;
  pages: Record<string, string>;
}

function buildTree(
  list: { id: string; name: string; role: string; status: string; group: string; parentId: string | null }[],
): TreeNode[] {
  const map = new Map<string, TreeNode>();
  list.forEach((a) => map.set(a.id, { ...a, children: [] }));
  const roots: TreeNode[] = [];
  list.forEach((a) => {
    const node = map.get(a.id)!;
    if (a.parentId && map.has(a.parentId)) map.get(a.parentId)!.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function computeMaxDepth(nodes: TreeNode[], d: number): number {
  return nodes.reduce(
    (max, n) => Math.max(max, n.children.length > 0 ? computeMaxDepth(n.children, d + 1) : d),
    d,
  );
}

export function useHierarchy(t: Translations) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [stats, setStats] = useState<HierarchyStats>({ total: 0, roots: 0, maxDepth: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);

  const fetchAgents = useCallback(() => {
    fetch('/api/agents')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        const agents = data.data?.agents || data.agents || data;
        const roots = buildTree(agents);
        setTree(roots);
        setStats({ total: agents.length, roots: roots.length, maxDepth: computeMaxDepth(roots, 1) });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleDrop = useCallback(
    async (dragId: string, targetId: string) => {
      if (dragId === targetId) return;
      try {
        const res = await fetch(`/api/agents/${dragId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentId: targetId }),
        });
        if (!res.ok) {
          const d = await res.json();
          setMessage({ type: 'error', text: d.error || t.common['Failed'] });
          return;
        }
        setMessage({ type: 'success', text: t.pages['Agent reparented'] });
        fetchAgents();
        setTimeout(() => setMessage(null), 3000);
      } catch {
        setMessage({ type: 'error', text: t.common['Network error'] });
      }
    },
    [t, fetchAgents],
  );

  return { tree, stats, loading, message, handleDrop, fetchAgents };
}