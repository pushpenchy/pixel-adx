"use client";

import { useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Frames whatever it wraps: measures the children's bounds and scales /
 * centres them so the box fills `w` × `h` of the visible area at z = 0, with
 * its centre lifted by `y` (fraction of the visible height) so captions at
 * the bottom of a card stay clear.
 *
 * Bounds ignore the scale of nodes tagged `userData.unitScale` (entrance
 * animations that grow from 0), so the framing is right from the first frame
 * and never depends on the canvas size being measured correctly elsewhere.
 * Works inside drei <View> too — camera and size come from the local store.
 */
const ONE = new THREE.Vector3(1, 1, 1);
const box = new THREE.Box3();
const sub = new THREE.Box3();
const mat = new THREE.Matrix4();
const local = new THREE.Matrix4();
const center = new THREE.Vector3();
const dims = new THREE.Vector3();

export function measureBounds(root: THREE.Object3D, out: THREE.Box3) {
  out.makeEmpty();
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry || o.userData.noFit) return;
    const geo = m.geometry;
    if (!geo.boundingBox) geo.computeBoundingBox();
    if (!geo.boundingBox) return;
    mat.identity();
    let n: THREE.Object3D | null = o;
    while (n && n !== root) {
      local.compose(n.position, n.quaternion, n.userData.unitScale ? ONE : n.scale);
      mat.premultiply(local);
      n = n.parent;
    }
    sub.copy(geo.boundingBox).applyMatrix4(mat);
    out.union(sub);
  });
  return out;
}

export function AutoFit({ w = 0.8, h = 0.6, y = 0.1, max = 1.5, children }: { w?: number; h?: number; y?: number; max?: number; children: ReactNode }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const target = useRef({ s: 0, x: 0, y: 0, z: 0 });
  const settled = useRef(false);
  const born = useRef<number | null>(null);
  const lastMeasure = useRef(-1);

  useFrame((_, dt) => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i || !size.width || !size.height) return;
    const now = performance.now();
    if (born.current === null) born.current = now;
    const age = now - born.current;

    // measure on the first frame, then every 400ms for four seconds (late meshes / textures)
    if (lastMeasure.current < 0 || (age < 4000 && now - lastMeasure.current > 400)) {
      lastMeasure.current = now;
      measureBounds(i, box);
      if (!box.isEmpty()) {
        box.getSize(dims);
        box.getCenter(center);
        const cam = camera as THREE.PerspectiveCamera;
        const fov = cam.isPerspectiveCamera ? cam.fov : 34;
        const dist = cam.position.length();
        const vh = 2 * dist * Math.tan((fov * Math.PI) / 360);
        const vw = vh * (size.width / size.height);
        // the box is centred at z = 0, so its near face sits dist - depth/2 from the
        // camera and projects larger than the z = 0 slice: shrink to fit that, not the slice
        let s = Math.min((w * vw) / Math.max(dims.x, 1e-3), (h * vh) / Math.max(dims.y, 1e-3), max);
        for (let pass = 0; pass < 2; pass++) {
          const k = Math.max(1, dist / Math.max(1e-3, dist - (dims.z * s) / 4)); // half-weighted: near-z parts are rarely the widest
          s = Math.min((w * vw) / (Math.max(dims.x, 1e-3) * k), (h * vh) / (Math.max(dims.y, 1e-3) * k), max);
        }
        target.current = { s, x: -center.x * s, y: y * vh - center.y * s, z: -center.z * s };
        if (!settled.current) {
          settled.current = true;
          o.scale.setScalar(s);
          o.position.set(target.current.x, target.current.y, target.current.z);
          return;
        }
      }
    }
    const t = target.current;
    if (!settled.current) return;
    const l = 1 - Math.exp(-8 * dt);
    o.scale.setScalar(THREE.MathUtils.lerp(o.scale.x, t.s, l));
    o.position.x = THREE.MathUtils.lerp(o.position.x, t.x, l);
    o.position.y = THREE.MathUtils.lerp(o.position.y, t.y, l);
    o.position.z = THREE.MathUtils.lerp(o.position.z, t.z, l);
  });

  return (
    <group ref={outer} scale={0.0001}>
      <group ref={inner}>{children}</group>
    </group>
  );
}
