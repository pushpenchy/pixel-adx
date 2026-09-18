"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { rng, type SceneProps } from "../SceneCanvas";

/**
 * Warp Tunnel — the viewer flies down a tunnel of glowing rings while light
 * streaks rush past, toward a bright portal. Communicates speed, scale and
 * growth. Rings and streaks are instanced / a single Points buffer.
 */

const RING_COUNT = 34;
const Z_NEAR = 14;
const Z_FAR = -62;
const SPEED = 9;

function Rings({ reduce }: { reduce: boolean }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const zs = useRef<Float32Array>(new Float32Array(RING_COUNT));
  const colorA = useMemo(() => new THREE.Color("#38e1ff"), []);
  const colorB = useMemo(() => new THREE.Color("#8b5cf6"), []);

  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < RING_COUNT; i++) {
      zs.current[i] = Z_NEAR - (i / RING_COUNT) * (Z_NEAR - Z_FAR);
      c.copy(colorA).lerp(colorB, (i % 6) / 5);
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [colorA, colorB]);

  useFrame((state, dt) => {
    const m = inst.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < RING_COUNT; i++) {
      if (!reduce) {
        zs.current[i] += dt * SPEED;
        if (zs.current[i] > Z_NEAR) zs.current[i] -= Z_NEAR - Z_FAR;
      }
      const z = zs.current[i];
      // rings breathe wider near the viewer
      const depth = (z - Z_FAR) / (Z_NEAR - Z_FAR);
      dummy.position.set(Math.sin(z * 0.08) * 0.6, Math.cos(z * 0.06) * 0.4, z);
      dummy.rotation.set(0, 0, t * 0.15 + i * 0.4);
      dummy.scale.setScalar(3.2 + depth * 1.4);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, RING_COUNT]}>
      <torusGeometry args={[1, 0.012, 6, 96]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

function Streaks({ count = 700, reduce }: { count?: number; reduce: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = rng(42);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = 1.2 + rand() * 3.2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.sin(a) * r;
      arr[i * 3 + 2] = Z_FAR + rand() * (Z_NEAR - Z_FAR);
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    const p = ref.current;
    if (!p || reduce) return;
    const attr = p.geometry.getAttribute("position") as THREE.BufferAttribute;
    const a = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      a[i * 3 + 2] += dt * SPEED * 1.6;
      if (a[i * 3 + 2] > Z_NEAR) a[i * 3 + 2] -= Z_NEAR - Z_FAR;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#bcd3ff" transparent opacity={0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function WarpScene({ reduce }: SceneProps) {
  return (
    <group position={[0, 0.2, 0]} rotation={[0.08, -0.25, 0]}>
      <Rings reduce={reduce} />
      <Streaks reduce={reduce} />
      {/* portal at the far end */}
      <mesh position={[0, 0, Z_FAR + 4]}>
        <circleGeometry args={[1.1, 48]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, Z_FAR + 4.2]}>
        <ringGeometry args={[1.3, 2.6, 64]} />
        <meshBasicMaterial color="#4d7cfe" transparent opacity={0.6} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0, Z_FAR + 6]} intensity={80} distance={40} color="#9cc2ff" />
    </group>
  );
}
