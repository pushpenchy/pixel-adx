"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { SceneProps } from "../SceneCanvas";
import { Panel } from "../Panel";
import { HudRing } from "./Sphere";

/**
 * Pixel Mark — the logo itself in 3D: four candy-glass cubes with glowing
 * cores in the X arrangement, a white exchange node in the centre, signal
 * traces, and data packets orbiting on tilted rings. Tilts toward the cursor.
 */

const SPACING = 1.42;
const corners: [number, number][] = [
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, -1],
];
const tints = ["#38e1ff", "#5b8cff", "#7d6bff", "#8b5cf6"];

function Cube({ position, tint, glow }: { position: [number, number, number]; tint: string; glow?: boolean }) {
  return (
    <group position={position}>
      <RoundedBox args={[1.12, 1.12, 1.12]} radius={0.2} smoothness={5}>
        {glow ? (
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.6} roughness={0.3} toneMapped={false} />
        ) : (
          <meshPhysicalMaterial
            color={tint}
            emissive={tint}
            emissiveIntensity={0.28}
            roughness={0.18}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.08}
            iridescence={0.55}
            iridescenceIOR={1.3}
            envMapIntensity={1.6}
            transparent
            opacity={0.82}
          />
        )}
      </RoundedBox>
      {!glow && (
        <RoundedBox args={[0.5, 0.5, 0.5]} radius={0.12} smoothness={3}>
          <meshBasicMaterial color={tint} toneMapped={false} />
        </RoundedBox>
      )}
    </group>
  );
}

function Mark({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const tx = -state.pointer.y * 0.28;
    const ty = state.pointer.x * 0.42 + (reduce ? 0 : Math.sin(t * 0.25) * 0.35);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 3, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 3, dt);
  });
  return (
    <group ref={group}>
      {[Math.PI / 4, -Math.PI / 4].map((r) => (
        <mesh key={r} rotation={[0, 0, r]} position={[0, 0, -0.62]}>
          <boxGeometry args={[4.6, 0.03, 0.03]} />
          <meshBasicMaterial color="#9cc2ff" transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}
      {corners.map(([x, y], i) => (
        <Cube key={i} position={[x * SPACING, y * SPACING, 0]} tint={tints[i]} />
      ))}
      <Cube position={[0, 0, 0]} tint="#fff" glow />
      <pointLight position={[0, 0, 1.4]} intensity={8} distance={6} color="#cfe0ff" />
    </group>
  );
}

function Orbit({ radius, tilt, speed, phase, color, reduce }: { radius: number; tilt: [number, number, number]; speed: number; phase: number; color: string; reduce: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = (reduce ? 0 : state.clock.elapsedTime) * speed + phase;
    if (ref.current) ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });
  return (
    <group rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.007, 8, 160]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.14} />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function PixelMarkScene({ reduce }: SceneProps) {
  return (
    <group scale={1.25}>
      <Float speed={reduce ? 0 : 1.1} rotationIntensity={reduce ? 0 : 0.25} floatIntensity={reduce ? 0 : 0.7}>
        <Mark reduce={reduce} />
      </Float>
      <Orbit radius={3.4} tilt={[1.2, 0.2, 0.4]} speed={0.55} phase={0} color="#38e1ff" reduce={reduce} />
      <Orbit radius={3.9} tilt={[-1.0, 0.6, -0.3]} speed={0.4} phase={2} color="#9cc2ff" reduce={reduce} />
      <Orbit radius={4.4} tilt={[0.6, -0.8, 0.9]} speed={0.3} phase={4} color="#c4b5fd" reduce={reduce} />
      <Panel spec={{ title: "Campaign", value: "Active", sub: "Live · 24/7 monitoring", kind: "bars", accent: "#38e1ff", seed: 4 }} position={[-3.4, 1.6, 0.6]} rotation={[0, 0.45, 0]} width={1.9} reduce={reduce} />
      <Panel spec={{ title: "Performance", value: "4.2×", sub: "ROAS · demo data", kind: "kpis", accent: "#8b5cf6", seed: 7 }} position={[3.4, -1.4, 0.8]} rotation={[0, -0.45, 0]} width={1.9} phase={2} reduce={reduce} />
      <HudRing reduce={reduce} y={-2.3} size={5.5} />
    </group>
  );
}
