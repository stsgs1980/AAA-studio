"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@stsgs/ui";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon, rightIcon, error, className, id, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "h-11 w-full rounded-lg border bg-midnight-card px-3 text-sm text-text-primary",
          "placeholder:text-text-muted outline-none transition-colors",
          "focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20",
          error && "border-brand-red focus:border-brand-red focus:ring-brand-red/20",
          icon && "pl-10",
          rightIcon && "pr-10",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
          {rightIcon}
        </div>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-brand-red">{error}</p>
      )}
    </div>
  )
);

AuthInput.displayName = "AuthInput";
