"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import { brand } from "@/content/site";
import { HeroVisual } from "./HeroVisual";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const yVisual = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0.2]);

  return (
    <section id="home" ref={ref} className="relative overflow-hidden pt-32 pb-16 sm:pt-40 lg:pt-44 lg:pb-24">
      {/* hero-specific light */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-[1] h-[600px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(77,124,254,var(--blob-a)),transparent_60%)]" />

      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6">
        <motion.div style={{ y: yText, opacity: fade }} className="relative">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            <Eyebrow><span className="hidden sm:inline">{brand.eyebrow}</span><span className="sm:hidden">{brand.eyebrow.split(" — ").pop()}</span></Eyebrow>
          </motion.div>

          <h1 className="mt-7 font-display text-[2.6rem] leading-[1.04] font-extrabold tracking-[-0.04em] text-white sm:text-6xl lg:text-[3.25rem] xl:text-[4rem]">
            {brand.coreMessage.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
                <motion.span
                  className={`block ${i === 1 ? "text-gradient" : ""}`}
                  initial={reduce ? false : { y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease }}
            className="mt-7 max-w-xl text-base leading-relaxed text-mute sm:text-lg"
          >
            {brand.description}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href="#contact" size="lg">
              Start a Project
            </Button>
            <Button href="#services" size="lg" variant="secondary" arrow={false}>
              Explore Our Services
            </Button>
          </motion.div>

          <motion.ul
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-medium uppercase tracking-[0.16em] text-white/40"
          >
            {["AdTech", "Media Buying", "Software", "Digital Growth"].map((t, i) => (
              <li key={t} className="flex items-center gap-5">
                {i > 0 && <span className="size-1 rounded-full bg-white/20" />}
                {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          style={{ y: yVisual }}
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
          className="relative lg:-mr-8"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
