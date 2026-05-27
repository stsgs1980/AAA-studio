import { Sparkles } from "lucide-react";

export default function PromptStudioPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Prompt Studio</h1>
      </div>
      <p className="text-muted-foreground">
        Write, evaluate, compare and improve prompts with scoring and
        frameworks.
      </p>
      <div className="rounded-xl border bg-card p-12 shadow-sm flex items-center justify-center">
        <p className="text-muted-foreground">Coming Soon</p>
      </div>
    </div>
  );
}
