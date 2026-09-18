"use client";

import dynamic from "next/dynamic";
import { SceneCanvas, type SceneCanvasProps } from "./SceneCanvas";

/**
 * Hero 3D concepts. Each scene renders inside the shared SceneCanvas stage
 * (lights, grid, bloom, adaptive quality). Pick the site's hero in
 * src/content/site.ts → heroScene. Preview them all at /lab.
 */
export type SceneId = "sphere" | "mark" | "knot" | "warp" | "globe";

export const scenes: Record<SceneId, { name: string; tagline: string; says: string; canvas: Partial<SceneCanvasProps> }> = {
  sphere: {
    name: "Attention Sphere",
    tagline: "Liquid iridescent core inside a living network shell.",
    says: "The brand at the centre of the ad ecosystem — data flowing, connections everywhere.",
    canvas: {},
  },
  mark: {
    name: "Pixel Mark",
    tagline: "The logo itself: glowing glass cubes with orbiting packets.",
    says: "Identity-first. Instantly ties the 3D to the brand mark.",
    canvas: { size: 1.05 },
  },
  knot: {
    name: "Liquid Chrome Knot",
    tagline: "Mirror-chrome torus knot with a slow liquid ripple.",
    says: "Premium tech. Pure material and light — the Awwwards look.",
    canvas: { size: 1.05, bloomIntensity: 0.8 },
  },
  warp: {
    name: "Warp Tunnel",
    tagline: "Flying down a tunnel of light rings toward a portal.",
    says: "Speed, scale, momentum — growth as motion.",
    canvas: { size: 1.1, offset: 0.1, grid: false, sparkles: false, particles: false, camera: [0, 0.6, 10.5], look: [0, 0, -10], bloomIntensity: 1.1 },
  },
  globe: {
    name: "Holographic Globe",
    tagline: "Dot-matrix world with arcs from Bangladesh.",
    says: "Built in Bangladesh, designed for the world — global reach made literal.",
    canvas: { size: 1.05 },
  },
};

const loaders = {
  sphere: dynamic(() => import("./scenes/Sphere"), { ssr: false }),
  mark: dynamic(() => import("./scenes/PixelMark"), { ssr: false }),
  knot: dynamic(() => import("./scenes/Knot"), { ssr: false }),
  warp: dynamic(() => import("./scenes/Warp"), { ssr: false }),
  globe: dynamic(() => import("./scenes/Globe"), { ssr: false }),
};

export default function HeroScene({
  scene = "sphere",
  active = true,
  reduce = false,
  light = false,
}: {
  scene?: SceneId;
  active?: boolean;
  reduce?: boolean;
  light?: boolean;
}) {
  const Scene = loaders[scene];
  return (
    <SceneCanvas active={active} reduce={reduce} light={light} {...scenes[scene].canvas}>
      <Scene reduce={reduce} light={light} />
    </SceneCanvas>
  );
}
