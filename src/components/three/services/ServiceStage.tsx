"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ServiceIcon } from "@/content/site";
import { SceneCanvas } from "../SceneCanvas";
import { miniScenes } from "./MiniScenes";

/**
 * A single canvas that shows one service vignette at a time. Pass the
 * `current` id and (optionally) the `prev` id: the previous scene scales
 * down and slides out while the new one scales in.
 *
 * Transitions are wall-clock based (performance.now), so a paused render
 * loop can never leave a half-finished pose on screen — the next frame
 * always shows the correct state for that moment in time.
 */
const DUR = 650;
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

function Slot({ id, exiting, animateIn, reduce }: { id: ServiceIcon; exiting: boolean; animateIn: boolean; reduce: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const t0 = useRef<number | null>(null); // set on the first frame, not during render
  const Scene = miniScenes[id];
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    if (t0.current === null) t0.current = performance.now();
    const p = reduce ? 1 : easeOut((performance.now() - t0.current) / DUR);
    if (exiting) {
      const q = 1 - p;
      g.scale.setScalar(Math.max(0.001, q));
      g.position.x = -1.6 * p;
      g.rotation.y = -0.5 * p;
    } else if (animateIn) {
      g.scale.setScalar(Math.max(0.001, p));
      g.position.x = 1.4 * (1 - p);
      g.rotation.y = 0.5 * (1 - p);
    } else {
      g.scale.setScalar(1);
      g.position.x = 0;
      g.rotation.y = 0;
    }
  });
  return (
    <group ref={ref} scale={animateIn && !reduce ? 0.001 : 1}>
      <Scene reduce={reduce} />
    </group>
  );
}

export function ServiceStage({ current, prev, reduce, active = true }: { current: ServiceIcon; prev?: ServiceIcon | null; reduce: boolean; active?: boolean }) {
  const hasPrev = !!prev && prev !== current;
  return (
    <SceneCanvas active={active} reduce={reduce} size={1.75} offset={0} camera={[0, 0.9, 9.2]} look={[0, 0, 0]} grid={false} sparkles={false} particles={false} bloomIntensity={0.45} parallax={0.2}>
      {hasPrev && <Slot key={`out-${prev}`} id={prev!} exiting animateIn={false} reduce={reduce} />}
      <Slot key={`in-${current}`} id={current} exiting={false} animateIn={hasPrev} reduce={reduce} />
    </SceneCanvas>
  );
}
