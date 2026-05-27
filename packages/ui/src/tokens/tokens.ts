// ============================================================================
// @stsgs/ui - Design tokens
// ============================================================================

export { cn } from "./cn";
export type { CnProps } from "./cn";

export const tokens = {
  colors: {
    primary: "hsl(220, 70%, 50%)",
    secondary: "hsl(220, 15%, 35%)",
    accent: "hsl(180, 70%, 45%)",
    destructive: "hsl(0, 70%, 50%)",
    muted: "hsl(220, 15%, 90%)",
    "muted-foreground": "hsl(220, 10%, 40%)",
    border: "hsl(220, 15%, 82%)",
    ring: "hsl(220, 70%, 50%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(220, 15%, 10%)",
    card: "hsl(0, 0%, 100%)",
    "card-foreground": "hsl(220, 15%, 10%)",
    popover: "hsl(0, 0%, 100%)",
    "popover-foreground": "hsl(220, 15%, 10%)",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
  },
  animation: {
    duration: {
      fast: "150ms",
      normal: "250ms",
      slow: "350ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },
} as const;
