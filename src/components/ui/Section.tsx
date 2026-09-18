import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { TextReveal } from "./TextReveal";

export function Section({
  id,
  children,
  className,
  bleed,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section id={id} className={cn("relative py-24 sm:py-28 lg:py-36 scroll-mt-20", className)}>
      {bleed ? children : <div className="container-x">{children}</div>}
    </section>
  );
}

/**
 * Editorial section label: "( 02 ) — SERVICES" in mono.
 * Replaces the pill chip — quieter, more typographic.
 */
export function Eyebrow({ children, index, className }: { children: ReactNode; index?: string; className?: string }) {
  return (
    <span className={cn("label-mono inline-flex items-center gap-3", className)}>
      {index && <span className="text-white/70">( {index} )</span>}
      <span className="h-px w-8 bg-white/25" aria-hidden />
      {children}
    </span>
  );
}

/**
 * Asymmetric heading: huge display title on the left, the supporting copy
 * sits in a narrower right column, bottom-aligned. `accent` renders in
 * italic serif — the editorial contrast that keeps it from feeling generic.
 */
export function SectionHeading({
  eyebrow,
  index,
  title,
  accent,
  subtitle,
  align = "left",
  className,
  titleClassName,
}: {
  eyebrow?: string;
  index?: string;
  title: string;
  accent?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  const heading = (
    <h2
      className={cn(
        "font-display text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl",
        titleClassName
      )}
    >
      <TextReveal text={title} />
      {accent && (
        <>
          {" "}
          <span className="serif-accent text-[1.12em] text-gradient">
            <TextReveal text={accent} delay={0.18} gradient />
          </span>
        </>
      )}
    </h2>
  );

  if (align === "center") {
    return (
      <div className={cn("mx-auto max-w-3xl text-center", className)}>
        {eyebrow && (
          <Reveal>
            <Eyebrow index={index}>{eyebrow}</Eyebrow>
          </Reveal>
        )}
        <div className="mt-6">{heading}</div>
        {subtitle && (
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mute sm:text-lg">{subtitle}</p>
          </Reveal>
        )}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 lg:grid-cols-12 lg:items-end", className)}>
      <div className="lg:col-span-8">
        {eyebrow && (
          <Reveal>
            <Eyebrow index={index}>{eyebrow}</Eyebrow>
          </Reveal>
        )}
        <div className="mt-6">{heading}</div>
      </div>
      {subtitle && (
        <Reveal delay={0.15} className="lg:col-span-4">
          <p className="max-w-sm text-base leading-relaxed text-mute lg:pb-2">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
