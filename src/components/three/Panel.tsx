"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makePanelTexture, type PanelSpec } from "./textures";

/**
 * Floating holographic dashboard card: the drawn texture on a plane, a glass
 * backplate for depth, glowing edges, and a gentle float/tilt.
 */
export function Panel({
  spec,
  position,
  rotation = [0, 0, 0],
  width = 2.4,
  phase = 0,
  reduce,
}: {
  spec: PanelSpec;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  phase?: number;
  reduce: boolean;
}) {
  const tex = useMemo(() => makePanelTexture(spec), [spec]);
  useEffect(() => () => tex.dispose(), [tex]);
  const aspect = spec.kind === "kpis" ? 520 / 1024 : 640 / 1024;
  const h = width * aspect;
  const group = useRef<THREE.Group>(null);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, h)), [width, h]);

  useFrame((state) => {
    if (!group.current || reduce) return;
    const t = state.clock.elapsedTime + phase;
    group.current.position.y = position[1] + Math.sin(t * 0.9) * 0.08;
    group.current.rotation.y = rotation[1] + Math.sin(t * 0.5) * 0.04 + state.pointer.x * 0.06;
    group.current.rotation.x = rotation[0] + state.pointer.y * -0.04;
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      {/* glass backplate */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[width + 0.06, h + 0.06]} />
        <meshPhysicalMaterial color="#1b2650" transparent opacity={0.55} roughness={0.2} clearcoat={1} envMapIntensity={1.2} />
      </mesh>
      {/* drawn dashboard */}
      <mesh>
        <planeGeometry args={[width, h]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
      {/* glowing edge */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#9cc2ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} toneMapped={false} />
      </lineSegments>
    </group>
  );
}
