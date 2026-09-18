"use client";

import { useSyncExternalStore } from "react";

/**
 * Skins — whole-site visual directions the client can preview at /lab/themes.
 * A skin is a set of CSS tokens on <html data-skin> (see globals.css) plus a
 * hero layout and a signature backdrop asset. The choice is kept in
 * localStorage so the whole site can be browsed in it.
 */
export type SkinId = "nebula" | "horizon" | "aurora" | "mono" | "sunset";
export type HeroLayout = "split" | "centered";

export const SKIN_KEY = "px-skin";

export const skins: {
  id: SkinId;
  name: string;
  mood: string;
  says: string;
  layout: HeroLayout;
  /** swatches shown on the picker */
  palette: [string, string, string, string];
}[] = [
  {
    id: "nebula",
    name: "Nebula",
    mood: "Electric blue → cyan → violet on deep ink. Liquid glass, holographic 3D deck.",
    says: "The current direction: premium AdTech control-room energy.",
    layout: "split",
    palette: ["#050507", "#4d7cfe", "#38e1ff", "#8b5cf6"],
  },
  {
    id: "horizon",
    name: "Horizon",
    mood: "Navy black with a planet-edge glow, centred headline, orbiting badge.",
    says: "Cinematic and calm — the 'view from orbit' agency look.",
    layout: "centered",
    palette: ["#03060e", "#2f6bff", "#8fc7ff", "#ffffff"],
  },
  {
    id: "aurora",
    name: "Aurora",
    mood: "Emerald, teal and sky drifting like northern lights behind the copy.",
    says: "Growth and freshness — reads as performance and results.",
    layout: "split",
    palette: ["#03080a", "#22c55e", "#5eead4", "#0ea5e9"],
  },
  {
    id: "mono",
    name: "Mono",
    mood: "Black and white, one signal orange, halftone texture, giant type.",
    says: "Editorial and confident — the studio / creative-agency look.",
    layout: "centered",
    palette: ["#050505", "#ffffff", "#ff5a1f", "#8a8a8a"],
  },
  {
    id: "sunset",
    name: "Sunset",
    mood: "Coral, magenta and amber over warm charcoal with a retro sun and grid.",
    says: "Warm, bold and human — stands out from every blue tech site.",
    layout: "centered",
    palette: ["#0a0507", "#ff6a3d", "#f43f8e", "#fbbf24"],
  },
];

const isSkin = (v: string | null | undefined): v is SkinId => !!v && skins.some((s) => s.id === v);

const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;

function snapshot(): SkinId {
  if (typeof document === "undefined") return "nebula";
  const v = document.documentElement.dataset.skin;
  return isSkin(v) ? v : "nebula";
}
function chosenSnapshot(): boolean {
  try {
    return isSkin(localStorage.getItem(SKIN_KEY));
  } catch {
    return false;
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!observer && typeof MutationObserver !== "undefined") {
    observer = new MutationObserver(() => listeners.forEach((l) => l()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-skin"] });
  }
  return () => {
    listeners.delete(cb);
  };
}

export function useSkin(): { skin: SkinId; layout: HeroLayout; chosen: boolean } {
  const skin = useSyncExternalStore(subscribe, snapshot, () => "nebula" as SkinId);
  const chosen = useSyncExternalStore(subscribe, chosenSnapshot, () => false);
  return { skin, layout: skins.find((s) => s.id === skin)!.layout, chosen };
}

/** Apply a skin site-wide (null = back to the default and stop previewing). Reloads: 3D lighting reads the tokens once at mount. */
export function setSkin(id: SkinId | null, opts: { reload?: boolean } = { reload: true }) {
  try {
    if (id) localStorage.setItem(SKIN_KEY, id);
    else localStorage.removeItem(SKIN_KEY);
  } catch {}
  if (id && id !== "nebula") document.documentElement.dataset.skin = id;
  else delete document.documentElement.dataset.skin;
  listeners.forEach((l) => l());
  if (opts.reload) window.location.reload();
}

/** Pre-hydration: restore the previewed skin before first paint. */
export const skinInitScript = `(function(){try{var s=localStorage.getItem("${SKIN_KEY}");if(s&&s!=="nebula")document.documentElement.dataset.skin=s;}catch(e){}})();`;
