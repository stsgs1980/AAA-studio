"use client";

import { type ButtonHTMLAttributes } from "react";
import { cn } from "@stsgs/ui";
import { Loader2 } from "lucide-react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "ghost";
}

export function AuthButton({
  children,
  loading,
  variant = "primary",
  className,
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/20",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-brand-accent text-white hover:bg-brand-accent-dim",
        variant === "ghost" &&
          "border border-midnight-border bg-transparent text-text-primary hover:bg-midnight-elevated",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
