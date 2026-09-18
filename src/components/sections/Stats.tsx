"use client";

import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/ui/Reveal";
import { stats } from "@/content/site";

/** Qualitative trust strip — big numerals on hairlines, no boxes. Editable in src/content/site.ts */
export function Stats() {
  return (
    <section aria-label="Pixel ADX at a glance" className="relative py-10 lg:py-16">
      <div className="container-x">
        <Stagger className="hairline grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={staggerItem}
              className="group relative border-b border-white/10 px-1 pb-8 pt-7 sm:pb-10 lg:border-b-0 lg:px-6 lg:first:pl-0"
            >
              <span className="label-mono text-white/40">0{i + 1}</span>
              <p className="mt-4 font-display text-xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.75rem] lg:leading-none">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-mute">{s.label}</p>
              <span aria-hidden className="absolute bottom-0 left-0 h-px w-0 bg-[linear-gradient(90deg,var(--color-cyan),var(--color-violet))] transition-all duration-500 group-hover:w-full lg:-bottom-px" />
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
