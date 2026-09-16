import { cn } from "@/lib/utils";

type MarkProps = {
  size?: number;
  className?: string;
  /** "color" = gradient mark; "mono" = single-colour (currentColor) */
  tone?: "color" | "mono";
  id?: string;
  /** Override the centre pixel colour (e.g. dark on light backgrounds) */
  center?: string;
};

/**
 * Pixel ADX mark.
 * A 3×3 pixel grid where the five diagonal pixels light up to form an "X" —
 * the pixel grid literally becomes the X in ADX. The white centre pixel is the
 * exchange node: where advertisers, technology and audiences meet.
 */
export function LogoMark({ size = 36, className, tone = "color", id = "pxg", center: centerOverride }: MarkProps) {
  const c = [2, 24, 46]; // cell origins on a 64×64 canvas (16px cells, 6px gaps)
  const r = 4.5;
  const corner = tone === "color" ? `url(#${id})` : "currentColor";
  const center = centerOverride ?? (tone === "color" ? "var(--color-white)" : "currentColor");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38e1ff" />
          <stop offset="50%" stopColor="#4d7cfe" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* faint signal traces between diagonal pixels */}
      <g stroke={corner} strokeOpacity={tone === "color" ? 0.35 : 0.3} strokeWidth="1.5" strokeLinecap="round">
        <line x1="10" y1="10" x2="54" y2="54" />
        <line x1="54" y1="10" x2="10" y2="54" />
      </g>
      {/* corner pixels */}
      <rect x={c[0]} y={c[0]} width="16" height="16" rx={r} fill={corner} />
      <rect x={c[2]} y={c[0]} width="16" height="16" rx={r} fill={corner} />
      <rect x={c[0]} y={c[2]} width="16" height="16" rx={r} fill={corner} />
      <rect x={c[2]} y={c[2]} width="16" height="16" rx={r} fill={corner} />
      {/* centre exchange node */}
      <rect x={c[1]} y={c[1]} width="16" height="16" rx={r} style={{ fill: center }} />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  markSize?: number;
  tone?: "color" | "mono";
  wordmark?: boolean;
  id?: string;
};

export function Logo({ className, markSize = 34, tone = "color", wordmark = true, id }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3 select-none", className)}>
      <LogoMark size={markSize} tone={tone} id={id} />
      {wordmark && (
        <span
          className="font-display font-extrabold tracking-[-0.03em] leading-none"
          style={{ fontSize: markSize * 0.66 }}
        >
          <span className="text-white">Pixel</span>
          <span className={tone === "color" ? "text-gradient" : "text-current"}> ADX</span>
        </span>
      )}
    </span>
  );
}
