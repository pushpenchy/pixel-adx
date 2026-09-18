"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";

/**
 * Inertial smooth scrolling (Lenis). Drives the native window scroll, so
 * Framer's useScroll, IntersectionObservers and anchor links keep working.
 * Disabled under prefers-reduced-motion.
 */
export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    // The browser restores the previous scroll offset after load; Lenis would
    // animate that as a long slide. Start at the top instead.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      anchors: { offset: -80 },
    });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}
