"use client";

import { useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import {
  ArrowUpRight,
  Radar,
  Megaphone,
  Target,
  Braces,
  Globe,
  Smartphone,
  PenTool,
  ShoppingBag,
  BarChart3,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { services, type ServiceIcon } from "@/content/site";
import { cn } from "@/lib/utils";

const icons: Record<ServiceIcon, LucideIcon> = {
  adtech: Radar,
  media: Megaphone,
  performance: Target,
  software: Braces,
  web: Globe,
  mobile: Smartphone,
  uiux: PenTool,
  ecommerce: ShoppingBag,
  data: BarChart3,
  automation: Workflow,
};

const tints = ["#38e1ff", "#4d7cfe", "#8b5cf6", "#22d3ee", "#6d8cff", "#a78bfa", "#38e1ff", "#4d7cfe", "#8b5cf6", "#6d8cff"];

/**
 * Editorial numbered list: index / title / description / arrow rows with a
 * hairline between them. On desktop a tilted preview card follows the cursor
 * over the hovered row — the "3D" moment for this section.
 */
export function Services() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 220, damping: 26, mass: 0.5 });
  const rot = useSpring(useMotionValue(0), { stiffness: 160, damping: 20 });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
    rot.set(((e.clientX - r.left) / r.width - 0.5) * 14);
  };

  return (
    <Section id="services">
      <SectionHeading
        index="02"
        eyebrow="Services"
        title="Everything your digital growth"
        accent="needs."
        subtitle="From advertising infrastructure to software engineering, Pixel ADX connects technology, media and growth."
      />

      <div
        className="relative mt-16 lg:mt-24"
        onMouseMove={onMove}
        onMouseLeave={() => setActive(null)}
      >
        <ol className="hairline">
          {services.map((s, i) => {
            const Icon = icons[s.icon];
            const isActive = active === i;
            return (
              <motion.li
                key={s.title}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setActive(i)}
                className="group relative border-b border-white/10"
              >
                <a
                  href="#contact"
                  className={cn(
                    "grid items-center gap-x-6 gap-y-3 py-6 transition-colors duration-300 sm:py-7 lg:grid-cols-[4rem_1fr_1.1fr_3rem] lg:py-8",
                    isActive ? "text-white" : "text-white/85"
                  )}
                >
                  <span className="label-mono text-white/45 lg:pt-1">{s.index}</span>
                  <h3 className="font-display text-[1.65rem] font-bold leading-none tracking-[-0.03em] sm:text-3xl lg:text-4xl">
                    <span className="relative inline-block">
                      {s.title}
                      <span
                        aria-hidden
                        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[linear-gradient(90deg,#38e1ff,#8b5cf6)] transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100"
                      />
                    </span>
                  </h3>
                  <p className="max-w-md text-[15px] leading-relaxed text-mute lg:justify-self-end lg:text-right">{s.description}</p>
                  <span className="hidden size-11 place-items-center justify-self-end rounded-full border border-white/12 text-white/60 transition-all duration-400 group-hover:rotate-45 group-hover:border-white/40 group-hover:bg-white/[0.06] group-hover:text-white lg:grid">
                    <ArrowUpRight className="size-4" />
                  </span>
                </a>
                {/* mobile: icon chip */}
                <Icon className="absolute right-0 top-7 size-5 text-white/30 lg:hidden" strokeWidth={1.6} />
              </motion.li>
            );
          })}
        </ol>

        {/* cursor-following 3D preview (desktop, fine pointer) */}
        <AnimatePresence>
          {active !== null && !reduce && (
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.85, rotateX: 12 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ x: sx, y: sy, rotateY: rot, transformPerspective: 900 }}
              className="pointer-events-none absolute left-0 top-0 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
            >
              <div
                className="glass glass-flat w-56 rounded-2xl p-5"
                style={{ boxShadow: `0 30px 80px -30px ${tints[active]}aa, inset 0 1px 0 rgba(255,255,255,.4)` }}
              >
                <div
                  className="grid size-12 place-items-center rounded-xl text-pure-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]"
                  style={{ background: `linear-gradient(135deg, ${tints[active]}, ${tints[(active + 2) % tints.length]})` }}
                >
                  {(() => {
                    const I = icons[services[active].icon];
                    return <I className="size-5" strokeWidth={1.9} />;
                  })()}
                </div>
                <p className="mt-4 font-display text-lg font-bold leading-tight text-white">{services[active].title}</p>
                <p className="label-mono mt-2">Service {services[active].index} / 10</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
