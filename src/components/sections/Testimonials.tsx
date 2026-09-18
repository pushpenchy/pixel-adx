"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { testimonials } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Testimonial carousel — placeholders only (see src/content/site.ts).
 * Auto-advances every 6s, pauses on hover, supports swipe/drag.
 */
export function Testimonials() {
  const reduce = useReducedMotion();
  const [[index, dir], setIndex] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const n = testimonials.length;

  const go = useCallback(
    (d: number) => setIndex(([i]) => [((i + d) % n + n) % n, d]),
    [n]
  );

  useEffect(() => {
    if (paused || reduce) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, reduce, go]);

  const t = testimonials[index];

  return (
    <Section id="testimonials">
      <SectionHeading index="11" eyebrow="Testimonials" title="What partners" accent="say." align="center" />

      <Reveal className="mx-auto mt-14 max-w-4xl" delay={0.1}>
        <div
          className="relative overflow-hidden rounded-xl3 card-surface crystal px-6 py-12 sm:px-14 sm:py-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-accent/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-violet/15 blur-3xl" />
          <Quote className="absolute left-6 top-6 size-10 text-white/10 sm:left-10 sm:top-10" />

          <div className="relative min-h-[180px]">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.figure
                key={index}
                custom={dir}
                initial={reduce ? false : { opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                drag={reduce ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                className="cursor-grab text-center active:cursor-grabbing"
              >
                <blockquote className="font-display text-2xl font-semibold leading-snug tracking-[-0.02em] text-white sm:text-3xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8">
                  <div className="mx-auto mb-3 size-12 rounded-full bg-[linear-gradient(135deg,#38e1ff,#4d7cfe,#8b5cf6)] p-px">
                    <div className="grid h-full w-full place-items-center rounded-full bg-ink text-sm font-bold text-white">
                      {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                  </div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-sm text-mute">{t.role}</p>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="relative mt-10 flex items-center justify-center gap-4">
            <button
              aria-label="Previous testimonial"
              onClick={() => go(-1)}
              className="glass liquid-press grid size-10 place-items-center rounded-full text-white/70 hover:text-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setIndex([i, i > index ? 1 : -1])}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-400",
                    i === index ? "w-7 bg-[linear-gradient(90deg,#38e1ff,#8b5cf6)]" : "w-1.5 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
            <button
              aria-label="Next testimonial"
              onClick={() => go(1)}
              className="glass liquid-press grid size-10 place-items-center rounded-full text-white/70 hover:text-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
