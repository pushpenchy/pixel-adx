"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TextReveal } from "@/components/ui/TextReveal";
import { brand } from "@/content/site";

export function CTA() {
  const reduce = useReducedMotion();

  return (
    <section id="contact" className="relative scroll-mt-20 py-24 sm:py-28 lg:py-36">
      <div className="container-x">
        <div className="crystal relative overflow-hidden rounded-[2rem] border border-white/10 px-6 py-20 text-center sm:px-12 sm:py-28 lg:py-36">
          {/* moving light field */}
          <div aria-hidden className="absolute inset-0 -z-[1] bg-ink-2" />
          <motion.div
            aria-hidden
            animate={reduce ? undefined : { x: ["-10%", "10%", "-10%"], y: ["-6%", "8%", "-6%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-1/4 -top-1/2 -z-[1] h-[140%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,0.35),transparent)] blur-3xl will-change-transform"
          />
          <motion.div
            aria-hidden
            animate={reduce ? undefined : { x: ["8%", "-12%", "8%"], y: ["6%", "-8%", "6%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1/2 -right-1/4 -z-[1] h-[140%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.32),transparent)] blur-3xl will-change-transform"
          />
          <div aria-hidden className="absolute inset-0 -z-[1] bg-grid opacity-50 mask-radial" />
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(var(--fg)/0.5),transparent)]" />

          <h2 className="mx-auto max-w-4xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            <TextReveal text="Have a Big Idea?" />
            <br />
            <TextReveal text="Let's Build It." gradient delay={0.25} />
          </h2>
          <Reveal delay={0.3}>
            <p className="mx-auto mt-6 max-w-xl text-base text-mute sm:text-lg">
              Tell us what you&apos;re building, what you&apos;re scaling, or what you&apos;re trying to solve.
            </p>
          </Reveal>
          <Reveal delay={0.4} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={`mailto:${brand.email}`} size="lg">
              Start a Project
            </Button>
            <Button href={`mailto:${brand.email}`} size="lg" variant="secondary" arrow={false}>
              Talk to Pixel ADX
            </Button>
          </Reveal>
          <Reveal delay={0.5} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
            <span className="inline-flex items-center gap-2">
              <Mail className="size-4" /> {brand.email}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4" /> {brand.location}
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
