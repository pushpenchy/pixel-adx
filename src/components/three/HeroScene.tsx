"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Grid, Lightformer, MeshDistortMaterial, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

/**
 * "Attention sphere": an iridescent liquid core (the brand) wrapped in a
 * rotating network shell of glowing nodes + connections (the ad ecosystem),
 * three data streams looping around it with travelling packets, tumbling
 * glass shards, a receding data grid, sparkles and a particle field.
 *
 * Everything is cheap on the GPU: one distort shader, instanced nodes and
 * shards, a single LineSegments for the network, thin tubes for streams.
 * dpr matches the device (capped 1.5); PerformanceMonitor steps quality
 * down on slow devices after a warm-up; frameloop pauses off-screen.
 */

/** Deterministic PRNG (mulberry32) — stable layouts, no impure calls in render. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ───────────── Core: liquid iridescent blob ───────────── */
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
      {/* inner light so the blob glows through its rim */}
      <pointLight intensity={14} distance={7} color="#7fa6ff" />
      {/* bright hot spot for bloom */}
      <mesh position={[0.55, 0.55, 1.35]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ───────────── Network shell: nodes + connections ───────────── */
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

function NetworkShell({ reduce, count = 150, radius = 3.25 }: { reduce: boolean; count?: number; radius?: number }) {
  const group = useRef<THREE.Group>(null);
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const nodes = useMemo(() => fibonacciSphere(count, radius), [count, radius]);

  // connect each node to its 2 nearest neighbours → one LineSegments
  const lineGeo = useMemo(() => {
    const seen = new Set<string>();
    const arr: number[] = [];
    nodes.forEach((a, i) => {
      const near = nodes
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter((x) => x.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);
      near.forEach(({ j }) => {
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
    // pulse a subset of nodes
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
      {/* faint shell surface */}
      <mesh>
        <sphereGeometry args={[radius - 0.02, 48, 48]} />
        <meshBasicMaterial color="#4d7cfe" transparent opacity={0.035} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ───────────── Data streams: looping tubes with packets ───────────── */
function Stream({ seed, radius, tilt, color, speed, reduce }: { seed: number; radius: number; tilt: [number, number, number]; color: string; speed: number; reduce: boolean }) {
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
    g.children.forEach((c, i) => {
      const u = (t + i / packetCount) % 1;
      c.position.copy(curve.getPointAt(u));
    });
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

/* ───────────── Tumbling glass shards ───────────── */
function Shards({ reduce, count = 14 }: { reduce: boolean; count?: number }) {
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => {
    const rand = rng(99);
    return Array.from({ length: count }, () => ({
      r: 4.2 + rand() * 2.2,
      a: rand() * Math.PI * 2,
      y: (rand() - 0.5) * 4.5,
      s: 0.18 + rand() * 0.28,
      spin: (rand() - 0.5) * 1.2,
      drift: 0.05 + rand() * 0.12,
    }));
  }, [count]);

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

/* ───────────── Particle field ───────────── */
function Particles({ count = 420 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = rng(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 5 + rand() * 5;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(ph) - 3;
    }
    return arr;
  }, [count]);

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

/* ───────────── Camera + fit ───────────── */
function CameraRig() {
  useFrame((state, dt) => {
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 1.1, 2.5, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, state.pointer.y * 0.6, 2.5, dt);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

function Fit({ children }: { children: React.ReactNode }) {
  const { viewport } = useThree();
  const s = Math.min(1, viewport.width / 8.6, viewport.height / 8);
  return (
    <group scale={s} position={[viewport.width * 0.05, 0, 0]}>
      {children}
    </group>
  );
}

export default function HeroScene({ active = true, reduce = false, light = false }: { active?: boolean; reduce?: boolean; light?: boolean }) {
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
      camera={{ position: [0, 0, 10], fov: 34 }}
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

      <Fit>
        <Float speed={reduce ? 0 : 1} rotationIntensity={reduce ? 0 : 0.15} floatIntensity={reduce ? 0 : 0.6}>
          <Core reduce={reduce} />
        </Float>
        <NetworkShell reduce={reduce} />
        <Stream seed={1} radius={2.55} tilt={[0.9, 0.3, 0.2]} color="#38e1ff" speed={0.06} reduce={reduce} />
        <Stream seed={2} radius={2.8} tilt={[-0.7, 0.9, 0.5]} color="#8b5cf6" speed={0.045} reduce={reduce} />
        <Stream seed={3} radius={2.35} tilt={[0.2, -1.1, 1.2]} color="#9cc2ff" speed={0.075} reduce={reduce} />
        <Shards reduce={reduce} />
        <Sparkles count={80} scale={[12, 7, 7]} size={2.6} speed={reduce ? 0 : 0.35} opacity={0.6} color="#bfd4ff" />
      </Fit>

      <Grid
        position={[0, -3.6, -2]}
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
          <Bloom mipmapBlur intensity={light ? 0.5 : 1.0} luminanceThreshold={0.7} luminanceSmoothing={0.3} radius={0.75} levels={6} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
