"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { rng, type SceneProps } from "../SceneCanvas";
import { Panel } from "../Panel";
import { makeHudTexture } from "../textures";

/**
 * Attention Sphere — an iridescent liquid core (the brand) wrapped in a
 * rotating network shell (the ad ecosystem), looping data streams with
 * packets, and tumbling glass shards.
 */

function Core({ reduce }: { reduce: boolean }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.75, 96, 96]} />
        <MeshDistortMaterial
          color="#17357f"
          emissive="#3b66f0"
          emissiveIntensity={0.35}
          distort={reduce ? 0 : 0.34}
          speed={reduce ? 0 : 1.4}
          roughness={0.12}
          metalness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.06}
          iridescence={0.9}
          iridescenceIOR={1.45}
          iridescenceThicknessRange={[120, 600]}
          envMapIntensity={2.2}
        />
      </mesh>
      <pointLight intensity={14} distance={7} color="#7fa6ff" />
      <mesh position={[0.55, 0.55, 1.35]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function fibonacciSphere(n: number, r: number) {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    pts.push(new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r));
  }
  return pts;
}

export function NetworkShell({ reduce, count = 150, radius = 3.25 }: { reduce: boolean; count?: number; radius?: number }) {
  const group = useRef<THREE.Group>(null);
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const nodes = useMemo(() => fibonacciSphere(count, radius), [count, radius]);

  const lineGeo = useMemo(() => {
    const seen = new Set<string>();
    const arr: number[] = [];
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter((x) => x.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          const b = nodes[j];
          arr.push(a.x, a.y, a.z, b.x, b.y, b.z);
        });
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, [nodes]);

  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    nodes.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [nodes, dummy]);

  useFrame((state, dt) => {
    if (!group.current) return;
    if (!reduce) {
      group.current.rotation.y += dt * 0.08;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.15;
    }
    const m = inst.current;
    if (!m || reduce) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i += 3) {
      const s = 1 + Math.max(0, Math.sin(t * 1.6 + i * 0.7)) * 1.6;
      dummy.position.copy(nodes[i]);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={inst} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#bcd3ff" toneMapped={false} />
      </instancedMesh>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#4d7cfe" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <mesh>
        <sphereGeometry args={[radius - 0.02, 48, 48]} />
        <meshBasicMaterial color="#4d7cfe" transparent opacity={0.035} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Stream({ seed, radius, tilt, color, speed, reduce }: { seed: number; radius: number; tilt: [number, number, number]; color: string; speed: number; reduce: boolean }) {
  const curve = useMemo(() => {
    const rand = rng(seed);
    const pts: THREE.Vector3[] = [];
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = radius + (rand() - 0.5) * 0.6;
      pts.push(new THREE.Vector3(Math.cos(a) * r, (rand() - 0.5) * 1.4, Math.sin(a) * r));
    }
    return new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.6);
  }, [seed, radius]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 220, 0.014, 6, true), [curve]);
  const packets = useRef<THREE.Group>(null);
  const packetCount = 4;

  useFrame((state) => {
    const g = packets.current;
    if (!g || reduce) return;
    const t = state.clock.elapsedTime * speed;
    g.children.forEach((c, i) => c.position.copy(curve.getPointAt((t + i / packetCount) % 1)));
  });

  return (
    <group rotation={tilt}>
      <mesh geometry={tube}>
        <meshBasicMaterial color={color} transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={packets}>
        {Array.from({ length: packetCount }).map((_, i) => (
          <mesh key={i} position={curve.getPointAt(i / packetCount)}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Shards({ reduce, count = 14, inner = 4.2 }: { reduce: boolean; count?: number; inner?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => {
    const rand = rng(99);
    return Array.from({ length: count }, () => ({
      r: inner + rand() * 2.2,
      a: rand() * Math.PI * 2,
      y: (rand() - 0.5) * 4.5,
      s: 0.18 + rand() * 0.28,
      spin: (rand() - 0.5) * 1.2,
      drift: 0.05 + rand() * 0.12,
    }));
  }, [count, inner]);

  useFrame((state) => {
    const m = inst.current;
    if (!m) return;
    const t = reduce ? 0 : state.clock.elapsedTime;
    seeds.forEach((s, i) => {
      const a = s.a + t * s.drift;
      dummy.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.6 + i) * 0.25, Math.sin(a) * s.r - 1);
      dummy.rotation.set(t * s.spin, t * s.spin * 0.7 + i, 0);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={inst} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial color="#8fb3ff" roughness={0.1} metalness={0.05} clearcoat={1} iridescence={0.7} envMapIntensity={2} transparent opacity={0.85} />
    </instancedMesh>
  );
}

/** Rotating HUD dial under the object. */
export function HudRing({ reduce, y = -2.55, size = 7 }: { reduce: boolean; y?: number; size?: number }) {
  const tex = useMemo(() => makeHudTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current && !reduce) ref.current.rotation.z += dt * 0.1;
  });
  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex} transparent opacity={0.8} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

export default function SphereScene({ reduce }: SceneProps) {
  return (
    <>
      <Float speed={reduce ? 0 : 1} rotationIntensity={reduce ? 0 : 0.15} floatIntensity={reduce ? 0 : 0.6}>
        <Core reduce={reduce} />
      </Float>
      <NetworkShell reduce={reduce} />
      <Stream seed={1} radius={2.55} tilt={[0.9, 0.3, 0.2]} color="#38e1ff" speed={0.06} reduce={reduce} />
      <Stream seed={2} radius={2.8} tilt={[-0.7, 0.9, 0.5]} color="#8b5cf6" speed={0.045} reduce={reduce} />
      <Stream seed={3} radius={2.35} tilt={[0.2, -1.1, 1.2]} color="#9cc2ff" speed={0.075} reduce={reduce} />
      <Shards reduce={reduce} />
      <HudRing reduce={reduce} />
      <Panel spec={{ title: "Conversions · 14d", value: "1,362", sub: "▲ 18.4% · demo data", kind: "line", accent: "#38e1ff", seed: 5 }} position={[-3.9, 1.9, 0.8]} rotation={[0, 0.5, 0]} width={2.2} reduce={reduce} />
      <Panel spec={{ title: "Performance", value: "4.2×", sub: "ROAS · demo data", kind: "kpis", accent: "#8b5cf6", seed: 7 }} position={[3.9, -1.2, 1.2]} rotation={[0, -0.5, 0]} width={2.2} phase={2} reduce={reduce} />
    </>
  );
}
