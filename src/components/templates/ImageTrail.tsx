"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { logos, type Logo, type LogoKey } from "@/content/logos";
import { demoPanels, PanelImage } from "./PanelImage";
import { cn } from "@/lib/utils";

/**
 * Cursor image-trail (ui-layouts "Image-Mousetrail"), rebuilt with brand
 * tiles instead of stock photos: every ~110px of pointer travel spawns a
 * dashboard card or platform logo under the cursor, which drifts up and
 * fades. Pure decoration — pointer-events never leave the children.
 */
const LOGO_TILES: LogoKey[] = ["meta", "googleads", "tiktok", "youtube", "snapchat", "x", "linkedin", "pinterest"];
const PANEL_KEYS = Object.keys(demoPanels);

type Tile = { id: number; x: number; y: number; r: number; kind: "panel" | "logo"; key: string };

function LogoTile({ k }: { k: LogoKey }) {
  const l: Logo = logos[k];
  const dark = parseInt(l.hex, 16) < 0x222222;
  return (
    <span className="grid size-full place-items-center rounded-2xl border border-white/12 bg-ink-2/90 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
      <svg viewBox="0 0 24 24" className="size-[42%]" style={{ color: dark ? "#fff" : `#${l.hex}` }} aria-hidden>
        {l.paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill ?? "currentColor"} />
        ))}
      </svg>
    </span>
  );
}

export function ImageTrail({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const seq = useRef(0);

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const p = last.current;
    if (p && Math.hypot(x - p.x, y - p.y) < 110) return;
    last.current = { x, y };
    const n = seq.current++;
    const kind: Tile["kind"] = n % 3 === 2 ? "logo" : "panel";
    const key = kind === "logo" ? LOGO_TILES[n % LOGO_TILES.length] : PANEL_KEYS[n % PANEL_KEYS.length];
    const tile: Tile = { id: n, x, y, r: ((n * 37) % 22) - 11, kind, key };
    setTiles((t) => [...t.slice(-9), tile]);
    window.setTimeout(() => setTiles((t) => t.filter((k) => k.id !== n)), 1100);
  };

  return (
    <div onPointerMove={onMove} className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
        <AnimatePresence>
          {tiles.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.55, x: t.x, y: t.y, rotate: t.r }}
              animate={{ opacity: 1, scale: 1, x: t.x, y: t.y - 40, rotate: t.r }}
              exit={{ opacity: 0, scale: 0.9, y: t.y - 120 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={cn("absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2", t.kind === "panel" ? "w-[180px] sm:w-[220px]" : "size-[76px] sm:size-[92px]")}
              style={{ translateX: "-50%", translateY: "-50%" }}
            >
              {t.kind === "panel" ? (
                <PanelImage spec={demoPanels[t.key]} className="rounded-2xl border border-white/12 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]" scale={0.5} />
              ) : (
                <LogoTile k={t.key as LogoKey} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {children}
    </div>
  );
}
