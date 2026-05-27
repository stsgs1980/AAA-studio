import Link from "next/link";
import { Cpu } from "lucide-react";
import { cn } from "@stsgs/ui";

export function Logo() {
  return (
    <div className="flex justify-center">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent">
          <Cpu className="h-5 w-5 text-white" />
        </div>
        <span className={cn("text-lg font-bold text-text-primary")}>
          3A Studio
        </span>
      </Link>
    </div>
  );
}
