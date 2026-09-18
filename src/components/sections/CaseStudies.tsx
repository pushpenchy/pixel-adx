"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/Section";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { caseStudies, type Hue } from "@/content/site";

const hueBg: Record<Hue, string> = {
  blue: "from-[#4d7cfe]/40 via-[#1b2a5c] to-[#0a0b10]",
  cyan: "from-[#38e1ff]/35 via-[#12384a] to-[#0a0b10]",
  violet: "from-[#8b5cf6]/40 via-[#2a1b5c] to-[#0a0b10]",
};

function ProjectCard({ p, index }: { p: (typeof caseStudies)[number]; index: number }) {
  return (
    <SpotlightCard as="article" className="h-full w-full rounded-xl3" lift={0}>
      <a href="#contact" className="block h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[inherit]">
          {/* image / video placeholder */}
          <div className={`absolute inset-0 bg-gradient-to-br ${hueBg[p.hue]} transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]`}>
            <div className="absolute inset-0 bg-grid opacity-40 [--grid-size:40px]" />
            <div className="absolute left-1/2 top-[30%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-white/30">
              <ImageIcon className="size-8" strokeWidth={1.4} />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em]">Image / Video placeholder</span>
            </div>
          </div>
          {/* overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--bg)/0)_20%,rgb(var(--bg)/0.55)_60%,rgb(var(--bg)/0.92)_100%)] transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/25" />

          {/* content */}
          <div className="relative flex flex-1 flex-col justify-between p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-white/15 bg-ink/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur">
                {p.category}
              </span>
              <span className="font-display text-sm font-bold text-white/40">0{index + 1}</span>
            </div>

            <div className="transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-2">
              <h3 className="font-display text-2xl font-bold tracking-[-0.025em] text-white sm:text-3xl">{p.name}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">{p.description}</p>
              <div className="mt-4 grid gap-1.5 text-[12px] sm:grid-cols-2">
                <p className="text-white/50">
                  <span className="text-white/35">Technology · </span>
                  {p.technology.join(", ")}
                </p>
                <p className="text-white/50">
                  <span className="text-white/35">Services · </span>
                  {p.services.join(", ")}
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                View Case Study
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
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
        <div className={horizontal ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "py-24 sm:py-28"}>
          <div className="container-x">
            <SectionHeading
              index="08"
              eyebrow="Work"
              title="Selected"
              accent="work."
              subtitle="Placeholders shown — swap in approved client projects, imagery and results."
            />
          </div>

          <motion.div
            ref={trackRef}
            style={horizontal ? { x } : undefined}
            className={
              horizontal
                ? "mt-12 flex w-max gap-6 pl-[max(1.25rem,calc((100vw-80rem)/2+3rem))] pr-12 will-change-transform"
                : "container-x mt-12 grid gap-5 md:grid-cols-2"
            }
          >
            {caseStudies.map((p, i) => (
              <div key={p.name} className={horizontal ? "h-[62vh] max-h-[560px] w-[min(72vw,760px)] shrink-0" : "flex min-h-[460px]"}>
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
