/**
 * Device quality tier. "lite" trims the expensive layers (bloom, sparkles,
 * texture resolution, blur radii) on phones, tablets and low-core machines so
 * scrolling stays smooth. Evaluated once on the client.
 */
let cached: boolean | null = null;

export function isLiteDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (cached !== null) return cached;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 900;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  cached = coarse || small || cores <= 4 || mem <= 4;
  return cached;
}
