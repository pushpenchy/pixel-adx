"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { scenes, type SceneId } from "@/components/three/HeroScene";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const ids = Object.keys(scenes) as SceneId[];

function Lab() {
  const params = useSearchParams();
  const initial = (params.get("scene") as SceneId | null) ?? "sphere";
  const [active, setActive] = useState<SceneId>(ids.includes(initial) ? initial : "sphere");
  const reduce = useReducedMotion();
  const { theme } = useTheme();
  const s = scenes[active];

  return (
    <main className="relative min-h-[100svh] overflow-hidden">
      {/* live preview in the real hero framing */}
      <div className="pointer-events-none absolute inset-x-0 top-20 h-[50vh] lg:inset-y-0 lg:left-[38%] lg:right-[-6%] lg:h-auto" aria-hidden>
        <HeroScene key={active} scene={active} reduce={!!reduce} light={theme === "light"} />
      </div>

      <div className="container-x relative flex min-h-[100svh] flex-col pt-6 pb-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white">
            <ArrowLeft className="size-4" /> Back to site
          </Link>
          <Logo markSize={26} id="lab-mark" />
        </header>

        <div className="mt-[52vh] lg:mt-auto lg:max-w-[40rem]">
          <span className="label-mono">( lab ) — hero 3D concepts</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl">
            {s.name.split(" ").slice(0, -1).join(" ")} <span className="serif-accent text-[1.1em] text-gradient">{s.name.split(" ").at(-1)}</span>
          </h1>
          <p className="mt-4 max-w-md text-mute">{s.tagline}</p>
          <p className="mt-2 max-w-md text-sm text-white/55">
            <span className="text-white/35">It says: </span>
            {s.says}
          </p>

          <ol className="mt-8 grid gap-2 sm:grid-cols-2 lg:mb-10">
            {ids.map((id, i) => {
              const on = id === active;
              return (
                <li key={id}>
                  <button
                    onClick={() => setActive(id)}
                    className={cn(
                      "glass liquid-press flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors",
                      on ? "[--glass-a1:0.2] [--glass-a2:0.1] ring-1 ring-accent/60" : "hover:[--glass-a1:0.16]"
                    )}
                  >
                    <span className="label-mono w-8 text-white/50">0{i + 1}</span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-white">{scenes[id].name}</span>
                      <span className="block text-[12px] text-mute">{scenes[id].tagline}</span>
                    </span>
                    {on && (
                      <motion.span layoutId="lab-check" className="grid size-6 place-items-center rounded-full bg-[linear-gradient(135deg,#38e1ff,#8b5cf6)] text-pure-white">
                        <Check className="size-3.5" strokeWidth={3} />
                      </motion.span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="label-mono mt-6 normal-case tracking-normal">
            Pick one and tell me its name — it becomes the hero and gets the full polish pass. Direct link: <code className="text-white/70">/lab?scene={active}</code>
          </p>
          <Link href="/lab/services" className="glass liquid-press mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white">
            Services section concepts →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LabPage() {
  return (
    <Suspense fallback={null}>
      <Lab />
    </Suspense>
  );
}
