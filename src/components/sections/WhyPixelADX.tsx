"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, staggerItem } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { whyPixelADX } from "@/content/site";

/** Line illustrations drawn with pathLength on scroll. */
const art: Record<string, string[]> = {
  cpu: [
    "M40 40 h80 v80 h-80 z",
    "M60 60 h40 v40 h-40 z",
    "M80 20 v20 M80 120 v20 M20 80 h20 M120 80 h20",
    "M60 20 v20 M100 20 v20 M60 120 v20 M100 120 v20 M20 60 h20 M20 100 h20 M120 60 h20 M120 100 h20",
  ],
  target: [
    "M80 80 m-50 0 a50 50 0 1 0 100 0 a50 50 0 1 0 -100 0",
    "M80 80 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0",
    "M80 80 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0",
    "M140 20 L84 76 M140 20 h-22 M140 20 v22",
  ],
  chart: [
    "M20 130 h120",
    "M30 120 v-30 M55 120 v-50 M80 120 v-38 M105 120 v-70 M130 120 v-88",
    "M25 96 L55 66 L80 78 L105 44 L135 26",
    "M135 26 h-14 M135 26 v14",
  ],
  handshake: [
    "M20 80 C 20 50, 60 50, 80 80 S 140 110, 140 80 S 100 50, 80 80 S 20 110, 20 80",
    "M40 80 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0",
    "M108 80 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0",
  ],
};

export function WhyPixelADX() {
  const reduce = useReducedMotion();

  return (
    <Section id="about">
      <SectionHeading
        eyebrow="Why Pixel ADX"
        title="Built For Growth. Engineered For Scale."
        subtitle="A hybrid of advertising technology, media buying, performance marketing and software engineering — one team, one accountable system."
      />

      <Stagger className="mt-14 grid gap-4 md:grid-cols-2 lg:mt-20" amount={0.15}>
        {whyPixelADX.map((w, i) => (
          <motion.div key={w.title} variants={staggerItem}>
            <SpotlightCard as="article" className="h-full p-7 sm:p-9 lg:min-h-[300px]" lift={8}>
              <div className="relative grid h-full gap-8 lg:grid-cols-[1fr_140px] lg:items-center">
                <div>
                  <span className="font-display text-xs font-bold tracking-[0.2em] text-accent">0{i + 1}</span>
                  <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.025em] text-white sm:text-[1.7rem]">{w.title}</h3>
                  <p className="mt-3 max-w-md text-[15px] leading-relaxed text-mute">{w.description}</p>
                </div>
                <svg viewBox="0 0 160 160" className="h-28 w-28 justify-self-start lg:justify-self-end text-white/80 transition-colors duration-500 group-hover:text-cyan sm:h-36 sm:w-36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {art[w.icon].map((d, k) => (
                    <motion.path
                      key={k}
                      d={d}
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 1.2, delay: 0.2 + k * 0.25, ease: "easeInOut" }}
                    />
                  ))}
                </svg>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </Stagger>
    </Section>
  );
}
