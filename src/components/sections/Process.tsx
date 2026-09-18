"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { processSteps } from "@/content/site";
import { cn } from "@/lib/utils";

export function Process() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 55%"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const idx = Math.min(processSteps.length - 1, Math.floor(v * processSteps.length + 0.0001));
      setActive(idx);
    });
  }, [scrollYProgress]);

  return (
    <Section id="process">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            index="10"
            eyebrow="Process"
            title="From idea"
            accent="to scale."
            subtitle="A single, connected process across technology, media and growth — so nothing gets lost between strategy and execution."
          />
          {/* active stage readout */}
          <div className="mt-10 hidden items-baseline gap-4 lg:flex">
            <span className="font-display text-7xl font-extrabold tracking-[-0.05em] text-gradient tabular-nums">
              {processSteps[active].index}
            </span>
            <span className="font-display text-2xl font-bold text-white">{processSteps[active].title}</span>
          </div>
        </div>

        <ol ref={ref} className="relative">
          {/* connecting line */}
          <div className="absolute bottom-6 left-[23px] top-6 w-px bg-white/10">
            <motion.div
              style={{ scaleY: reduce ? 1 : line, transformOrigin: "top" }}
              className="h-full w-full bg-[linear-gradient(180deg,#38e1ff,#4d7cfe,#8b5cf6)] shadow-[0_0_14px_rgba(77,124,254,0.7)]"
            />
          </div>

          {processSteps.map((s, i) => {
            const isActive = i === active;
            const done = i < active;
            return (
              <motion.li
                key={s.index}
                initial={reduce ? false : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-6 py-5 sm:py-6"
              >
                <span
                  className={cn(
                    "relative z-[1] grid size-12 shrink-0 place-items-center rounded-full border font-display text-sm font-bold transition-all duration-500 shadow-[0_0_0_6px_rgb(var(--bg)/1)]",
                    isActive
                      ? "border-transparent bg-[linear-gradient(135deg,#38e1ff,#4d7cfe,#8b5cf6)] text-pure-white shadow-[0_0_0_6px_rgb(var(--bg)/1),0_0_30px_rgba(77,124,254,0.7)] scale-110"
                      : done
                        ? "border-accent/50 bg-ink text-white"
                        : "border-white/12 bg-ink text-white/50"
                  )}
                >
                  {s.index}
                </span>
                <div
                  className={cn(
                    "flex-1 rounded-xl2 border p-5 transition-all duration-500 sm:p-6",
                    isActive ? "border-accent/40 bg-accent/[0.06]" : "border-white/[0.07] bg-white/[0.02]"
                  )}
                >
                  <h3 className={cn("font-display text-xl font-bold tracking-[-0.02em] transition-colors", isActive ? "text-white" : "text-white/80")}>
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{s.description}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
