"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeFeedLinesTexture, makePanelTexture, makeScanTexture, PANEL_SIZE, type PanelSpec } from "./textures";

/** 1×1 transparent stand-in so the material compiles with a map from the start (no shader rebuild when the real one lands). */
let blank: THREE.Texture | null = null;
function blankTexture() {
  if (!blank) {
    blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
    blank.needsUpdate = true;
  }
  return blank;
}

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/**
 * Floating holographic dashboard card: the drawn texture on a plane, a glass
 * backplate for depth, glowing edges, a scan-line sweep, a gentle float/tilt,
 * and a choreographed "boot" entrance (unfolds + flickers on after `delay`).
 */
export function Panel({
  spec,
  position,
  rotation = [0, 0, 0],
  width = 2.4,
  phase = 0,
  delay = 0,
  reduce,
}: {
  spec: PanelSpec;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  phase?: number;
  /** seconds after mount before this panel boots */
  delay?: number;
  reduce: boolean;
}) {
  // 1.5× on hi-dpi screens (phones included); 1× elsewhere
  const texScale = typeof window !== "undefined" && window.devicePixelRatio >= 1.5 ? 1.5 : 1;
  // The dashboard is drawn on a 2D canvas — spread that work across the boot
  // sequence instead of drawing every panel in the same frame at mount.
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let made: THREE.Texture | null = null;
    const t = window.setTimeout(() => {
      made = makePanelTexture(spec, texScale);
      setTex(made);
    }, Math.max(0, delay * 1000 - 350));
    return () => {
      window.clearTimeout(t);
      made?.dispose();
    };
  }, [spec, texScale, delay]);
  const scan = useMemo(() => makeScanTexture(), []);
  useEffect(() => () => scan.dispose(), [scan]);
  const [pw, ph] = PANEL_SIZE[spec.kind];
  const h = width * (ph / pw);
  const feed = spec.kind === "feed";
  const feedTex = useMemo(() => (feed ? makeFeedLinesTexture() : null), [feed]);
  useEffect(() => () => feedTex?.dispose(), [feedTex]);
  const feedMat = useRef<THREE.MeshBasicMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const face = useRef<THREE.MeshBasicMaterial>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const back = useRef<THREE.MeshPhysicalMaterial>(null);
  const scanMat = useRef<THREE.MeshBasicMaterial>(null);
  const start = useRef<number | null>(null);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, h)), [width, h]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const now = state.clock.elapsedTime;
    if (start.current === null) start.current = now;
    const t = now - start.current - delay;

    // ── boot: unfold from a thin bright line, then flicker on (waits for the texture)
    const p = !tex ? 0 : reduce ? 1 : easeOut(t / 0.7);
    const flicker = reduce || t > 0.9 ? 1 : t < 0 ? 0 : 0.55 + 0.45 * Math.abs(Math.sin(t * 40)) * (t / 0.9);
    g.scale.set(Math.max(0.001, p), Math.max(0.001, 0.08 + p * 0.92), 1);
    g.visible = !!tex && (t > 0 || reduce);
    if (face.current) face.current.opacity = flicker * p;
    if (back.current) back.current.opacity = 0.55 * p;
    if (edgeMat.current) edgeMat.current.opacity = 0.18 + 0.22 * flicker;

    // ── scan sweep
    const sm = scanMat.current;
    if (sm) {
      if (sm.map) sm.map.offset.y = (-(now * 0.22 + phase * 0.1)) % 1;
      sm.opacity = 0.2 * p;
    }

    // ── live feed: scroll the tileable event list upward
    const fm = feedMat.current;
    if (fm && fm.map) {
      fm.map.repeat.set(1, 0.56);
      fm.map.offset.y = (now * 0.06) % 1;
      fm.opacity = 0.95 * p;
    }

    // ── idle float + cursor tilt
    if (reduce) return;
    const tt = now + phase;
    g.position.y = position[1] + Math.sin(tt * 0.9) * 0.08;
    g.rotation.y = rotation[1] + Math.sin(tt * 0.5) * 0.04 + state.pointer.x * 0.06;
    g.rotation.x = rotation[0] + state.pointer.y * -0.04;
  });

  return (
    <group ref={group} position={position} rotation={rotation} userData={{ unitScale: true }}>
      {/* glass backplate */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[width + 0.06, h + 0.06]} />
        <meshPhysicalMaterial ref={back} color="#1b2650" transparent opacity={0.55} roughness={0.2} clearcoat={1} envMapIntensity={1.2} />
      </mesh>
      {/* drawn dashboard */}
      <mesh>
        <planeGeometry args={[width, h]} />
        <meshBasicMaterial ref={face} map={tex ?? blankTexture()} transparent toneMapped={false} />
      </mesh>
      {feed && feedTex && (
        <mesh position={[0, -h * 0.13, 0.005]}>
          <planeGeometry args={[width * 0.9, h * 0.56]} />
          <meshBasicMaterial ref={feedMat} map={feedTex} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      )}
      {/* holographic scan sweep */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, h]} />
        <meshBasicMaterial ref={scanMat} map={scan} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* glowing edge */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edgeMat} color="#9cc2ff" transparent opacity={0.4} blending={THREE.AdditiveBlending} toneMapped={false} />
      </lineSegments>
    </group>
  );
}
