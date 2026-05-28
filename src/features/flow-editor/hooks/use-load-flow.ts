'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFlowEditorStore } from '../store/flow-store';
import type { Node, Edge } from '@xyflow/react';

/** Load a flow by ?id= query param from the database into the store. */
export function useLoadFlow() {
  const searchParams = useSearchParams();
  const flowId = searchParams.get('id');
  const loadFlow = useFlowEditorStore((s) => s.loadFlow);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!flowId || hasLoaded.current) return;
    hasLoaded.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/flows/${flowId}`);
        if (!res.ok) return;
        const flow = await res.json();

        const nodes: Node[] = typeof flow.nodes === 'string'
          ? JSON.parse(flow.nodes)
          : flow.nodes ?? [];
        const edges: Edge[] = typeof flow.edges === 'string'
          ? JSON.parse(flow.edges)
          : flow.edges ?? [];

        loadFlow(nodes, edges, flow.id, flow.name ?? 'Untitled Flow');
      } catch (err) {
        console.error('[useLoadFlow] Failed to load flow:', err);
      }
    })();
  }, [flowId, loadFlow]);
}
