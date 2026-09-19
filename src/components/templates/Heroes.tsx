"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { Eyebrow } from "@/components/ui/Section";
import { Marquee } from "@/components/ui/Marquee";
import { brand, heroScene, trafficSources } from "@/content/site";
import { logos, type Logo } from "@/content/logos";
import { ImageTrail } from "./ImageTrail";
import { MeshGradient } from "./Blocks";
import { demoPanels, PanelImage } from "./PanelImage";
import { cn } from "@/lib/utils";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const ease = [0.22, 1, 0.36, 1] as const;

function Lines({ className, poster }: { className?: string; poster?: boolean }) {
  const reduce = useReducedMotion();
  const [l1, l2, l3] = brand.coreMessage;
  const split = (s: string) => {
    const w = s.split(" ");
    return [w.slice(0, -1).join(" "), w.at(-1)!] as const;
  };
  const [a2, b2] = split(l2);
  const [a3, b3] = split(l3);
  const nodes = [
    <span key="1">{l1}</span>,
    <span key="2">
      <span className="text-outline">{a2}</span> <span className={cn("text-gradient", !poster && "serif-accent text-[1.1em]")}>{b2}</span>
    </span>,
    <span key="3">
      {a3} <span className="text-outline-thin">{b3}</span>
    </span>,
  ];
  return (
    <h1 className={cn("font-display font-extrabold leading-[0.96] tracking-[-0.045em] text-white", className)}>
      {nodes.map((n, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span className="block" initial={reduce ? false : { y: "108%" }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.1 + i * 0.12, ease }}>
            {n}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}

/* ── 1. Trail: giant type + cursor image-trail ─────────────────────────── */
export function TrailHero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <ImageTrail className="min-h-[100svh]">
        <div className="absolute inset-0 bg-grid opacity-50 mask-radial" aria-hidden />
        <div className="container-x relative flex min-h-[100svh] flex-col justify-end pb-16 pt-32 sm:pb-20">
          <Eyebrow index="00">AdTech &amp; Digital Technology · Bangladesh</Eyebrow>
          <Lines className="mt-8 text-[2.8rem] sm:text-[4.6rem] lg:text-[5.6rem] xl:text-[6.4rem]" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-lg text-base leading-relaxed text-mute sm:text-lg">{brand.description}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="#contact" size="lg">
                Start a Project
              </Button>
              <Button href="#services" size="lg" variant="secondary" arrow={false}>
                Explore Our Services
              </Button>
            </div>
          </div>
          <p className="label-mono mt-10 hidden items-center gap-3 text-white/45 sm:flex">
            <ArrowDown className="size-3.5" /> move your cursor · scroll to explore
          </p>
        </div>
      </ImageTrail>
    </section>
  );
}

/* ── 2. Mesh: centred copy on an animated mesh gradient, deck below ────── */
export function MeshHero({ reduce }: { reduce: boolean }) {
  return (
    <section id="home" className="relative overflow-hidden pt-32 sm:pt-40">
      <MeshGradient />
      <div className="container-x relative flex flex-col items-center text-center">
        <Eyebrow index="00">AdTech &amp; Digital Technology · Bangladesh</Eyebrow>
        <Lines className="mx-auto mt-8 max-w-6xl text-[2.8rem] sm:text-[4.8rem] lg:text-[6rem]" />
        <p className="mt-8 max-w-xl text-base leading-relaxed text-mute sm:text-lg">{brand.description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="#contact" size="lg">
            Start a Project
          </Button>
          <Button href="#services" size="lg" variant="secondary" arrow={false}>
            See how we work
          </Button>
        </div>
      </div>
      <div className="pointer-events-none relative mx-auto mt-4 h-[48svh] w-full max-w-6xl sm:h-[58vh]" aria-hidden>
        <HeroScene scene={heroScene} reduce={reduce} light={false} />
      </div>
    </section>
  );
}

/* ── 3. Bento: the hero is a dashboard grid with the deck in the big tile ─ */
function Tile({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("crystal relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-2/70 p-5 sm:p-6", className)}>{children}</div>;
}
export function BentoHero({ reduce }: { reduce: boolean }) {
  const channels = trafficSources.filter((s) => s.icon).slice(0, 10);
  return (
    <section id="home" className="relative overflow-hidden pt-28 sm:pt-32">
      <MeshGradient strength={0.6} />
      <div className="container-x relative">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-4 md:auto-rows-[200px] lg:auto-rows-[225px]">
          {/* headline */}
          <Tile className="flex flex-col justify-between md:col-span-2 md:row-span-2">
            <Eyebrow index="00">AdTech &amp; Digital</Eyebrow>
            <div>
              <Lines className="mt-5 text-[2rem] sm:text-[2.5rem] lg:text-[2.7rem] xl:text-[3rem]" />
              <p className="mt-4 max-w-md text-sm leading-relaxed text-mute">{brand.shortDescription}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="#contact">Start a Project</Button>
                <Button href="#services" variant="secondary" arrow={false}>
                  Services
                </Button>
              </div>
            </div>
          </Tile>
          {/* deck */}
          <Tile className="!p-0 md:col-span-2 md:row-span-2">
            <div className="absolute inset-0" aria-hidden>
              <HeroScene scene={heroScene} reduce={reduce} light={false} />
            </div>
            <span className="label-mono absolute left-5 top-5 text-white/60">Command deck · live demo</span>
          </Tile>
          {/* metric tiles (demo data) */}
          <Tile>
            <span className="label-mono text-white/50">Conversions · 14d</span>
            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-white">
              <Counter value={1362} />
            </p>
            <p className="mt-1 text-[12px] text-cyan">▲ 18.4% · demo data</p>
          </Tile>
          <Tile className="!p-0">
            <PanelImage spec={demoPanels.conversions} className="size-full" scale={0.75} />
          </Tile>
          <Tile>
            <span className="label-mono text-white/50">ROAS</span>
            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-white">
              <Counter value={4.2} decimals={1} suffix="×" />
            </p>
            <p className="mt-1 text-[12px] text-mute">Performance · demo data</p>
          </Tile>
          <Tile className="!p-0">
            <PanelImage spec={demoPanels.mix} className="size-full" scale={0.75} />
          </Tile>
          {/* channels marquee */}
          <Tile className="flex flex-col justify-center !px-0 md:col-span-3">
            <span className="label-mono mb-4 px-6 text-white/50">Buying live across</span>
            <Marquee duration={28} gap="2.5rem">
              {channels.map((c) => {
                const l: Logo = logos[c.icon!];
                const dark = parseInt(l.hex, 16) < 0x222222;
                return (
                  <span key={c.name} className="flex items-center gap-2.5 text-sm font-semibold text-white/80">
                    <svg viewBox="0 0 24 24" className="size-6" style={{ color: dark ? "#fff" : `#${l.hex}` }} aria-hidden>
                      {l.paths.map((p, i) => (
                        <path key={i} d={p.d} fill={p.fill ?? "currentColor"} />
                      ))}
                    </svg>
                    {c.name}
                  </span>
                );
              })}
            </Marquee>
          </Tile>
          <Tile className="flex flex-col justify-between">
            <span className="label-mono text-white/50">Based in</span>
            <p className="font-display text-2xl font-bold tracking-[-0.02em] text-white">
              Bangladesh <span className="text-mute">→ world</span>
            </p>
          </Tile>
        </div>
      </div>
    </section>
  );
}

/* ── 4. Reveal: scroll opens a clip-path window onto the deck ──────────── */
export function MaskRevealHero({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const inset = useTransform(scrollYProgress, [0, 0.75], reduce ? ["0%", "0%"] : ["38%", "0%"]);
  const radius = useTransform(scrollYProgress, [0, 0.75], reduce ? ["0px", "0px"] : ["48px", "0px"]);
  const clip = useTransform([inset, radius], ([i, r]) => `inset(${i} round ${r})`);
  const copyY = useTransform(scrollYProgress, [0, 0.5], [0, -120]);
  const copyOpacity = useTransform(scrollYProgress, (p) => Math.max(0, 1 - p / 0.45));
  const deckScale = useTransform(scrollYProgress, [0, 0.75], [1.12, 1]);
  return (
    <section id="home" ref={ref} className="relative h-[220svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* deck window */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 bg-ink-2">
          <motion.div style={{ scale: deckScale }} className="absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-grid opacity-60 mask-radial" />
            <HeroScene scene={heroScene} reduce={reduce} light={false} />
          </motion.div>
        </motion.div>
        {/* copy over the window */}
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="container-x relative flex h-full flex-col items-center justify-center text-center">
          <Eyebrow index="00">AdTech &amp; Digital Technology · Bangladesh</Eyebrow>
          <Lines className="mt-8 max-w-6xl text-[2.8rem] sm:text-[5rem] lg:text-[6.4rem]" />
          <p className="mt-8 max-w-xl text-base leading-relaxed text-mute sm:text-lg [text-shadow:0_1px_14px_rgb(var(--bg))]">{brand.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#contact" size="lg">
              Start a Project
            </Button>
            <Button href="#services" size="lg" variant="secondary" arrow={false}>
              Explore Our Services
            </Button>
          </div>
          <p className="label-mono mt-12 inline-flex items-center gap-2 text-white/45">
            <ArrowDown className="size-3.5 animate-bounce" /> scroll to open the deck
          </p>
        </motion.div>
      </div>
    </section>
  );
}
