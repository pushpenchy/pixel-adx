"use client";

import { createRef, useMemo, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Landmark,
  ShoppingCart,
  Cloud,
  HeartPulse,
  GraduationCap,
  Building2,
  Store,
  Clapperboard,
  Plane,
  Cpu,
  Rocket,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { industries } from "@/content/site";
import { industryScenes } from "@/components/three/industries/IndustryScenes";
import { SceneView, ViewCanvas } from "@/components/three/ViewCanvas";
import { isLiteDevice } from "@/lib/quality";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  FinTech: Landmark,
  "E-Commerce": ShoppingCart,
  SaaS: Cloud,
  Healthcare: HeartPulse,
  Education: GraduationCap,
  "Real Estate": Building2,
  Retail: Store,
  Media: Clapperboard,
  Travel: Plane,
  Technology: Cpu,
  Startups: Rocket,
  "Professional Services": Briefcase,
};

/**
 * Industries bento: twelve cards, each with its own live 3D vignette
 * rendered through one shared WebGL context. Hover reveals the description.
 *
 * Layering: the shared canvas is a fixed layer above the card surfaces
 * (z-10), so the card itself must not create a stacking context — the glass
 * surface is an inner element, and the label sits above the canvas (z-20)
 * over a soft scrim so a vignette can never hide the text.
 */
export function Industries() {
  const reduce = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => industries.map(() => createRef<HTMLDivElement>()), []);
  const lite = useMemo(() => isLiteDevice(), []);
  const near = useInView(container, { margin: "300px 0px" });

  return (
    <Section id="industries">
      <SectionHeading
        index="06"
        eyebrow="Industries"
        title="Growth systems for"
        accent="every sector."
        subtitle="Different industries, one approach: technology, media and data working together."
        align="center"
      />

      <div ref={container} className="relative mt-10 sm:mt-14 lg:mt-20">
        <div className="grid auto-rows-[215px] grid-cols-2 gap-3 sm:auto-rows-[230px] sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {industries.map((ind, i) => {
            const Icon = icons[ind.name] ?? Cpu;
            return (
              <article key={ind.name} ref={refs[i]} className="group relative rounded-[1.25rem] sm:rounded-[1.5rem]">
                {/* glass surface (animates in; sits under the canvas) */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="crystal absolute inset-0 overflow-hidden rounded-[inherit] border border-white/10 bg-ink-2/60 transition-colors duration-300 group-hover:border-white/20"
                  aria-hidden
                >
                  <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,0.16),transparent_70%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                </motion.div>
                {/* scrim keeps the label legible where a vignette reaches the bottom */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[48%] rounded-b-[inherit] bg-[linear-gradient(to_top,rgba(7,9,18,0.88),rgba(7,9,18,0.42)_48%,transparent)]" aria-hidden />
                {/* label, above the canvas */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-base font-bold tracking-[-0.01em] text-white sm:text-lg">{ind.name}</p>
                    <Icon className="size-4 shrink-0 text-white/35 transition-colors group-hover:text-cyan" strokeWidth={1.6} />
                  </div>
                  <div className={cn("hidden transition-[grid-template-rows] duration-500 ease-out sm:grid", "grid-rows-[0fr] group-hover:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]")}>
                    <p className="overflow-hidden text-[12.5px] leading-snug text-mute">
                      <span className="block pt-1.5">{ind.description}</span>
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {near && (
          <ViewCanvas eventSource={container} lite={lite}>
            {industries.map((ind, i) => {
              const Scene = industryScenes[ind.name];
              return (
                <SceneView key={ind.name} track={refs[i]} cameraZ={6.6} fit={{ w: 0.8, h: 0.56, y: 0.15, max: 1.2 }}>
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
