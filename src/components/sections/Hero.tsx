"use client";

import dynamic from "next/dynamic";
import { useRef, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Activity, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { brand } from "@/content/site";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const HeroVisual = dynamic(() => import("./HeroVisual").then((m) => m.HeroVisual), { ssr: false });

// WebGL capability, evaluated once on the client; server snapshot says "no" so SSR stays static.
let webglCache: boolean | null = null;
const hasWebGL = () => {
  if (webglCache === null) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
};
const noop = () => () => {};

const ease = [0.22, 1, 0.36, 1] as const;

const cards = [
  { icon: Zap, label: "Campaign Active", sub: "Live", style: "left-[4%] top-[14%]", delay: 0, dot: true },
  { icon: TrendingUp, label: "ROAS", sub: "Optimizing", style: "right-[2%] top-[22%]", delay: 1.4 },
  { icon: Activity, label: "Real-Time Analytics", sub: "Streaming", style: "left-[10%] bottom-[16%]", delay: 0.8 },
];

export function Hero() {
  const reduce = useReducedMotion();
  const webgl = useSyncExternalStore(noop, hasWebGL, () => false);
  const ref = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneInView = useInView(sceneRef, { margin: "200px 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const yScene = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0.15]);

  const [l1, l2, l3] = brand.coreMessage; // "We Build Technology." / "We Buy Attention." / "We Drive Growth."
  const split = (s: string) => {
    const words = s.split(" ");
    return [words.slice(0, -1).join(" "), words.at(-1)!] as const;
  };
  const [l2a, l2b] = split(l2);
  const [l3a, l3b] = split(l3);

  return (
    <section id="home" ref={ref} className="relative min-h-[100svh] overflow-hidden pt-28 sm:pt-32 lg:pt-0">
      {/* 3D scene — right on desktop, behind copy on mobile */}
      <motion.div
        ref={sceneRef}
        style={{ y: yScene }}
        className="pointer-events-none absolute inset-x-0 top-24 h-[52vh] sm:top-16 sm:h-[60vh] lg:inset-y-0 lg:left-[42%] lg:right-[-6%] lg:h-auto"
        aria-hidden
      >
        <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,var(--blob-a)),transparent_70%)]" />
        {webgl ? (
          <HeroScene active={sceneInView} reduce={!!reduce} />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6">
            <HeroVisual />
          </div>
        )}

        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.1 + i * 0.15, duration: 0.7, ease }}
            className={`absolute hidden sm:block ${c.style}`}
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
              className="glass flex items-center gap-2.5 rounded-xl px-3 py-2"
            >
              <span className="grid size-7 place-items-center rounded-lg bg-white/[0.06] text-cyan">
                <c.icon className="size-3.5" />
              </span>
              <span className="leading-tight">
                <span className="block text-[12px] font-semibold text-white">{c.label}</span>
                <span className="flex items-center gap-1.5 text-[10.5px] text-white/50">
                  {c.dot && <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_1px_rgba(52,211,153,0.7)]" />}
                  {c.sub}
                </span>
              </span>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Copy */}
      <div className="container-x relative flex min-h-[100svh] flex-col justify-end pb-16 pt-[52vh] sm:pt-[60vh] lg:justify-center lg:py-32 lg:pt-40">
        <motion.div style={{ y: yText, opacity: fade }} className="relative max-w-[46rem]">
          <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <Eyebrow index="00">AdTech &amp; Digital Technology · Bangladesh</Eyebrow>
          </motion.div>

          <h1 className="mt-7 font-display text-[3rem] font-extrabold leading-[0.96] tracking-[-0.045em] text-white sm:text-[4.4rem] lg:text-[5.2rem] xl:text-[6rem]">
            {[
              <span key="1">{l1}</span>,
              <span key="2">
                <span className="text-outline">{l2a}</span>{" "}
                <span className="serif-accent text-[1.1em] text-gradient">{l2b}</span>
              </span>,
              <span key="3">
                {l3a} <span className="text-outline-thin">{l3b}</span>
              </span>,
            ].map((node, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: "108%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.13, ease }}
                >
                  {node}
                </motion.span>
              </span>
            ))}
          </h1>

          <div className="mt-9 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease }}
              className="max-w-md text-base leading-relaxed text-mute sm:text-[17px]"
            >
              {brand.description}
            </motion.p>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href="#contact" size="lg">
              Start a Project
            </Button>
            <Button href="#services" size="lg" variant="secondary" arrow={false}>
              Explore Our Services
            </Button>
          </motion.div>
        </motion.div>

        {/* scroll cue + tagline, bottom row */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-14 flex items-end justify-between gap-6 lg:absolute lg:inset-x-[max(1.25rem,calc((100%-80rem)/2+3rem))] lg:bottom-8 lg:mt-0"
        >
          <span className="label-mono hidden items-center gap-3 sm:inline-flex">
            <span className="relative h-10 w-px overflow-hidden bg-white/15">
              <motion.span
                aria-hidden
                animate={reduce ? undefined : { y: ["-100%", "100%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 top-0 h-1/2 bg-white/80"
              />
            </span>
            Scroll
          </span>
          <span className="label-mono text-right">{brand.tagline}</span>
        </motion.div>
      </div>
    </section>
  );
}
