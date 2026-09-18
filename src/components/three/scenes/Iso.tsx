"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { SceneProps } from "../SceneCanvas";
import { makeBubbleTexture, makeCodeTexture, makeIconTexture, makePhoneScreenTexture, type IconKind } from "../isoTextures";

/**
 * Isometric Studio — an illustrated 3D diorama in the isometric-vector style:
 * a phone running a scrolling app, floating app-icon tiles orbiting it,
 * spinning gears, a code slab, a growth chart, paint cans and a metric
 * bubble, all on a floating base with soft contact shadows.
 *
 * Materials are clean and matte (illustration look), lit softly.
 */

const NAVY = "#1e2450";
const BLUE = "#5b8cff";
const VIOLET = "#7c6bff";
const ORANGE = "#ff9f43";
const CYAN = "#38e1ff";
const CREAM = "#f5f2ff";

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** Pops in (scale 0 → 1) at `delay` seconds after mount, then floats. */
function Pop({ delay, reduce, children, position, rotation }: { delay: number; reduce: boolean; children: React.ReactNode; position?: [number, number, number]; rotation?: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (start.current === null) start.current = now;
    const t = now - start.current - delay;
    const s = reduce ? 1 : easeOut(t / 0.6);
    // slight overshoot for a "pop"
    const over = reduce ? 1 : 1 + Math.sin(Math.min(1, Math.max(0, t / 0.6)) * Math.PI) * 0.08;
    if (ref.current) ref.current.scale.setScalar(Math.max(0.001, s * over));
  });
  return (
    <group ref={ref} position={position} rotation={rotation}>
      {children}
    </group>
  );
}

/* ───────── Phone with scrolling app screen ───────── */
function Phone({ reduce }: { reduce: boolean }) {
  const screen = useMemo(() => makePhoneScreenTexture(), []);
  useEffect(() => () => screen.dispose(), [screen]);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    const m = mat.current;
    if (!m || !m.map || reduce) return;
    // scroll the feed, pausing between cards
    const t = state.clock.elapsedTime;
    const u = (t * 0.045 + Math.sin(t * 0.8) * 0.01) % 1;
    m.map.offset.y = -u;
    m.map.repeat.set(1, 0.42);
  });
  return (
    <group>
      <RoundedBox args={[2.5, 5.1, 0.28]} radius={0.28} smoothness={6}>
        <meshStandardMaterial color="#e9ecf5" roughness={0.45} metalness={0.05} />
      </RoundedBox>
      <RoundedBox args={[2.36, 4.96, 0.2]} radius={0.24} smoothness={6} position={[0, 0, 0.05]}>
        <meshStandardMaterial color="#0f1330" roughness={0.6} />
      </RoundedBox>
      {/* screen */}
      <mesh position={[0, 0, 0.155]}>
        <planeGeometry args={[2.2, 4.8]} />
        <meshBasicMaterial ref={mat} map={screen} toneMapped={false} />
      </mesh>
      {/* notch */}
      <RoundedBox args={[0.7, 0.14, 0.05]} radius={0.06} position={[0, 2.25, 0.16]}>
        <meshStandardMaterial color="#0f1330" />
      </RoundedBox>
      {/* side button */}
      <RoundedBox args={[0.06, 0.5, 0.12]} radius={0.03} position={[1.29, 0.8, 0]}>
        <meshStandardMaterial color="#cfd4e6" />
      </RoundedBox>
    </group>
  );
}

/* ───────── App-icon tile ───────── */
function Tile({ kind, color, size = 0.9 }: { kind: IconKind; color: string; size?: number }) {
  const tex = useMemo(() => makeIconTexture(kind, color), [kind, color]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      <RoundedBox args={[size, size, size * 0.34]} radius={size * 0.16} smoothness={5}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, size * 0.171]}>
        <planeGeometry args={[size * 0.98, size * 0.98]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ───────── Gear (extruded shape) ───────── */
function gearShape(teeth: number, rOut: number, rIn: number, hole: number) {
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [rIn, a],
      [rIn, a + step * 0.18],
      [rOut, a + step * 0.3],
      [rOut, a + step * 0.55],
      [rIn, a + step * 0.67],
    ];
    pts.forEach(([r, ang], j) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && j === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
  }
  s.closePath();
  const h = new THREE.Path();
  h.absarc(0, 0, hole, 0, Math.PI * 2, true);
  s.holes.push(h);
  return s;
}

function Gear({ radius = 0.7, teeth = 10, color, speed, reduce, position }: { radius?: number; teeth?: number; color: string; speed: number; reduce: boolean; position: [number, number, number] }) {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(gearShape(teeth, radius, radius * 0.78, radius * 0.28), { depth: radius * 0.36, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
    g.center();
    return g;
  }, [radius, teeth]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current && !reduce) ref.current.rotation.z += dt * speed;
  });
  return (
    <mesh ref={ref} geometry={geo} position={position} rotation={[0, 0, 0]}>
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
    </mesh>
  );
}

/* ───────── Paint can (brand colour) ───────── */
function Can({ color, position }: { color: string; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.6, 32]} />
        <meshStandardMaterial color="#d9dde9" roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.61, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      {/* drip */}
      <RoundedBox args={[0.14, 0.4, 0.1]} radius={0.05} position={[0.32, 0.36, 0.1]}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </RoundedBox>
    </group>
  );
}

/* ───────── Growth chart tile ───────── */
function Chart({ reduce }: { reduce: boolean }) {
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const heights = [0.5, 0.8, 0.65, 1.1, 1.4];
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    heights.forEach((h, i) => {
      const m = bars.current[i];
      if (!m) return;
      const hh = reduce ? h : h * (0.85 + 0.15 * Math.sin(t * 1.4 + i));
      m.scale.y = hh;
      m.position.y = hh / 2;
    });
  });
  return (
    <group>
      <RoundedBox args={[2.2, 0.16, 1.1]} radius={0.06}>
        <meshStandardMaterial color={CREAM} roughness={0.7} />
      </RoundedBox>
      {heights.map((h, i) => (
        <mesh
          key={i}
          ref={(el) => {
            bars.current[i] = el;
          }}
          position={[-0.8 + i * 0.4, h / 2, 0]}
        >
          <boxGeometry args={[0.26, 1, 0.26]} />
          <meshStandardMaterial color={i === heights.length - 1 ? ORANGE : i % 2 ? VIOLET : BLUE} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────── Bubble + code slab ───────── */
function Bubble() {
  const tex = useMemo(() => makeBubbleTexture("ROAS this month", "+24%"), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      <RoundedBox args={[1.7, 0.95, 0.22]} radius={0.22} smoothness={5}>
        <meshStandardMaterial color={ORANGE} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.115]}>
        <planeGeometry args={[1.66, 0.92]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
      {/* tail */}
      <mesh position={[-0.55, -0.6, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.16, 0.36, 4]} />
        <meshStandardMaterial color={ORANGE} roughness={0.5} />
      </mesh>
    </group>
  );
}

function CodeSlab() {
  const tex = useMemo(() => makeCodeTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      <RoundedBox args={[1.5, 0.18, 1.0]} radius={0.06}>
        <meshStandardMaterial color="#151a2e" roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.44, 0.96]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ───────── Orbiting tiles ───────── */
const tiles: { kind: IconKind; color: string; r: number; y: number; phase: number; delay: number }[] = [
  { kind: "play", color: VIOLET, r: 2.4, y: 1.6, phase: 0, delay: 0.9 },
  { kind: "image", color: BLUE, r: 2.6, y: 2.4, phase: 1.1, delay: 1.0 },
  { kind: "mail", color: VIOLET, r: 2.5, y: 0.4, phase: 2.2, delay: 1.1 },
  { kind: "camera", color: BLUE, r: 2.7, y: 1.1, phase: 3.3, delay: 1.2 },
  { kind: "chat", color: ORANGE, r: 2.4, y: 2.0, phase: 4.4, delay: 1.3 },
  { kind: "bell", color: CYAN, r: 2.6, y: 0.8, phase: 5.5, delay: 1.4 },
];

function Orbiters({ reduce }: { reduce: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((state) => {
    const t = reduce ? 0 : state.clock.elapsedTime * 0.18;
    tiles.forEach((tl, i) => {
      const g = refs.current[i];
      if (!g) return;
      const a = t + tl.phase;
      g.position.set(Math.cos(a) * tl.r, tl.y + Math.sin(a * 2 + i) * 0.12, Math.sin(a) * tl.r * 0.55 + 0.6);
      // always face the viewer-ish while bobbing
      g.rotation.y = Math.sin(a) * 0.35;
    });
  });
  return (
    <group>
      {tiles.map((tl, i) => (
        <group
          key={tl.kind}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <Pop delay={tl.delay} reduce={reduce}>
            <Tile kind={tl.kind} color={tl.color} />
          </Pop>
        </group>
      ))}
    </group>
  );
}

export default function IsoScene({ reduce }: SceneProps) {
  return (
    <group scale={1.05} position={[0, -1.9, 0]} rotation={[0, -0.35, 0]}>
      {/* soft studio light for the illustration look */}
      <hemisphereLight args={["#ffffff", "#8fa3ff", 0.9]} />
      <directionalLight position={[4, 8, 5]} intensity={1.2} />

      {/* floating base */}
      <Pop delay={0} reduce={reduce}>
        <RoundedBox args={[7.4, 0.36, 7.4]} radius={0.18} position={[0, -0.18, 0]}>
          <meshStandardMaterial color={NAVY} roughness={0.8} />
        </RoundedBox>
        <RoundedBox args={[6.6, 0.12, 6.6]} radius={0.12} position={[0, 0.06, 0]}>
          <meshStandardMaterial color="#27306a" roughness={0.8} />
        </RoundedBox>
      </Pop>

      {/* phone, standing, slightly tilted, floating */}
      <Pop delay={0.35} reduce={reduce} position={[0.2, 2.75, -0.4]} rotation={[0.06, -0.15, 0]}>
        <Float speed={reduce ? 0 : 1.2} rotationIntensity={reduce ? 0 : 0.08} floatIntensity={reduce ? 0 : 0.5}>
          <Phone reduce={reduce} />
        </Float>
      </Pop>

      <Orbiters reduce={reduce} />

      {/* gears */}
      <Pop delay={0.7} reduce={reduce} position={[-3.1, 4.3, 0.6]}>
        <Float speed={reduce ? 0 : 1} rotationIntensity={0} floatIntensity={reduce ? 0 : 0.5}>
          <Gear color={VIOLET} speed={0.6} reduce={reduce} position={[0, 0, 0]} />
          <Gear color={NAVY} radius={0.5} teeth={8} speed={-0.84} reduce={reduce} position={[0.95, -0.7, 0.1]} />
        </Float>
      </Pop>

      {/* metric bubble */}
      <Pop delay={1.5} reduce={reduce} position={[-2.9, 2.2, 0.9]} rotation={[0, 0.35, 0]}>
        <Float speed={reduce ? 0 : 1.4} rotationIntensity={reduce ? 0 : 0.05} floatIntensity={reduce ? 0 : 0.5}>
          <Bubble />
        </Float>
      </Pop>

      {/* code slab + chart + cans on the base */}
      <Pop delay={0.5} reduce={reduce} position={[-2.2, 0.2, 1.8]} rotation={[0, 0.3, 0]}>
        <CodeSlab />
      </Pop>
      <Pop delay={0.6} reduce={reduce} position={[2.4, 0.2, 1.6]} rotation={[0, -0.4, 0]}>
        <Chart reduce={reduce} />
      </Pop>
      <Pop delay={0.8} reduce={reduce}>
        <Can color={ORANGE} position={[1.2, 0.12, 2.6]} />
        <Can color={VIOLET} position={[2.0, 0.12, 2.9]} />
        <Can color={NAVY} position={[2.9, 0.12, 2.3]} />
      </Pop>

      <ContactShadows position={[0, 0.13, 0]} opacity={0.45} scale={9} blur={2.4} far={5} resolution={256} color="#0a0f2e" />
    </group>
  );
}
