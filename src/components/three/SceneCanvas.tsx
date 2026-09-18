"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Grid, Lightformer, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * Shared stage for every hero concept: lights, studio environment, grid
 * floor, sparkles, particle field, bloom, cursor-parallax camera and
 * adaptive quality. Scenes only render their own objects inside <Fit>.
 */

export type SceneProps = { reduce: boolean; light: boolean };

/** Deterministic PRNG (mulberry32) — stable layouts, no impure calls in render. */
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Particles({ count = 420, spread = 5 }: { count?: number; spread?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = rng(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = spread + rand() * spread;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(ph) - 3;
    }
    return arr;
  }, [count, spread]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#9cc2ff" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function CameraRig({ base, look }: { base: [number, number, number]; look: [number, number, number] }) {
  useFrame((state, dt) => {
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, base[0] + state.pointer.x * 1.1, 2.5, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, base[1] + state.pointer.y * 0.6, 2.5, dt);
    cam.lookAt(look[0], look[1], look[2]);
  });
  return null;
}

/** Scales the scene so it always fits the canvas, offset right so headline copy can overlap the left edge. */
function Fit({ children, size = 1, offset = 0.06 }: { children: React.ReactNode; size?: number; offset?: number }) {
  const { viewport } = useThree();
  const s = Math.min(0.72 * size, (viewport.width / 11.5) * size, (viewport.height / 10.5) * size);
  return (
    <group scale={s} position={[viewport.width * offset, 0.35, 0]}>
      {children}
    </group>
  );
}

export type SceneCanvasProps = {
  active?: boolean;
  reduce?: boolean;
  light?: boolean;
  children: React.ReactNode;
  /** relative scale for the concept */
  size?: number;
  /** horizontal offset as a fraction of viewport width */
  offset?: number;
  camera?: [number, number, number];
  look?: [number, number, number];
  grid?: boolean;
  sparkles?: boolean;
  particles?: boolean;
  bloomIntensity?: number;
};

export function SceneCanvas({
  active = true,
  reduce = false,
  light = false,
  children,
  size = 1,
  offset = 0.06,
  camera = [0, 2.2, 10.5],
  look = [0, -0.2, 0],
  grid = true,
  sparkles = true,
  particles = true,
  bloomIntensity = 1,
}: SceneCanvasProps) {
  // render at the device ratio (capped) — supersampling a 1× screen is pure waste
  const maxDpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 1.5);
  const [dpr, setDpr] = useState(maxDpr);
  const [bloom, setBloom] = useState(true);
  // Start sampling only after shaders have compiled, otherwise the first-frame
  // hitch registers as a permanent "slow device" verdict.
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWarm(true), 3000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: camera, fov: 34 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false }}
      frameloop={active ? "always" : "never"}
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      {warm && (
        <PerformanceMonitor
          onDecline={() => {
            setDpr(Math.max(0.75, maxDpr - 0.5));
            setBloom(false);
          }}
          onIncline={() => setDpr(maxDpr)}
          flipflops={3}
          bounds={() => [40, 58]}
          ms={300}
          iterations={8}
        />
      )}

      <ambientLight intensity={light ? 0.8 : 0.35} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} />
      <pointLight position={[-6, 3, 4]} intensity={60} color="#38e1ff" />
      <pointLight position={[6, -3, 3]} intensity={60} color="#8b5cf6" />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={3} position={[0, 6, -8]} scale={[12, 6, 1]} color="#dfe8ff" />
        <Lightformer intensity={3} position={[-8, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 6, 1]} color="#38e1ff" />
        <Lightformer intensity={3} position={[8, -2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 6, 1]} color="#8b5cf6" />
        <Lightformer intensity={1.5} position={[0, -6, 4]} scale={[10, 4, 1]} color="#ffffff" />
      </Environment>

      <Fit size={size} offset={offset}>
        {children}
        {sparkles && <Sparkles count={80} scale={[12, 7, 7]} size={2.6} speed={reduce ? 0 : 0.35} opacity={0.6} color="#bfd4ff" />}
      </Fit>

      {grid && (
        <Grid
          position={[0, -2.7, 0]}
          args={[60, 60]}
          cellSize={0.6}
          cellThickness={0.7}
          cellColor={light ? "#aab6d3" : "#2a3452"}
          sectionSize={3}
          sectionThickness={1.3}
          sectionColor={light ? "#6d8fff" : "#4d7cfe"}
          fadeDistance={34}
          fadeStrength={1.6}
          infiniteGrid
        />
      )}

      {particles && <Particles />}
      {!reduce && <CameraRig base={camera} look={look} />}

      {bloom && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={(light ? 0.5 : 1.0) * bloomIntensity} luminanceThreshold={0.7} luminanceSmoothing={0.3} radius={0.75} levels={6} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
