"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { SceneProps } from "../SceneCanvas";
import { Panel } from "../Panel";
import { makeHudTexture, type PanelSpec } from "../textures";

/**
 * Command Deck — a curved wall of holographic campaign dashboards (drawn
 * charts, KPIs, live indicators) around a small hologram of the Pixel mark
 * on a HUD dial. The AdTech control room.
 */

const panels: { spec: PanelSpec; position: [number, number, number]; rotation: [number, number, number]; width: number }[] = [
  { spec: { title: "Conversions · 14d", value: "1,362", sub: "▲ 18.4% vs last period", kind: "line", accent: "#38e1ff", seed: 5 }, position: [0.2, 1.05, 0.4], rotation: [0, 0, 0], width: 2.9 },
  { spec: { title: "Spend by channel", value: "$12,480", sub: "Budget pacing on track", kind: "bars", accent: "#4d7cfe", seed: 9 }, position: [-2.75, 0.2, -0.9], rotation: [0, 0.55, 0], width: 2.3 },
  { spec: { title: "Traffic mix", value: "2.41M", sub: "Impressions", kind: "donut", accent: "#8b5cf6", seed: 2 }, position: [2.85, 0.15, -0.9], rotation: [0, -0.55, 0], width: 2.3 },
  { spec: { title: "Performance", value: "4.2×", sub: "ROAS · demo data", kind: "kpis", accent: "#38e1ff", seed: 7 }, position: [0.1, -1.55, 0.2], rotation: [0.12, 0, 0], width: 2.6 },
];

function MiniMark({ reduce }: { reduce: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (g.current && !reduce) g.current.rotation.y += dt * 0.6;
  });
  const s = 0.62;
  const cells: [number, number][] = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
  ];
  return (
    <group ref={g} position={[0, -0.25, 1.9]} scale={0.32}>
      {cells.map(([x, y], i) => (
        <RoundedBox key={i} args={[1, 1, 1]} radius={0.18} position={[x * s * 2, y * s * 2, 0]}>
          <meshPhysicalMaterial color={["#38e1ff", "#5b8cff", "#7d6bff", "#8b5cf6"][i]} emissive={["#38e1ff", "#5b8cff", "#7d6bff", "#8b5cf6"][i]} emissiveIntensity={0.5} clearcoat={1} roughness={0.15} transparent opacity={0.85} />
        </RoundedBox>
      ))}
      <RoundedBox args={[1, 1, 1]} radius={0.18}>
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </RoundedBox>
    </group>
  );
}

function HudDial({ reduce }: { reduce: boolean }) {
  const tex = useMemo(() => makeHudTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (reduce) return;
    if (a.current) a.current.rotation.z += dt * 0.12;
    if (b.current) b.current.rotation.z -= dt * 0.2;
  });
  return (
    <group position={[0, -2.4, 1.2]} rotation={[-Math.PI / 2 + 0.25, 0, 0]}>
      <mesh ref={a}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={b} scale={0.62} position={[0, 0, 0.01]}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial map={tex} transparent opacity={0.5} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Links() {
  const geo = useMemo(() => {
    const hub = new THREE.Vector3(0, -0.25, 1.9);
    const arr: number[] = [];
    panels.forEach((p) => arr.push(hub.x, hub.y, hub.z, p.position[0], p.position[1], p.position[2]));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#4d7cfe" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

export default function DeckScene({ reduce }: SceneProps) {
  return (
    <group scale={1.08} position={[0, 0.2, 0]}>
      {panels.map((p, i) => (
        <Panel key={i} spec={p.spec} position={p.position} rotation={p.rotation} width={p.width} phase={i * 1.7} reduce={reduce} />
      ))}
      <Links />
      <Float speed={reduce ? 0 : 1.2} rotationIntensity={0} floatIntensity={reduce ? 0 : 0.5}>
        <MiniMark reduce={reduce} />
      </Float>
      <HudDial reduce={reduce} />
      <pointLight position={[0, 0, 3]} intensity={12} distance={9} color="#9cc2ff" />
    </group>
  );
}
