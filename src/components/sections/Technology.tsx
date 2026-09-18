"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Code2, Globe, Smartphone, Plug, Cloud, Workflow, BarChart3, type LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { technologyStages, technologyCapabilities } from "@/content/site";

const capIcons: Record<string, LucideIcon> = {
  "Custom Software": Code2,
  "Web Platforms": Globe,
  "Mobile Apps": Smartphone,
  APIs: Plug,
  "Cloud Infrastructure": Cloud,
  Automation: Workflow,
  Analytics: BarChart3,
};

export function Technology() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 45%"] });
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section id="technology">
      <SectionHeading
        index="05"
        eyebrow="Software & Solutions"
        title="Technology built around"
        accent="your business."
        subtitle="Custom software, web platforms, mobile apps, APIs, cloud infrastructure, automation and analytics — engineered as one system that grows with you."
      />

      {/* Timeline */}
      <div ref={ref} className="relative mt-16 lg:mt-24">
        {/* desktop: horizontal track */}
        <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-white/10 lg:block">
          <motion.div
            style={{ scaleX: reduce ? 1 : progress, transformOrigin: "left" }}
            className="h-full w-full bg-[linear-gradient(90deg,var(--color-cyan),var(--color-accent),var(--color-violet))] shadow-[0_0_16px_rgb(var(--accent-rgb)/0.7)]"
          />
        </div>
        {/* mobile: vertical track */}
        <div className="absolute bottom-0 left-[22px] top-0 w-px bg-white/10 lg:hidden">
          <motion.div
            style={{ scaleY: reduce ? 1 : progress, transformOrigin: "top" }}
            className="h-full w-full bg-[linear-gradient(180deg,var(--color-cyan),var(--color-accent),var(--color-violet))] shadow-[0_0_16px_rgb(var(--accent-rgb)/0.7)]"
          />
        </div>

        <ol className="grid gap-8 lg:grid-cols-6 lg:gap-4">
          {technologyStages.map((s, i) => (
            <Stage key={s.title} index={i} total={technologyStages.length} title={s.title} description={s.description} progress={progress} />
          ))}
        </ol>
      </div>

      {/* Capabilities */}
      <Reveal className="mt-16 lg:mt-24">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">We build</span>
          {technologyCapabilities.map((c, i) => {
            const Icon = capIcons[c];
            return (
              <motion.span
                key={c}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="glass liquid-press group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/80 hover:text-white"
              >
                <Icon className="size-4 text-cyan transition-transform duration-300 group-hover:rotate-6" strokeWidth={1.9} />
                {c}
              </motion.span>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}

function Stage({
  index,
  total,
  title,
  description,
  progress,
}: {
  index: number;
  total: number;
  title: string;
  description: string;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const threshold = index / (total - 1);
  // node lights up once the line reaches it
  const glow = useTransform(progress, (p: number): number => (p >= threshold - 0.02 ? 1 : 0));
  const opacity = useTransform(glow, [0, 1], [0.35, 1]);
  const scale = useTransform(glow, [0, 1], [0.8, 1]);

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay: index * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-5 pl-0 lg:flex-col lg:gap-6"
    >
      <motion.span
        style={{ opacity: reduce ? 1 : opacity, scale: reduce ? 1 : scale }}
        className="relative z-[1] grid size-11 shrink-0 place-items-center rounded-full border border-white/15 bg-ink font-display text-sm font-bold text-white shadow-[0_0_0_6px_rgb(var(--bg)/1)]"
      >
        <span className="relative">{String(index + 1).padStart(2, "0")}</span>
        {/* lit layer sits on top so the number stays white on the gradient in both themes */}
        <motion.span style={{ opacity: reduce ? 1 : glow }} className="absolute inset-0 grid place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-cyan),var(--color-accent),var(--color-violet))] text-pure-white shadow-[0_0_24px_rgb(var(--accent-rgb)/0.6)]">
          {String(index + 1).padStart(2, "0")}
        </motion.span>
      </motion.span>
      <div className="pt-1.5 lg:pt-0">
        <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-mute">{description}</p>
      </div>
    </motion.li>
  );
}
