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

/** On phones only the first row is 3D; the rest show icons. */
const LITE_3D = new Set(["FinTech", "E-Commerce", "SaaS", "Healthcare"]);

/**
 * Industries bento: twelve cards, each with its own live 3D vignette
 * rendered through one shared WebGL context. Hover reveals the description.
 */
export function Industries() {
  const reduce = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => industries.map(() => createRef<HTMLDivElement>()), []);
  const lite = useMemo(() => isLiteDevice(), []);
  const near = useInView(container, { margin: "300px 0px" });
  const is3D = (name: string) => !lite || LITE_3D.has(name);

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

      <div ref={container} className="relative mt-14 lg:mt-20">
        <div className="grid auto-rows-[200px] grid-cols-2 gap-3 sm:auto-rows-[230px] sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {industries.map((ind, i) => {
            const Icon = icons[ind.name] ?? Cpu;
            return (
              <motion.article
                key={ind.name}
                ref={refs[i]}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="crystal group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-2/60 transition-colors duration-300 hover:border-white/20"
              >
                <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,0.16),transparent_70%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                {!is3D(ind.name) && (
                  <span className="absolute left-1/2 top-[36%] grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan">
                    <Icon className="size-6" strokeWidth={1.6} />
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-base font-bold tracking-[-0.01em] text-white sm:text-lg">{ind.name}</p>
                    <Icon className="size-4 shrink-0 text-white/35 transition-colors group-hover:text-cyan" strokeWidth={1.6} />
                  </div>
                  <div className={cn("grid transition-[grid-template-rows] duration-500 ease-out", "grid-rows-[0fr] group-hover:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]")}>
                    <p className="overflow-hidden text-[12.5px] leading-snug text-mute">
                      <span className="block pt-1.5">{ind.description}</span>
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {near && (
          <ViewCanvas eventSource={container} lite={lite}>
            {industries.map((ind, i) => {
              if (!is3D(ind.name)) return null;
              const Scene = industryScenes[ind.name];
              return (
                <SceneView key={ind.name} track={refs[i]} cameraZ={6.6} y={0.55} scale={0.74}>
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
