"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { Eyebrow } from "@/components/ui/Section";
import { services, type ServiceIcon } from "@/content/site";
import { cn } from "@/lib/utils";

const ServiceStage = dynamic(() => import("@/components/three/services/ServiceStage").then((m) => m.ServiceStage), { ssr: false });

const CORE: ServiceIcon[] = ["adtech", "media", "performance"];

/**
 * Concept C — "Story": a pinned section. Scrolling steps through the ten
 * services; the copy cross-fades on the left while the 3D stage swaps
 * vignettes on the right. Progress dots on the far left.
 */
export function ServicesStory() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [sel, setSel] = useState<{ cur: number; prev: ServiceIcon | null }>({ cur: 0, prev: null });
  const timer = useRef<number | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(services.length - 1, Math.max(0, Math.floor(v * services.length)));
    setSel((s) => {
      if (s.cur === i) return s;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setSel((x) => ({ ...x, prev: null })), 700);
      return { cur: i, prev: services[s.cur].icon };
    });
  });

  const s = services[sel.cur];
  const core = CORE.includes(s.icon);

  return (
    <section id="services" ref={ref} className="relative scroll-mt-20" style={{ height: `${services.length * 60 + 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container-x grid w-full items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* copy */}
          <div className="relative min-h-[280px]">
            <Eyebrow index="01">Services · {String(sel.cur + 1).padStart(2, "0")} / 10</Eyebrow>
            <AnimatePresence mode="wait">
              <motion.div
                key={s.icon}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -14 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6"
              >
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">{s.title.split(" ").slice(0, -1).join(" ")} <span className="serif-accent text-[1.1em] text-gradient">{s.title.split(" ").at(-1)}</span></h2>
                </div>
                {core && <span className="mt-4 inline-block rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan">Core practice</span>}
                <p className="mt-5 max-w-md text-base leading-relaxed text-mute sm:text-lg">{s.description}</p>
              </motion.div>
            </AnimatePresence>

            {/* progress */}
            <ol className="mt-10 flex flex-wrap gap-2">
              {services.map((x, i) => (
                <li key={x.icon} className={cn("h-1.5 rounded-full transition-all duration-400", i === sel.cur ? "w-8 bg-[linear-gradient(90deg,#38e1ff,#8b5cf6)]" : i < sel.cur ? "w-3 bg-white/40" : "w-3 bg-white/15")} />
              ))}
            </ol>
            <p className="label-mono mt-4 normal-case tracking-normal text-white/40">Scroll to explore</p>
          </div>

          {/* stage */}
          <div className="crystal relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-white/10 bg-ink-2/60 lg:aspect-[4/3]">
            <div className="absolute inset-[15%] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,0.22),transparent_70%)]" aria-hidden />
            <ServiceStage current={s.icon} prev={sel.prev} reduce={!!reduce} />
          </div>
        </div>
      </div>
    </section>
  );
}
