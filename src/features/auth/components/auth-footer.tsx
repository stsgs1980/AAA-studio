'use client';

import Link from "next/link";
import { cn } from "@stsgs/ui";
import { useLanguage } from "@/lib/i18n/language-context";

interface AuthFooterProps {
  mode: "login" | "signup";
}

export function AuthFooter({ mode }: AuthFooterProps) {
  const { t } = useLanguage();

  return (
    <p className={cn("text-center text-sm text-muted-foreground")}>
      {mode === "login" ? (
        <>
          {t.auth["Don't have an account?"]}{" "}
          <Link href="/signup" className="font-medium text-brand-accent hover:underline">
            {t.auth['Sign up']}
          </Link>
        </>
      ) : (
        <>
          {t.auth['Already have an account?']}{" "}
          <Link href="/login" className="font-medium text-brand-accent hover:underline">
            {t.auth['Sign in']}
          </Link>
        </>
      )}
    </p>
  );
}
