"use client";

import { motion } from "framer-motion";
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
import { Stagger, staggerItem } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { industries } from "@/content/site";

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

export function Industries() {
  return (
    <Section id="industries">
      <SectionHeading
        eyebrow="Industries"
        title="Growth Systems for Every Sector"
        subtitle="Different industries, one approach: technology, media and data working together."
        align="center"
      />

      <Stagger className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:mt-20 lg:grid-cols-4" amount={0.1}>
        {industries.map((ind) => {
          const Icon = icons[ind.name] ?? Cpu;
          return (
            <motion.div key={ind.name} variants={staggerItem}>
              <SpotlightCard className="h-full min-h-[170px] p-5 sm:min-h-[200px] sm:p-6" lift={5} tilt>
                <div className="relative flex h-full flex-col">
                  <span className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-white/80 transition-all duration-500 group-hover:border-cyan/50 group-hover:bg-cyan/10 group-hover:text-cyan">
                    <Icon className="size-[18px] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-auto pt-6 font-display text-base font-bold tracking-[-0.01em] text-white sm:text-lg">
                    {ind.name}
                  </h3>
                  {/* description reveals on hover (always visible on touch via max-h) */}
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
                    <p className="overflow-hidden text-[13px] leading-snug text-mute">
                      <span className="block pt-2">{ind.description}</span>
                    </p>
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
