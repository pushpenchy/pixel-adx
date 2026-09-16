/**
 * Fixed page background: subtle grid, slow animated gradient blobs and a
 * radial vignette. Pure CSS — transforms only — so it stays off the main thread.
 */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      {/* grid */}
      <div className="absolute inset-0 bg-grid mask-radial opacity-70" />
      {/* blobs */}
      <div className="absolute -top-[20%] -left-[10%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(closest-side,rgba(77,124,254,var(--blob-a)),transparent)] blur-3xl animate-blob will-change-transform" />
      <div className="absolute -bottom-[30%] -right-[15%] h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,var(--blob-b)),transparent)] blur-3xl animate-blob-slow will-change-transform" />
      <div className="absolute top-[30%] right-[10%] h-[40vmax] w-[40vmax] rounded-full bg-[radial-gradient(closest-side,rgba(56,225,255,var(--blob-c)),transparent)] blur-3xl animate-blob will-change-transform [animation-delay:-8s]" />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,rgb(var(--bg)/0.8)_100%)]" />
    </div>
  );
}
