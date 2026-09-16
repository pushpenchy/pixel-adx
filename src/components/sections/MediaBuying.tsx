"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Layers, FlaskConical, Crosshair, SlidersHorizontal, LineChart } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { Button } from "@/components/ui/Button";

/**
 * DEMO DATA — illustrative UI only. These numbers are not Pixel ADX results.
 * Edit or wire to a real data source; the "Demo" badge is intentional.
 */
const kpis = [
  { label: "Spend", value: 12480, prefix: "$", decimals: 0 },
  { label: "Impressions", value: 2.41, suffix: "M", decimals: 2 },
  { label: "Clicks", value: 48920, decimals: 0 },
  { label: "Conversions", value: 1362, decimals: 0 },
  { label: "CPA", value: 9.16, prefix: "$", decimals: 2 },
  { label: "ROAS", value: 4.2, suffix: "x", decimals: 1 },
];

const campaigns = [
  { name: "Search — Brand", channel: "Google", status: "Active", spend: "$3,120", roas: "5.1x" },
  { name: "Prospecting — Lookalike", channel: "Meta", status: "Active", spend: "$4,860", roas: "3.8x" },
  { name: "Retargeting — 30d", channel: "Meta", status: "Scaling", spend: "$2,240", roas: "6.4x" },
  { name: "Video — Awareness", channel: "YouTube", status: "Testing", spend: "$2,260", roas: "2.9x" },
];

const series = [18, 24, 22, 30, 36, 33, 42, 48, 46, 55, 61, 58, 66, 72];
const bars = [40, 55, 48, 70, 62, 84, 78];

function linePath(points: number[], w: number, h: number) {
  const max = Math.max(...points);
  const step = w / (points.length - 1);
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h * 0.9 - 4}`)
    .join(" ");
}

const pillars = [
  { icon: Layers, title: "Media Strategy", text: "Channel mix, budget allocation and funnel design." },
  { icon: FlaskConical, title: "Creative Testing", text: "Structured experiments on hooks, formats and offers." },
  { icon: Crosshair, title: "Audience Targeting", text: "First-party signals, lookalikes and intent data." },
  { icon: SlidersHorizontal, title: "Campaign Optimization", text: "Bids, budgets and placements tuned continuously." },
  { icon: LineChart, title: "Performance Analytics", text: "Attribution, dashboards and clear reporting." },
];

export function MediaBuying() {
  const reduce = useReducedMotion();
  const W = 420;
  const H = 120;
  const d = linePath(series, W, H);

  return (
    <Section id="media-buying">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Media Buying"
            title="Buy Smarter. Scale Faster."
            subtitle="Pixel ADX combines media strategy, creative testing, audience targeting, campaign optimization and performance analytics — so budgets move toward what actually converts."
          />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={0.05 * i} as="li">
                <div className="group flex gap-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.04]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent ring-1 ring-accent/25 transition-all group-hover:bg-accent/20 group-hover:text-cyan">
                    <p.icon className="size-4" strokeWidth={1.9} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{p.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-mute">{p.text}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.3} className="mt-9">
            <Button href="#contact">Plan a Campaign</Button>
          </Reveal>
        </div>

        {/* Dashboard mockup */}
        <Reveal delay={0.1} className="relative">
          <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(77,124,254,0.18),transparent)] blur-2xl" />
          <div className="glass glass-strong relative overflow-hidden rounded-xl3">
            {/* window chrome */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="size-2.5 rounded-full bg-white/15" />
                <span className="ml-3 text-xs font-medium text-white/60">Campaign Overview</span>
              </div>
              <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                Demo data
              </span>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-px bg-white/[0.06] sm:grid-cols-6">
              {kpis.map((k) => (
                <div key={k.label} className="bg-ink-2/70 px-4 py-4">
                  <p className="text-[10.5px] font-medium uppercase tracking-wider text-white/45">{k.label}</p>
                  <p className="mt-1 font-display text-lg font-bold tracking-tight text-white sm:text-xl">
                    <Counter value={k.value} prefix={k.prefix} suffix={k.suffix} decimals={k.decimals} />
                  </p>
                </div>
              ))}
            </div>

            {/* charts */}
            <div className="grid gap-4 p-5 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-white/70">Conversions · 14 days</p>
                  <p className="text-[11px] text-emerald-400">▲ trending</p>
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-28 w-full" preserveAspectRatio="none" aria-hidden>
                  <defs>
                    <linearGradient id="mb-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#4d7cfe" stopOpacity="0.45" />
                      <stop offset="1" stopColor="#4d7cfe" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="mb-stroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#38e1ff" />
                      <stop offset="1" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75].map((g) => (
                    <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgb(var(--fg)/0.06)" />
                  ))}
                  <motion.path
                    d={`${d} L ${W} ${H} L 0 ${H} Z`}
                    fill="url(#mb-area)"
                    initial={reduce ? false : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1, duration: 1 }}
                  />
                  <motion.path
                    d={d}
                    fill="none"
                    stroke="url(#mb-stroke)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                  />
                </svg>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-xs font-medium text-white/70">Spend by day</p>
                <div className="mt-3 flex h-28 items-end gap-1.5">
                  {bars.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={reduce ? false : { scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      style={{ height: `${b}%`, transformOrigin: "bottom" }}
                      className="flex-1 rounded-t-md bg-[linear-gradient(180deg,#6d8cff,rgba(77,124,254,0.25))]"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* campaign table */}
            <div className="border-t border-white/[0.07]">
              <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.7fr_0.6fr] gap-2 px-5 py-2.5 text-[10.5px] font-medium uppercase tracking-wider text-white/40">
                <span>Campaign</span>
                <span>Channel</span>
                <span>Status</span>
                <span className="text-right">Spend</span>
                <span className="text-right">ROAS</span>
              </div>
              {campaigns.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                  className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.7fr_0.6fr] items-center gap-2 border-t border-white/[0.05] px-5 py-3 text-[12.5px] transition-colors hover:bg-white/[0.03]"
                >
                  <span className="truncate font-medium text-white/90">{c.name}</span>
                  <span className="text-white/55">{c.channel}</span>
                  <span className="flex items-center gap-1.5 text-white/70">
                    <span className={`size-1.5 rounded-full ${c.status === "Active" ? "bg-emerald-400" : c.status === "Scaling" ? "bg-cyan" : "bg-amber-400"}`} />
                    {c.status}
                  </span>
                  <span className="text-right text-white/80">{c.spend}</span>
                  <span className="text-right font-semibold text-white">{c.roas}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-white/35">
            Dashboard shown for demonstration only — values are illustrative, not client results.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
