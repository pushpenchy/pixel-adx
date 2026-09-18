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
 */
function Slot({ id, exiting, reduce }: { id: ServiceIcon; exiting: boolean; reduce: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const Scene = miniScenes[id];
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const targetScale = exiting ? 0.001 : 1;
    const targetX = exiting ? -1.6 : 0;
    const targetRot = exiting ? -0.5 : 0;
    const k = reduce ? 40 : 7;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, targetScale, k, dt));
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, k, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRot, k, dt);
  });
  return (
    <group ref={ref} scale={reduce ? 1 : 0.001} position={[reduce ? 0 : 1.4, 0, 0]} rotation={[0, reduce ? 0 : 0.5, 0]}>
      <Scene reduce={reduce} />
    </group>
  );
}

export function ServiceStage({ current, prev, reduce, active = true }: { current: ServiceIcon; prev?: ServiceIcon | null; reduce: boolean; active?: boolean }) {
  return (
    <SceneCanvas active={active} reduce={reduce} size={1.9} offset={0} camera={[0, 1.0, 8.6]} look={[0, 0, 0]} grid={false} sparkles={false} particles={false} bloomIntensity={0.45}>
      {prev && prev !== current && <Slot key={`out-${prev}`} id={prev} exiting reduce={reduce} />}
      <Slot key={`in-${current}`} id={current} exiting={false} reduce={reduce} />
    </SceneCanvas>
  );
}
