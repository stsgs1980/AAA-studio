"use client";

import Link from "next/link";
import { ArrowDown, Github } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background particle-bg pt-16">
      {/* Decorative dots */}
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle, #30363D 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-brand-green animate-pulse-dot" />
            Open Source Visual IDE
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          Design{" "}
          <span className="gradient-text">Multi-Agent</span>
          {" "}Systems Visually
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Build, deploy, and orchestrate intelligent AI agent systems with a powerful visual editor.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground"
        >
          Drag-and-drop flow editor, prompt engineering studio, real-time monitoring, and multi-agent orchestration.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/signup"
            className="h-11 rounded-lg bg-brand-accent px-6 text-sm font-medium text-white transition-colors hover:bg-brand-accent-dim"
          >
            Get Started
          </Link>
          <a
            href="#"
            className="flex h-11 items-center gap-2 rounded-lg border border-border px-6 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce-slow"
      >
        <ArrowDown className="h-5 w-5" />
      </motion.div>
    </section>
  );
}
