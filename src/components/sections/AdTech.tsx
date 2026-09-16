"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { LogoMark } from "@/components/brand/Logo";
import { adtechNodes, campaignIntelligence } from "@/content/site";
import { cn } from "@/lib/utils";

const W = 640;
const H = 640;
const CX = W / 2;
const CY = H / 2;
const R = 235;

function polar(i: number, n: number, r = R) {
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r };
}

export function AdTech() {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);

  return (
    <Section id="adtech" className="overflow-hidden">
      <SectionHeading
        eyebrow="AdTech"
        title="Where Advertising Meets Technology"
        subtitle="Pixel ADX sits at the centre of the advertising stack — connecting advertisers, publishers and audiences through campaigns, traffic, data and analytics."
      />

      <div className="mt-14 grid items-center gap-10 lg:mt-20 lg:grid-cols-[1.25fr_0.85fr] lg:gap-14">
        {/* Network visualization */}
        <Reveal className="relative">
          <div aria-hidden className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,0.2),transparent)] blur-3xl" />
          <svg viewBox={`0 0 ${W} ${H}`} className="relative mx-auto w-full max-w-[640px]" role="img" aria-label="Pixel ADX connected to advertisers, publishers, audiences, campaigns, traffic, data, conversions and analytics">
            <defs>
              <radialGradient id="at-hub">
                <stop offset="0" stopColor="#4d7cfe" stopOpacity="0.5" />
                <stop offset="0.5" stopColor="#4d7cfe" stopOpacity="0.1" />
                <stop offset="1" stopColor="#4d7cfe" stopOpacity="0" />
              </radialGradient>
              <filter id="at-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle cx={CX} cy={CY} r={R + 40} fill="none" stroke="rgb(var(--fg)/0.05)" />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgb(var(--fg)/0.07)" strokeDasharray="3 9" />
            <circle cx={CX} cy={CY} r={130} fill="url(#at-hub)" />

            {adtechNodes.map((label, i) => {
              const p = polar(i, adtechNodes.length);
              const id = `at-l-${i}`;
              const active = hover === i;
              // slight curve alternating direction
              const mx = (CX + p.x) / 2 + (i % 2 ? 18 : -18);
              const my = (CY + p.y) / 2 + (i % 2 ? -18 : 18);
              const d = `M ${CX} ${CY} Q ${mx} ${my} ${p.x} ${p.y}`;
              const dBack = `M ${p.x} ${p.y} Q ${mx} ${my} ${CX} ${CY}`;
              return (
                <g key={label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="cursor-default">
                  <path id={id} d={d} fill="none" stroke={active ? "rgba(120,170,255,0.55)" : "rgb(var(--fg)/0.10)"} strokeWidth={active ? 1.6 : 1.1} className="transition-all duration-300" />
                  <path id={`${id}-b`} d={dBack} fill="none" stroke="none" />
                  <path d={d} fill="none" stroke="rgba(56,225,255,0.35)" strokeWidth="1" className="flow-line" />
                  {!reduce && (
                    <>
                      <circle r="3" fill="#9cc2ff">
                        <animateMotion dur={`${3.4 + (i % 3) * 0.7}s`} begin={`${i * 0.42}s`} repeatCount="indefinite">
                          <mpath href={`#${id}`} />
                        </animateMotion>
                      </circle>
                      <circle r="2.2" fill="#38e1ff">
                        <animateMotion dur={`${4 + (i % 2) * 0.9}s`} begin={`${1.5 + i * 0.3}s`} repeatCount="indefinite">
                          <mpath href={`#${id}-b`} />
                        </animateMotion>
                      </circle>
                    </>
                  )}
                  {/* node */}
                  <circle cx={p.x} cy={p.y} r={active ? 34 : 30} fill="rgb(var(--bg)/0.9)" stroke={active ? "rgba(120,170,255,0.8)" : "rgb(var(--fg)/0.14)"} strokeWidth="1.2" className="transition-all duration-300" />
                  <circle cx={p.x} cy={p.y} r="4" className={active ? "fill-white" : "fill-cyan"} filter="url(#at-glow)" />
                  <text x={p.x} y={p.y + 48} textAnchor="middle" className={cn("text-[12.5px] font-medium transition-all", active ? "fill-white" : "fill-white/70")} style={{ fontFamily: "var(--font-sans)" }}>
                    {label}
                  </text>
                </g>
              );
            })}

            {/* hub */}
            <circle cx={CX} cy={CY} r="60" fill="rgb(var(--bg)/0.95)" stroke="rgba(120,170,255,0.55)" strokeWidth="1.3" />
            <circle cx={CX} cy={CY} r="60" fill="none" stroke="#4d7cfe" strokeOpacity="0.5" className={reduce ? "" : "animate-pulse-soft"} style={{ transformOrigin: `${CX}px ${CY}px` }} />
            <foreignObject x={CX - 24} y={CY - 32} width="48" height="48">
              <div className="grid h-full w-full place-items-center">
                <LogoMark size={40} id="adtech-mark" />
              </div>
            </foreignObject>
            <text x={CX} y={CY + 36} textAnchor="middle" className="fill-white text-[11px] font-bold tracking-[0.2em]" style={{ fontFamily: "var(--font-display)" }}>
              PIXEL ADX
            </text>
          </svg>
        </Reveal>

        {/* Side panel */}
        <Reveal delay={0.15}>
          <div className="relative overflow-hidden rounded-xl3 card-surface crystal p-7 sm:p-9">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-accent/20 blur-3xl" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan">Campaign Intelligence</p>
            <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">
              More than an agency. An advertising technology layer.
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-mute sm:text-[15px]">
              Every campaign runs on infrastructure we design: tracking, attribution, automation and reporting that turn media spend into measurable growth.
            </p>
            <ul className="mt-7 grid gap-2.5">
              {campaignIntelligence.map((item, i) => (
                <motion.li
                  key={item}
                  initial={reduce ? false : { opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors duration-300 hover:border-accent/40 hover:bg-accent/[0.06]"
                >
                  <span className="grid size-6 place-items-center rounded-md bg-accent/15 text-cyan ring-1 ring-accent/30">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-medium text-white/85 group-hover:text-white">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
