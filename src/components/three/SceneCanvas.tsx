"use client";

import React, { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Grid, Lightformer, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { isLiteDevice } from "@/lib/quality";
import { AutoFit } from "./AutoFit";

/**
 * Shared stage for every hero concept: lights, studio environment, grid
 * floor, sparkles, particle field, bloom, cursor-parallax camera and
 * adaptive quality. Scenes only render their own objects inside <Fit>.
 */

export type SceneProps = { reduce: boolean; light: boolean };

/** Deterministic PRNG (mulberry32) — stable layouts, no impure calls in render. */
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Particles({ count = 420, spread = 5 }: { count?: number; spread?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = rng(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = spread + rand() * spread;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(ph) - 3;
    }
    return arr;
  }, [count, spread]);

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

function CameraRig({ base, look, parallax }: { base: [number, number, number]; look: [number, number, number]; parallax: number }) {
  useFrame((state, dt) => {
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, base[0] + state.pointer.x * 1.1 * parallax, 2.5, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, base[1] + state.pointer.y * 0.6 * parallax, 2.5, dt);
    cam.lookAt(look[0], look[1], look[2]);
  });
  return null;
}

/**
 * Keeps the renderer's size equal to the wrapper's layout box. R3F measures
 * its container with getBoundingClientRect, which can be stale or transformed
 * at mount; when that happens the canvas is drawn at the wrong size and the
 * scene lands off-centre. Checked by a ResizeObserver and every 20th frame.
 */
function syncSize(el: HTMLElement | null, get: () => { size: { width: number; height: number }; setSize: (w: number, h: number, top?: number, left?: number) => void }) {
  if (!el) return;
  const w = el.clientWidth;
  const h = el.clientHeight;
  if (!w || !h) return;
  const { size, setSize } = get();
  if (Math.abs(size.width - w) > 1 || Math.abs(size.height - h) > 1) {
    const r = el.getBoundingClientRect();
    setSize(w, h, r.top, r.left);
  }
}
function SizeGuard({ wrap }: { wrap: RefObject<HTMLDivElement | null> }) {
  const get = useThree((s) => s.get);
  const n = useRef(0);
  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => syncSize(el, get));
    ro.observe(el);
    return () => ro.disconnect();
  }, [get, wrap]);
  useFrame(() => {
    if (++n.current % 20 === 0) syncSize(wrap.current, get);
  });
  return null;
}

/** Scales the scene so it always fits the canvas, offset right so headline copy can overlap the left edge. */
function Fit({ children, size = 1, offset = 0.06 }: { children: React.ReactNode; size?: number; offset?: number }) {
  const { viewport, size: px } = useThree();
  // phones (narrow in pixels) get a smaller, centred composition
  const narrow = px.width < 640;
  const s = Math.min(0.72 * size, (viewport.width / 10.2) * size, (viewport.height / 10.5) * size) * (narrow ? 0.82 : 1);
  return (
    <group scale={s} position={[narrow ? 0 : viewport.width * offset, 0.35, 0]}>
      {children}
    </group>
  );
}

export type SceneCanvasProps = {
  active?: boolean;
  reduce?: boolean;
  light?: boolean;
  children: React.ReactNode;
  /** relative scale for the concept */
  size?: number;
  /** horizontal offset as a fraction of viewport width */
  offset?: number;
  camera?: [number, number, number];
  look?: [number, number, number];
  grid?: boolean;
  sparkles?: boolean;
  particles?: boolean;
  bloomIntensity?: number;
  /** strength of the cursor camera drift (1 = hero, 0 = none) */
  parallax?: number;
  /** bounds-based framing (see AutoFit); when unset the legacy Fit heuristic is used */
  fit?: { w?: number; h?: number; y?: number; max?: number };
};

export function SceneCanvas({
  active = true,
  reduce = false,
  light = false,
  children,
  size = 1,
  offset = 0.06,
  camera = [0, 2.2, 10.5],
  look = [0, -0.2, 0],
  grid = true,
  sparkles = true,
  particles = true,
  bloomIntensity = 1,
  parallax = 1,
  fit,
}: SceneCanvasProps) {
  // lite tier (phones / low-core): no bloom or sparkles, fewer particles — but
  // still native pixel ratio (capped at 2) and MSAA, so nothing looks soft
  const lite = useMemo(() => isLiteDevice(), []);
  const maxDpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
  const [dpr, setDpr] = useState(maxDpr);
  const [bloom, setBloom] = useState(!lite);
  // Start sampling only after shaders have compiled, otherwise the first-frame
  // hitch registers as a permanent "slow device" verdict.
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWarm(true), 3000);
    return () => window.clearTimeout(t);
  }, []);

  // Own visibility gate: render while the canvas is on screen (generous margin),
  // stop only after it has been off-screen for a moment. Defaults to visible so a
  // late or missing observer can never freeze a frame mid-animation.
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let off: number | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (off) window.clearTimeout(off);
          off = null;
          setVisible(true);
        } else if (!off) {
          off = window.setTimeout(() => setVisible(false), 600);
        }
      },
      { rootMargin: "250px 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (off) window.clearTimeout(off);
    };
  }, []);

  return (
    // the canvas box is forced to the wrapper: the renderer may size it, but layout wins
    <div ref={wrap} className="absolute inset-0 [&_canvas]:!h-full [&_canvas]:!w-full">
    <Canvas
      dpr={dpr}
      camera={{ position: camera, fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      frameloop={active && visible ? "always" : "never"}
      className="!absolute inset-0"
      style={{ pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      {warm && (
        <PerformanceMonitor
          onDecline={() => {
            setDpr((d) => Math.max(1, d - 0.5));
            setBloom(false);
          }}
          onIncline={() => setDpr(maxDpr)}
          flipflops={3}
          bounds={() => (lite ? [30, 50] : [40, 58])}
          ms={300}
          iterations={8}
        />
      )}

      <ambientLight intensity={light ? 0.8 : 0.35} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} />
      <pointLight position={[-6, 3, 4]} intensity={35} color="#38e1ff" />
      <pointLight position={[6, -3, 3]} intensity={35} color="#8b5cf6" />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={3} position={[0, 6, -8]} scale={[12, 6, 1]} color="#dfe8ff" />
        <Lightformer intensity={3} position={[-8, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 6, 1]} color="#38e1ff" />
        <Lightformer intensity={3} position={[8, -2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 6, 1]} color="#8b5cf6" />
        <Lightformer intensity={1.5} position={[0, -6, 4]} scale={[10, 4, 1]} color="#ffffff" />
      </Environment>

      <SizeGuard wrap={wrap} />
      {fit ? (
        <AutoFit w={fit.w} h={fit.h} y={fit.y} max={fit.max}>
          {children}
        </AutoFit>
      ) : (
        <Fit size={size} offset={offset}>
          {children}
        </Fit>
      )}
      {sparkles && !lite && (
        <group scale={fit ? 0.7 : 1}>
          <Sparkles count={70} scale={[12, 7, 7]} size={2.2} speed={reduce ? 0 : 0.35} opacity={0.4} color="#bfd4ff" />
        </group>
      )}

      {grid && (
        <Grid
          position={[0, -2.7, 0]}
          args={[60, 60]}
          cellSize={0.6}
          cellThickness={0.7}
          cellColor={light ? "#aab6d3" : "#1c2440"}
          sectionSize={3}
          sectionThickness={1.1}
          sectionColor={light ? "#6d8fff" : "#2f4aa8"}
          fadeDistance={34}
          fadeStrength={1.6}
          infiniteGrid
        />
      )}

      {particles && <Particles count={lite ? 180 : 420} />}
      {!reduce && <CameraRig base={camera} look={look} parallax={parallax} />}

      {bloom && !lite && (
        // keyed by dpr: the composer sizes its buffers at creation, and a pixel-ratio change
        // without a remount leaves it drawing into a corner of the canvas
        <EffectComposer key={dpr} multisampling={4} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={(light ? 0.5 : 1.0) * bloomIntensity} luminanceThreshold={0.82} luminanceSmoothing={0.25} radius={0.7} levels={6} />
        </EffectComposer>
      )}
    </Canvas>
    </div>
  );
}
