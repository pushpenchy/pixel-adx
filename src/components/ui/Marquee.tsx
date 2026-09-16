"use client";

import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** seconds for one full loop */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  gap?: string;
};

/**
 * Infinite, seamless marquee. The content is rendered twice and the track
 * translates by exactly -50%, so the loop never jumps. Pure CSS animation
 * (transform only). Under prefers-reduced-motion it degrades to a static,
 * wrapping row.
 */
export function Marquee({ children, duration = 40, reverse = false, pauseOnHover = true, className, gap = "1rem" }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={cn("flex flex-wrap justify-center", className)} style={{ gap }}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn("group/marquee relative flex overflow-hidden mask-fade-x", className)}
      style={{ ["--gap" as string]: gap, ["--duration" as string]: `${duration}s` }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn(
            "flex shrink-0 items-center will-change-transform",
            reverse ? "animate-marquee-reverse" : "animate-marquee",
            pauseOnHover && "group-hover/marquee:[animation-play-state:paused]"
          )}
          style={{ gap: "var(--gap)", paddingRight: "var(--gap)", animationDuration: `${duration}s` }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
