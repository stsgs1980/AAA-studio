"use client";

import { cn } from "@stsgs/ui";
import { useLanguage } from "@/lib/i18n/language-context";

export type UserRole = "admin" | "operator" | "viewer";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const { t } = useLanguage();

  const roles: { value: UserRole; label: string }[] = [
    { value: "admin", label: t.auth.Admin },
    { value: "operator", label: t.auth.Operator },
    { value: "viewer", label: t.auth.Viewer },
  ];

  return (
    <div className="flex gap-2">
      {roles.map((role) => (
        <button
          key={role.value}
          type="button"
          onClick={() => onChange(role.value)}
          className={cn(
            "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            value === role.value
              ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
