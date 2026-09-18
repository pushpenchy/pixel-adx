"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { SceneProps } from "../SceneCanvas";
import { Shards } from "./Sphere";

/**
 * Liquid Chrome Knot — a slowly turning torus knot in mirror-chrome with a
 * gentle liquid distortion and iridescent film, wrapped by a glowing wire
 * twin and floating glass shards. Pure material porn; reads "premium tech".
 */

function KnotMesh({ reduce }: { reduce: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (reduce) return;
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y += dt * 0.18;
      ref.current.rotation.x = Math.sin(t * 0.2) * 0.35;
    }
    if (wire.current) {
      wire.current.rotation.y -= dt * 0.12;
      wire.current.rotation.z = Math.cos(t * 0.15) * 0.3;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1.35, 0.42, 320, 48, 2, 3]} />
        <MeshDistortMaterial
          color="#c9d6ff"
          metalness={0.95}
          roughness={0.08}
          distort={reduce ? 0 : 0.16}
          speed={reduce ? 0 : 1.2}
          clearcoat={1}
          clearcoatRoughness={0.05}
          iridescence={1}
          iridescenceIOR={1.6}
          iridescenceThicknessRange={[100, 700]}
          envMapIntensity={2.6}
        />
      </mesh>
      {/* glowing wire twin, slightly larger, additive */}
      <mesh ref={wire} scale={1.28}>
        <torusKnotGeometry args={[1.35, 0.42, 160, 12, 2, 3]} />
        <meshBasicMaterial color="#4d7cfe" wireframe transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 2]} intensity={10} distance={7} color="#9cc2ff" />
      {/* hot spots for bloom */}
      <mesh position={[1.9, 1.1, 1.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[-1.6, -1.3, 1.4]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#38e1ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function KnotScene({ reduce }: SceneProps) {
  return (
    <group scale={1.15}>
      <Float speed={reduce ? 0 : 1} rotationIntensity={reduce ? 0 : 0.2} floatIntensity={reduce ? 0 : 0.5}>
        <KnotMesh reduce={reduce} />
      </Float>
      <Shards reduce={reduce} count={12} inner={3.6} />
    </group>
  );
}
