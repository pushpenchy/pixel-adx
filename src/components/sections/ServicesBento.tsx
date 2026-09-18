"use client";

import { createRef, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Radar, Megaphone, Target, Braces, Globe, Smartphone, PenTool, ShoppingBag, BarChart3, Workflow, type LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { services, type ServiceIcon } from "@/content/site";
import { miniScenes } from "@/components/three/services/MiniScenes";
import { SceneView, ViewCanvas } from "@/components/three/ViewCanvas";
import { isLiteDevice } from "@/lib/quality";
import { cn } from "@/lib/utils";

const CORE: ServiceIcon[] = ["adtech", "media", "performance"];
const icons: Record<ServiceIcon, LucideIcon> = { adtech: Radar, media: Megaphone, performance: Target, software: Braces, web: Globe, mobile: Smartphone, uiux: PenTool, ecommerce: ShoppingBag, data: BarChart3, automation: Workflow };

/**
 * Concept B — "Bento": every service is a card with its own live 3D
 * vignette. One WebGL context renders all of them through drei <View>
 * (scissored per card; off-screen cards are skipped). On lite devices only
 * the three core cards are 3D; the rest show icons.
 */
export function ServicesBento() {
  const reduce = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => services.map(() => createRef<HTMLDivElement>()), []);
  const lite = useMemo(() => isLiteDevice(), []);
  // drei <View> measures cards against the canvas size in viewport coordinates,
  // so the canvas must be a fixed full-window layer. Mount it only while the
  // grid is near the viewport.
  const near = useInView(container, { margin: "300px 0px" });

  const is3D = (id: ServiceIcon) => !lite || CORE.includes(id);

  return (
    <Section id="services">
      <SectionHeading index="01" eyebrow="Services" title="Everything your digital growth" accent="needs." subtitle="Advertising is our core — AdTech, media buying and performance. Around it we build the software, products and data that make growth compound." />

      <div ref={container} className="relative mt-14 lg:mt-20">
        <div className="grid auto-rows-[190px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:gap-4 lg:grid-cols-4">
          {services.map((s, i) => {
            const core = CORE.includes(s.icon);
            const Icon = icons[s.icon];
            const span = s.icon === "adtech" ? "col-span-2 row-span-2" : s.icon === "media" ? "col-span-2" : "";
            return (
              <motion.article
                key={s.title}
                ref={refs[i]}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className={cn("crystal group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-2/60", span)}
              >
                <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.16),transparent_70%)]" aria-hidden />
                {!is3D(s.icon) && (
                  <span className="absolute left-1/2 top-[38%] grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan">
                    <Icon className="size-6" strokeWidth={1.6} />
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                  <div className="min-w-0">
                    <span className="label-mono text-white/45">{s.index}</span>
                    <p className={cn("mt-1 font-display font-bold tracking-[-0.02em] text-white", s.icon === "adtech" ? "text-2xl sm:text-3xl" : "text-base sm:text-lg")}>{s.title}</p>
                    {(s.icon === "adtech" || s.icon === "media") && <p className="mt-1 hidden max-w-sm text-sm text-mute sm:block">{s.description}</p>}
                  </div>
                  {core ? (
                    <span className="shrink-0 rounded-full border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan">Core</span>
                  ) : (
                    <ArrowUpRight className="size-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        {near && (
          <ViewCanvas eventSource={container} lite={lite}>
            {services.map((s, i) => {
              if (!is3D(s.icon)) return null;
              const Scene = miniScenes[s.icon];
              const big = s.icon === "adtech";
              return (
                <SceneView key={s.icon} track={refs[i]} cameraZ={big ? 7.8 : 6.8} fit={big ? { w: 0.8, h: 0.62, y: 0.08 } : undefined}>
                  <Scene reduce={!!reduce} />
                </SceneView>
              );
            })}
          </ViewCanvas>
        )}
      </div>
    </Section>
  );
}
