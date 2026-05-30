import { cn } from "@stsgs/ui";

export function AuthDivider() {
  return (
    <div className="relative flex items-center">
      <div className="flex-1 border-t border-border" />
      <span className={cn("mx-3 text-xs text-muted-foreground")}>
        or continue with email
      </span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}
