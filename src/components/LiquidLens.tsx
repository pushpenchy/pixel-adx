"use client";

import { useEffect } from "react";

/**
 * Liquid Glass lens distortion.
 *
 * Renders an SVG displacement filter that `.glass-lens` elements reference
 * through `backdrop-filter: url(#px-lens)`. Only Chromium composites SVG
 * backdrop filters correctly, so the html.lens flag is set there and the
 * rest of the browsers fall back to the plain frosted material.
 */
export function LiquidLens() {
  useEffect(() => {
    const ua = navigator.userAgent;
    const chromium = ua.includes("Chrome/") && !ua.includes("Firefox"); // Safari and iOS browsers never carry "Chrome/"
    const supported = typeof CSS !== "undefined" && CSS.supports("backdrop-filter", "url(#px-lens)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (chromium && supported && !reduce) document.documentElement.classList.add("lens");

    // Cursor-tracked specular highlight on any .glass surface — one delegated
    // listener, writes two CSS vars, no per-element JS. Fine pointers only.
    const fine = window.matchMedia("(pointer: fine)").matches;
    let last: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(".glass") as HTMLElement | null;
      if (last && last !== el) {
        last.style.removeProperty("--px");
        last.style.removeProperty("--py");
      }
      last = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    if (fine && !reduce) document.addEventListener("pointermove", onMove, { passive: true });

    // While scrolling, flag <html> so the (expensive) lens distortion and grain
    // are suspended; they come back ~150ms after the scroll settles.
    let t = 0;
    const onScroll = () => {
      const root = document.documentElement;
      if (!root.classList.contains("scrolling")) root.classList.add("scrolling");
      window.clearTimeout(t);
      t = window.setTimeout(() => root.classList.remove("scrolling"), 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.documentElement.classList.remove("lens");
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <svg aria-hidden className="pointer-events-none absolute size-0" focusable="false">
      <defs>
        <filter id="px-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* low-frequency ripple → gentle refraction, not noise */}
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="7" result="ripple" />
          <feGaussianBlur in="ripple" stdDeviation="1.5" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
