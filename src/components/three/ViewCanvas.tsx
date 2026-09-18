"use client";

import type { ReactNode, RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerspectiveCamera, View } from "@react-three/drei";

/**
 * One WebGL context rendering into many DOM cards via drei <View>.
 *
 * drei decides "off-screen" by comparing a card's window position to the
 * canvas size, which only works when the canvas covers the whole window —
 * so this is a fixed full-viewport layer (pointer-events off, under the nav).
 * With manual view rendering R3F never clears, hence the ClearPass.
 */
function ClearPass() {
  useFrame(({ gl }) => {
    gl.setClearColor(0x000000, 0);
    gl.setScissorTest(false);
    gl.clear();
  }, 0);
  return null;
}

export function ViewCanvas({ eventSource, lite, children }: { eventSource: RefObject<HTMLElement | null>; lite: boolean; children: ReactNode }) {
  return (
    <Canvas
      eventSource={eventSource as RefObject<HTMLElement>}
      className="!pointer-events-none !fixed inset-0 z-10"
      dpr={lite ? 1 : Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 1.5)}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false }}
    >
      <ClearPass />
      {children}
    </Canvas>
  );
}

/** A card's view: its own camera, lights and studio environment around the scene. */
export function SceneView({ track, cameraZ = 7.6, y = 0.5, scale = 0.66, children }: { track: RefObject<HTMLElement | null>; cameraZ?: number; y?: number; scale?: number; children: ReactNode }) {
  return (
    <View track={track as RefObject<HTMLElement>}>
      <PerspectiveCamera makeDefault position={[0, 0.7, cameraZ]} fov={34} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 6]} intensity={1.4} />
      <pointLight position={[-5, 3, 4]} intensity={30} color="#38e1ff" />
      <pointLight position={[5, -3, 3]} intensity={30} color="#8b5cf6" />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.5} position={[0, 6, -8]} scale={[12, 6, 1]} color="#dfe8ff" />
        <Lightformer intensity={2} position={[-8, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 6, 1]} color="#38e1ff" />
        <Lightformer intensity={2} position={[8, -2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 6, 1]} color="#8b5cf6" />
      </Environment>
      <group position={[0, y, 0]} scale={scale}>
        {children}
      </group>
    </View>
  );
}
