"use client";

import React, { useRef, type ReactNode, type MouseEvent, type CSSProperties } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  /** How far the card lifts on hover (px) */
  lift?: number;
  /** Enable subtle 3D tilt */
  tilt?: boolean;
  style?: CSSProperties;
  as?: "div" | "article" | "li" | "a";
  href?: string;
};

/**
 * Card with cursor-following spotlight, glowing border and lift on hover.
 * Uses only transform/opacity for the animated parts.
 */
export function SpotlightCard({ children, className, lift = 6, tilt = false, style, as = "div", href }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    mx.set(px);
    my.set(py);
    if (tilt && !reduce) {
      ry.set(((px / r.width) - 0.5) * 6);
      rx.set(-((py / r.height) - 0.5) * 6);
    }
  };
  const onLeave = () => {
    mx.set(-1000);
    my.set(-1000);
    rx.set(0);
    ry.set(0);
  };

  const spotlight = useMotionTemplate`radial-gradient(360px circle at ${mx}px ${my}px, rgba(77,124,254,0.16), transparent 60%)`;
  const border = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(120,170,255,0.7), transparent 70%)`;

  const Comp = motion[as] as unknown as React.ComponentType<Record<string, unknown>>;

  return (
    <Comp
      ref={ref as never}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={reduce ? undefined : { y: -lift }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, ...style }}
      className={cn(
        "group relative overflow-hidden rounded-xl2 card-surface crystal will-change-transform",
        className
      )}
    >
      {/* glowing border that follows the cursor */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: border,
          WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: 1,
        }}
      />
      {/* cursor spotlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <div className="relative h-full">{children}</div>
    </Comp>
  );
}
