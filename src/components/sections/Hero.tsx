"use client";

import dynamic from "next/dynamic";
import { useRef, useSyncExternalStore } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { brand, heroScene } from "@/content/site";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSkin } from "@/lib/skin";
import { OrbitBadge, SkinBackdrop } from "@/components/hero/Backdrops";
import { cn } from "@/lib/utils";

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

/**
 * Hero. Two layouts, chosen by the active skin (src/lib/skin.ts):
 *  - split: copy left, 3D deck right (behind the copy on phones)
 *  - centered: skin backdrop, centred headline, deck as a wide band below
 */
export function Hero() {
  const reduce = useReducedMotion();
  const { theme } = useTheme();
  const { skin, layout } = useSkin();
  const centered = layout === "centered";
  const poster = skin === "mono";
  const webgl = useSyncExternalStore(noop, hasWebGL, () => false);
  const ref = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
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

  const scene = webgl ? (
    <HeroScene scene={heroScene} reduce={!!reduce} light={theme === "light"} />
  ) : (
    <div className="absolute inset-0 grid place-items-center p-6">
      <HeroVisual />
    </div>
  );

  const headline = (
    <h1
      className={cn(
        "mt-6 font-display font-extrabold leading-[0.98] tracking-[-0.045em] text-white",
        centered ? "mx-auto max-w-6xl text-[2.6rem] sm:text-[4.4rem] lg:text-[5.4rem] xl:text-[6rem]" : "text-[2.45rem] sm:text-[4.4rem] lg:text-[5.2rem] xl:text-[6rem]",
        poster && "uppercase tracking-[-0.03em]"
      )}
    >
      {[
        <span key="1">{l1}</span>,
        <span key="2">
          <span className="text-outline">{l2a}</span>{" "}
          <span className={cn("text-gradient", poster ? "font-display" : "serif-accent text-[1.1em]")}>{l2b}</span>
        </span>,
        <span key="3">
          {l3a} <span className="text-outline-thin">{l3b}</span>
        </span>,
      ].map((node, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span className="block" initial={reduce ? false : { y: "108%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.15 + i * 0.13, ease }}>
            {node}
          </motion.span>
        </span>
      ))}
    </h1>
  );

  const copy = (
    <motion.div style={{ y: yText, opacity: fade }} className={cn("relative", centered ? "flex flex-col items-center text-center" : "max-w-[46rem]")}>
      <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <Eyebrow index="00">
          <span className="hidden sm:inline">AdTech &amp; Digital Technology · Bangladesh</span>
          <span className="sm:hidden">AdTech &amp; Digital</span>
        </Eyebrow>
      </motion.div>

      {headline}

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease }}
        className={cn("mt-9 text-base leading-relaxed text-mute sm:text-[17px]", centered ? "max-w-lg [text-shadow:0_1px_12px_rgb(var(--bg)/0.9)]" : "max-w-md")}
      >
        {brand.description}
      </motion.p>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.75, ease }}
        className={cn("mt-8 flex flex-col gap-3 sm:flex-row sm:items-center", centered && "sm:justify-center")}
      >
        <Button href="#contact" size="lg">
          Start a Project
        </Button>
        <Button href="#services" size="lg" variant="secondary" arrow={false}>
          Explore Our Services
        </Button>
      </motion.div>
    </motion.div>
  );

  if (centered) {
    return (
      <section id="home" ref={ref} className="relative min-h-[100svh] overflow-hidden pt-28 sm:pt-36">
        <SkinBackdrop skin={skin} />
        <div className="container-x relative">{copy}</div>
        {/* the deck as a wide band under the headline */}
        <motion.div ref={sceneRef} style={{ y: yScene }} className="pointer-events-none relative mx-auto mt-2 h-[46svh] w-full max-w-6xl sm:mt-4 sm:h-[56vh]" aria-hidden>
          <div className="absolute inset-x-[15%] inset-y-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/var(--blob-a)),transparent_70%)]" />
          {scene}
        </motion.div>
        <div className="pointer-events-none absolute bottom-6 right-6 hidden lg:block">
          <OrbitBadge />
        </div>
      </section>
    );
  }

  return (
    <section id="home" ref={ref} className="relative min-h-[100svh] overflow-hidden pt-24 sm:pt-32 lg:pt-0">
      <SkinBackdrop skin={skin} />
      {/* 3D scene — right on desktop, behind copy on mobile */}
      <motion.div
        ref={sceneRef}
        style={{ y: yScene }}
        className="pointer-events-none absolute inset-x-0 top-[4.5rem] h-[44svh] sm:top-16 sm:h-[60vh] lg:inset-y-0 lg:left-[42%] lg:right-0 lg:h-auto"
        aria-hidden
      >
        <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/var(--blob-a)),transparent_70%)]" />
        {scene}
      </motion.div>

      {/* Copy */}
      <div className="container-x relative flex flex-col pb-14 pt-[44svh] sm:min-h-[100svh] sm:justify-end sm:pb-16 sm:pt-[60vh] lg:justify-center lg:py-32 lg:pt-40">
        {copy}

        {/* scroll cue + tagline, bottom row */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-10 flex items-end justify-between gap-6 sm:mt-14 lg:absolute lg:inset-x-[max(1.25rem,calc((100%-80rem)/2+3rem))] lg:bottom-8 lg:mt-0"
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
