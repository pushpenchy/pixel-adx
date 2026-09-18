"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { services, type ServiceIcon } from "@/content/site";
import { cn } from "@/lib/utils";

const ServiceStage = dynamic(() => import("@/components/three/services/ServiceStage").then((m) => m.ServiceStage), { ssr: false });

const CORE: ServiceIcon[] = ["adtech", "media", "performance"];

/**
 * Concept A — "Stage": the numbered list on the left, a persistent 3D stage
 * on the right that swaps to the hovered / tapped service's vignette.
 * Advertising services are flagged as the core practice.
 */
export function ServicesStage() {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState<{ cur: ServiceIcon; prev: ServiceIcon | null }>({ cur: "adtech", prev: null });
  const timer = useRef<number | null>(null);

  const pick = (id: ServiceIcon) => {
    setSel((s) => (s.cur === id ? s : { cur: id, prev: s.cur }));
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSel((s) => ({ ...s, prev: null })), 700);
  };

  const current = services.find((s) => s.icon === sel.cur)!;

  return (
    <Section id="services">
      <SectionHeading index="01" eyebrow="Services" title="Everything your digital growth" accent="needs." subtitle="Advertising is our core — AdTech, media buying and performance. Around it we build the software, products and data that make growth compound." />

      <div className="mt-14 grid gap-8 lg:mt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        {/* stage: sticky on desktop, top on mobile */}
        <div className="order-first lg:order-last lg:sticky lg:top-24 lg:self-start">
          <div className="crystal relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 bg-ink-2/60 sm:aspect-[5/4]">
            <div className="absolute inset-[15%] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,0.22),transparent_70%)]" aria-hidden />
            <ServiceStage current={sel.cur} prev={sel.prev} reduce={!!reduce} />
            {/* caption */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6">
              <div>
                <span className="label-mono text-white/50">{current.index} / 10</span>
                <p className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{current.title}</p>
              </div>
              {CORE.includes(current.icon) && <span className="glass glass-flat rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan">Core practice</span>}
            </div>
          </div>
        </div>

        {/* list */}
        <ol className="hairline">
          {services.map((s, i) => {
            const on = s.icon === sel.cur;
            const core = CORE.includes(s.icon);
            return (
              <motion.li
                key={s.title}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => pick(s.icon)}
                onFocus={() => pick(s.icon)}
                className={cn("group relative border-b border-white/10 transition-colors duration-300", on && "bg-white/[0.03]")}
              >
                <button type="button" onClick={() => pick(s.icon)} className="grid w-full grid-cols-[3rem_1fr_2.5rem] items-center gap-x-4 py-4 text-left sm:py-5">
                  <span className={cn("label-mono transition-colors", on ? "text-cyan" : "text-white/40")}>{s.index}</span>
                  <span>
                    <span className="flex items-center gap-2.5">
                      <span className={cn("font-display text-xl font-bold tracking-[-0.02em] transition-colors sm:text-2xl", on ? "text-white" : "text-white/80")}>{s.title}</span>
                      {core && <span className="rounded-full border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan">Core</span>}
                    </span>
                    <span className={cn("mt-1 block max-w-lg text-sm leading-relaxed text-mute transition-all duration-300", on ? "max-h-20 opacity-100" : "max-h-0 overflow-hidden opacity-0 lg:max-h-20 lg:opacity-100")}>{s.description}</span>
                  </span>
                  <span className={cn("grid size-9 place-items-center rounded-full border transition-all duration-300", on ? "border-white/40 bg-white/[0.08] text-white rotate-45" : "border-white/12 text-white/50")}>
                    <ArrowUpRight className="size-4" />
                  </span>
                </button>
                <span aria-hidden className={cn("absolute bottom-0 left-0 h-px bg-[linear-gradient(90deg,#38e1ff,#8b5cf6)] transition-all duration-500", on ? "w-full" : "w-0")} />
              </motion.li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
