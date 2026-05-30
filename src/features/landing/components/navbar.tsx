"use client";

import Link from "next/link";
import { Cpu } from "lucide-react";
import { cn } from "@stsgs/ui";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Architecture", href: "#architecture" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border/40 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">3A Studio</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              "hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground",
              "transition-colors hover:text-foreground sm:inline-block"
            )}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent-dim"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
