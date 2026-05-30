import Link from "next/link";
import { cn } from "@stsgs/ui";

interface AuthFooterProps {
  mode: "login" | "signup";
}

export function AuthFooter({ mode }: AuthFooterProps) {
  return (
    <p className={cn("text-center text-sm text-muted-foreground")}>
      {mode === "login" ? (
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-brand-accent hover:underline">
            Sign up
          </Link>
        </>
      ) : (
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-accent hover:underline">
            Sign in
          </Link>
        </>
      )}
    </p>
  );
}
