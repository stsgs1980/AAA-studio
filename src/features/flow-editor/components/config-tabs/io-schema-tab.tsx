'use client';

import { useFlowEditorStore } from '../../store/flow-store';
import { getNodeDefinition } from '../../nodes/node-registry';

/**
 * I/O Schema tab — displays input and output ports for the selected node.
 */
export function IOSchemaTab() {
  const { nodes, selectedNodeId } = useFlowEditorStore();
  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const def = getNodeDefinition(node.type ?? '');

  return (
    <div className="space-y-4 p-1">
      <PortSection title="Inputs" items={def?.inputs ?? []} />
      <PortSection title="Outputs" items={def?.outputs ?? []} />
    </div>
  );
}

function PortSection({
  title,
  items,
}: {
  title: string;
  items: { id: string; label: string; type: string; dataType?: string }[];
}) {
  if (items.length === 0) {
    return (
      <div className="space-y-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        <p className="text-[10px] text-muted-foreground italic">
          No {title.toLowerCase()}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded border border-border bg-background px-2 py-1.5"
          >
            <div className="flex items-center gap-2">
              <div className={
                item.type === 'input'
                  ? 'h-2 w-2 rounded-full bg-emerald-500'
                  : 'h-2 w-2 rounded-full bg-blue-500'
              } />
              <span className="text-xs">{item.label}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{item.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
