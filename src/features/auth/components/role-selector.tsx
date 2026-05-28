"use client";

import { cn } from "@stsgs/ui";

export type UserRole = "admin" | "operator" | "viewer";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

const roles: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "operator", label: "Operator" },
  { value: "viewer", label: "Viewer" },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
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
              : "border-midnight-border bg-midnight-card text-text-secondary hover:bg-midnight-elevated"
          )}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
