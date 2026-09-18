import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Brand" };

const files = [
  ["pixel-adx-mark.svg", "Mark — colour"],
  ["pixel-adx-mark-white.svg", "Mark — white"],
  ["pixel-adx-mark-black.svg", "Mark — black"],
  ["pixel-adx-logo-dark.svg", "Lockup — for dark backgrounds"],
  ["pixel-adx-logo-light.svg", "Lockup — for light backgrounds"],
  ["pixel-adx-logo-mono-white.svg", "Lockup — mono white"],
  ["pixel-adx-logo-mono-black.svg", "Lockup — mono black"],
  ["pixel-adx-icon.svg", "App icon / favicon"],
];

const colors = [
  ["Ink", "#050507"],
  ["Electric Blue", "var(--color-accent)"],
  ["Cyan", "var(--color-cyan)"],
  ["Violet", "var(--color-violet)"],
  ["Fog", "#f5f7fb"],
];

export default function BrandPage() {
  return (
    <main className="container-x py-16 sm:py-24">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white">
        <ArrowLeft className="size-4" /> Back to site
      </Link>
      <h1 className="mt-8 font-display text-4xl font-extrabold tracking-[-0.035em] text-white sm:text-6xl">Pixel ADX brand</h1>
      <p className="mt-4 max-w-2xl text-mute">
        A 3×3 pixel grid where the five diagonal pixels light up to form an X — the pixel grid literally becomes the X in ADX.
        The white centre pixel is the exchange node: where advertisers, technology and audiences meet.
      </p>

      {/* Hero lockups */}
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="grid min-h-[280px] place-items-center rounded-xl3 border border-white/10 bg-ink-2">
          <Logo markSize={72} id="b1" />
        </div>
        <div className="grid min-h-[280px] place-items-center rounded-xl3 border border-white/10 bg-fog text-ink">
          <span className="inline-flex items-center gap-4">
            <LogoMark size={72} id="b2" center="#0a0b10" />
            <span className="font-display text-5xl font-extrabold tracking-[-0.03em] text-ink">
              Pixel<span className="text-gradient"> ADX</span>
            </span>
          </span>
        </div>
        <div className="grid min-h-[220px] place-items-center rounded-xl3 border border-white/10 bg-ink-2 text-white">
          <Logo markSize={56} tone="mono" id="b3" />
        </div>
        <div className="grid min-h-[220px] place-items-center rounded-xl3 border border-white/10 bg-[linear-gradient(135deg,var(--color-cyan),var(--color-accent),var(--color-violet))] text-pure-white">
          <Logo markSize={56} tone="mono" id="b4" />
        </div>
      </div>

      {/* Construction */}
      <h2 className="mt-16 font-display text-2xl font-bold text-white">Mark construction & sizes</h2>
      <div className="mt-6 flex flex-wrap items-end gap-8 rounded-xl3 border border-white/10 bg-ink-2 p-8">
        {[96, 64, 48, 32, 24, 16].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <LogoMark size={s} id={`s${s}`} />
            <span className="text-[11px] text-white/40">{s}px</span>
          </div>
        ))}
        <div className="ml-auto grid size-24 place-items-center rounded-[22px] bg-ink ring-1 ring-white/10">
          <LogoMark size={64} id="tile" />
        </div>
      </div>

      {/* Colours */}
      <h2 className="mt-16 font-display text-2xl font-bold text-white">Colour</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {colors.map(([name, hex]) => (
          <div key={hex} className="overflow-hidden rounded-xl2 border border-white/10">
            <div className="h-20" style={{ background: hex }} />
            <div className="bg-ink-2 px-3 py-2.5">
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-white/50">{hex}</p>
            </div>
          </div>
        ))}
        <div className="overflow-hidden rounded-xl2 border border-white/10 sm:col-span-5">
          <div className="h-16 bg-[linear-gradient(120deg,var(--color-cyan),var(--color-accent)_45%,var(--color-violet))]" />
          <div className="bg-ink-2 px-3 py-2.5 text-xs text-white/60">Brand gradient · 120° · var(--color-cyan) → var(--color-accent) → var(--color-violet)</div>
        </div>
      </div>

      {/* Files */}
      <h2 className="mt-16 font-display text-2xl font-bold text-white">Files</h2>
      <p className="mt-2 text-sm text-mute">
        SVG sources live in <code className="text-white/80">public/brand/</code>. Lockup text uses the Manrope font stack — convert to outlines in a vector editor for print.
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {files.map(([file, label]) => (
          <li key={file}>
            <a
              href={`/brand/${file}`}
              download
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/80 transition hover:border-accent/40 hover:bg-accent/[0.06] hover:text-white"
            >
              <span>
                {label}
                <span className="ml-2 text-xs text-white/35">{file}</span>
              </span>
              <Download className="size-4" />
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
