"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Workflow,
  Bot,
  Network,
  Sparkles,
  Database,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  const features: FeatureCard[] = [
    { icon: Workflow, title: t.landing['Visual Flow Editor'], description: t.landing['Drag-and-drop canvas for designing complex agent orchestration pipelines with conditional routing and error handling.'] },
    { icon: Bot, title: t.landing['Agent Runtime'], description: t.landing['Deploy and manage AI agents with built-in retry logic, circuit breakers, and real-time execution tracking.'] },
    { icon: Network, title: t.landing['Multi-Agent Orchestration'], description: t.landing['Coordinate agent hierarchies with supervisor patterns, fan-out/fan-in, and dynamic task delegation.'] },
    { icon: Sparkles, title: t.landing['Prompt Studio'], description: t.landing['20 engineering techniques, 11 structured frameworks, and 6-dimension scoring for optimal prompt design.'] },
    { icon: Database, title: t.landing['Knowledge Base'], description: t.landing['RAG-powered document management with vector search, automatic chunking, and semantic retrieval.'] },
    { icon: Activity, title: t.landing['Real-time Monitoring'], description: t.landing['Live execution tracking with latency metrics, error rate dashboards, and cost monitoring.'] },
  ];

  return (
    <section id="features" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t.landing['Everything you need to build intelligent systems']}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t.landing['A comprehensive toolkit for designing, deploying, and managing AI agent pipelines at scale.']}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-accent/40"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/10">
                <feature.icon className="h-5 w-5 text-brand-accent" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
