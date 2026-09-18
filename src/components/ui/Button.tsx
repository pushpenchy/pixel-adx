"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  arrow?: boolean;
  className?: string;
  onClick?: () => void;
};

/**
 * Magnetic button: the label drifts toward the cursor with a spring,
 * the arrow slides right on hover, and the primary variant carries a
 * subtle gradient + glow. Motion is disabled under prefers-reduced-motion.
 */
export function Button({
  href = "#",
  children,
  variant = "primary",
  size = "md",
  arrow = true,
  className,
  onClick,
}: ButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.32);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[box-shadow,background-color,border-color,color] duration-300 will-change-transform";
  const sizes = size === "lg" ? "h-13 px-7 text-[15px]" : "h-11 px-5.5 text-sm";
  const variants = {
    primary:
      "text-pure-white bg-[linear-gradient(120deg,var(--color-accent),var(--color-accent-2)_45%,var(--color-violet))] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),inset_0_-1px_0_0_rgba(0,0,0,0.15),0_10px_30px_-10px_rgb(var(--accent-rgb)/0.7)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),inset_0_-1px_0_0_rgba(0,0,0,0.15),0_14px_40px_-10px_rgb(var(--accent-rgb)/0.9)]",
    secondary:
      "glass text-white hover:[--glass-a1:0.18] hover:[--glass-a2:0.08] [[data-theme=light]_&]:hover:[--glass-a1:0.85] [[data-theme=light]_&]:hover:[--glass-a2:0.55]",
    ghost: "text-white/80 hover:text-white",
  }[variant];

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={cn(base, sizes, variants, className)}
    >
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[linear-gradient(120deg,transparent_20%,rgb(var(--fg)/0.18)_50%,transparent_80%)] bg-[length:200%_100%] animate-shimmer"
        />
      )}
      <span className="relative z-[1]">{children}</span>
      {arrow && (
        <ArrowRight
          className="relative z-[1] size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
          strokeWidth={2.2}
        />
      )}
    </motion.a>
  );
}
