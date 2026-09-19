import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { templates } from "@/components/templates/list";

/**
 * Template picker: four alternative homepage compositions built from
 * ui-layouts-style blocks (image trail, sticky story, bento, clip-path
 * reveal, stacking cards, accordion, scroll-word reveal). Each opens as a
 * full page; themes from /lab/themes apply on top of any of them.
 */
export default function TemplatesLab() {
  return (
    <main className="relative pb-24">
      <div className="container-x flex items-center justify-between pt-6">
        <Link href="/lab/themes" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white">
          <ArrowLeft className="size-4" /> Site themes
        </Link>
        <Logo markSize={26} id="lab-mark" />
      </div>

      <div className="container-x mt-10">
        <span className="label-mono">( lab ) — homepage templates</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl">
          Four layouts. <span className="serif-accent text-gradient">Pick one.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-mute">
          Same content, four different compositions and motion systems — inspired by the ui-layouts.com block library. Each one is a full page: open it, scroll it, feel it. Themes from the theme picker apply on top of any template.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {templates.map((t, i) => (
            <Link key={t.id} href={`/t/${t.id}`} className="crystal group relative flex flex-col justify-between rounded-[2rem] border border-white/10 bg-ink-2/60 p-6 transition-colors hover:border-white/30 sm:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="label-mono text-white/50">0{i + 1}</span>
                  <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">{t.name}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-mute sm:text-[15px]">{t.tagline}</p>
                <p className="mt-2 text-[13px] text-white/60">{t.says}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.blocks.map((b) => (
                    <span key={b} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-white/60">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                Open template <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
          <div className="crystal flex flex-col justify-between rounded-[2rem] border border-white/10 bg-ink-2/40 p-6 sm:p-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="label-mono text-white/50">05</span>
                <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">Current</h2>
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">Live</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mute sm:text-[15px]">Split hero with the command deck, numbered service stage, bento industries, horizontal work rail.</p>
            </div>
            <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              Open homepage <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <p className="label-mono mt-10 normal-case tracking-normal">
          Tell me the template name (and a theme) — it becomes the homepage and gets the full polish pass. Blocks can be mixed: e.g. Reveal hero + Bento services.
        </p>
      </div>
    </main>
  );
}
