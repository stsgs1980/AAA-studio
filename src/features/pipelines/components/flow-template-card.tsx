import { Workflow, Copy, ArrowRight } from "lucide-react";
import { cn } from "@stsgs/ui";
import type { FlowTemplate } from "../data/flow-templates";
import { FLOW_CATEGORIES } from "../data/flow-templates";

function countByType(template: FlowTemplate): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const n of template.nodes) {
    counts[n.type] = (counts[n.type] ?? 0) + 1;
  }
  return counts;
}

export function FlowTemplateCard({
  template, onClone,
}: {
  template: FlowTemplate;
  onClone: (t: FlowTemplate) => void;
}) {
  const cat = FLOW_CATEGORIES.find((c) => c.id === template.category);
  const counts = countByType(template);

  return (
    <div className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-semibold truncate">{template.name}</span>
          {cat && (
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full ml-auto shrink-0", cat.color)}>
              {cat.label}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {template.description}
        </p>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground">
            {template.nodes.length} nodes &middot; {template.edges.length} edges
          </span>
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {Object.entries(counts).map(([type, count]) => (
            <span key={type} className="px-1.5 py-0.5 rounded bg-muted">
              {type}×{count}
            </span>
          ))}
        </div>

        <button
          onClick={() => onClone(template)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Copy className="h-3 w-3" />
          <span>Clone to Editor</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
