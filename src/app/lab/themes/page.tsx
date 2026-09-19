"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SkinBackdrop } from "@/components/hero/Backdrops";
import { setSkin, skins, useSkin, type SkinId } from "@/lib/skin";
import { brand } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Theme picker: every skin rendered as a live mini-hero (scoped tokens), with
 * a button that applies it to the whole site so it can be browsed for real.
 */
function MiniHero({ id }: { id: SkinId }) {
  const s = skins.find((k) => k.id === id)!;
  const centered = s.layout === "centered";
  const poster = id === "mono";
  const [l1, l2, l3] = brand.coreMessage;
  return (
    <div data-skin={id === "nebula" ? undefined : id} className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-ink text-white">
      <SkinBackdrop skin={id} />
      {id === "nebula" && (
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-60 mask-radial" />
          <div className="absolute right-[-10%] top-[10%] h-[80%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.35),transparent_70%)] blur-2xl" />
        </div>
      )}
      <div className={cn("absolute inset-0 flex flex-col p-6 sm:p-8", centered ? "items-center justify-start pt-10 text-center" : "justify-center")}>
        <span className="label-mono text-white/60">( 00 ) —— AdTech &amp; Digital</span>
        <p className={cn("mt-3 font-display font-extrabold leading-[0.98] tracking-[-0.045em]", centered ? "text-[1.9rem] sm:text-[2.4rem]" : "max-w-[60%] text-[1.6rem] sm:text-[2.1rem]", poster && "uppercase tracking-[-0.03em]")}>
          {l1}
          <br />
          <span className="text-outline">{l2.split(" ").slice(0, -1).join(" ")}</span> <span className={cn("text-gradient", !poster && "serif-accent text-[1.1em]")}>{l2.split(" ").at(-1)}</span>
          <br />
          {l3.split(" ").slice(0, -1).join(" ")} <span className="text-outline-thin">{l3.split(" ").at(-1)}</span>
        </p>
        <div className={cn("mt-4 flex gap-2", centered && "justify-center")}>
          <span className="rounded-full bg-[linear-gradient(120deg,var(--color-accent),var(--color-accent-2)_45%,var(--color-violet))] px-4 py-1.5 text-[12px] font-semibold text-pure-white">Start a Project</span>
          <span className="glass rounded-full px-4 py-1.5 text-[12px] font-semibold">Explore</span>
        </div>
      </div>
      {/* deck stand-in so the composition reads */}
      {centered && <div className="absolute inset-x-[18%] bottom-[-6%] h-[26%] rounded-t-2xl border border-white/10 bg-ink-2/70 shadow-[0_-20px_60px_-20px_rgb(var(--accent-rgb)/0.5)]" />}
      {!centered && <div className="absolute right-[6%] top-[22%] h-[56%] w-[34%] rounded-2xl border border-white/10 bg-ink-2/70 shadow-[0_20px_60px_-20px_rgb(var(--accent-rgb)/0.6)]" />}
    </div>
  );
}

export default function ThemesLab() {
  const { skin, chosen } = useSkin();

  // full navigation on purpose: 3D lighting reads the skin tokens once at mount
  const preview = (id: SkinId) => {
    setSkin(id, { reload: false });
    window.location.assign(window.location.origin + "/");
  };

  return (
    <main className="relative pb-24">
      <div className="container-x flex items-center justify-between pt-6">
        <Link href="/lab" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white">
          <ArrowLeft className="size-4" /> Hero concepts
        </Link>
        <Logo markSize={26} id="lab-mark" />
      </div>

      <div className="container-x mt-10">
        <span className="label-mono">( lab ) — site themes</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl">
          Five directions. <span className="serif-accent text-gradient">Pick one.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-mute">
          Each theme retints every section — buttons, gradients, glass, 3D lighting — and gives the hero its own layout and signature graphic. Hit <b className="text-white">Preview on site</b> to browse the whole site in it; a pill at the bottom lets you switch anywhere.
        </p>
        {chosen && (
          <p className="label-mono mt-3 normal-case tracking-normal">
            Currently previewing <b className="text-white">{skins.find((s) => s.id === skin)?.name}</b>.{" "}
            <button type="button" onClick={() => setSkin(null)} className="text-white/70 underline underline-offset-4 hover:text-white">
              Exit preview
            </button>
          </p>
        )}

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {skins.map((s, i) => {
            const on = chosen && s.id === skin;
            return (
              <article key={s.id} className={cn("crystal rounded-[2rem] border bg-ink-2/60 p-3 transition-colors sm:p-4", on ? "border-white/40" : "border-white/10")}>
                <MiniHero id={s.id} />
                <div className="flex items-start justify-between gap-4 p-3 pt-5 sm:p-4 sm:pt-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="label-mono text-white/50">0{i + 1}</span>
                      <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-white">{s.name}</h2>
                      {s.id === "nebula" && <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">Current</span>}
                    </div>
                    <p className="mt-2 text-sm text-mute">{s.mood}</p>
                    <p className="mt-1 text-[13px] text-white/60">{s.says}</p>
                    <div className="mt-3 flex gap-1.5">
                      {s.palette.map((c) => (
                        <span key={c} className="size-5 rounded-full border border-white/15" style={{ background: c }} title={c} />
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => preview(s.id)}
                    className={cn(
                      "liquid-press inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold",
                      on ? "bg-white/[0.1] text-white" : "bg-[linear-gradient(120deg,var(--color-accent),var(--color-accent-2)_45%,var(--color-violet))] text-pure-white"
                    )}
                  >
                    {on ? (
                      <>
                        <Check className="size-4" strokeWidth={2.5} /> Previewing
                      </>
                    ) : (
                      <>
                        Preview on site <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <p className="label-mono mt-10 normal-case tracking-normal">
          Tell me the name and I make it the default and delete the rest — or mix them (e.g. Horizon layout with Nebula colours).
        </p>
        <Link href="/lab/templates" className="glass liquid-press mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white">
          Homepage templates →
        </Link>
      </div>
    </main>
  );
}
