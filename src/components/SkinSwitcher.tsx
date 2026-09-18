"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { setSkin, skins, useSkin } from "@/lib/skin";
import { cn } from "@/lib/utils";

/**
 * Floating theme pill, shown only while a skin is being previewed (chosen at
 * /lab/themes). Lets the client flip directions anywhere on the site.
 */
export function SkinSwitcher() {
  const { skin, chosen } = useSkin();
  if (!chosen) return null;
  return (
    <div className="glass glass-flat fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5 pl-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] sm:left-4 sm:translate-x-0">
      <span className="label-mono mr-1 hidden text-white/50 sm:inline">Theme</span>
      {skins.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setSkin(s.id)}
          title={s.name}
          className={cn(
            "grid size-8 place-items-center rounded-full border transition-all",
            skin === s.id ? "border-white/60 bg-white/[0.1] scale-105" : "border-transparent hover:border-white/25"
          )}
        >
          <span className="size-4 rounded-full" style={{ background: `linear-gradient(135deg, ${s.palette[1]}, ${s.palette[2]} 60%, ${s.palette[3]})` }} />
          <span className="sr-only">{s.name}</span>
        </button>
      ))}
      <Link href="/lab/themes" className="ml-1 hidden rounded-full px-2.5 py-1 text-[12px] font-semibold text-white/70 hover:text-white sm:inline">
        Compare
      </Link>
      <button type="button" onClick={() => setSkin(null)} title="Exit preview" className="grid size-8 place-items-center rounded-full text-white/60 hover:bg-white/[0.08] hover:text-white">
        <X className="size-4" />
      </button>
    </div>
  );
}
