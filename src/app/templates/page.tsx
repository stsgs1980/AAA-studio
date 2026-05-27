import { Layers } from "lucide-react";

export default function TemplateGalleryPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Layers className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Template Gallery</h1>
      </div>
      <p className="text-muted-foreground">
        Pre-built flow templates for common multi-agent patterns.
      </p>
      <div className="rounded-xl border bg-card p-12 shadow-sm flex items-center justify-center">
        <p className="text-muted-foreground">Coming Soon</p>
      </div>
    </div>
  );
}
