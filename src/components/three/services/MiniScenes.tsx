"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type ComponentType } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { ServiceIcon } from "@/content/site";
import { Panel } from "../Panel";
import { Pop, Spin } from "../util";
import { makeBrowserTexture, makeLogoTileTexture, makeProductTexture, makeWireframeTexture } from "../textures";
import { makeCodeTexture, makeIconTexture, makePhoneScreenTexture } from "../isoTextures";
import type { LogoKey } from "@/content/logos";

/**
 * One compact animated 3D vignette per service. Each fits in roughly a
 * 5 × 4 unit box centred on the origin and is cheap enough to run several
 * at once. Shared props: { reduce }.
 */
export type MiniProps = { reduce: boolean };

const CYAN = "#38e1ff";
const BLUE = "#4d7cfe";
const VIOLET = "#8b5cf6";
const ORANGE = "#ff9f43";

/* ───── helpers ───── */
function Glow({ color = "#9cc2ff", intensity = 6, position = [0, 0, 2] as [number, number, number] }) {
  return <pointLight color={color} intensity={intensity} distance={7} position={position} />;
}

function Packet({ path, speed, phase, color = "#ffffff", reduce }: { path: THREE.Curve<THREE.Vector3>; speed: number; phase: number; color?: string; reduce: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const u = reduce ? phase % 1 : (state.clock.elapsedTime * speed + phase) % 1;
    ref.current.position.copy(path.getPointAt(u));
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

/* ───── 01 AdTech: hub + nodes + packets + a live chart ───── */
export function AdTechMini({ reduce }: MiniProps) {
  const nodes = useMemo(() => Array.from({ length: 7 }, (_, i) => new THREE.Vector3(Math.cos((i / 7) * Math.PI * 2) * 1.9, Math.sin((i / 7) * Math.PI * 2) * 1.2, (i % 2) * 0.6 - 0.3)), []);
  const hub = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const lines = useMemo(() => {
    const arr: number[] = [];
    nodes.forEach((n) => arr.push(hub.x, hub.y, hub.z, n.x, n.y, n.z));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, [nodes, hub]);
  const paths = useMemo(() => nodes.map((n) => new THREE.LineCurve3(hub, n)), [nodes, hub]);
  return (
    <group>
      <Spin speed={0.25} reduce={reduce}>
        <lineSegments geometry={lines}>
          <lineBasicMaterial color={BLUE} transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
        {nodes.map((n, i) => (
          <mesh key={i} position={n}>
            <sphereGeometry args={[0.11, 14, 14]} />
            <meshStandardMaterial color={i % 2 ? CYAN : VIOLET} emissive={i % 2 ? CYAN : VIOLET} emissiveIntensity={0.7} />
          </mesh>
        ))}
        {paths.map((p, i) => (
          <Packet key={i} path={p} speed={0.35 + (i % 3) * 0.1} phase={i * 0.17} reduce={reduce} />
        ))}
        <Float speed={reduce ? 0 : 1.5} floatIntensity={reduce ? 0 : 0.3} rotationIntensity={0}>
          <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.16}>
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} roughness={0.3} />
          </RoundedBox>
        </Float>
      </Spin>
      <Panel spec={{ title: "Conversions", value: "1,362", sub: "▲ 18.4%", kind: "line", accent: CYAN, seed: 5 }} position={[-2.6, 1.4, -1]} rotation={[0, 0.5, 0]} width={1.7} reduce={reduce} />
      <Glow />
    </group>
  );
}

/* ───── 02 Media Buying: platform tiles orbiting a budget chart ───── */
const platforms: LogoKey[] = ["meta", "googleads", "tiktok", "youtube", "snapchat", "x"];
function LogoTile({ k }: { k: LogoKey }) {
  const tex = useMemo(() => makeLogoTileTexture(k), [k]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      <RoundedBox args={[0.9, 0.9, 0.18]} radius={0.16}>
        <meshStandardMaterial color="#1a2140" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.095]}>
        <planeGeometry args={[0.88, 0.88]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
export function MediaBuyingMini({ reduce }: MiniProps) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((state) => {
    const t = reduce ? 0 : state.clock.elapsedTime * 0.3;
    platforms.forEach((_, i) => {
      const g = refs.current[i];
      if (!g) return;
      const a = t + (i / platforms.length) * Math.PI * 2;
      g.position.set(Math.cos(a) * 2.2, Math.sin(a * 1.3 + i) * 0.35, Math.sin(a) * 0.9);
      g.rotation.y = Math.sin(a) * 0.4;
    });
  });
  return (
    <group>
      {platforms.map((k, i) => (
        <group key={k} ref={(el) => { refs.current[i] = el; }}>
          <Pop delay={0.2 + i * 0.1} reduce={reduce}>
            <LogoTile k={k} />
          </Pop>
        </group>
      ))}
      <Panel spec={{ title: "Spend by channel", value: "$12,480", sub: "pacing on track", kind: "bars", accent: BLUE, seed: 9 }} position={[0, 0.1, 0]} width={2.1} delay={0.1} reduce={reduce} />
      <Glow color={BLUE} />
    </group>
  );
}

/* ───── 03 Performance: funnel + target + ROAS ───── */
export function PerformanceMini({ reduce }: MiniProps) {
  const arrow = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!arrow.current || reduce) return;
    const t = (state.clock.elapsedTime * 0.6) % 1;
    arrow.current.position.set(-3 + t * 3, 1.2 - t * 1.2, 0.8);
    arrow.current.scale.setScalar(t > 0.9 ? 1 - (t - 0.9) * 10 : 1);
  });
  const rings = [1.1, 0.75, 0.4];
  return (
    <group>
      {/* funnel: stacked discs */}
      <Spin speed={0.4} reduce={reduce}>
        {[1.3, 1.0, 0.7, 0.42].map((r, i) => (
          <mesh key={i} position={[-1.5, 1.1 - i * 0.62, 0]}>
            <cylinderGeometry args={[r, r * 0.8, 0.42, 40, 1, true]} />
            <meshPhysicalMaterial color={[CYAN, BLUE, VIOLET, "#c4b5fd"][i]} transparent opacity={0.55} side={THREE.DoubleSide} clearcoat={1} roughness={0.2} />
          </mesh>
        ))}
      </Spin>
      {/* target */}
      <group position={[1.6, 0.4, 0.8]}>
        {rings.map((r, i) => (
          <mesh key={i}>
            <torusGeometry args={[r, 0.05, 8, 64]} />
            <meshStandardMaterial color={i === 2 ? ORANGE : "#dfe8ff"} emissive={i === 2 ? ORANGE : "#9cc2ff"} emissiveIntensity={0.5} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.12, 14, 14]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </group>
      <group ref={arrow}>
        <mesh rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.09, 0.5, 8]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </group>
      <Panel spec={{ title: "Performance", value: "4.2×", sub: "ROAS", kind: "kpis", accent: CYAN, seed: 7 }} position={[0.9, -1.35, 0.4]} width={2.2} delay={0.3} reduce={reduce} />
      <Glow color={ORANGE} intensity={3} position={[1.6, 0.4, 2]} />
    </group>
  );
}

/* ───── 04 Software: monitor with code + gears ───── */
function gearShape(teeth: number, rOut: number, rIn: number, hole: number) {
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    ([[rIn, a], [rIn, a + step * 0.18], [rOut, a + step * 0.3], [rOut, a + step * 0.55], [rIn, a + step * 0.67]] as [number, number][]).forEach(([r, ang], j) => {
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
export function Gear({ radius = 0.6, teeth = 10, color, speed, reduce, position }: { radius?: number; teeth?: number; color: string; speed: number; reduce: boolean; position: [number, number, number] }) {
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
    <mesh ref={ref} geometry={geo} position={position}>
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </mesh>
  );
}
export function SoftwareMini({ reduce }: MiniProps) {
  const code = useMemo(() => makeCodeTexture(), []);
  useEffect(() => () => code.dispose(), [code]);
  return (
    <group>
      <Float speed={reduce ? 0 : 1} floatIntensity={reduce ? 0 : 0.3} rotationIntensity={reduce ? 0 : 0.05}>
        <group position={[-0.4, 0.2, 0]} rotation={[0, 0.25, 0]}>
          <RoundedBox args={[3.1, 2.2, 0.16]} radius={0.12}>
            <meshStandardMaterial color="#151a2e" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0, 0.085]}>
            <planeGeometry args={[3.0, 2.1]} />
            <meshBasicMaterial map={code} toneMapped={false} />
          </mesh>
          <RoundedBox args={[0.5, 0.6, 0.3]} radius={0.06} position={[0, -1.35, -0.1]}>
            <meshStandardMaterial color="#2a3350" />
          </RoundedBox>
        </group>
      </Float>
      <Float speed={reduce ? 0 : 1.3} floatIntensity={reduce ? 0 : 0.4} rotationIntensity={0}>
        <Gear color={VIOLET} speed={0.7} reduce={reduce} position={[1.9, 1.1, 0.6]} />
        <Gear color={CYAN} radius={0.42} teeth={8} speed={-1.0} reduce={reduce} position={[2.7, 0.3, 0.7]} />
      </Float>
      <Glow color={VIOLET} intensity={4} />
    </group>
  );
}

/* ───── 05 Web: browser window with exploded layers ───── */
export function WebMini({ reduce }: MiniProps) {
  const tex = useMemo(() => makeBrowserTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  const layers = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!layers.current) return;
    const t = reduce ? 0 : state.clock.elapsedTime;
    // layers breathe apart and back together
    const k = 0.5 + 0.5 * Math.sin(t * 0.8);
    layers.current.children.forEach((c, i) => {
      c.position.z = 0.1 + i * 0.28 * k;
    });
  });
  return (
    <group rotation={[0.15, -0.35, 0]} position={[0.2, 0.1, 0]}>
      <RoundedBox args={[3.4, 2.35, 0.14]} radius={0.12}>
        <meshStandardMaterial color="#0d1126" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[3.3, 2.25]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <group ref={layers}>
        {[
          [0.1, 0.75, 1.7, 0.36, CYAN],
          [-0.9, 0.05, 1.3, 0.5, BLUE],
          [0.55, -0.45, 1.5, 0.7, VIOLET],
        ].map(([x, y, w, h, col], i) => (
          <mesh key={i} position={[x as number, y as number, 0.1]}>
            <planeGeometry args={[w as number, h as number]} />
            <meshBasicMaterial color={col as string} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <Glow color={CYAN} intensity={4} />
    </group>
  );
}

/* ───── 06 Mobile: phone + orbiting app tiles ───── */
function Tile({ kind, color }: { kind: "play" | "chat" | "bell"; color: string }) {
  const tex = useMemo(() => makeIconTexture(kind, color), [kind, color]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      <RoundedBox args={[0.7, 0.7, 0.24]} radius={0.12}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.125]}>
        <planeGeometry args={[0.68, 0.68]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
export function MobileMini({ reduce }: MiniProps) {
  const screen = useMemo(() => makePhoneScreenTexture(), []);
  useEffect(() => () => screen.dispose(), [screen]);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const tiles = useRef<(THREE.Group | null)[]>([]);
  useFrame((state) => {
    const m = mat.current;
    if (m && m.map && !reduce) {
      m.map.repeat.set(1, 0.42);
      m.map.offset.y = -((state.clock.elapsedTime * 0.05) % 1);
    }
    const t = reduce ? 0 : state.clock.elapsedTime * 0.5;
    tiles.current.forEach((g, i) => {
      if (!g) return;
      const a = t + (i / 3) * Math.PI * 2;
      g.position.set(Math.cos(a) * 1.7, Math.sin(a * 1.5) * 0.5, Math.sin(a) * 0.8);
    });
  });
  return (
    <group>
      <Float speed={reduce ? 0 : 1.1} floatIntensity={reduce ? 0 : 0.3} rotationIntensity={reduce ? 0 : 0.08}>
        <group rotation={[0.05, -0.2, 0]}>
          <RoundedBox args={[1.5, 3.05, 0.2]} radius={0.2} smoothness={5}>
            <meshStandardMaterial color="#e9ecf5" roughness={0.45} />
          </RoundedBox>
          <mesh position={[0, 0, 0.105]}>
            <planeGeometry args={[1.32, 2.86]} />
            <meshBasicMaterial ref={mat} map={screen} toneMapped={false} />
          </mesh>
        </group>
      </Float>
      {(["play", "chat", "bell"] as const).map((k, i) => (
        <group key={k} ref={(el) => { tiles.current[i] = el; }}>
          <Pop delay={0.3 + i * 0.15} reduce={reduce}>
            <Tile kind={k} color={[VIOLET, ORANGE, CYAN][i]} />
          </Pop>
        </group>
      ))}
      <Glow color={BLUE} intensity={4} />
    </group>
  );
}

/* ───── 07 UI/UX: exploded wireframe layers + cursor + swatches ───── */
export function UiUxMini({ reduce }: MiniProps) {
  const texs = useMemo(() => [makeWireframeTexture(0), makeWireframeTexture(1), makeWireframeTexture(2)], []);
  useEffect(() => () => texs.forEach((t) => t.dispose()), [texs]);
  const cursor = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!cursor.current || reduce) return;
    const t = state.clock.elapsedTime;
    cursor.current.position.set(Math.sin(t * 0.9) * 1.1 + 0.2, Math.cos(t * 0.7) * 0.6 + 0.3, 1.3);
  });
  return (
    <group rotation={[0.55, -0.5, 0.25]} position={[0.2, 0.2, 0]}>
      {texs.map((t, i) => (
        <Float key={i} speed={reduce ? 0 : 1 + i * 0.3} floatIntensity={reduce ? 0 : 0.2} rotationIntensity={0}>
          <mesh position={[0, 0, i * 0.5]}>
            <planeGeometry args={[3.2, 2.2]} />
            <meshBasicMaterial map={t} transparent toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </Float>
      ))}
      <mesh ref={cursor} rotation={[0, 0, -0.6]}>
        <coneGeometry args={[0.11, 0.34, 3]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      {[CYAN, BLUE, VIOLET, ORANGE].map((c, i) => (
        <mesh key={c} position={[-1.9 + i * 0.42, -1.5, 0.6]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color={c} roughness={0.35} />
        </mesh>
      ))}
      <Glow color={VIOLET} intensity={3} />
    </group>
  );
}

/* ───── 08 E-commerce: product card, bag, coins ───── */
export function EcommerceMini({ reduce }: MiniProps) {
  const tex = useMemo(() => makeProductTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  const coins = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!coins.current || reduce) return;
    const t = state.clock.elapsedTime;
    coins.current.children.forEach((c, i) => {
      c.position.y = -0.9 + i * 0.16 + Math.sin(t * 1.5 + i) * 0.05;
      c.rotation.y = t * 0.6 + i;
    });
  });
  return (
    <group>
      <Float speed={reduce ? 0 : 1} floatIntensity={reduce ? 0 : 0.3} rotationIntensity={reduce ? 0 : 0.05}>
        <group position={[-0.9, 0.2, 0]} rotation={[0, 0.3, 0]}>
          <RoundedBox args={[1.7, 2.15, 0.14]} radius={0.12}>
            <meshStandardMaterial color="#12172e" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0, 0.075]}>
            <planeGeometry args={[1.62, 2.05]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      </Float>
      {/* bag */}
      <Float speed={reduce ? 0 : 1.4} floatIntensity={reduce ? 0 : 0.35} rotationIntensity={0}>
        <group position={[1.5, 0.3, 0.4]} rotation={[0, -0.3, 0]}>
          <RoundedBox args={[1.1, 1.1, 0.5]} radius={0.1}>
            <meshStandardMaterial color={ORANGE} roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.65, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.32, 0.05, 8, 40, Math.PI]} />
            <meshStandardMaterial color="#ffd7b0" />
          </mesh>
          <mesh position={[0, 0.05, 0.26]}>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
        </group>
      </Float>
      <group ref={coins} position={[1.7, 0, -0.2]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, -0.9 + i * 0.16, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.1, 28]} />
            <meshStandardMaterial color={i % 2 ? "#ffd166" : "#f6b73c"} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
      <Glow color={ORANGE} intensity={3} />
    </group>
  );
}

/* ───── 09 Data & Analytics: mini skyline + donut + trend ───── */
export function DataMini({ reduce }: MiniProps) {
  const N = 7;
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorA = useMemo(() => new THREE.Color("#2a3a7a"), []);
  const colorB = useMemo(() => new THREE.Color(CYAN), []);
  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < N * N; i++) {
      c.copy(colorA).lerp(colorB, (i % N) / N);
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [colorA, colorB]);
  useFrame((state) => {
    const m = inst.current;
    if (!m) return;
    const t = reduce ? 0 : state.clock.elapsedTime;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const h = 0.3 + (Math.sin(i * 0.9 + t * 1.2) + 1) * 0.35 + (Math.cos(j * 0.7 + t * 0.9) + 1) * 0.35;
        dummy.position.set((i - N / 2) * 0.36 - 0.8, h / 2 - 1.3, (j - N / 2) * 0.36);
        dummy.scale.set(0.22, h, 0.22);
        dummy.updateMatrix();
        m.setMatrixAt(i * N + j, dummy.matrix);
      }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <group rotation={[0.2, 0.5, 0]}>
      <instancedMesh ref={inst} args={[undefined, undefined, N * N]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} emissive="#4d7cfe" emissiveIntensity={0.25} />
      </instancedMesh>
      <Panel spec={{ title: "Traffic mix", value: "2.41M", sub: "Impressions", kind: "donut", accent: VIOLET, seed: 2 }} position={[1.9, 1.1, -0.6]} rotation={[0, -0.4, 0]} width={1.9} reduce={reduce} />
      <Panel spec={{ title: "Trend", value: "+18%", sub: "vs last period", kind: "line", accent: CYAN, seed: 11 }} position={[-1.6, 1.6, -1.2]} rotation={[0, 0.3, 0]} width={1.8} delay={0.2} reduce={reduce} />
      <Glow color={CYAN} intensity={4} />
    </group>
  );
}

/* ───── 10 Automation: conveyor + gears + workflow chain ───── */
export function AutomationMini({ reduce }: MiniProps) {
  const belt = useRef<THREE.Group>(null);
  const chain = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-2.2, 1.2, 0), new THREE.Vector3(-0.8, 1.6, 0.3), new THREE.Vector3(0.6, 1.1, -0.2), new THREE.Vector3(2.2, 1.5, 0)]), []);
  const tube = useMemo(() => new THREE.TubeGeometry(chain, 60, 0.02, 6, false), [chain]);
  useFrame((state) => {
    if (!belt.current || reduce) return;
    const t = state.clock.elapsedTime;
    belt.current.children.forEach((c, i) => {
      const u = ((t * 0.25 + i / 5) % 1) * 4.4 - 2.2;
      c.position.x = u;
      c.scale.setScalar(u > 1.9 ? Math.max(0.001, 1 - (u - 1.9) * 3.3) : u < -1.9 ? Math.max(0.001, (u + 2.2) * 3.3) : 1);
    });
  });
  return (
    <group rotation={[0.15, -0.3, 0]}>
      {/* conveyor */}
      <RoundedBox args={[4.6, 0.16, 0.9]} radius={0.06} position={[0, -0.9, 0]}>
        <meshStandardMaterial color="#1a2140" roughness={0.6} />
      </RoundedBox>
      {[-1.6, -0.8, 0, 0.8, 1.6].map((x) => (
        <mesh key={x} position={[x, -0.9, 0.46]}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 16]} />
          <meshStandardMaterial color="#38e1ff" emissive="#38e1ff" emissiveIntensity={0.6} />
        </mesh>
      ))}
      <group ref={belt}>
        {[0, 1, 2, 3, 4].map((i) => (
          <RoundedBox key={i} args={[0.5, 0.5, 0.5]} radius={0.08} position={[-2.2 + i * 0.9, -0.55, 0]}>
            <meshStandardMaterial color={[CYAN, BLUE, VIOLET, ORANGE, "#c4b5fd"][i]} roughness={0.45} />
          </RoundedBox>
        ))}
      </group>
      {/* workflow chain */}
      <mesh geometry={tube}>
        <meshBasicMaterial color={BLUE} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {[0, 0.33, 0.66, 1].map((u, i) => (
        <mesh key={i} position={chain.getPointAt(u)}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color="#ffffff" emissive="#9cc2ff" emissiveIntensity={0.8} />
        </mesh>
      ))}
      <Packet path={chain} speed={0.3} phase={0} reduce={reduce} />
      <Packet path={chain} speed={0.3} phase={0.5} reduce={reduce} />
      <Gear color={VIOLET} speed={0.8} reduce={reduce} position={[2.3, -0.2, 0.4]} radius={0.5} />
      <Gear color={CYAN} speed={-1.1} reduce={reduce} position={[2.95, 0.45, 0.45]} radius={0.35} teeth={8} />
      <Glow color={BLUE} intensity={4} />
    </group>
  );
}

export const miniScenes: Record<ServiceIcon, ComponentType<MiniProps>> = {
  adtech: AdTechMini,
  media: MediaBuyingMini,
  performance: PerformanceMini,
  software: SoftwareMini,
  web: WebMini,
  mobile: MobileMini,
  uiux: UiUxMini,
  ecommerce: EcommerceMini,
  data: DataMini,
  automation: AutomationMini,
};
