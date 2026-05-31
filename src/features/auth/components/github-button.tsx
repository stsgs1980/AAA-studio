"use client";

import { cn } from "@stsgs/ui";
import { Github } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function GitHubButton() {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-border",
        "bg-card text-sm font-medium text-foreground",
        "transition-colors hover:bg-muted"
      )}
    >
      <Github className="h-4 w-4" />
      {t.auth['Continue with GitHub']}
    </button>
  );
}
