"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { whyPixelADX } from "@/content/site";

/** Line illustrations drawn with pathLength on scroll. */
const art: Record<string, string[]> = {
  cpu: ["M40 40 h80 v80 h-80 z", "M60 60 h40 v40 h-40 z", "M80 20 v20 M80 120 v20 M20 80 h20 M120 80 h20", "M60 20 v20 M100 20 v20 M60 120 v20 M100 120 v20 M20 60 h20 M20 100 h20 M120 60 h20 M120 100 h20"],
  target: ["M80 80 m-50 0 a50 50 0 1 0 100 0 a50 50 0 1 0 -100 0", "M80 80 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0", "M80 80 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0", "M140 20 L84 76 M140 20 h-22 M140 20 v22"],
  chart: ["M20 130 h120", "M30 120 v-30 M55 120 v-50 M80 120 v-38 M105 120 v-70 M130 120 v-88", "M25 96 L55 66 L80 78 L105 44 L135 26", "M135 26 h-14 M135 26 v14"],
  handshake: ["M20 80 C 20 50, 60 50, 80 80 S 140 110, 140 80 S 100 50, 80 80 S 20 110, 20 80", "M40 80 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0", "M108 80 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0"],
};

const tints = ["#38e1ff", "#4d7cfe", "#8b5cf6", "#22d3ee"];

/**
 * Sticky stacking cards: each card pins under the previous one and scales
 * back slightly as the next arrives — a depth effect without WebGL.
 */
export function WhyPixelADX() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end end"] });

  return (
    <Section id="about">
      <SectionHeading
        index="08"
        eyebrow="Why Pixel ADX"
        title="Built for growth."
        accent="Engineered for scale."
        subtitle="A hybrid of advertising technology, media buying, performance marketing and software engineering — one team, one accountable system."
      />

      <div ref={ref} className="relative mt-16 lg:mt-24">
        {whyPixelADX.map((w, i) => (
          <StackCard key={w.title} index={i} total={whyPixelADX.length} progress={scrollYProgress} reduce={!!reduce} w={w} />
        ))}
      </div>
    </Section>
  );
}

function StackCard({
  index,
  total,
  progress,
  reduce,
  w,
}: {
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduce: boolean;
  w: (typeof whyPixelADX)[number];
}) {
  // each card scales down as the following cards stack on top
  const start = index / total;
  const end = (index + 1) / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - 1 - index) * 0.045]);
  const y = useTransform(progress, [start, end], [0, 0]);
  const dim = useTransform(progress, [end, 1], [0, index === total - 1 ? 0 : 0.35]);

  return (
    <motion.article
      style={reduce ? undefined : { scale, y, top: `calc(6rem + ${index * 1.25}rem)` }}
      className="sticky mb-6 origin-top"
    >
      <div
        className="crystal relative overflow-hidden rounded-[2rem] border border-white/10 bg-ink-2 p-8 sm:p-12 lg:p-14"
        style={{ background: `linear-gradient(135deg, ${tints[index]}14, rgb(var(--bg)) 55%)` }}
      >
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink" />
        <div className="grid gap-10 lg:grid-cols-[1fr_260px] lg:items-center">
          <div>
            <div className="flex items-center gap-4">
              <span className="label-mono text-white/60">( 0{index + 1} )</span>
              <span className="h-px flex-1 max-w-24 bg-white/15" />
            </div>
            <h3 className="mt-6 font-display text-3xl font-extrabold tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.6rem] lg:leading-[1]">
              {w.title.split(" ").slice(0, -1).join(" ")} <span className="serif-accent text-[1.1em]" style={{ color: tints[index] }}>{w.title.split(" ").at(-1)}</span>
            </h3>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-mute sm:text-lg">{w.description}</p>
          </div>
          <svg viewBox="0 0 160 160" className="h-40 w-40 justify-self-start lg:h-60 lg:w-60 lg:justify-self-end" fill="none" stroke={tints[index]} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {art[w.icon].map((d, k) => (
              <motion.path
                key={k}
                d={d}
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.2, delay: 0.2 + k * 0.25, ease: "easeInOut" }}
              />
            ))}
          </svg>
        </div>
      </div>
    </motion.article>
  );
}
