import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      <p className="text-muted-foreground">
        System configuration, API keys, theme and language preferences.
      </p>
      <div className="rounded-xl border bg-card p-12 shadow-sm flex items-center justify-center">
        <p className="text-muted-foreground">Coming Soon</p>
      </div>
    </div>
  );
}
