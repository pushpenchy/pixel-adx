"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Dark / light switch. A pill with a sliding knob; the sun and moon
 * cross-fade and rotate as the knob moves. Accessible as a switch.
 */
export function ThemeToggle({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const { theme, toggle } = useTheme();
  const reduce = useReducedMotion();
  const light = theme === "light";
  const lg = size === "lg";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      title={light ? "Dark mode" : "Light mode"}
      onClick={toggle}
      className={cn(
        "glass liquid-press group relative inline-flex shrink-0 items-center rounded-full",
        lg ? "h-11 w-[84px] px-1" : "h-9 w-[68px] px-1",
        className
      )}
    >
      {/* track icons */}
      <span className={cn("pointer-events-none absolute inset-y-0 flex items-center text-white/45", lg ? "left-3.5" : "left-3")}>
        <Sun className={lg ? "size-4" : "size-3.5"} strokeWidth={2} />
      </span>
      <span className={cn("pointer-events-none absolute inset-y-0 flex items-center text-white/45", lg ? "right-3.5" : "right-3")}>
        <Moon className={lg ? "size-4" : "size-3.5"} strokeWidth={2} />
      </span>

      {/* knob */}
      <motion.span
        layout
        aria-hidden
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 34 }}
        className={cn(
          "relative z-[1] grid place-items-center rounded-full bg-[linear-gradient(135deg,#38e1ff,#4d7cfe,#8b5cf6)] text-pure-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_2px_10px_-2px_rgba(77,124,254,0.8)]",
          lg ? "size-9" : "size-7",
          light ? "ml-0" : "ml-auto"
        )}
      >
        <motion.span
          key={theme}
          initial={reduce ? false : { rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid place-items-center"
        >
          {light ? <Sun className={lg ? "size-4" : "size-3.5"} strokeWidth={2.2} /> : <Moon className={lg ? "size-4" : "size-3.5"} strokeWidth={2.2} />}
        </motion.span>
      </motion.span>
    </button>
  );
}
