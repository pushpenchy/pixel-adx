"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { SceneProps } from "../SceneCanvas";
import { landLonLat } from "@/lib/worldmap";
import { reachPoints } from "@/content/site";
import { makeLabelTexture } from "../textures";
import { HudRing } from "./Sphere";

/**
 * Holographic Globe — the world as a dot-matrix hologram, slowly turning,
 * with glowing arcs and travelling packets from Bangladesh to the regions
 * Pixel ADX serves. Communicates "Built in Bangladesh. Designed for the world."
 */

const R = 2.45;

function toVec(lon: number, lat: number, r = R) {
  const phi = THREE.MathUtils.degToRad(lat);
  const theta = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(r * Math.cos(phi) * Math.sin(theta), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(theta));
}

function Land() {
  const positions = useMemo(() => {
    const pts = landLonLat(2.4);
    const arr = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => {
      const v = toVec(p.lon, p.lat);
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = v.z;
    });
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#bcd3ff" transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Arc({ from, to, i, reduce }: { from: THREE.Vector3; to: THREE.Vector3; i: number; reduce: boolean }) {
  const curve = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const lift = 1 + from.distanceTo(to) * 0.22;
    mid.normalize().multiplyScalar(R * lift);
    return new THREE.QuadraticBezierCurve3(from, mid, to);
  }, [from, to]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.012, 6, false), [curve]);
  const packet = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!packet.current || reduce) return;
    const u = (state.clock.elapsedTime * 0.18 + i * 0.23) % 1;
    packet.current.position.copy(curve.getPointAt(u));
  });
  return (
    <group>
      <mesh geometry={tube}>
        <meshBasicMaterial color="#38e1ff" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={packet} position={from}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={to}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#8b5cf6" toneMapped={false} />
      </mesh>
    </group>
  );
}

function Label({ text, at, accent }: { text: string; at: THREE.Vector3; accent?: string }) {
  const tex = useMemo(() => makeLabelTexture(text, accent), [text, accent]);
  useEffect(() => () => tex.dispose(), [tex]);
  const pos = useMemo(() => at.clone().multiplyScalar(1.16), [at]);
  return (
    <sprite position={pos} scale={[1.5, 0.375, 1]}>
      <spriteMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </sprite>
  );
}

function GlobeBody({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const home = reachPoints.find((p) => p.home)!;
  const homeVec = useMemo(() => toVec(home.lon, home.lat), [home.lon, home.lat]);
  const targets = useMemo(() => reachPoints.filter((p) => !p.home).map((p) => toVec(p.lon, p.lat)), []);
  const beacon = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    if (group.current && !reduce) group.current.rotation.y += dt * 0.07;
    if (beacon.current) {
      const s = 1 + (Math.sin(state.clock.elapsedTime * 3) + 1) * 0.35;
      beacon.current.scale.setScalar(reduce ? 1 : s);
    }
  });

  return (
    // start with Bangladesh facing the viewer
    <group ref={group} rotation={[0.25, -THREE.MathUtils.degToRad(home.lon) + 0.35, 0]}>
      <Land />
      {/* inner body + atmosphere */}
      <mesh>
        <sphereGeometry args={[R - 0.04, 64, 64]} />
        <meshPhysicalMaterial color="#0b1a48" roughness={0.6} metalness={0.1} clearcoat={0.6} transparent opacity={0.92} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R + 0.08, 64, 64]} />
        <meshBasicMaterial color="#4d7cfe" transparent opacity={0.08} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R + 0.45, 48, 48]} />
        <meshBasicMaterial color="#38e1ff" transparent opacity={0.035} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* equator + meridian guides */}
      {[0, Math.PI / 2].map((r, i) => (
        <mesh key={i} rotation={[i === 0 ? Math.PI / 2 : 0, r, 0]}>
          <torusGeometry args={[R + 0.02, 0.006, 6, 128]} />
          <meshBasicMaterial color="#9cc2ff" transparent opacity={0.18} />
        </mesh>
      ))}
      {targets.map((t, i) => (
        <Arc key={i} from={homeVec} to={t} i={i} reduce={reduce} />
      ))}
      {reachPoints.map((p) => (
        <Label key={p.label} text={p.label} at={toVec(p.lon, p.lat)} accent={p.home ? "#38e1ff" : "#8b5cf6"} />
      ))}
      {/* home beacon */}
      <mesh ref={beacon} position={homeVec}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <pointLight position={homeVec.clone().multiplyScalar(1.15)} intensity={6} distance={3} color="#38e1ff" />
    </group>
  );
}

export default function GlobeScene({ reduce }: SceneProps) {
  return (
    <group scale={1.15}>
      <Float speed={reduce ? 0 : 0.8} rotationIntensity={reduce ? 0 : 0.08} floatIntensity={reduce ? 0 : 0.4}>
        <GlobeBody reduce={reduce} />
      </Float>
      {/* orbit ring */}
      <mesh rotation={[Math.PI / 2 + 0.35, 0.2, 0]}>
        <torusGeometry args={[3.6, 0.008, 8, 200]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>
      <HudRing reduce={reduce} y={-2.6} size={6.5} />
    </group>
  );
}
