'use client';

import { useEffect, useState, useCallback } from 'react';
import { Network, ChevronRight, ChevronDown, User, Bot } from 'lucide-react';
import { cn } from '@stsgs/ui';
import { PageSkeleton } from '@/components/ui';

interface TreeNode {
  id: string;
  name: string;
  role: string;
  status: string;
  group: string;
  children: TreeNode[];
}

const STATUS_COLORS: Record<string, string> = { active: 'bg-emerald-500', inactive: 'bg-gray-400', draft: 'bg-amber-500' };

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={cn('flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors', depth > 0 && 'ml-6')}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <span className="w-3.5" />
        )}
        <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_COLORS[node.status] ?? 'bg-gray-400')} />
        {node.group === 'orchestrator' ? <Bot className="h-4 w-4 text-primary shrink-0" /> : <User className="h-4 w-4 text-muted-foreground shrink-0" />}
        <div className="min-w-0">
          <span className="text-sm font-medium truncate">{node.name}</span>
          <span className="text-xs text-muted-foreground ml-2">{node.group}</span>
        </div>
        {hasChildren && <span className="text-xs text-muted-foreground ml-auto">{node.children.length}</span>}
      </div>
      {expanded && hasChildren && (
        <div className="ml-4 border-l border-border/50 pl-1">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgentHierarchyPage() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [stats, setStats] = useState({ total: 0, roots: 0, maxDepth: 0 });
  const [loading, setLoading] = useState(true);

  const buildTree = useCallback((agents: { id: string; name: string; role: string; status: string; group: string; parentId: string | null }[]) => {
    const map = new Map<string, TreeNode>();
    agents.forEach((a) => map.set(a.id, { ...a, children: [] }));
    const roots: TreeNode[] = [];
    agents.forEach((a) => {
      const node = map.get(a.id)!;
      if (a.parentId && map.has(a.parentId)) {
        map.get(a.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    const maxDepth = (nodes: TreeNode[], d: number): number =>
      nodes.reduce((max, n) => Math.max(max, n.children.length > 0 ? maxDepth(n.children, d + 1) : d), d);
    setTree(roots);
    setStats({ total: agents.length, roots: roots.length, maxDepth: maxDepth(roots, 1) });
  }, []);

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => buildTree(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [buildTree]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Agent Hierarchy</h1>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{stats.total} agents</span>
          <span>{stats.roots} roots</span>
          <span>depth {stats.maxDepth}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={5} /></div>
          <div className="rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={4} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-4">
            <h2 className="text-sm font-semibold mb-3">Tree View</h2>
            {tree.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No agents yet. Create some in the Agents page.</p>
            ) : (
              <div className="space-y-0.5">
                {tree.map((node) => (
                  <TreeItem key={node.id} node={node} />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-semibold">Legend</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> Orchestrator</div>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Agent</div>
            </div>
            <h2 className="text-sm font-semibold pt-2">Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Active</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Draft</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gray-400" /> Inactive</div>
            </div>
            <h2 className="text-sm font-semibold pt-2">Stats</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Total agents: {stats.total}</p>
              <p>Root agents: {stats.roots}</p>
              <p>Max depth: {stats.maxDepth}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
