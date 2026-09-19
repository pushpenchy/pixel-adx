"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/content/site";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Template building blocks, in the spirit of ui-layouts.com:
   mesh gradient, stacking cards, image accordion, scroll-word reveal.
   ───────────────────────────────────────────────────────────── */

/** Animated mesh gradient — four drifting radial blobs in the skin's accents. */
export function MeshGradient({ className, strength = 1 }: { className?: string; strength?: number }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} style={{ opacity: strength }}>
      <div className="absolute -left-[10%] -top-[20%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.55),transparent_70%)] blur-3xl animate-blob" />
      <div className="absolute -right-[15%] top-[-10%] h-[80%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--violet-rgb)/0.45),transparent_70%)] blur-3xl animate-blob-slow" />
      <div className="absolute bottom-[-30%] left-[20%] h-[80%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--cyan-rgb)/0.35),transparent_70%)] blur-3xl animate-blob" style={{ animationDelay: "-9s" }} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--bg)/0)_40%,rgb(var(--bg))_100%)]" />
    </div>
  );
}

/** Cards that stack under the previous one as you scroll (ui-layouts "Stacking Card"). */
function StackCard({ i, total, progress, children }: { i: number; total: number; progress: MotionValue<number>; children: ReactNode }) {
  const start = i / total;
  const end = (i + 1) / total;
  const scale = useTransform(progress, [start, end, 1], [1, 0.94, 0.9]);
  // dim (not fade) the cards underneath, so stacked cards never bleed through each other
  const filter = useTransform(progress, [start, end], ["brightness(1)", "brightness(0.55)"]);
  return (
    <motion.div style={{ scale, filter, top: `calc(5.5rem + ${i * 14}px)` }} className="sticky mb-6 origin-top will-change-transform">
      {children}
    </motion.div>
  );
}

export function StackCards({ items, className }: { items: { index: string; title: string; description: string; tag?: string; art?: ReactNode }[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88px", "end end"] });
  return (
    <div ref={ref} className={cn("relative", className)}>
      {items.map((it, i) => (
        <StackCard key={it.title} i={i} total={items.length} progress={scrollYProgress}>
          <article className="crystal grid min-h-[380px] gap-8 overflow-hidden rounded-[2rem] border border-white/10 bg-ink-2 p-7 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:min-h-[440px]">
            <div className="flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <span className="label-mono text-white/45">{it.index}</span>
                {it.tag && <span className="rounded-full border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan">{it.tag}</span>}
              </div>
              <div>
                <h3 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl">{it.title}</h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-mute sm:text-lg">{it.description}</p>
                <a href="#contact" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  Talk about {it.title.toLowerCase()} <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
            <div className="relative min-h-[200px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(ellipse_at_top,rgb(var(--accent-rgb)/0.25),transparent_65%)]">
              <div className="absolute inset-0 bg-grid opacity-40 [--grid-size:32px]" />
              <div className="absolute inset-0 grid place-items-center p-6">{it.art}</div>
            </div>
          </article>
        </StackCard>
      ))}
    </div>
  );
}

/** Horizontal image accordion — hover a panel to expand it (ui-layouts "Image-Accordion"). */
export function ImageAccordion({ items, className }: { items: { index: string; title: string; description: string; art?: ReactNode }[]; className?: string }) {
  return (
    <div className={cn("flex h-[520px] gap-3 max-lg:flex-col max-lg:h-auto", className)}>
      {items.map((it) => (
        <article
          key={it.title}
          className="group relative flex-1 overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-2 transition-[flex-grow] duration-700 ease-[cubic-bezier(.22,1,.36,1)] hover:flex-[3.2] max-lg:min-h-[120px] max-lg:hover:min-h-[360px]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgb(var(--accent-rgb)/0.28),transparent_65%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-grid opacity-30 [--grid-size:28px]" />
          {/* art fades in when expanded */}
          <div className="absolute inset-x-6 top-6 bottom-[42%] grid place-items-center opacity-0 transition-opacity delay-150 duration-500 group-hover:opacity-100">{it.art}</div>
          {/* collapsed: vertical title */}
          <div className="absolute inset-0 flex items-end justify-center p-5 transition-opacity duration-300 group-hover:opacity-0 max-lg:items-center max-lg:justify-start">
            <span className="label-mono rotate-180 text-white/80 [writing-mode:vertical-rl] max-lg:rotate-0 max-lg:[writing-mode:horizontal-tb]">
              {it.index} — {it.title}
            </span>
          </div>
          {/* expanded copy */}
          <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 transition-opacity delay-200 duration-500 group-hover:opacity-100 sm:p-7">
            <span className="label-mono text-white/50">{it.index}</span>
            <h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">{it.title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-mute">{it.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Paragraph that lights up word by word as it scrolls through the viewport. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={cn("flex flex-wrap gap-x-[0.28em] gap-y-1 font-display font-bold leading-[1.15] tracking-[-0.03em] text-white", className)}>
      {words.map((w, i) => (
        <Word key={i} word={w} range={[i / words.length, (i + 1) / words.length]} progress={scrollYProgress} reduce={!!reduce} />
      ))}
    </p>
  );
}
function Word({ word, range, progress, reduce }: { word: string; range: [number, number]; progress: MotionValue<number>; reduce: boolean }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return <motion.span style={reduce ? undefined : { opacity }}>{word}</motion.span>;
}

/** Service list shaped for the blocks above. */
export const serviceItems = services.map((s) => ({ index: s.index, title: s.title, description: s.description, tag: ["adtech", "media", "performance"].includes(s.icon) ? "Core" : undefined }));
