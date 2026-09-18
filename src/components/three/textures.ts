import * as THREE from "three";

/**
 * Runtime-generated "asset" textures for the 3D scenes: holographic
 * dashboard panels, HUD rings and label tags. Drawn on 2D canvases at 2×
 * so they stay crisp; no font or image downloads.
 */

const FONT = "Inter, Manrope, system-ui, -apple-system, Segoe UI, sans-serif";
const MONO = "JetBrains Mono, ui-monospace, Menlo, monospace";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Deterministic pseudo-random for stable chart shapes. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export type PanelKind = "line" | "bars" | "donut" | "kpis";
export type PanelSpec = { title: string; value: string; sub: string; kind: PanelKind; accent?: string; seed?: number };

/** A glassy dashboard card: title, big metric, delta, and a mini chart. */
export function makePanelTexture({ title, value, sub, kind, accent = "#38e1ff", seed = 3 }: PanelSpec) {
  const W = 1024;
  const H = kind === "kpis" ? 520 : 640;
  const { c, ctx } = canvas(W, H);
  const rand = seeded(seed);

  // glass body
  roundRect(ctx, 6, 6, W - 12, H - 12, 44);
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "rgba(28,36,70,0.86)");
  bg.addColorStop(1, "rgba(10,12,24,0.92)");
  ctx.fillStyle = bg;
  ctx.fill();
  // rim
  const rim = ctx.createLinearGradient(0, 0, W, H);
  rim.addColorStop(0, "rgba(255,255,255,0.7)");
  rim.addColorStop(0.35, "rgba(150,180,255,0.15)");
  rim.addColorStop(1, "rgba(139,92,246,0.6)");
  ctx.lineWidth = 3;
  ctx.strokeStyle = rim;
  ctx.stroke();
  // top sheen
  const sheen = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  sheen.addColorStop(0, "rgba(255,255,255,0.10)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fill();

  // header
  ctx.fillStyle = "rgba(190,205,240,0.75)";
  ctx.font = `600 26px ${FONT}`;
  ctx.fillText(title.toUpperCase(), 52, 78);
  ctx.letterSpacing = "0px";
  // live dot
  ctx.fillStyle = "#34d399";
  ctx.beginPath();
  ctx.arc(W - 70, 68, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "#34d399";
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  // value
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 96px ${FONT}`;
  ctx.fillText(value, 48, 190);
  ctx.fillStyle = accent;
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText(sub, 52, 240);

  const chartTop = 290;
  const chartH = H - chartTop - 60;
  const x0 = 52;
  const x1 = W - 52;

  if (kind === "line") {
    const n = 18;
    const pts: [number, number][] = [];
    let v = 0.35;
    for (let i = 0; i < n; i++) {
      v = Math.min(0.95, Math.max(0.1, v + (rand() - 0.42) * 0.22));
      pts.push([x0 + ((x1 - x0) * i) / (n - 1), chartTop + chartH - v * chartH]);
    }
    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 2;
    for (let g = 0; g < 4; g++) {
      const y = chartTop + (chartH * g) / 3;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    }
    // area
    ctx.beginPath();
    ctx.moveTo(pts[0][0], chartTop + chartH);
    pts.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(pts[n - 1][0], chartTop + chartH);
    ctx.closePath();
    const area = ctx.createLinearGradient(0, chartTop, 0, chartTop + chartH);
    area.addColorStop(0, accent + "88");
    area.addColorStop(1, accent + "00");
    ctx.fillStyle = area;
    ctx.fill();
    // line
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    const lg = ctx.createLinearGradient(x0, 0, x1, 0);
    lg.addColorStop(0, "#38e1ff");
    lg.addColorStop(1, "#8b5cf6");
    ctx.strokeStyle = lg;
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.shadowColor = accent;
    ctx.shadowBlur = 24;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // end dot
    const [ex, ey] = pts[n - 1];
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ex, ey, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "bars") {
    const n = 12;
    const bw = (x1 - x0) / n - 14;
    for (let i = 0; i < n; i++) {
      const h = (0.25 + rand() * 0.7) * chartH;
      const x = x0 + i * (bw + 14);
      const y = chartTop + chartH - h;
      const g = ctx.createLinearGradient(0, y, 0, chartTop + chartH);
      g.addColorStop(0, i === n - 2 ? "#ffffff" : accent);
      g.addColorStop(1, accent + "22");
      ctx.fillStyle = g;
      roundRect(ctx, x, y, bw, h, 10);
      ctx.fill();
    }
  } else if (kind === "donut") {
    const cx = W - 220;
    const cy = chartTop + chartH / 2 + 10;
    const r = Math.min(chartH / 2, 150);
    const segs = [
      { v: 0.46, c: "#38e1ff" },
      { v: 0.3, c: "#4d7cfe" },
      { v: 0.24, c: "#8b5cf6" },
    ];
    let a = -Math.PI / 2;
    segs.forEach((s) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, a + 0.04, a + s.v * Math.PI * 2 - 0.04);
      ctx.strokeStyle = s.c;
      ctx.lineWidth = 34;
      ctx.lineCap = "round";
      ctx.stroke();
      a += s.v * Math.PI * 2;
    });
    ctx.fillStyle = "#fff";
    ctx.font = `800 52px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("46%", cx, cy + 18);
    ctx.textAlign = "left";
    // legend
    segs.forEach((s, i) => {
      const y = chartTop + 40 + i * 62;
      ctx.fillStyle = s.c;
      roundRect(ctx, x0, y - 18, 18, 18, 5);
      ctx.fill();
      ctx.fillStyle = "rgba(220,228,255,0.85)";
      ctx.font = `500 28px ${FONT}`;
      ctx.fillText(["Search", "Social", "Video"][i], x0 + 34, y);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = `500 24px ${MONO}`;
      ctx.fillText(`${Math.round(s.v * 100)}%`, x0 + 200, y);
    });
  } else {
    // kpis: three mini tiles
    const tiles = [
      ["CPA", "$9.16", "#38e1ff"],
      ["CTR", "3.8%", "#4d7cfe"],
      ["CONV", "1,362", "#8b5cf6"],
    ];
    const tw = (x1 - x0 - 40) / 3;
    tiles.forEach(([k, v, col], i) => {
      const x = x0 + i * (tw + 20);
      roundRect(ctx, x, chartTop, tw, 150, 24);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(200,212,245,0.65)";
      ctx.font = `600 22px ${MONO}`;
      ctx.fillText(k, x + 26, chartTop + 46);
      ctx.fillStyle = col;
      ctx.font = `800 54px ${FONT}`;
      ctx.fillText(v, x + 24, chartTop + 112);
    });
  }

  return toTexture(c);
}

/** Small pill label, e.g. region names on the globe. */
export function makeLabelTexture(text: string, accent = "#38e1ff") {
  const W = 512;
  const H = 128;
  const { c, ctx } = canvas(W, H);
  roundRect(ctx, 4, 4, W - 8, H - 8, 60);
  ctx.fillStyle = "rgba(10,12,24,0.85)";
  ctx.fill();
  ctx.strokeStyle = "rgba(190,205,255,0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(64, H / 2, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = accent;
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 46px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 100, H / 2 + 2);
  return toTexture(c);
}

/** Circular HUD: rings, tick marks, arc segments and readouts. */
export function makeHudTexture() {
  const S = 1024;
  const { c, ctx } = canvas(S, S);
  const cx = S / 2;
  const cy = S / 2;
  ctx.translate(cx, cy);

  // outer ring
  ctx.strokeStyle = "rgba(190,205,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 490, 0, Math.PI * 2);
  ctx.stroke();
  // ticks
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const major = i % 10 === 0;
    ctx.strokeStyle = major ? "rgba(255,255,255,0.7)" : "rgba(190,205,255,0.3)";
    ctx.lineWidth = major ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (major ? 455 : 470), Math.sin(a) * (major ? 455 : 470));
    ctx.lineTo(Math.cos(a) * 486, Math.sin(a) * 486);
    ctx.stroke();
  }
  // arc segments
  const arcs = [
    [0.05, 0.32, "#38e1ff"],
    [0.4, 0.55, "#4d7cfe"],
    [0.62, 0.9, "#8b5cf6"],
  ] as const;
  arcs.forEach(([s, e, col]) => {
    ctx.beginPath();
    ctx.arc(0, 0, 425, s * Math.PI * 2, e * Math.PI * 2);
    ctx.strokeStyle = col;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.shadowColor = col;
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
  // inner dashed ring
  ctx.setLineDash([6, 14]);
  ctx.strokeStyle = "rgba(190,205,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 380, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // readouts
  ctx.fillStyle = "rgba(220,228,255,0.8)";
  ctx.font = `500 22px ${MONO}`;
  ctx.textAlign = "center";
  ["00", "90", "180", "270"].forEach((t, i) => {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    ctx.fillText(t, Math.cos(a) * 520, Math.sin(a) * 520 + 8);
  });
  return toTexture(c);
}

/** Vertical window strip for skyline towers. */
export function makeWindowsTexture() {
  const W = 64;
  const H = 256;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#0b1230";
  ctx.fillRect(0, 0, W, H);
  const rand = seeded(11);
  for (let y = 6; y < H - 6; y += 12) {
    for (let x = 6; x < W - 6; x += 12) {
      const on = rand() > 0.45;
      ctx.fillStyle = on ? (rand() > 0.7 ? "#9cc2ff" : "#38e1ff") : "#141c3d";
      ctx.globalAlpha = on ? 0.6 + rand() * 0.4 : 1;
      ctx.fillRect(x, y, 7, 7);
    }
  }
  ctx.globalAlpha = 1;
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Repeating scan-line strip with one bright sweep band (offset-animated). */
export function makeScanTexture() {
  const W = 4;
  const H = 512;
  const { c, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  // fine scanlines
  for (let y = 0; y < H; y += 4) {
    ctx.fillStyle = "rgba(160,190,255,0.10)";
    ctx.fillRect(0, y, W, 1);
  }
  // sweep band
  const g = ctx.createLinearGradient(0, 40, 0, 120);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.5, "rgba(190,215,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 40, W, 80);
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 1);
  return t;
}
