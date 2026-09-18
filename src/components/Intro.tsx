"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const KEY = "px-intro-seen";
const noop = () => () => {};
const seenBefore = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
};

/**
 * Brand intro: the five pixels of the mark assemble, the wordmark fades in,
 * then the curtain lifts to reveal the page. ~1.6s, once per session.
 */
export function Intro() {
  const reduce = useReducedMotion();
  const seen = useSyncExternalStore(noop, seenBefore, () => true);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (seen || reduce) return;
    document.documentElement.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      setOpen(false);
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
    }, 1650);
    return () => {
      window.clearTimeout(t);
      document.documentElement.style.overflow = "";
    };
  }, [seen, reduce]);

  if (seen || reduce) return null;

  const cells = [
    [2, 2],
    [46, 2],
    [24, 24],
    [2, 46],
    [46, 46],
  ];

  return (
    <AnimatePresence onExitComplete={() => (document.documentElement.style.overflow = "")}>
      {open && (
        <motion.div
          key="intro"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center bg-ink"
          aria-hidden
        >
          <div className="flex flex-col items-center gap-6">
            <svg width="88" height="88" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="intro-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38e1ff" />
                  <stop offset="50%" stopColor="#4d7cfe" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              {cells.map(([x, y], i) => (
                <motion.rect
                  key={i}
                  x={x}
                  y={y}
                  width="16"
                  height="16"
                  rx="4.5"
                  fill={i === 2 ? "#fff" : "url(#intro-g)"}
                  style={{ transformOrigin: `${x + 8}px ${y + 8}px` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </svg>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="font-display text-2xl font-extrabold tracking-[-0.03em] text-white"
            >
              Pixel<span className="text-gradient"> ADX</span>
            </motion.p>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 1.2, ease: "easeInOut" }}
              className="h-px w-40 origin-left bg-[linear-gradient(90deg,#38e1ff,#4d7cfe,#8b5cf6)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
