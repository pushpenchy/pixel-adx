"use client";

import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { reachPoints } from "@/content/site";
import { project, worldDots } from "@/lib/worldmap";

const W = 1000;
const H = 500;

export function GlobalReach() {
  const reduce = useReducedMotion();
  const dots = useMemo(() => worldDots(W, H, 3), []);
  const pts = useMemo(() => reachPoints.map((p) => ({ ...p, ...project(p.lon, p.lat, W, H) })), []);
  const home = pts.find((p) => p.home)!;

  return (
    <Section id="global" className="overflow-hidden">
      <SectionHeading
        index="12"
        eyebrow="Global Reach"
        title="Built in Bangladesh."
        accent="Designed for the world."
        subtitle="Headquartered in Bangladesh, Pixel ADX works with businesses across regions — delivering campaigns and technology digitally, wherever growth happens."
        align="center"
      />

      <Reveal className="relative mt-14 lg:mt-20" delay={0.1}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-[60%] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(77,124,254,0.16),transparent_60%)] blur-2xl" />
        <div className="crystal relative overflow-hidden rounded-xl3 border border-white/[0.08] bg-ink-2/60 p-3 sm:p-6">
          <svg viewBox={`0 ${H * 0.06} ${W} ${H * 0.8}`} className="w-full" role="img" aria-label="Abstract world map with connection points in Bangladesh, Asia, the Middle East, Europe and North America">
            <defs>
              <linearGradient id="gr-arc" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#38e1ff" stopOpacity="0.9" />
                <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.9" />
              </linearGradient>
              <filter id="gr-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* dot-matrix land */}
            <g fill="rgb(var(--fg)/0.22)">
              {dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r="1.7" />
              ))}
            </g>

            {/* arcs from home */}
            {pts
              .filter((p) => !p.home)
              .map((p, i) => {
                const mx = (home.x + p.x) / 2;
                const my = Math.min(home.y, p.y) - Math.abs(home.x - p.x) * 0.22 - 20;
                const d = `M ${home.x} ${home.y} Q ${mx} ${my} ${p.x} ${p.y}`;
                const id = `gr-a-${i}`;
                return (
                  <g key={p.label}>
                    <path id={id} d={d} fill="none" stroke="url(#gr-arc)" strokeWidth="1.2" strokeOpacity="0.55" strokeDasharray="4 6" className={reduce ? "" : "flow-line"} />
                    {!reduce && (
                      <circle r="3" className="fill-white [[data-theme=light]_&]:fill-accent">
                        <animateMotion dur={`${3.2 + i * 0.5}s`} begin={`${i * 0.6}s`} repeatCount="indefinite">
                          <mpath href={`#${id}`} />
                        </animateMotion>
                      </circle>
                    )}
                  </g>
                );
              })}

            {/* points */}
            {pts.map((p) => (
              <g key={p.label}>
                {!reduce && (
                  <circle cx={p.x} cy={p.y} r="6" fill="none" stroke={p.home ? "#38e1ff" : "#4d7cfe"} strokeOpacity="0.8">
                    <animate attributeName="r" values="6;20" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={p.x} cy={p.y} r={p.home ? 6 : 4.5} fill={p.home ? "#38e1ff" : "#4d7cfe"} filter="url(#gr-glow)" />
                <circle cx={p.x} cy={p.y} r="2" fill="#fff" fillOpacity="0.95" />
                <g transform={p.labelSide === "left" ? `translate(${p.x - 12 - (p.label.length * 7.2 + 18)} ${p.y - 12})` : `translate(${p.x + 12} ${p.y - 12})`}>
                  <rect x="0" y="-11" rx="6" width={p.label.length * 7.2 + 18} height="22" fill="rgb(var(--bg)/0.85)" stroke="rgb(var(--fg)/0.12)" />
                  <text x="9" y="4" className={p.home ? "fill-cyan text-[11.5px] font-semibold" : "fill-white text-[11.5px] font-semibold"} style={{ fontFamily: "var(--font-sans)" }}>
                    {p.label}
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>
        <p className="mt-4 text-center text-[11px] text-white/35">
          Markers represent regions we serve digitally, not physical offices.
        </p>
      </Reveal>
    </Section>
  );
}
