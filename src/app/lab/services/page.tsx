"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ServicesStage } from "@/components/sections/ServicesStage";
import { ServicesBento } from "@/components/sections/ServicesBento";
import { ServicesStory } from "@/components/sections/ServicesStory";
import { cn } from "@/lib/utils";

type Concept = "stage" | "bento" | "story";
const concepts: { id: Concept; name: string; blurb: string }[] = [
  { id: "stage", name: "Stage", blurb: "List + a sticky 3D stage that swaps to the hovered service." },
  { id: "bento", name: "Bento", blurb: "Every service is a card with its own live 3D vignette." },
  { id: "story", name: "Story", blurb: "Pinned section — scrolling steps through each service." },
];

function Lab() {
  const params = useSearchParams();
  const initial = (params.get("concept") as Concept | null) ?? "stage";
  const [active, setActive] = useState<Concept>(concepts.some((c) => c.id === initial) ? initial : "stage");

  return (
    <main className="relative">
      <div className="container-x flex items-center justify-between pt-6">
        <Link href="/lab" className="inline-flex items-center gap-2 text-sm text-mute hover:text-white">
          <ArrowLeft className="size-4" /> Hero concepts
        </Link>
        <Logo markSize={26} id="lab-mark" />
      </div>

      <div className="container-x mt-10">
        <span className="label-mono">( lab ) — services section concepts</span>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {concepts.map((c, i) => {
            const on = c.id === active;
            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={cn("glass liquid-press flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left", on ? "[--glass-a1:0.2] [--glass-a2:0.1] ring-1 ring-accent/60" : "hover:[--glass-a1:0.16]")}
              >
                <span className="label-mono w-6 text-white/50">0{i + 1}</span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-white">{c.name}</span>
                  <span className="block text-[12px] text-mute">{c.blurb}</span>
                </span>
                {on && (
                  <span className="grid size-6 place-items-center rounded-full bg-[linear-gradient(135deg,#38e1ff,#8b5cf6)] text-pure-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="label-mono mt-3 normal-case tracking-normal">
          Tell me the name — it replaces the current services section and gets the polish pass. Direct link: <code className="text-white/70">/lab/services?concept={active}</code>
        </p>
      </div>

      <div key={active} className="mt-4">
        {active === "stage" && <ServicesStage />}
        {active === "bento" && <ServicesBento />}
        {active === "story" && <ServicesStory />}
      </div>
      <div className="h-24" />
    </main>
  );
}

export default function ServicesLabPage() {
  return (
    <Suspense fallback={null}>
      <Lab />
    </Suspense>
  );
}
