"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

const QUERY = "(pointer: fine)";
function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const useFinePointer = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);

/**
 * Soft light that follows the pointer across the whole page.
 * Only renders on fine-pointer devices; a single fixed element using
 * transform so it never causes layout.
 */
export function CursorGlow() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const enabled = fine && !reduce;
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const sx = useSpring(x, { stiffness: 120, damping: 24, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 24, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 size-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,0.12),rgba(56,225,255,0.05)_45%,transparent_70%)] mix-blend-screen [[data-theme=light]_&]:mix-blend-multiply will-change-transform"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
    />
  );
}
