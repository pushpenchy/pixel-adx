"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** Pops in (scale 0 → 1 with a small overshoot) `delay` seconds after mount. */
export function Pop({
  delay = 0,
  reduce = false,
  children,
  position,
  rotation,
}: {
  delay?: number;
  reduce?: boolean;
  children: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (start.current === null) start.current = now;
    const t = now - start.current - delay;
    const s = reduce ? 1 : easeOut(t / 0.6);
    const over = reduce ? 1 : 1 + Math.sin(Math.min(1, Math.max(0, t / 0.6)) * Math.PI) * 0.08;
    if (ref.current) ref.current.scale.setScalar(Math.max(0.001, s * over));
  });
  return (
    <group ref={ref} position={position} rotation={rotation} userData={{ unitScale: true }}>
      {children}
    </group>
  );
}

/** Slow idle spin around Y (plus optional wobble). */
export function Spin({ speed = 0.3, wobble = 0, reduce = false, children }: { speed?: number; wobble?: number; reduce?: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (!ref.current || reduce) return;
    ref.current.rotation.y += dt * speed;
    if (wobble) ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * wobble;
  });
  return <group ref={ref}>{children}</group>;
}
