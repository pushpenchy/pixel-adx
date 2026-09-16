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

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-mute",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(77,124,254,0.6)]" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  subtitle,
  align = "left",
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: string;
  /** Optional trailing words rendered in the brand gradient */
  accent?: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <h2
        className={cn(
          "mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] leading-[1.02] text-white",
          titleClassName
        )}
      >
        <TextReveal text={title} />
        {accent && (
          <>
            {" "}
            <TextReveal text={accent} gradient delay={0.2} />
          </>
        )}
      </h2>
      {subtitle && (
        <Reveal delay={0.15}>
          <p className="mt-6 text-base sm:text-lg text-mute leading-relaxed">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
