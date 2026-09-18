"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LogoMark } from "@/components/brand/Logo";
import type { SkinId } from "@/lib/skin";

/**
 * Signature hero assets per skin — all vector / CSS, so they stay crisp at
 * any pixel density and cost nothing to load.
 */

/** Horizon: a planet's edge lit from below — white rim, atmosphere, then space. */
export function PlanetHorizon() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-0 overflow-hidden">
      {/* atmosphere haze above the rim */}
      <div className="absolute inset-x-[-10%] top-[36svh] h-[62svh] bg-[radial-gradient(ellipse_at_50%_100%,rgb(var(--accent-rgb)/0.55)_0%,rgb(var(--accent-rgb)/0.22)_35%,transparent_70%)]" />
      {/* the planet: huge ellipse whose top edge is the horizon */}
      <div className="absolute left-1/2 top-[94svh] h-[140vh] w-[220vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_0%,#ffffff_0%,color-mix(in_oklab,var(--color-cyan)_60%,white)_3%,var(--color-accent)_10%,color-mix(in_oklab,var(--color-accent)_45%,black)_24%,#02040a_48%)] shadow-[0_-24px_120px_10px_rgb(var(--accent-rgb)/0.55),0_-2px_0_0_rgba(255,255,255,0.9)] sm:top-[91svh]" />
      {/* grain over the glow so the gradient doesn't band */}
      <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
    </div>
  );
}

/** Aurora: three drifting light curtains, blurred and screened. */
export function AuroraCurtains() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="aurora-band absolute left-[-10%] top-[-20%] h-[90%] w-[60%] rounded-[50%] bg-[linear-gradient(180deg,rgb(var(--accent-rgb)/0.55),rgb(var(--cyan-rgb)/0.18)_60%,transparent)] blur-3xl mix-blend-screen" />
      <div className="aurora-band absolute left-[30%] top-[-30%] h-[100%] w-[50%] rounded-[50%] bg-[linear-gradient(180deg,rgb(var(--cyan-rgb)/0.5),rgb(var(--violet-rgb)/0.2)_55%,transparent)] blur-3xl mix-blend-screen" />
      <div className="aurora-band absolute left-[62%] top-[-15%] h-[85%] w-[55%] rounded-[50%] bg-[linear-gradient(180deg,rgb(var(--violet-rgb)/0.45),rgb(var(--accent-rgb)/0.15)_60%,transparent)] blur-3xl mix-blend-screen" />
      {/* ground fade so copy stays readable */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent,rgb(var(--bg))_85%)]" />
    </div>
  );
}

/** Mono: halftone dot field fading in from the right + one signal bar. */
export function Halftone() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-[70%] opacity-[0.55] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1.6px)] [background-size:14px_14px] [mask-image:radial-gradient(ellipse_at_80%_40%,#000_10%,transparent_65%)]" />
      <div className="absolute inset-y-0 right-0 w-[70%] opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.7)_1.4px,transparent_2px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_85%_30%,#000_0%,transparent_45%)]" />
      <div className="absolute bottom-[14%] left-0 h-1.5 w-[38%] bg-[var(--color-accent)]" />
    </div>
  );
}

/** Sunset: retro sun disc with horizon lines above a perspective grid. */
export function RetroSun() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-[6%] h-[70%] bg-[radial-gradient(ellipse_at_50%_60%,rgb(var(--accent-rgb)/0.35),rgb(var(--violet-rgb)/0.12)_45%,transparent_70%)]" />
      {/* the sun: gradient disc sliced by horizontal bands */}
      <div className="absolute left-1/2 top-[54svh] size-[46vmin] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,var(--color-cyan)_0%,var(--color-accent)_55%,var(--color-accent-2)_100%)] shadow-[0_0_120px_20px_rgb(var(--accent-rgb)/0.35)] [mask-image:repeating-linear-gradient(180deg,#000_0_62%,transparent_62%_66%,#000_66%_72%,transparent_72%_75%,#000_75%_80%,transparent_80%_82.5%,#000_82.5%_87%,transparent_87%_89%,#000_89%_93%,transparent_93%_94.5%,#000_94.5%_100%)] sm:top-[50svh]" />
      {/* perspective grid */}
      <div className="sun-grid absolute inset-x-[-30%] bottom-0 h-[42%] opacity-40 [background-image:linear-gradient(rgb(var(--accent-rgb)/0.5)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--accent-rgb)/0.35)_1px,transparent_1px)] [background-size:100%_48px,80px_100%] [transform:perspective(600px)_rotateX(62deg)] [transform-origin:50%_0] [mask-image:linear-gradient(180deg,#000,transparent_90%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[40%] bg-[linear-gradient(180deg,transparent,rgb(var(--bg))_80%)]" />
    </div>
  );
}

/** Orbiting badge: text on a circle, slowly rotating, mark in the centre. */
export function OrbitBadge({ text = "ADTECH • MEDIA BUYING • SOFTWARE • GROWTH • ", className = "" }: { text?: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={`relative grid size-36 place-items-center sm:size-44 ${className}`} aria-hidden>
      <motion.svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-white/80" animate={reduce ? undefined : { rotate: 360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }}>
        <defs>
          <path id="orbit" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-current font-mono text-[8.6px] font-semibold tracking-[0.22em]">
          <textPath href="#orbit">{text}</textPath>
        </text>
      </motion.svg>
      <span className="grid size-14 place-items-center rounded-full border border-white/12 bg-white/[0.04] sm:size-16">
        <LogoMark size={30} id="orbit-mark" />
      </span>
    </div>
  );
}

export function SkinBackdrop({ skin }: { skin: SkinId }) {
  switch (skin) {
    case "horizon":
      return <PlanetHorizon />;
    case "aurora":
      return <AuroraCurtains />;
    case "mono":
      return <Halftone />;
    case "sunset":
      return <RetroSun />;
    default:
      return null;
  }
}
