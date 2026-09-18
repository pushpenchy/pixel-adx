"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/Section";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { caseStudies, type Hue } from "@/content/site";

const hueBg: Record<Hue, string> = {
  blue: "from-[#4d7cfe]/30 via-[#141d3f] to-[#0a0b10]",
  cyan: "from-[#38e1ff]/25 via-[#0f2a36] to-[#0a0b10]",
  violet: "from-[#8b5cf6]/30 via-[#221744] to-[#0a0b10]",
};
const hueGlow: Record<Hue, string> = {
  blue: "rgba(77,124,254,0.45)",
  cyan: "rgba(56,225,255,0.35)",
  violet: "rgba(139,92,246,0.45)",
};

/**
 * Project card: a browser-frame mockup of the site (crisp 2× capture) with a
 * phone mockup floating over its corner, on a tinted stage; copy sits on a
 * solid panel below so nothing overlaps the artwork.
 */
function ProjectCard({ p, index }: { p: (typeof caseStudies)[number]; index: number }) {
  const host = p.href ? p.href.replace(/^https?:\/\//, "").replace(/\/$/, "") : "coming-soon";
  return (
    <SpotlightCard as="article" className="h-full w-full rounded-xl3" lift={0}>
      <a href={p.href ?? "#contact"} target={p.href ? "_blank" : undefined} rel={p.href ? "noopener noreferrer" : undefined} className="flex h-full flex-col overflow-hidden rounded-[inherit]">
        {/* ── stage with browser mockup */}
        <div className={`relative min-h-0 flex-1 overflow-hidden bg-gradient-to-br ${hueBg[p.hue]}`}>
          <div aria-hidden className="absolute inset-0 bg-grid opacity-30 [--grid-size:36px] mask-radial" />
          <div aria-hidden className="absolute left-1/2 top-[65%] h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-70 transition-opacity duration-700 group-hover:opacity-100" style={{ background: `radial-gradient(closest-side, ${hueGlow[p.hue]}, transparent)` }} />

          <div className="absolute inset-x-7 top-6 bottom-0 flex flex-col rounded-t-2xl border border-white/12 bg-[#0b0d16] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2 sm:inset-x-10 sm:top-9">
            {/* chrome */}
            <div className="flex h-9 shrink-0 items-center gap-3 border-b border-white/10 px-3.5">
              <span className="flex gap-1.5">
                <i className="size-2.5 rounded-full bg-[#ff5f57]" />
                <i className="size-2.5 rounded-full bg-[#febc2e]" />
                <i className="size-2.5 rounded-full bg-[#28c840]" />
              </span>
              <span className="flex h-6 flex-1 items-center justify-center rounded-md bg-white/[0.05] text-[11px] tracking-wide text-white/45">{host}</span>
            </div>
            {/* page */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={`${p.name} — website`}
                  fill
                  quality={90}
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="object-cover object-top transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.025]"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_60%)]">
                  <div className="absolute inset-0 bg-grid opacity-30 [--grid-size:28px]" />
                  <div className="flex flex-col items-center gap-2 text-white/30">
                    <ImageIcon className="size-7" strokeWidth={1.4} />
                    <span className="text-[11px] font-medium uppercase tracking-[0.2em]">Image / video placeholder</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* floating handset, overlapping the browser's corner */}
          {p.mobile && (
            <div
              className="absolute -bottom-[7%] right-5 w-[23%] min-w-[118px] max-w-[188px] rounded-[1.7rem] border-[5px] border-[#171a26] bg-[#05060a] shadow-[0_34px_70px_-22px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.09)] transition-transform delay-75 duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-4 sm:right-8"
              style={{ aspectRatio: "430 / 932" }}
            >
              <div aria-hidden className="absolute left-1/2 top-[1.6%] z-10 h-[2.6%] w-[34%] -translate-x-1/2 rounded-full bg-[#171a26]" />
              <div className="absolute inset-0 overflow-hidden rounded-[1.35rem]">
                <Image src={p.mobile} alt="" fill quality={90} sizes="190px" className="object-cover object-top" />
              </div>
            </div>
          )}
        </div>

        {/* ── copy */}
        <div className="relative shrink-0 border-t border-white/10 bg-ink-2/80 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">{p.category}</span>
            <span className="label-mono text-white/40">{p.year ?? `0${index + 1}`}</span>
          </div>
          {p.client && <p className="label-mono mt-4 text-white/45">{p.client}</p>}
          <h3 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.025em] text-white sm:text-[1.75rem]">{p.name}</h3>
          <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-mute">{p.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {[...p.services, ...p.technology].map((t) => (
              <span key={t} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-white/60">
                {t}
              </span>
            ))}
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
            {p.href ? "Visit live site" : "View case study"}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </a>
    </SpotlightCard>
  );
}

export function CaseStudies() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Measure the track only after the horizontal layout has rendered.
  useEffect(() => {
    if (!desktop || !trackRef.current) {
      setDistance(0);
      return;
    }
    const el = trackRef.current;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [desktop]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const horizontal = desktop && !reduce;

  return (
    <section id="work" className="relative scroll-mt-20">
      <div ref={ref} style={horizontal ? { height: `calc(100vh + ${distance}px)` } : undefined}>
        <div className={horizontal ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-16 sm:py-28"}>
          <div className="container-x">
            <SectionHeading
              index="08"
              eyebrow="Work"
              title="Selected"
              accent="work."
              subtitle="Recent projects. Placeholders stay until each client signs off on being shown."
            />
          </div>

          <motion.div
            ref={trackRef}
            style={horizontal ? { x } : undefined}
            className={
              horizontal
                ? "mt-10 flex w-max gap-6 pl-[max(1.25rem,calc((100vw-80rem)/2+3rem))] pr-12 will-change-transform"
                : "container-x mt-10 grid gap-5 md:grid-cols-2"
            }
          >
            {caseStudies.map((p, i) => (
              <div key={p.name} className={horizontal ? "h-[76vh] max-h-[720px] min-h-[560px] w-[min(70vw,820px)] shrink-0" : "flex h-[560px] sm:h-[600px]"}>
                <ProjectCard p={p} index={i} />
              </div>
            ))}
            {horizontal && <div className="w-[10vw] shrink-0" aria-hidden />}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
