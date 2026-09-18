import { Marquee } from "./Marquee";
import { cn } from "@/lib/utils";

/**
 * Oversized editorial ticker between sections — alternating solid / outline
 * words with the brand mark as a separator.
 */
export function TextTicker({ items, className, reverse }: { items: string[]; className?: string; reverse?: boolean }) {
  return (
    <div className={cn("hairline border-b border-b-white/10 py-5 sm:py-7", className)} aria-hidden>
      <Marquee duration={38} reverse={reverse} gap="0" pauseOnHover={false}>
        {items.map((w, i) => (
          <span key={i} className="flex items-center">
            <span
              className={cn(
                "whitespace-nowrap px-5 font-display text-[2rem] font-extrabold uppercase leading-none tracking-[-0.03em] sm:text-6xl lg:text-7xl",
                i % 2 ? "text-outline-thin" : "text-white"
              )}
            >
              {w}
            </span>
            <span className="grid size-3 rotate-45 place-items-center bg-[linear-gradient(135deg,var(--color-cyan),var(--color-violet))]" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
