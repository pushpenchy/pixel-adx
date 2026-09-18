"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/**
 * The Pixel ADX mark in 3D: five glass cubes in the X arrangement (the logo),
 * a glowing exchange node in the centre, data packets orbiting on tilted
 * rings, and a particle field. The group tilts toward the cursor.
 *
 * Performance: one Canvas, dpr capped at 1.5, transmission material with
 * low sample count, frameloop paused when the hero is off-screen.
 */

const SPACING = 1.42;
const corners: [number, number][] = [
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, -1],
];
const cornerTints = ["#38e1ff", "#5b8cff", "#7d6bff", "#8b5cf6"];

function Cube({ position, tint, glow }: { position: [number, number, number]; tint: string; glow?: boolean }) {
  return (
    <RoundedBox args={[1.12, 1.12, 1.12]} radius={0.2} smoothness={5} position={position}>
      {glow ? (
        <meshStandardMaterial color="#ffffff" emissive="#dbe8ff" emissiveIntensity={1.4} roughness={0.25} metalness={0} />
      ) : (
        <MeshTransmissionMaterial
          color={tint}
          thickness={1.1}
          roughness={0.12}
          ior={1.45}
          chromaticAberration={0.05}
          anisotropicBlur={0.2}
          distortion={0.08}
          distortionScale={0.4}
          temporalDistortion={0.1}
          transmission={1}
          samples={4}
          resolution={384}
          attenuationDistance={2.2}
          attenuationColor={tint}
        />
      )}
    </RoundedBox>
  );
}

function Mark({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // cursor tilt (normalized pointer) + slow idle rotation
    target.current.x = -state.pointer.y * 0.28;
    target.current.y = state.pointer.x * 0.42 + (reduce ? 0 : Math.sin(t * 0.25) * 0.35);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, target.current.x, 3, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target.current.y, 3, dt);
  });

  return (
    <group ref={group}>
      {/* signal traces (the diagonals in the logo) */}
      {[Math.PI / 4, -Math.PI / 4].map((r) => (
        <mesh key={r} rotation={[0, 0, r]} position={[0, 0, -0.62]}>
          <boxGeometry args={[4.6, 0.028, 0.028]} />
          <meshBasicMaterial color="#9cc2ff" transparent opacity={0.35} />
        </mesh>
      ))}
      {corners.map(([x, y], i) => (
        <Cube key={i} position={[x * SPACING, y * SPACING, 0]} tint={cornerTints[i]} />
      ))}
      <Cube position={[0, 0, 0]} tint="#fff" glow />
      {/* glow halo behind the centre node */}
      <pointLight position={[0, 0, 1.2]} intensity={6} distance={5} color="#bfd4ff" />
    </group>
  );
}

function Orbit({ radius, tilt, speed, phase, color }: { radius: number; tilt: [number, number, number]; speed: number; phase: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (ref.current) ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });
  return (
    <group rotation={tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.006, 8, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.10} />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

/** Deterministic PRNG (mulberry32) — stable particle field, no impure calls in render. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Particles({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = rng(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // shell distribution so the mark stays uncluttered
      const r = 4.5 + rand() * 4;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(ph) - 2;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#9cc2ff" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** Scales the scene so the mark always fits the canvas, and offsets it right so headline copy can overlap the left edge. */
function Fit({ children }: { children: React.ReactNode }) {
  const { viewport } = useThree();
  const s = Math.min(1, viewport.width / 8.2, viewport.height / 7.6);
  return (
    <group scale={s} position={[viewport.width * 0.06, 0, 0]}>
      {children}
    </group>
  );
}

export default function HeroScene({ active = true, reduce = false }: { active?: boolean; reduce?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 9.5], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 6]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-5, 3, 4]} intensity={40} color="#38e1ff" />
      <pointLight position={[5, -3, 3]} intensity={40} color="#8b5cf6" />

      {/* Studio-style reflections from light panels — no HDR download */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={3} position={[0, 6, -8]} scale={[12, 6, 1]} color="#dfe8ff" />
        <Lightformer intensity={2} position={[-8, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 6, 1]} color="#38e1ff" />
        <Lightformer intensity={2} position={[8, -2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 6, 1]} color="#8b5cf6" />
        <Lightformer intensity={1} position={[0, -6, 4]} scale={[10, 4, 1]} color="#ffffff" />
      </Environment>

      <Fit>
        <Float speed={reduce ? 0 : 1.1} rotationIntensity={reduce ? 0 : 0.25} floatIntensity={reduce ? 0 : 0.7}>
          <Mark reduce={reduce} />
        </Float>

        {!reduce && (
          <>
            <Orbit radius={3.4} tilt={[1.2, 0.2, 0.4]} speed={0.55} phase={0} color="#38e1ff" />
            <Orbit radius={3.9} tilt={[-1.0, 0.6, -0.3]} speed={0.4} phase={2} color="#9cc2ff" />
            <Orbit radius={4.4} tilt={[0.6, -0.8, 0.9]} speed={0.3} phase={4} color="#c4b5fd" />
          </>
        )}
      </Fit>
      <Particles />
    </Canvas>
  );
}
