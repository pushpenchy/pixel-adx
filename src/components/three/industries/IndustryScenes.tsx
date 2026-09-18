"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, type ComponentType } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Panel } from "../Panel";
import { Pop, Spin } from "../util";
import { Gear, EcommerceMini, WebMini, type MiniProps } from "../services/MiniScenes";
import { makeIconTexture } from "../isoTextures";
import { landLonLat } from "@/lib/worldmap";

/**
 * One compact animated vignette per industry. Same footprint and props as
 * the service mini-scenes so they share the ViewCanvas plumbing.
 */

const CYAN = "#38e1ff";
const BLUE = "#4d7cfe";
const VIOLET = "#8b5cf6";
const ORANGE = "#ff9f43";
const MINT = "#34d399";
const ROSE = "#ff6b8a";

function Glow({ color = "#9cc2ff", intensity = 5 }: { color?: string; intensity?: number }) {
  return <pointLight color={color} intensity={intensity} distance={7} position={[0, 0, 2]} />;
}

/* helper: a stack of coins */
function Coins({ position, count = 5, color = "#ffd166", reduce }: { position: [number, number, number]; count?: number; color?: string; reduce: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current || reduce) return;
    const t = state.clock.elapsedTime;
    g.current.children.forEach((c, i) => {
      c.position.y = i * 0.14 + Math.sin(t * 1.6 + i * 0.6) * 0.03;
      c.rotation.y = t * 0.5 + i * 0.3;
    });
  });
  return (
    <group ref={g} position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.14, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.1, 28]} />
          <meshStandardMaterial color={i % 2 ? color : "#f6b73c"} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* helper: rounded "card" with a flat colour + a stripe */
function CreditCard({ color, position, rotation }: { color: string; position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[2.1, 1.3, 0.08]} radius={0.12}>
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0.28, 0.045]}>
        <planeGeometry args={[2.1, 0.22]} />
        <meshBasicMaterial color="#0a0b10" />
      </mesh>
      <RoundedBox args={[0.42, 0.3, 0.02]} radius={0.05} position={[-0.65, -0.15, 0.045]}>
        <meshStandardMaterial color="#ffd166" metalness={0.7} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0.3, -0.42, 0.045]}>
        <planeGeometry args={[1.1, 0.08]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

/* 01 FinTech */
export function FinTechScene({ reduce }: MiniProps) {
  return (
    <group>
      <Float speed={reduce ? 0 : 1} floatIntensity={reduce ? 0 : 0.3} rotationIntensity={reduce ? 0 : 0.06}>
        <CreditCard color={BLUE} position={[-0.9, 0.5, 0]} rotation={[0.1, 0.35, -0.05]} />
        <CreditCard color={VIOLET} position={[-0.5, 0.05, -0.5]} rotation={[0.1, 0.35, -0.05]} />
      </Float>
      <Coins position={[1.6, -1.1, 0.3]} reduce={reduce} />
      <Panel spec={{ title: "Transactions", value: "+32%", sub: "approved · secure", kind: "line", accent: MINT, seed: 21 }} position={[1.5, 1.3, -0.8]} rotation={[0, -0.35, 0]} width={1.8} reduce={reduce} />
      <Glow color={BLUE} />
    </group>
  );
}

/* 02 E-Commerce — reuse the service vignette */
export const EcommerceScene = EcommerceMini;

/* 03 SaaS — app window + cloud + usage bars */
function Cloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[
        [0, 0, 0, 0.5],
        [-0.5, -0.1, 0.1, 0.36],
        [0.5, -0.1, 0.1, 0.4],
        [0.15, 0.3, -0.1, 0.36],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 20, 20]} />
          <meshStandardMaterial color="#eef2ff" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
export function SaaSScene({ reduce }: MiniProps) {
  return (
    <group>
      <group scale={0.85} position={[-0.3, -0.2, 0]}>
        <WebMini reduce={reduce} />
      </group>
      <Float speed={reduce ? 0 : 1.2} floatIntensity={reduce ? 0 : 0.35} rotationIntensity={0}>
        <Cloud position={[1.9, 1.6, 0.3]} scale={0.7} />
      </Float>
      <Glow color={CYAN} />
    </group>
  );
}

/* 04 Healthcare — medical cross + pulse */
export function HealthcareScene({ reduce }: MiniProps) {
  const pulse = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const seq = [0, 0, 0.2, -0.3, 0.9, -0.7, 0.3, 0, 0, 0.15, 0];
    seq.forEach((y, i) => pts.push(new THREE.Vector3(-2.2 + (i / (seq.length - 1)) * 4.4, y * 0.6 - 1.2, 0.2)));
    return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2);
  }, []);
  const tube = useMemo(() => new THREE.TubeGeometry(pulse, 120, 0.03, 6, false), [pulse]);
  const dot = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (dot.current && !reduce) dot.current.position.copy(pulse.getPointAt((state.clock.elapsedTime * 0.35) % 1));
  });
  return (
    <group>
      <Float speed={reduce ? 0 : 1} floatIntensity={reduce ? 0 : 0.3} rotationIntensity={reduce ? 0 : 0.1}>
        <group position={[0, 0.7, 0]}>
          <RoundedBox args={[0.6, 1.8, 0.5]} radius={0.12}>
            <meshStandardMaterial color={ROSE} roughness={0.4} />
          </RoundedBox>
          <RoundedBox args={[1.8, 0.6, 0.5]} radius={0.12}>
            <meshStandardMaterial color={ROSE} roughness={0.4} />
          </RoundedBox>
        </group>
      </Float>
      <mesh geometry={tube}>
        <meshBasicMaterial color={MINT} toneMapped={false} />
      </mesh>
      <mesh ref={dot}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <Glow color={ROSE} />
    </group>
  );
}

/* 05 Education — stacked books + play tile (video learning) */
function TileFace({ kind, color }: { kind: "play" | "chat" | "image"; color: string }) {
  const tex = useMemo(() => makeIconTexture(kind, color), [kind, color]);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <group>
      <RoundedBox args={[0.8, 0.8, 0.26]} radius={0.14}>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.135]}>
        <planeGeometry args={[0.78, 0.78]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
export function EducationScene({ reduce }: MiniProps) {
  const books = [
    [2.2, 0.28, 1.5, BLUE],
    [2.0, 0.28, 1.4, VIOLET],
    [1.8, 0.28, 1.3, CYAN],
  ] as const;
  return (
    <group rotation={[0.1, 0.4, 0]}>
      {books.map(([w, h, d, c], i) => (
        <RoundedBox key={i} args={[w, h, d]} radius={0.05} position={[i * 0.08, -0.9 + i * 0.3, i * 0.05]} rotation={[0, i * 0.12, 0]}>
          <meshStandardMaterial color={c} roughness={0.55} />
        </RoundedBox>
      ))}
      <Float speed={reduce ? 0 : 1.3} floatIntensity={reduce ? 0 : 0.4} rotationIntensity={reduce ? 0 : 0.1}>
        <group position={[0, 0.8, 0.3]}>
          <TileFace kind="play" color={ORANGE} />
        </group>
      </Float>
      <Panel spec={{ title: "Enrollments", value: "3,120", sub: "▲ this term", kind: "bars", accent: BLUE, seed: 33 }} position={[1.9, 1.2, -0.9]} rotation={[0, -0.4, 0]} width={1.7} reduce={reduce} />
      <Glow color={ORANGE} />
    </group>
  );
}

/* 06 Real Estate — buildings + key */
export function RealEstateScene({ reduce }: MiniProps) {
  const N = 5;
  const inst = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const heights = useMemo(() => Array.from({ length: N * N }, (_, i) => 0.5 + ((i * 7919) % 13) / 13 * 1.6), []);
  useLayoutEffect(() => {
    const m = inst.current;
    if (!m) return;
    const c = new THREE.Color();
    heights.forEach((h, i) => {
      dummy.position.set(((i % N) - N / 2) * 0.5 + 0.25, h / 2 - 1.2, (Math.floor(i / N) - N / 2) * 0.5 + 0.25);
      dummy.scale.set(0.36, h, 0.36);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      c.set(i % 3 === 0 ? BLUE : i % 3 === 1 ? "#2b3a7a" : VIOLET);
      m.setColorAt(i, c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [heights, dummy]);
  return (
    <group rotation={[0.15, 0.6, 0]}>
      <Spin speed={0.15} reduce={reduce}>
        <instancedMesh ref={inst} args={[undefined, undefined, N * N]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial roughness={0.5} emissive="#4d7cfe" emissiveIntensity={0.15} />
        </instancedMesh>
        <RoundedBox args={[3.2, 0.14, 3.2]} radius={0.05} position={[0, -1.27, 0]}>
          <meshStandardMaterial color="#1a2140" roughness={0.7} />
        </RoundedBox>
      </Spin>
      <Float speed={reduce ? 0 : 1.2} floatIntensity={reduce ? 0 : 0.35} rotationIntensity={reduce ? 0 : 0.1}>
        <group position={[1.9, 1.3, 0.5]} rotation={[0, 0, -0.6]}>
          <mesh>
            <torusGeometry args={[0.28, 0.09, 10, 32]} />
            <meshStandardMaterial color="#ffd166" metalness={0.7} roughness={0.3} />
          </mesh>
          <RoundedBox args={[0.16, 0.9, 0.12]} radius={0.04} position={[0, -0.65, 0]}>
            <meshStandardMaterial color="#ffd166" metalness={0.7} roughness={0.3} />
          </RoundedBox>
          <RoundedBox args={[0.3, 0.12, 0.12]} radius={0.03} position={[0.12, -0.95, 0]}>
            <meshStandardMaterial color="#ffd166" metalness={0.7} roughness={0.3} />
          </RoundedBox>
        </group>
      </Float>
      <Glow color={BLUE} />
    </group>
  );
}

/* 07 Retail — bag + price tags + coins */
export function RetailScene({ reduce }: MiniProps) {
  const tags = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!tags.current || reduce) return;
    const t = state.clock.elapsedTime;
    tags.current.children.forEach((c, i) => {
      c.position.y = 0.9 + Math.sin(t * 1.2 + i) * 0.15;
      c.rotation.z = Math.sin(t * 0.9 + i) * 0.2;
    });
  });
  return (
    <group>
      <Float speed={reduce ? 0 : 1.2} floatIntensity={reduce ? 0 : 0.3} rotationIntensity={0}>
        <group position={[-0.6, 0, 0]} rotation={[0, 0.3, 0]}>
          <RoundedBox args={[1.5, 1.6, 0.7]} radius={0.12}>
            <meshStandardMaterial color={ORANGE} roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.9, 0]}>
            <torusGeometry args={[0.42, 0.06, 8, 40, Math.PI]} />
            <meshStandardMaterial color="#ffd7b0" />
          </mesh>
        </group>
      </Float>
      <group ref={tags}>
        {[CYAN, VIOLET, MINT].map((c, i) => (
          <group key={c} position={[1.0 + i * 0.55, 0.9, 0.4 - i * 0.25]}>
            <RoundedBox args={[0.7, 0.42, 0.06]} radius={0.08}>
              <meshStandardMaterial color={c} roughness={0.5} />
            </RoundedBox>
            <mesh position={[-0.25, 0, 0.035]}>
              <circleGeometry args={[0.06, 12]} />
              <meshBasicMaterial color="#0a0b10" />
            </mesh>
          </group>
        ))}
      </group>
      <Coins position={[1.7, -1.2, 0.3]} count={4} reduce={reduce} />
      <Glow color={ORANGE} />
    </group>
  );
}

/* 08 Media — play tiles orbiting a film strip */
export function MediaScene({ reduce }: MiniProps) {
  const orbit = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!orbit.current) return;
    const t = reduce ? 0 : state.clock.elapsedTime * 0.5;
    orbit.current.children.forEach((c, i) => {
      const a = t + (i / 3) * Math.PI * 2;
      c.position.set(Math.cos(a) * 1.9, Math.sin(a * 1.4) * 0.5 + 0.3, Math.sin(a) * 0.8);
    });
  });
  return (
    <group>
      <Spin speed={0.3} reduce={reduce}>
        <group rotation={[0.3, 0, 0]}>
          <RoundedBox args={[3.2, 0.9, 0.06]} radius={0.05}>
            <meshStandardMaterial color="#151a2e" roughness={0.6} />
          </RoundedBox>
          {[-1.1, -0.35, 0.4, 1.15].map((x, i) => (
            <mesh key={i} position={[x, 0, 0.035]}>
              <planeGeometry args={[0.6, 0.55]} />
              <meshBasicMaterial color={[CYAN, BLUE, VIOLET, ORANGE][i]} transparent opacity={0.85} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </Spin>
      <group ref={orbit}>
        {(["play", "image", "chat"] as const).map((k, i) => (
          <group key={k}>
            <Pop delay={0.2 + i * 0.15} reduce={reduce}>
              <TileFace kind={k} color={[VIOLET, CYAN, ORANGE][i]} />
            </Pop>
          </group>
        ))}
      </group>
      <Glow color={VIOLET} />
    </group>
  );
}

/* 09 Travel — dotted globe + plane */
export function TravelScene({ reduce }: MiniProps) {
  const R = 1.35;
  const positions = useMemo(() => {
    const pts = landLonLat(5);
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      const phi = THREE.MathUtils.degToRad(p.lat);
      const th = THREE.MathUtils.degToRad(p.lon);
      arr[i * 3] = R * Math.cos(phi) * Math.sin(th);
      arr[i * 3 + 1] = R * Math.sin(phi);
      arr[i * 3 + 2] = R * Math.cos(phi) * Math.cos(th);
    });
    return arr;
  }, []);
  const plane = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!plane.current || reduce) return;
    const t = state.clock.elapsedTime * 0.6;
    plane.current.position.set(Math.cos(t) * 2.1, Math.sin(t * 0.7) * 0.6 + 0.2, Math.sin(t) * 2.1);
    plane.current.rotation.y = -t + Math.PI / 2;
  });
  return (
    <group position={[0, 0.1, 0]}>
      <Spin speed={0.2} reduce={reduce}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.05} color="#bcd3ff" transparent opacity={0.9} sizeAttenuation depthWrite={false} />
        </points>
        <mesh>
          <sphereGeometry args={[R - 0.03, 40, 40]} />
          <meshPhysicalMaterial color="#0b1a48" roughness={0.6} clearcoat={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[R + 0.12, 32, 32]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.06} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      </Spin>
      <group ref={plane}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.5, 10]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.05, 0, 0]}>
          <boxGeometry args={[0.16, 0.03, 0.5]} />
          <meshStandardMaterial color={ORANGE} />
        </mesh>
      </group>
      <Glow color={CYAN} />
    </group>
  );
}

/* 10 Technology — chip + gears */
export function TechnologyScene({ reduce }: MiniProps) {
  return (
    <group>
      <Float speed={reduce ? 0 : 1} floatIntensity={reduce ? 0 : 0.3} rotationIntensity={reduce ? 0 : 0.08}>
        <group position={[-0.6, 0.2, 0]} rotation={[0.5, -0.4, 0]}>
          <RoundedBox args={[1.6, 0.18, 1.6]} radius={0.06}>
            <meshStandardMaterial color="#151a2e" roughness={0.5} metalness={0.3} />
          </RoundedBox>
          <RoundedBox args={[0.8, 0.12, 0.8]} radius={0.04} position={[0, 0.15, 0]}>
            <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.5} roughness={0.3} />
          </RoundedBox>
          {Array.from({ length: 8 }).map((_, i) => (
            <group key={i}>
              <mesh position={[-0.7 + i * 0.2, 0, 0.9]}>
                <boxGeometry args={[0.06, 0.06, 0.25]} />
                <meshStandardMaterial color="#c9d3ea" metalness={0.6} />
              </mesh>
              <mesh position={[-0.7 + i * 0.2, 0, -0.9]}>
                <boxGeometry args={[0.06, 0.06, 0.25]} />
                <meshStandardMaterial color="#c9d3ea" metalness={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      </Float>
      <Float speed={reduce ? 0 : 1.3} floatIntensity={reduce ? 0 : 0.4} rotationIntensity={0}>
        <Gear color={VIOLET} speed={0.7} reduce={reduce} position={[1.7, 1.0, 0.5]} />
        <Gear color={CYAN} radius={0.42} teeth={8} speed={-1.0} reduce={reduce} position={[2.5, 0.2, 0.6]} />
      </Float>
      <Glow color={BLUE} />
    </group>
  );
}

/* 11 Startups — rocket launch + growth chart */
export function StartupsScene({ reduce }: MiniProps) {
  const rocket = useRef<THREE.Group>(null);
  const flames = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!rocket.current || reduce) return;
    const t = state.clock.elapsedTime;
    rocket.current.position.y = 0.2 + Math.sin(t * 1.1) * 0.25;
    rocket.current.rotation.z = Math.sin(t * 0.8) * 0.06;
    if (flames.current) flames.current.scale.set(1, 0.8 + Math.abs(Math.sin(t * 14)) * 0.5, 1);
  });
  return (
    <group>
      <group ref={rocket} position={[-0.8, 0.2, 0]} rotation={[0, 0, -0.35]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.32, 0.38, 1.3, 24]} />
          <meshStandardMaterial color="#eef2ff" roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <coneGeometry args={[0.34, 0.6, 24]} />
          <meshStandardMaterial color={ROSE} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.55, 0.36]}>
          <circleGeometry args={[0.14, 16]} />
          <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.6} />
        </mesh>
        {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.4, -0.15, Math.sin(a) * 0.4]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.32, 0.5, 0.06]} />
            <meshStandardMaterial color={ROSE} />
          </mesh>
        ))}
        <mesh ref={flames} position={[0, -0.55, 0]}>
          <coneGeometry args={[0.24, 0.8, 16]} />
          <meshBasicMaterial color={ORANGE} toneMapped={false} transparent opacity={0.9} />
        </mesh>
      </group>
      <Panel spec={{ title: "Growth", value: "+180%", sub: "MoM · launch", kind: "line", accent: CYAN, seed: 41 }} position={[1.5, 0.9, -0.5]} rotation={[0, -0.4, 0]} width={1.9} reduce={reduce} />
      <Glow color={ORANGE} />
    </group>
  );
}

/* 12 Professional Services — briefcase + documents + KPIs */
export function ProfessionalScene({ reduce }: MiniProps) {
  const docs = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!docs.current || reduce) return;
    const t = state.clock.elapsedTime;
    docs.current.children.forEach((c, i) => {
      c.position.y = 0.6 + i * 0.18 + Math.sin(t * 1.1 + i) * 0.08;
    });
  });
  return (
    <group>
      <Float speed={reduce ? 0 : 1} floatIntensity={reduce ? 0 : 0.3} rotationIntensity={0}>
        <group position={[-0.9, -0.2, 0]} rotation={[0, 0.35, 0]}>
          <RoundedBox args={[1.9, 1.3, 0.6]} radius={0.12}>
            <meshStandardMaterial color="#2b3a7a" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.78, 0]}>
            <torusGeometry args={[0.4, 0.06, 8, 32, Math.PI]} />
            <meshStandardMaterial color="#c9d3ea" metalness={0.5} />
          </mesh>
          <RoundedBox args={[0.5, 0.18, 0.04]} radius={0.04} position={[0, 0.1, 0.31]}>
            <meshStandardMaterial color="#ffd166" metalness={0.6} />
          </RoundedBox>
        </group>
      </Float>
      <group ref={docs} position={[1.3, 0.6, 0.2]} rotation={[0, -0.4, 0]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 0.1, i * 0.18, -i * 0.15]}>
            <RoundedBox args={[1.1, 1.4, 0.03]} radius={0.05}>
              <meshStandardMaterial color="#f5f2ff" roughness={0.7} />
            </RoundedBox>
            {[0.45, 0.2, -0.05, -0.3].map((y, k) => (
              <mesh key={k} position={[-0.05, y, 0.02]}>
                <planeGeometry args={[k === 0 ? 0.5 : 0.8, 0.07]} />
                <meshBasicMaterial color={k === 0 ? BLUE : "#c9d3ea"} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      <Panel spec={{ title: "Pipeline", value: "48", sub: "qualified leads", kind: "kpis", accent: VIOLET, seed: 51 }} position={[0.4, -1.4, 0.5]} width={2.0} delay={0.2} reduce={reduce} />
      <Glow color={VIOLET} />
    </group>
  );
}

export const industryScenes: Record<string, ComponentType<MiniProps>> = {
  FinTech: FinTechScene,
  "E-Commerce": EcommerceScene,
  SaaS: SaaSScene,
  Healthcare: HealthcareScene,
  Education: EducationScene,
  "Real Estate": RealEstateScene,
  Retail: RetailScene,
  Media: MediaScene,
  Travel: TravelScene,
  Technology: TechnologyScene,
  Startups: StartupsScene,
  "Professional Services": ProfessionalScene,
};
