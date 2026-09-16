"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, Globe2, TrendingUp, Zap, MousePointerClick } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";

/**
 * Abstract AdTech ecosystem:
 * Advertisers → Pixel ADX → Ad Platforms → Audiences → Data → Conversions
 * SVG paths with SMIL animateMotion particles (GPU-cheap, no JS per frame).
 */

type Node = { id: string; label: string; x: number; y: number; hub?: boolean };

const nodes: Node[] = [
  { id: "adv", label: "Advertisers", x: 90, y: 150 },
  { id: "hub", label: "Pixel ADX", x: 300, y: 262, hub: true },
  { id: "plat", label: "Ad Platforms", x: 520, y: 140 },
  { id: "aud", label: "Audiences", x: 545, y: 350 },
  { id: "data", label: "Data", x: 320, y: 470 },
  { id: "conv", label: "Conversions", x: 85, y: 385 },
];

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

// curved connections: [from, to, curvature]
const links: [string, string, number][] = [
  ["adv", "hub", -40],
  ["hub", "plat", -50],
  ["plat", "aud", 60],
  ["aud", "data", 50],
  ["data", "hub", 40],
  ["hub", "conv", 40],
  ["data", "conv", 60],
];

function curve(a: Node, b: Node, k: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // perpendicular offset for the control point
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * k;
  const cy = my + (dx / len) * k;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

const cards = [
  { icon: Zap, label: "Campaign Active", sub: "Live", style: "left-[2%] top-[6%]", delay: 0, dot: true },
  { icon: TrendingUp, label: "ROAS +", sub: "Optimizing", style: "right-[0%] top-[2%]", delay: 1.2 },
  { icon: MousePointerClick, label: "Conversions", sub: "Tracking", style: "left-[0%] bottom-[8%] hidden sm:block", delay: 0.6 },
  { icon: Activity, label: "Real-Time Analytics", sub: "Streaming", style: "right-[2%] bottom-[14%]", delay: 1.8 },
  { icon: Globe2, label: "Global Reach", sub: "Multi-market", style: "left-[38%] -bottom-[2%] hidden sm:block", delay: 2.4 },
];

export function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-[600/560] w-full max-w-[620px]">
      {/* ambient glow */}
      <div aria-hidden className="absolute inset-[15%] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,0.22),transparent)] blur-2xl" />

      <svg viewBox="0 0 620 560" className="relative h-full w-full" role="img" aria-label="Pixel ADX advertising ecosystem: advertisers, ad platforms, audiences, data and conversions connected through Pixel ADX">
        <defs>
          <linearGradient id="hv-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#38e1ff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="hv-node">
            <stop offset="0" stopColor="rgb(var(--fg))" stopOpacity="0.16" />
            <stop offset="1" stopColor="rgb(var(--fg))" stopOpacity="0.02" />
          </radialGradient>
          <radialGradient id="hv-hub">
            <stop offset="0" stopColor="#4d7cfe" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#4d7cfe" stopOpacity="0.12" />
            <stop offset="1" stopColor="#4d7cfe" stopOpacity="0" />
          </radialGradient>
          <filter id="hv-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* orbit rings */}
        <g style={{ transformOrigin: "300px 262px" }} className={reduce ? "" : "animate-spin-slow"}>
          <circle cx="300" cy="262" r="150" fill="none" stroke="rgb(var(--fg)/0.06)" strokeDasharray="2 10" />
          <circle cx="300" cy="262" r="215" fill="none" stroke="rgb(var(--fg)/0.045)" strokeDasharray="1 14" />
        </g>
        <circle cx="300" cy="262" r="120" fill="url(#hv-hub)" />

        {/* links */}
        {links.map(([f, t, k], i) => {
          const d = curve(byId[f], byId[t], k);
          const id = `hv-p-${i}`;
          return (
            <g key={id}>
              <path id={id} d={d} fill="none" stroke="rgb(var(--fg)/0.09)" strokeWidth="1.2" />
              <path d={d} fill="none" stroke="url(#hv-line)" strokeWidth="1.2" className="flow-line" />
              {!reduce &&
                [0, 1].map((n) => (
                  <circle key={n} r={n === 0 ? 3 : 2} fill={n === 0 ? "#9cc2ff" : "#38e1ff"} filter="url(#hv-glow)">
                    <animateMotion dur={`${4.5 + i * 0.6}s`} begin={`${n * 2.1 + i * 0.35}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1">
                      <mpath href={`#${id}`} />
                    </animateMotion>
                  </circle>
                ))}
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map((n) =>
          n.hub ? (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="46" fill="rgb(var(--bg)/0.9)" stroke="rgba(120,170,255,0.5)" strokeWidth="1.2" />
              <circle cx={n.x} cy={n.y} r="46" fill="none" stroke="#4d7cfe" strokeOpacity="0.6" className={reduce ? "" : "animate-pulse-soft"} style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
              <foreignObject x={n.x - 20} y={n.y - 20} width="40" height="40">
                <div className="grid h-full w-full place-items-center">
                  <LogoMark size={34} id="hero-mark" />
                </div>
              </foreignObject>
              <text x={n.x} y={n.y + 68} textAnchor="middle" className="fill-white text-[13px] font-semibold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
                PIXEL ADX
              </text>
            </g>
          ) : (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="26" fill="url(#hv-node)" stroke="rgb(var(--fg)/0.14)" />
              <circle cx={n.x} cy={n.y} r="5" className="fill-white" fillOpacity="0.9" filter="url(#hv-glow)" />
              <circle cx={n.x} cy={n.y} r="9" fill="none" stroke="#38e1ff" strokeOpacity="0.5" />
              <text x={n.x} y={n.y + 44} textAnchor="middle" className="fill-white/75 text-[12px] font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                {n.label}
              </text>
            </g>
          )
        )}
      </svg>

      {/* floating data cards */}
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.9 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute scale-[0.8] sm:scale-100 ${c.style}`}
        >
          <motion.div
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
            className="glass flex items-center gap-2.5 rounded-xl px-3 py-2 shadow-[0_10px_40px_-15px_rgb(var(--shadow)/0.9)]"
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
    </div>
  );
}
