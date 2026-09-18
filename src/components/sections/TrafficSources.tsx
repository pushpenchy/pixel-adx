"use client";

import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { trafficSources, type TrafficSource } from "@/content/site";
import { logos, type Logo } from "@/content/logos";

/** Brands whose official mark is black — rendered in the theme ink so they stay visible in dark mode. */
const isDark = (hex: string) => parseInt(hex, 16) < 0x222222;

function BrandIcon({ s }: { s: TrafficSource }) {
  if (s.logo) {
    return <Image src={s.logo} alt="" width={112} height={28} className="h-7 w-auto sm:h-8" />;
  }
  if (s.icon) {
    const l: Logo = logos[s.icon];
    const fill = isDark(l.hex) ? "currentColor" : `#${l.hex}`;
    return (
      <svg viewBox="0 0 24 24" className="size-7 shrink-0 text-white sm:size-8" aria-hidden>
        {l.paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill ?? fill} />
        ))}
      </svg>
    );
  }
  // monogram fallback
  const lightTile = ["#fffc00", "#e7e9ea", "#a2aaad"].includes(s.color);
  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-lg font-display text-[13px] font-extrabold text-pure-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_6px_16px_-6px_var(--brand)] sm:size-9"
      style={{
        background: `linear-gradient(135deg, color-mix(in oklab, ${s.color} 85%, white), ${s.color})`,
        color: lightTile ? "#0a0b10" : undefined,
      }}
    >
      {s.mark ?? s.name[0]}
    </span>
  );
}

function SourceChip({ s }: { s: TrafficSource }) {
  return (
    <div
      className="glass glass-flat liquid-press flex h-14 shrink-0 items-center gap-3 rounded-2xl px-4 pr-5 sm:h-16 sm:px-5 sm:pr-6"
      style={{ ["--brand" as string]: s.color }}
      title={s.name}
    >
      <BrandIcon s={s} />
      <span className="whitespace-nowrap font-display text-[15px] font-bold tracking-[-0.01em] text-white sm:text-base">{s.name}</span>
    </div>
  );
}

export function TrafficSources() {
  const half = Math.ceil(trafficSources.length / 2);
  const rowA = trafficSources.slice(0, half);
  const rowB = trafficSources.slice(half);

  return (
    <Section id="traffic" className="py-16 sm:py-20 lg:py-24" bleed>
      <div className="container-x">
        <SectionHeading
          index="02"
          eyebrow="Traffic Sources"
          title="Traffic sources"
          accent="we use."
          subtitle="We buy and scale across the world's leading advertising networks — so budgets go where performance is."
          align="center"
        />
      </div>

      <Reveal className="mt-12 space-y-4 lg:mt-16" amount={0.2}>
        <Marquee duration={46} gap="1rem">
          {rowA.map((s) => (
            <SourceChip key={s.name} s={s} />
          ))}
        </Marquee>
        <Marquee duration={52} reverse gap="1rem">
          {rowB.map((s) => (
            <SourceChip key={s.name} s={s} />
          ))}
        </Marquee>
      </Reveal>

      <p className="mt-6 text-center text-[11px] text-white/35">
        Platform names and marks belong to their respective owners.
      </p>
    </Section>
  );
}
