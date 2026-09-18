"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { SceneProps } from "../SceneCanvas";
import { Panel } from "../Panel";
import { makeHudTexture, type PanelSpec } from "../textures";

/**
 * Command Deck — a curved wall of holographic campaign dashboards (drawn
 * charts, KPIs, live indicators) around a hologram of the Pixel mark on a
 * HUD dial. The AdTech control room.
 *
 * Choreography (seconds after mount): dial spins up → mark assembles
 * (0.2s, pixel by pixel) → links draw (0.9s) → panels boot in sequence
 * (1.1s, 1.35s, 1.6s, 1.85s) with an unfold + flicker.
 */

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const HUB = new THREE.Vector3(0, -0.25, 1.9);

const panels: { spec: PanelSpec; position: [number, number, number]; rotation: [number, number, number]; width: number; delay: number }[] = [
  // centre column
  { spec: { title: "Conversions · 14d", value: "1,362", sub: "▲ 18.4% vs last period", kind: "line", accent: "#38e1ff", seed: 5 }, position: [0.2, 1.55, 0.2], rotation: [0, 0, 0], width: 2.8, delay: 1.1 },
  { spec: { title: "Performance", value: "4.2×", sub: "ROAS · demo data", kind: "kpis", accent: "#38e1ff", seed: 7 }, position: [0.1, -0.85, 0.55], rotation: [0.1, 0, 0], width: 2.3, delay: 1.85 },
  // left wing
  { spec: { title: "Spend by channel", value: "$12,480", sub: "Budget pacing on track", kind: "bars", accent: "#4d7cfe", seed: 9 }, position: [-2.95, 1.0, -0.7], rotation: [0, 0.5, 0], width: 2.2, delay: 1.35 },
  { spec: { title: "Live campaign feed", value: "", sub: "Real-time · all channels", kind: "feed", accent: "#34d399", seed: 1 }, position: [-3.15, -1.35, 0.1], rotation: [0, 0.55, 0], width: 2.1, delay: 2.1 },
  { spec: { title: "Conversion funnel", value: "0.056%", sub: "Impression → sale", kind: "funnel", accent: "#8b5cf6", seed: 3 }, position: [-3.45, 2.75, -1.5], rotation: [0.05, 0.6, 0], width: 1.9, delay: 2.35 },
  // right wing
  { spec: { title: "Traffic mix", value: "2.41M", sub: "Impressions", kind: "donut", accent: "#8b5cf6", seed: 2 }, position: [2.95, 1.0, -0.7], rotation: [0, -0.5, 0], width: 2.2, delay: 1.6 },
  { spec: { title: "Audience reach", value: "5 regions", sub: "Live audiences by market", kind: "map", accent: "#8b5cf6", seed: 6 }, position: [3.15, -1.3, 0.1], rotation: [0, -0.55, 0], width: 2.3, delay: 2.2 },
  { spec: { title: "Creative test", value: "+24%", sub: "Variant B lifts CTR", kind: "ab", accent: "#38e1ff", seed: 8 }, position: [3.45, 2.75, -1.5], rotation: [0.05, -0.6, 0], width: 1.9, delay: 2.5 },
  // channels strip in front of the dial
  { spec: { title: "Active channels", value: "10 platforms · buying live", sub: "All systems nominal", kind: "channels", accent: "#34d399", seed: 4 }, position: [0, -2.15, 2.4], rotation: [-0.35, 0, 0], width: 3.4, delay: 2.7 },
];

const cells: [number, number][] = [
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, -1],
];
const tints = ["#38e1ff", "#5b8cff", "#7d6bff", "#8b5cf6"];

/** One pixel of the hologram: pops in at its own moment. */
function Pixel({ i, position, reduce, children }: { i: number; position?: [number, number, number]; reduce: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (start.current === null) start.current = now;
    const t = now - start.current;
    const s = reduce ? 1 : easeOut((t - 0.2 - i * 0.12) / 0.5);
    if (ref.current) ref.current.scale.setScalar(Math.max(0.001, s));
  });
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
}

/** The Pixel mark hologram — pixels pop in one by one, then it turns slowly. */
function MiniMark({ reduce }: { reduce: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current && !reduce) g.current.rotation.y += dt * 0.6;
  });
  const sp = 1.24;
  return (
    <group ref={g} position={HUB} scale={0.32}>
      {cells.map(([x, y], i) => (
        <Pixel key={i} i={i} position={[x * sp, y * sp, 0]} reduce={reduce}>
          <RoundedBox args={[1, 1, 1]} radius={0.18}>
            <meshPhysicalMaterial color={tints[i]} emissive={tints[i]} emissiveIntensity={0.5} clearcoat={1} roughness={0.15} transparent opacity={0.85} />
          </RoundedBox>
        </Pixel>
      ))}
      <Pixel i={4} reduce={reduce}>
        <RoundedBox args={[1, 1, 1]} radius={0.18}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.9} roughness={0.4} />
        </RoundedBox>
      </Pixel>
      <pointLight intensity={1.5} distance={4} color="#cfe0ff" />
    </group>
  );
}

function HudDial({ reduce }: { reduce: boolean }) {
  const tex = useMemo(() => makeHudTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const matA = useRef<THREE.MeshBasicMaterial>(null);
  const matB = useRef<THREE.MeshBasicMaterial>(null);
  const start = useRef<number | null>(null);
  useFrame((state, dt) => {
    const now = state.clock.elapsedTime;
    if (start.current === null) start.current = now;
    const t = now - start.current;
    const p = reduce ? 1 : easeOut(t / 1.2);
    // spin-up: fast then settle
    const spin = reduce ? 0 : dt * (0.12 + (1 - p) * 2.5);
    if (a.current) {
      a.current.rotation.z += spin;
      a.current.scale.setScalar(0.6 + 0.4 * p);
    }
    if (b.current) {
      b.current.rotation.z -= spin * 1.6;
      b.current.scale.setScalar((0.6 + 0.4 * p) * 0.62);
    }
    if (matA.current) matA.current.opacity = 0.6 * p;
    if (matB.current) matB.current.opacity = 0.35 * p;
  });
  return (
    <group position={[0, -2.4, 1.2]} rotation={[-Math.PI / 2 + 0.25, 0, 0]}>
      <mesh ref={a}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial ref={matA} map={tex} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={b} position={[0, 0, 0.01]}>
        <planeGeometry args={[4.6, 4.6]} />
        <meshBasicMaterial ref={matB} map={tex} transparent opacity={0.5} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Data links from the hub to each panel — drawn in, with packets travelling out. */
function Links({ reduce }: { reduce: boolean }) {
  const mat = useRef<THREE.LineBasicMaterial>(null);
  const packets = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const geo = useMemo(() => {
    const arr: number[] = [];
    panels.forEach((p) => arr.push(HUB.x, HUB.y, HUB.z, p.position[0], p.position[1], p.position[2]));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, []);
  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (start.current === null) start.current = now;
    const t = now - start.current;
    if (mat.current) mat.current.opacity = 0.35 * (reduce ? 1 : easeOut((t - 0.9) / 0.6));
    if (!packets.current || reduce) return;
    packets.current.children.forEach((c, i) => {
      const u = (now * 0.35 + i * 0.25) % 1;
      const p = panels[i];
      c.position.set(HUB.x + (p.position[0] - HUB.x) * u, HUB.y + (p.position[1] - HUB.y) * u, HUB.z + (p.position[2] - HUB.z) * u);
      c.visible = t > p.delay;
    });
  });
  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial ref={mat} color="#4d7cfe" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <group ref={packets}>
        {panels.map((_, i) => (
          <mesh key={i} visible={false}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function DeckScene({ reduce }: SceneProps) {
  return (
    <group scale={1.08} position={[0, 0.2, 0]}>
      {panels.map((p, i) => (
        <Panel key={i} spec={p.spec} position={p.position} rotation={p.rotation} width={p.width} phase={i * 1.7} delay={p.delay} reduce={reduce} />
      ))}
      <Links reduce={reduce} />
      <Float speed={reduce ? 0 : 1.2} rotationIntensity={0} floatIntensity={reduce ? 0 : 0.5}>
        <MiniMark reduce={reduce} />
      </Float>
      <HudDial reduce={reduce} />
      <pointLight position={[0, 0, 3]} intensity={5} distance={9} color="#9cc2ff" />
    </group>
  );
}
