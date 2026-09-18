"use client";

import { useEffect, useMemo, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, PerspectiveCamera, View } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { AutoFit } from "./AutoFit";
import { accentColors } from "./SceneCanvas";

/**
 * One WebGL context rendering into many DOM cards via drei <View>.
 *
 * drei decides "off-screen" by comparing a card's window position to the
 * canvas size, which only works when the canvas covers the whole window —
 * so this is a fixed full-viewport layer (pointer-events off, under the nav).
 * With manual view rendering R3F never clears, hence the ClearPass.
 *
 * Quality: MSAA on, native pixel ratio up to 2 on every device (stepped down
 * by PerformanceMonitor on slow machines), and ONE shared PMREM environment
 * for every view instead of one per card.
 */
function ClearPass() {
  useFrame(({ gl }) => {
    gl.setClearColor(0x000000, 0);
    gl.setScissorTest(false);
    gl.clear();
  }, 0);
  return null;
}

/** Studio environment generated once per renderer and shared by all views. */
const envCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();
function getStudioEnv(gl: THREE.WebGLRenderer) {
  let tex = envCache.get(gl);
  if (!tex) {
    const pmrem = new THREE.PMREMGenerator(gl);
    tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    envCache.set(gl, tex);
  }
  return tex;
}
function SharedEnv({ intensity = 1 }: { intensity?: number }) {
  const gl = useThree((s) => s.gl);
  const get = useThree((s) => s.get);
  useEffect(() => {
    // read the view scene through the store getter so we mutate a runtime object, not a memoized value
    const scene = get().scene;
    scene.environment = getStudioEnv(gl);
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
    };
  }, [gl, get, intensity]);
  return null;
}

export function ViewCanvas({ eventSource, lite, children }: { eventSource: RefObject<HTMLElement | null>; lite: boolean; children: ReactNode }) {
  const maxDpr = useMemo(() => Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2), []);
  const [dpr, setDpr] = useState(maxDpr);
  return (
    <Canvas
      eventSource={eventSource as RefObject<HTMLElement>}
      className="!pointer-events-none !fixed inset-0 z-10"
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
    >
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.5))} onIncline={() => setDpr(maxDpr)} flipflops={3} bounds={() => (lite ? [30, 50] : [40, 58])} ms={300} iterations={8} />
      <ClearPass />
      {children}
    </Canvas>
  );
}

export type FitSpec = { w?: number; h?: number; y?: number; max?: number };

/** A card's view: its own camera and lights, environment shared, content framed by its bounds. */
export function SceneView({ track, cameraZ = 7.0, fit, children }: { track: RefObject<HTMLElement | null>; cameraZ?: number; fit?: FitSpec; children: ReactNode }) {
  const [tintA, tintB] = useMemo(() => accentColors(), []);
  return (
    <View track={track as RefObject<HTMLElement>}>
      <PerspectiveCamera makeDefault position={[0, 0.7, cameraZ]} fov={34} />
      <SharedEnv intensity={0.9} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 6]} intensity={1.3} />
      <pointLight position={[-5, 3, 4]} intensity={26} color={tintA} />
      <pointLight position={[5, -3, 3]} intensity={26} color={tintB} />
      <AutoFit w={fit?.w ?? 0.78} h={fit?.h ?? 0.56} y={fit?.y ?? 0.14} max={fit?.max ?? 1.2}>
        {children}
      </AutoFit>
    </View>
  );
}
