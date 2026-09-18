"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Grid,
  Lightformer,
  PerformanceMonitor,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * The Pixel ADX mark in 3D: five cubes in the X arrangement (the logo) —
 * four lit candy-glass corners with glowing cores, a white exchange node in
 * the centre — plus orbiting data packets, a receding data grid, sparkles
 * and a particle field. Camera and mark both follow the cursor.
 *
 * Performance: no transmission materials (they re-render the scene per
 * material per frame), dpr capped at 1.5, PerformanceMonitor drops dpr and
 * bloom on slow devices, frameloop paused when the hero is off-screen.
 */

const SPACING = 1.42;
const corners: [number, number][] = [
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, -1],
];
const cornerTints = ["#38e1ff", "#5b8cff", "#7d6bff", "#8b5cf6"];

function Cube({
  position,
  tint,
  glow,
}: {
  position: [number, number, number];
  tint: string;
  glow?: boolean;
}) {
  return (
    <group position={position}>
      {/* outer shell: glossy tinted glass with clearcoat + iridescence, reflects the light panels */}
      <RoundedBox args={[1.12, 1.12, 1.12]} radius={0.2} smoothness={5}>
        {glow ? (
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.6}
            roughness={0.3}
            toneMapped={false}
          />
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
      {/* inner core: bright emissive so the cube reads as lit from inside */}
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
    const ty =
      state.pointer.x * 0.42 + (reduce ? 0 : Math.sin(t * 0.25) * 0.35);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 3, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 3, dt);
  });

  return (
    <group ref={group}>
      {[Math.PI / 4, -Math.PI / 4].map((r) => (
        <mesh key={r} rotation={[0, 0, r]} position={[0, 0, -0.62]}>
          <boxGeometry args={[4.6, 0.03, 0.03]} />
          <meshBasicMaterial
            color="#9cc2ff"
            transparent
            opacity={0.5}
            toneMapped={false}
          />
        </mesh>
      ))}
      {corners.map(([x, y], i) => (
        <Cube
          key={i}
          position={[x * SPACING, y * SPACING, 0]}
          tint={cornerTints[i]}
        />
      ))}
      <Cube position={[0, 0, 0]} tint="#fff" glow />
      <pointLight
        position={[0, 0, 1.4]}
        intensity={8}
        distance={6}
        color="#cfe0ff"
      />
    </group>
  );
}

function Orbit({
  radius,
  tilt,
  speed,
  phase,
  color,
}: {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  phase: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (ref.current)
      ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
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

function Particles({ count = 360 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = rng(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
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
      <pointsMaterial
        size={0.035}
        color="#9cc2ff"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** Camera drifts with the cursor for parallax depth. */
function CameraRig() {
  useFrame((state, dt) => {
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(
      cam.position.x,
      state.pointer.x * 0.9,
      2.5,
      dt,
    );
    cam.position.y = THREE.MathUtils.damp(
      cam.position.y,
      state.pointer.y * 0.5,
      2.5,
      dt,
    );
    cam.lookAt(0, 0, 0);
  });
  return null;
}

/** Scales the scene so the mark always fits the canvas, offset right so headline copy can overlap the left edge. */
function Fit({ children }: { children: React.ReactNode }) {
  const { viewport } = useThree();
  const s = Math.min(1, viewport.width / 8.2, viewport.height / 7.6);
  return (
    <group scale={s} position={[viewport.width * 0.06, 0, 0]}>
      {children}
    </group>
  );
}

export default function HeroScene({
  active = true,
  reduce = false,
  light = false,
}: {
  active?: boolean;
  reduce?: boolean;
  light?: boolean;
}) {
  // render at the device ratio (capped) — supersampling a 1× screen is pure waste
  const maxDpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    1.5,
  );
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
      camera={{ position: [0, 0, 9.5], fov: 34 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      frameloop={active ? "always" : "never"}
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      {/* adaptive quality: step down on slow devices, back up when headroom returns */}
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

      <ambientLight intensity={light ? 0.9 : 0.45} />
      <directionalLight position={[3, 5, 6]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-5, 3, 4]} intensity={50} color="#38e1ff" />
      <pointLight position={[5, -3, 3]} intensity={50} color="#8b5cf6" />

      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={3}
          position={[0, 6, -8]}
          scale={[12, 6, 1]}
          color="#dfe8ff"
        />
        <Lightformer
          intensity={2.5}
          position={[-8, 2, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[6, 6, 1]}
          color="#38e1ff"
        />
        <Lightformer
          intensity={2.5}
          position={[8, -2, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[6, 6, 1]}
          color="#8b5cf6"
        />
        <Lightformer
          intensity={1.2}
          position={[0, -6, 4]}
          scale={[10, 4, 1]}
          color="#ffffff"
        />
      </Environment>

      <Fit>
        <Float
          speed={reduce ? 0 : 1.1}
          rotationIntensity={reduce ? 0 : 0.25}
          floatIntensity={reduce ? 0 : 0.7}
        >
          <Mark reduce={reduce} />
        </Float>
        {!reduce && (
          <>
            <Orbit
              radius={3.4}
              tilt={[1.2, 0.2, 0.4]}
              speed={0.55}
              phase={0}
              color="#38e1ff"
            />
            <Orbit
              radius={3.9}
              tilt={[-1.0, 0.6, -0.3]}
              speed={0.4}
              phase={2}
              color="#9cc2ff"
            />
            <Orbit
              radius={4.4}
              tilt={[0.6, -0.8, 0.9]}
              speed={0.3}
              phase={4}
              color="#c4b5fd"
            />
          </>
        )}
        <Sparkles
          count={70}
          scale={[11, 6, 6]}
          size={2.6}
          speed={reduce ? 0 : 0.35}
          opacity={0.6}
          color="#bfd4ff"
        />
      </Fit>

      {/* receding data grid */}
      <Grid
        position={[0, -3.4, -2]}
        args={[40, 40]}
        cellSize={0.7}
        cellThickness={0.6}
        cellColor={light ? "#b9c4dc" : "#1f2740"}
        sectionSize={3.5}
        sectionThickness={1.1}
        sectionColor={light ? "#7c9cff" : "#3556b8"}
        fadeDistance={26}
        fadeStrength={2.2}
        infiniteGrid
      />

      <Particles />
      {!reduce && <CameraRig />}

      {bloom && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            mipmapBlur
            intensity={light ? 0.45 : 0.9}
            luminanceThreshold={0.75}
            luminanceSmoothing={0.25}
            radius={0.7}
            levels={6}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
