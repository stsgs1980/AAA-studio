import { Info, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  info: {
    icon: Info,
    border: "border-l-brand-accent",
    bg: "bg-brand-accent/10",
    iconColor: "text-brand-accent",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-brand-amber",
    bg: "bg-brand-amber/10",
    iconColor: "text-brand-amber",
  },
  success: {
    icon: CheckCircle2,
    border: "border-l-brand-green",
    bg: "bg-brand-green/10",
    iconColor: "text-brand-green",
  },
  tip: {
    icon: Lightbulb,
    border: "border-l-brand-purple",
    bg: "bg-brand-purple/10",
    iconColor: "text-brand-purple",
  },
} as const;

interface WikiCalloutProps {
  variant: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
}

export function WikiCallout({ variant, title, children }: WikiCalloutProps) {
  const v = variants[variant];
  const Icon = v.icon;

  return (
    <div
      className={cn(
        "rounded-md border-l-4 p-3 text-sm",
        v.bg,
        v.border
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", v.iconColor)} />
        <div className="min-w-0 flex-1">
          {title && (
            <p className="font-medium text-text-primary">{title}</p>
          )}
          <div className="text-text-secondary">{children}</div>
        </div>
      </div>
    </div>
  );
}
