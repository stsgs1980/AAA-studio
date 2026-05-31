"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  return (
    <section id="pricing" className="bg-background py-20 sm:py-28">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl px-4 sm:px-6"
      >
        <div className="rounded-xl border border-dashed border-brand-accent/30 bg-card/50 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t.landing['Ready to build intelligent systems?']}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            {t.landing['Start designing multi-agent workflows today with our open-source visual IDE.']}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="h-11 rounded-lg bg-brand-accent px-6 text-sm font-medium text-white transition-colors hover:bg-brand-accent-dim"
            >
              {t.landing['Get Started']}
            </Link>
            <a
              href="#"
              className="flex h-11 items-center gap-2 rounded-lg border border-border px-6 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              <BookOpen className="h-4 w-4" />
              {t.landing['Read Documentation']}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
