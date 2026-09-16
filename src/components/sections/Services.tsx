"use client";

import { motion } from "framer-motion";
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
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Stagger, staggerItem } from "@/components/ui/Reveal";
import { services, type ServiceIcon } from "@/content/site";

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

export function Services() {
  return (
    <Section id="services">
      <SectionHeading
        eyebrow="Services"
        title="Everything Your Digital Growth Needs"
        subtitle="From advertising infrastructure to software engineering, Pixel ADX connects technology, media and growth."
      />

      <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 xl:grid-cols-5" amount={0.1}>
        {services.map((s, i) => {
          const Icon = icons[s.icon];
          const wide = i < 2; // first two cards span wider on xl for hierarchy
          return (
            <motion.div key={s.title} variants={staggerItem} className={wide ? "xl:col-span-2" : ""}>
              <SpotlightCard as="article" className="h-full p-6 sm:p-7" lift={8}>
                {/* moving gradient wash */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-700 group-hover:opacity-100 bg-[linear-gradient(120deg,rgba(56,225,255,0.10),rgba(77,124,254,0.10),rgba(139,92,246,0.10))] bg-[length:200%_200%] animate-gradient"
                />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/85 transition-all duration-500 group-hover:border-accent/50 group-hover:bg-accent/15 group-hover:text-white group-hover:shadow-[0_0_24px_-4px_rgba(77,124,254,0.7)]">
                      <Icon className="size-5 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" strokeWidth={1.8} />
                    </span>
                    <span className="font-display text-sm font-bold tracking-wider text-white/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent">
                      {s.index}
                    </span>
                  </div>
                  <h3 className="mt-7 font-display text-xl font-bold tracking-[-0.02em] text-white">{s.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-mute">{s.description}</p>
                  <div className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors duration-300 group-hover:text-white">
                      Learn more
                      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </Stagger>
    </Section>
  );
}
