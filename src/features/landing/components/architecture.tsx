"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Monitor, Cpu, Network } from "lucide-react";

const endpoints = [
  { icon: Monitor, title: "Visual IDE", description: "Drag-and-drop flow designer with real-time preview and validation." },
  { icon: Cpu, title: "Agent Runtime", description: "Scalable execution engine with retry, fallback, and circuit breaker patterns." },
  { icon: Network, title: "Orchestration", description: "Multi-agent coordination with supervisor and map-reduce patterns." },
];

export function Architecture() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="architecture" className="bg-midnight-base py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Powered by a structured orchestration engine
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            A modular architecture designed for reliability, scalability, and extensibility.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto max-w-3xl"
        >
          {/* Circuit lines */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-brand-accent/40 via-midnight-border to-brand-accent/40 hidden md:block" />

          {/* Central core */}
          <div className="relative mb-12 flex justify-center">
            <div className="rounded-xl border border-brand-accent/40 bg-midnight-card p-6 text-center shadow-lg shadow-brand-accent/5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10 mx-auto">
                <Cpu className="h-6 w-6 text-brand-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Orchestrator Core</h3>
              <p className="mt-1 text-sm text-text-secondary">Central coordination engine</p>
            </div>
          </div>

          {/* Endpoint cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {endpoints.map((ep, i) => (
              <motion.div
                key={ep.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="rounded-xl border border-midnight-border bg-midnight-card p-5 transition-colors hover:border-brand-accent/40"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-midnight-elevated">
                  <ep.icon className="h-4 w-4 text-brand-accent" />
                </div>
                <h4 className="mb-1 text-sm font-semibold text-text-primary">{ep.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{ep.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
