"use client";

import { useEffect, useState } from "react";
import { makePanelTexture, PANEL_SIZE, type PanelSpec } from "@/components/three/textures";
import { accentColors } from "@/components/three/SceneCanvas";
import { cn } from "@/lib/utils";

/**
 * The same drawn dashboards the 3D deck uses, as a plain <img> — so HTML
 * layouts (bento tiles, cursor trails) share the deck's look. Drawn on the
 * client after mount; the accent follows the active skin.
 */
export const demoPanels: Record<string, PanelSpec> = {
  conversions: { title: "Conversions · 14d", value: "1,362", sub: "▲ 18.4% vs last period", kind: "line", accent: "#38e1ff", seed: 5 },
  roas: { title: "Performance", value: "4.2×", sub: "ROAS · demo data", kind: "kpis", accent: "#38e1ff", seed: 7 },
  spend: { title: "Spend by channel", value: "$12,480", sub: "Budget pacing on track", kind: "bars", accent: "#4d7cfe", seed: 9 },
  mix: { title: "Traffic mix", value: "2.41M", sub: "Impressions", kind: "donut", accent: "#8b5cf6", seed: 2 },
  reach: { title: "Audience reach", value: "5 regions", sub: "Live audiences by market", kind: "map", accent: "#8b5cf6", seed: 6 },
  channels: { title: "Active channels", value: "10 platforms · buying live", sub: "All systems nominal", kind: "channels", accent: "#34d399", seed: 4 },
  funnel: { title: "Conversion funnel", value: "0.056%", sub: "Impression → sale", kind: "funnel", accent: "#8b5cf6", seed: 3 },
  ab: { title: "Creative test", value: "+24%", sub: "Variant B lifts CTR", kind: "ab", accent: "#38e1ff", seed: 8 },
};

const cache = new Map<string, string>();
function render(spec: PanelSpec, scale: number) {
  const key = `${spec.kind}|${spec.title}|${scale}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [cyan, violet, accent] = accentColors();
  const map: Record<string, string> = { "#38e1ff": cyan, "#8b5cf6": violet, "#4d7cfe": accent };
  const tex = makePanelTexture({ ...spec, accent: map[spec.accent ?? ""] ?? spec.accent }, scale);
  const url = (tex.image as HTMLCanvasElement).toDataURL("image/png");
  tex.dispose();
  cache.set(key, url);
  return url;
}

export function PanelImage({ spec, className, scale = 1 }: { spec: PanelSpec; className?: string; scale?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setSrc(render(spec, scale)));
    return () => window.cancelAnimationFrame(id);
  }, [spec, scale]);
  const [w, h] = PANEL_SIZE[spec.kind];
  return (
    <span className={cn("block overflow-hidden", className)} style={{ aspectRatio: `${w} / ${h}` }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL drawn at runtime
        <img src={src} alt="" className="block size-full object-cover" draggable={false} />
      ) : (
        <span className="block size-full bg-white/[0.04]" />
      )}
    </span>
  );
}
