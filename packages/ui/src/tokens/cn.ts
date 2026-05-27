import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CnProps {
  className?: string;
}

/** Merge Tailwind CSS classes (shadcn/ui standard utility) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
