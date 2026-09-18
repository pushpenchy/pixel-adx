"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { rng, type SceneProps } from "../SceneCanvas";
import { Panel } from "../Panel";
import { makeWindowsTexture } from "../textures";

/**
 * Growth Skyline — a city of glowing data towers whose heights rise and
 * fall in waves (a living bar chart), lit windows, light traffic on the
 * avenues, and a floating ROAS dashboard above it. Growth, literally.
 */

const N = 22; // grid per side
const STEP = 0.62;

function Towers({ reduce }: { reduce: boolean }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const windows = useMemo(() => makeWindowsTexture(), []);
  useEffect(() => () => windows.dispose(), [windows]);
  const seeds = useMemo(() => {
    const rand = rng(7);
    return Array.from({ length: N * N }, () => rand());
  }, []);
  const colorA = useMemo(() => new THREE.Color("#1d2a5e"), []);
  const colorB = useMemo(() => new THREE.Color("#4d7cfe"), []);
  const colorC = useMemo(() => new THREE.Color("#38e1ff"), []);

  const heightAt = (i: number, j: number, t: number) => {
    const x = i - N / 2;
    const z = j - N / 2;
    const d = Math.hypot(x, z);
    const base = 0.35 + seeds[i * N + j] * 1.1;
    const wave = reduce ? 0.6 : (Math.sin(d * 0.55 - t * 1.1) + 1) * 0.5;
    const centre = Math.max(0, 1 - d / (N * 0.55));
    return base + wave * 1.6 * centre + centre * 1.4;
  };

  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const k = i * N + j;
        c.copy(colorA).lerp(seeds[k] > 0.85 ? colorC : colorB, seeds[k]);
        m.setColorAt(k, c);
      }
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [seeds, colorA, colorB, colorC]);

  useFrame((state) => {
    const m = inst.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const h = heightAt(i, j, t);
        dummy.position.set((i - N / 2) * STEP, h / 2 - 2.4, (j - N / 2) * STEP);
        dummy.scale.set(0.42, h, 0.42);
        dummy.updateMatrix();
        m.setMatrixAt(i * N + j, dummy.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, N * N]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial map={windows} emissiveMap={windows} emissive="#ffffff" emissiveIntensity={0.9} roughness={0.5} metalness={0.2} />
    </instancedMesh>
  );
}

function Traffic({ count = 160, reduce }: { count?: number; reduce: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const seeds = useMemo(() => {
    const rand = rng(31);
    return Array.from({ length: count }, () => ({ lane: Math.floor(rand() * 6) - 3, dir: rand() > 0.5 ? 1 : -1, t: rand(), v: 0.08 + rand() * 0.12, axis: rand() > 0.5 }));
  }, [count]);
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  useFrame((state) => {
    const p = ref.current;
    if (!p) return;
    const attr = p.geometry.getAttribute("position") as THREE.BufferAttribute;
    const a = attr.array as Float32Array;
    const time = reduce ? 0 : state.clock.elapsedTime;
    const span = N * STEP;
    seeds.forEach((s, i) => {
      const u = (s.t + time * s.v * s.dir + 10) % 1;
      const along = (u - 0.5) * span;
      const lane = s.lane * STEP * 3.5 + STEP * 0.5;
      a[i * 3] = s.axis ? along : lane;
      a[i * 3 + 1] = -2.32;
      a[i * 3 + 2] = s.axis ? lane : along;
    });
    attr.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.11} color="#ffffff" transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function SkylineScene({ reduce }: SceneProps) {
  return (
    <group rotation={[0.12, 0.6, 0]} position={[0, -0.3, 0]} scale={0.92}>
      <Towers reduce={reduce} />
      <Traffic reduce={reduce} />
      {/* ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.42, 0]}>
        <planeGeometry args={[N * STEP + 2, N * STEP + 2]} />
        <meshBasicMaterial color="#0d1533" />
      </mesh>
      <Panel
        spec={{ title: "Return on ad spend", value: "4.2×", sub: "▲ trending · demo data", kind: "line", accent: "#38e1ff", seed: 13 }}
        position={[0.6, 2.7, -1.2]}
        rotation={[-0.08, -0.5, 0]}
        width={2.9}
        reduce={reduce}
      />
      <pointLight position={[0, 4, 2]} intensity={30} distance={14} color="#6d8cff" />
    </group>
  );
}
