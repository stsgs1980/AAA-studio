"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/lib/i18n/language-context";

function AnimatedCounter({ target, suffix, inView }: { target: number | null; suffix: string; inView: boolean }) {
  const { t } = useLanguage();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || target === null) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Number(current.toFixed(1)));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  if (target === null) {
    return <span className="text-3xl font-bold text-foreground">{t.landing.Free}</span>;
  }

  const display = target % 1 !== 0 ? count.toFixed(1) : Math.round(count);
  return (
    <span className="text-3xl font-bold text-foreground sm:text-4xl">
      {display}{suffix}
    </span>
  );
}

export function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  const stats = [
    { value: 1000, suffix: "+", label: t.landing['Agents Deployed'] },
    { value: 50, suffix: "+", label: t.landing.Templates },
    { value: 99.9, suffix: "%", label: t.landing.Uptime },
    { value: null, suffix: "", label: t.landing['Open Source'] },
  ];

  return (
    <section className="border-y border-border/40 bg-card/50 py-16">
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={inView} />
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
