# Pixel ADX — corporate website

> **We Build Technology. We Buy Attention. We Drive Growth.**

Premium, dark, animated single-page site for Pixel ADX (AdTech • Media Buying • Software • Digital Growth), plus a minimalist brand identity.

## Stack

- **Next.js 16** (App Router, static export-ready) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (design tokens in `src/app/globals.css`)
- **Framer Motion** for scroll/hover/spring animation · SMIL `animateMotion` for SVG data packets (no per-frame JS)
- **Lucide** icons · `next/font` (Inter + Manrope)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all routes are static)
npm run lint
```

## Where to edit content

All copy, nav, services, industries, process steps, testimonials, case studies and map points live in **`src/content/site.ts`**. That file is the "CMS" layer:

| What | Note |
| --- | --- |
| `stats` | Qualitative by design — no invented client numbers. |
| `testimonials` | **Placeholders.** Replace only with real, permitted quotes. |
| `caseStudies` | **Placeholders** with image/video placeholder art. Replace with approved work. |
| `reachPoints` | Regions served digitally — **not** office locations. Add `labelSide: "left"` to flip a label. |
| `brand.email` / `brand.social` | Replace the placeholder email and social URLs. |
| Media Buying dashboard | Demo values in `src/components/sections/MediaBuying.tsx`, badged **"Demo data"** in the UI. |

## Structure

```
src/
  app/            layout, page, /brand (logo system), icon.svg
  content/        site.ts — all editable copy/data
  components/
    brand/Logo    LogoMark + Logo lockup (React)
    ui/           Button (magnetic), SpotlightCard, Reveal/Stagger, TextReveal, Counter, Section
    sections/     Hero, Stats, Services, AdTech, MediaBuying, Technology, Industries,
                  WhyPixelADX, CaseStudies, Process, Testimonials, GlobalReach, CTA
    Navbar, Footer, Background (grid + blobs + grain), CursorGlow
  lib/            utils (cn), worldmap (procedural dot-matrix map)
public/brand/     logo SVG set (mark, lockups, mono, icon)
scripts/          build-brand.mjs — regenerates public/brand + app icon
```

## Brand

The mark is a 3×3 pixel grid with the five diagonal pixels lit — the pixel grid literally forms the **X** in ADX; the white centre pixel is the exchange node. Palette: Ink `#050507`, Electric Blue `#4d7cfe`, Cyan `#38e1ff`, Violet `#8b5cf6`. Visit **`/brand`** for the full system and downloads. Lockup SVGs use the Manrope font stack — convert text to outlines for print.

## Dark / light mode

Dark is the brand default; the switch lives in the navbar (and the mobile drawer). The choice is stored in `localStorage` (`px-theme`) and applied by a `beforeInteractive` script so there is no flash on reload.

How it works (`src/app/globals.css`): light mode sets `<html data-theme="light">` and remaps a handful of tokens — `--color-white`, the `ink` surfaces, `fog`, `mute` — so every `text-white` / `bg-white/5` / `border-white/10` utility flips automatically. Hardcoded colours in SVGs and gradients use the `--fg` / `--bg` / `--shadow` RGB triplets. Use `text-pure-white` for text that must stay white in both themes (e.g. on the accent gradient).

- Provider + hook: `src/components/theme/ThemeProvider.tsx` (`useTheme()` → `{ theme, setTheme, toggle }`)
- Switch: `src/components/theme/ThemeToggle.tsx`
- Theme-specific tweaks: `[[data-theme=light]_&]:…` arbitrary variant in Tailwind

## Traffic sources marquee

Two counter-scrolling logo rows (`src/components/sections/TrafficSources.tsx`, generic `ui/Marquee.tsx`). Platform icons come from the CC0 `simple-icons` package and are baked into `src/content/logos.ts` by `npm run build:logos` (the icon library is a dev dependency and never ships to the client). Two marks not in that set (LinkedIn, Microsoft) are hand-drawn. For Taboola, Outbrain, Teads and NewsBreak, download the official SVG from each brand's press kit into `public/logos/` and set `logo: "/logos/<file>.svg"` on the entry in `src/content/site.ts`.

## Liquid Glass material

The UI chrome (navbar, buttons, chips, toggle, floating cards, drawer, dashboard) uses a Liquid-Glass style material defined in `src/app/globals.css`:

- `glass` — frosted, saturated, tinted backdrop + inset specular highlights, a refractive rim ring (`::before`) and a top sheen with a cursor-tracked specular (`::after`). `glass-strong` = heavier frost for the navbar/drawer.
- `glass-lens` — on Chromium only, adds a subtle lens distortion via `backdrop-filter: url(#px-lens)` (SVG displacement filter mounted by `src/components/LiquidLens.tsx`). Other browsers get the plain frosted material.
- `crystal` — the rim + specular without the blur, for large cards and panels (keeps scrolling cheap).
- `liquid-press` — springy hover lift / press squish for small interactive glass.

All material strengths are CSS variables (`--glass-*`, `--spec-*`, `--rim-*`, `--sheen`) with separate values per theme.

## Motion & performance

- Every animation honours `prefers-reduced-motion` (CSS keyframes disabled, Framer initial states skipped, SVG packets not rendered).
- Only `transform`/`opacity` are animated; backgrounds are CSS-only; the cursor glow renders only on fine-pointer devices.
- Below-the-fold sections are code-split with `next/dynamic`.
- No WebGL — all visuals are SVG/CSS.
