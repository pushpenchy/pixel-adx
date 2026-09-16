"use client";

import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/ui/Reveal";
import { stats } from "@/content/site";

/** Qualitative trust strip. Values are editable in src/content/site.ts */
export function Stats() {
  return (
    <section aria-label="Pixel ADX at a glance" className="relative py-6 lg:py-10">
      <div className="container-x">
        <Stagger className="crystal relative grid grid-cols-2 overflow-hidden rounded-xl3 border border-white/10 bg-white/[0.025] lg:grid-cols-4">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(120,170,255,0.6),transparent)]" />
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={staggerItem}
              className={[
                "group relative px-4 py-6 sm:px-8 sm:py-8 lg:py-10",
                i % 2 === 1 ? "border-l border-white/10" : "",
                i >= 2 ? "border-t border-white/10 lg:border-t-0" : "",
                i >= 1 ? "lg:border-l" : "",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(400px_circle_at_50%_120%,rgba(77,124,254,0.14),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p className="font-display text-[17px] font-extrabold tracking-[-0.03em] text-white sm:text-3xl lg:text-[2.1rem]">
                {s.value}
              </p>
              <p className="mt-1.5 text-sm text-mute">{s.label}</p>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
