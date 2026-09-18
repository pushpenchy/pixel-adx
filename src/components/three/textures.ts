import * as THREE from "three";
import { logos, type Logo, type LogoKey } from "@/content/logos";
import { landLonLat } from "@/lib/worldmap";
import { reachPoints } from "@/content/site";

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

export type PanelKind = "line" | "bars" | "donut" | "kpis" | "feed" | "channels" | "map" | "funnel" | "ab";
export type PanelSpec = { title: string; value: string; sub: string; kind: PanelKind; accent?: string; seed?: number };

/** Canvas size per kind — the Panel plane keeps this aspect. */
export const PANEL_SIZE: Record<PanelKind, [number, number]> = {
  line: [1024, 640],
  bars: [1024, 640],
  donut: [1024, 640],
  kpis: [1024, 520],
  feed: [1024, 900],
  channels: [1024, 300],
  map: [1024, 640],
  funnel: [1024, 640],
  ab: [1024, 640],
};

const CHANNELS: LogoKey[] = ["meta", "googleads", "tiktok", "youtube", "snapchat", "x", "linkedin", "pinterest", "reddit", "microsoft"];

function drawLogo(ctx: CanvasRenderingContext2D, key: LogoKey, x: number, y: number, size: number) {
  const l: Logo = logos[key];
  const dark = parseInt(l.hex, 16) < 0x222222;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  l.paths.forEach((p) => {
    ctx.fillStyle = p.fill ?? (dark ? "#ffffff" : "#" + l.hex);
    ctx.fill(new Path2D(p.d));
  });
  ctx.restore();
}

/** A glassy dashboard card: title, big metric, delta, and a mini chart. */
export function makePanelTexture({ title, value, sub, kind, accent = "#38e1ff", seed = 3 }: PanelSpec, scale = 1) {
  const [W, H] = PANEL_SIZE[kind];
  const { c, ctx } = canvas(Math.round(W * scale), Math.round(H * scale));
  ctx.scale(scale, scale); // draw in 1× coordinates, rasterize at `scale`
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
  rim.addColorStop(0, "rgba(255,255,255,0.42)");
  rim.addColorStop(0.35, "rgba(150,180,255,0.12)");
  rim.addColorStop(1, "rgba(139,92,246,0.38)");
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

  if (kind === "channels") {
    // one row of platform marks with status dots
    ctx.fillStyle = accent;
    ctx.font = `600 26px ${FONT}`;
    ctx.fillText(sub, W - 52 - ctx.measureText(sub).width, 78);
    const n = CHANNELS.length;
    const slot = (W - 104) / n;
    CHANNELS.forEach((k, i) => {
      const cx = 52 + slot * i + slot / 2;
      roundRect(ctx, cx - 44, 118, 88, 88, 22);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2;
      ctx.stroke();
      drawLogo(ctx, k, cx - 24, 118 + 20, 48);
      ctx.fillStyle = i % 4 === 3 ? "#fbbf24" : "#34d399";
      ctx.beginPath();
      ctx.arc(cx + 34, 128, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "rgba(190,205,240,0.6)";
    ctx.font = `500 22px ${MONO}`;
    ctx.fillText(value, 52, 262);
    return toTexture(c);
  }

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
  } else if (kind === "feed") {
    // static frame only — the scrolling lines are a separate tileable texture (makeFeedLinesTexture)
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, chartTop - 10);
    ctx.lineTo(x1, chartTop - 10);
    ctx.stroke();
    ctx.fillStyle = "rgba(190,205,240,0.5)";
    ctx.font = `500 22px ${MONO}`;
    ctx.fillText("TIME      EVENT                          Δ", x0, chartTop + 22);
  } else if (kind === "map") {
    // equirectangular dot map with glowing audience hotspots
    const mx = x0;
    const my = chartTop - 20;
    const mw = x1 - x0;
    const mh = chartH + 30;
    const proj = (lon: number, lat: number) => [mx + ((lon + 180) / 360) * mw, my + ((84 - lat) / 142) * mh] as const;
    ctx.fillStyle = "rgba(190,205,255,0.35)";
    landLonLat(4).forEach((p) => {
      const [px, py] = proj(p.lon, p.lat);
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, Math.PI * 2);
      ctx.fill();
    });
    reachPoints.forEach((p) => {
      const [px, py] = proj(p.lon, p.lat);
      const col = p.home ? "#38e1ff" : accent;
      const g = ctx.createRadialGradient(px, py, 0, px, py, p.home ? 70 : 46);
      g.addColorStop(0, col + "99");
      g.addColorStop(1, col + "00");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, p.home ? 70 : 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (kind === "funnel") {
    const steps = [
      ["Impressions", "2.41M", 1],
      ["Clicks", "48.9K", 0.72],
      ["Leads", "6.1K", 0.48],
      ["Sales", "1,362", 0.3],
    ] as const;
    const rowH = chartH / steps.length;
    steps.forEach(([label, val, w], i) => {
      const y = chartTop + i * rowH;
      const bw = (x1 - x0) * w;
      const bx = x0 + ((x1 - x0) - bw) / 2;
      const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      g.addColorStop(0, "#38e1ff");
      g.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.85 - i * 0.12;
      roundRect(ctx, bx, y + 8, bw, rowH - 16, 14);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 26px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText(`${label}  ·  ${val}`, x0 + (x1 - x0) / 2, y + rowH / 2 + 9);
      ctx.textAlign = "left";
    });
  } else if (kind === "ab") {
    const cw = (x1 - x0 - 30) / 2;
    [
      ["Variant A", "2.9% CTR", false, ["#1f2a5a", "#3b4b9a"]],
      ["Variant B", "3.6% CTR", true, ["#0d3a4a", "#38e1ff"]],
    ].forEach(([name, ctr, win, grad], i) => {
      const x = x0 + i * (cw + 30);
      const g = ctx.createLinearGradient(x, chartTop, x + cw, chartTop + chartH);
      g.addColorStop(0, (grad as string[])[0]);
      g.addColorStop(1, (grad as string[])[1]);
      ctx.fillStyle = g;
      roundRect(ctx, x, chartTop, cw, chartH - 70, 20);
      ctx.fill();
      // abstract creative: circles + bar
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.arc(x + cw * 0.3, chartTop + 70, 34, 0, Math.PI * 2);
      ctx.fill();
      roundRect(ctx, x + 24, chartTop + chartH - 150, cw - 48, 22, 8);
      ctx.fill();
      roundRect(ctx, x + 24, chartTop + chartH - 118, cw * 0.55, 22, 8);
      ctx.fill();
      if (win) {
        ctx.strokeStyle = "#38e1ff";
        ctx.lineWidth = 4;
        roundRect(ctx, x, chartTop, cw, chartH - 70, 20);
        ctx.stroke();
        roundRect(ctx, x + cw - 150, chartTop + 16, 134, 40, 20);
        ctx.fillStyle = "#38e1ff";
        ctx.fill();
        ctx.fillStyle = "#0a0b10";
        ctx.font = `800 22px ${FONT}`;
        ctx.fillText("WINNER", x + cw - 130, chartTop + 44);
      }
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 28px ${FONT}`;
      ctx.fillText(name as string, x + 4, chartTop + chartH - 26);
      ctx.fillStyle = win ? "#38e1ff" : "rgba(200,212,245,0.7)";
      ctx.font = `600 26px ${MONO}`;
      ctx.fillText(ctr as string, x + cw - ctx.measureText(ctr as string).width - 4, chartTop + chartH - 26);
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

/** Tileable list of campaign events for the live feed (scrolled via texture offset). */
export function makeFeedLinesTexture() {
  const W = 1024;
  const rows = [
    ["12:04:11", "Conversion · Meta · Lookalike 2%", "+$48.20", "#34d399"],
    ["12:04:07", "Bid +12% · Search — Brand", "CPA ↓", "#38e1ff"],
    ["12:03:52", "Creative B winning · CTR +0.6%", "auto", "#c4b5fd"],
    ["12:03:40", "Budget → TikTok Prospecting", "+$300", "#38e1ff"],
    ["12:03:21", "Conversion · Google · Retargeting", "+$112.00", "#34d399"],
    ["12:03:05", "Frequency cap reached · Video", "paused", "#fbbf24"],
    ["12:02:48", "New audience synced · 18.2K", "CRM", "#38e1ff"],
    ["12:02:30", "Conversion · Snapchat · Story", "+$26.50", "#34d399"],
    ["12:02:12", "Landing page LCP 1.9s", "ok", "#34d399"],
    ["12:01:58", "Bid −8% · Reddit · Awareness", "ROAS", "#38e1ff"],
    ["12:01:41", "Conversion · Meta · Prospecting", "+$64.00", "#34d399"],
    ["12:01:20", "Attribution model refreshed", "sys", "#c4b5fd"],
  ];
  const LH = 46;
  const H = rows.length * LH;
  const { c, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  rows.forEach(([t, ev, d, col], i) => {
    const y = i * LH + 30;
    ctx.fillStyle = "rgba(190,205,240,0.55)";
    ctx.font = `500 22px ${MONO}`;
    ctx.fillText(t, 0, y);
    ctx.fillStyle = "rgba(235,240,255,0.9)";
    ctx.font = `500 23px ${FONT}`;
    ctx.fillText(ev, 130, y);
    ctx.fillStyle = col;
    ctx.font = `600 22px ${MONO}`;
    ctx.fillText(d, W - 120 - ctx.measureText(d).width + 100, y);
  });
  const tex = toTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** A platform logo on a rounded glass tile (for the media-buying scene). */
export function makeLogoTileTexture(key: LogoKey) {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  roundRect(ctx, 4, 4, S - 8, S - 8, 56);
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, "rgba(40,50,96,0.95)");
  g.addColorStop(1, "rgba(12,15,32,0.95)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(190,205,255,0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();
  drawLogo(ctx, key, S / 2 - 64, S / 2 - 64, 128);
  return toTexture(c);
}

/** A browser window mock: chrome bar + a landing page with hero, cards and a CTA. */
export function makeBrowserTexture() {
  const W = 1024;
  const H = 700;
  const { c, ctx } = canvas(W, H);
  roundRect(ctx, 0, 0, W, H, 36);
  ctx.fillStyle = "#0d1126";
  ctx.fill();
  // chrome
  ctx.fillStyle = "#151a34";
  roundRect(ctx, 0, 0, W, 64, 36);
  ctx.fill();
  ctx.fillRect(0, 32, W, 32);
  ["#ff6b6b", "#ffd166", "#34d399"].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(40 + i * 30, 32, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  roundRect(ctx, 150, 18, 520, 28, 14);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  // nav
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  roundRect(ctx, 60, 100, 80, 16, 8);
  ctx.fill();
  [260, 340, 420, 500].forEach((x) => {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    roundRect(ctx, x, 100, 50, 14, 7);
    ctx.fill();
  });
  roundRect(ctx, W - 200, 90, 140, 36, 18);
  const cta = ctx.createLinearGradient(W - 200, 0, W - 60, 0);
  cta.addColorStop(0, "#4d7cfe");
  cta.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = cta;
  ctx.fill();
  // hero text
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 60, 190, 480, 34, 12);
  ctx.fill();
  roundRect(ctx, 60, 240, 360, 34, 12);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  roundRect(ctx, 60, 300, 400, 12, 6);
  ctx.fill();
  roundRect(ctx, 60, 322, 300, 12, 6);
  ctx.fill();
  // hero visual
  const hv = ctx.createLinearGradient(620, 180, W - 60, 380);
  hv.addColorStop(0, "#38e1ff");
  hv.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = hv;
  roundRect(ctx, 620, 170, W - 680, 220, 28);
  ctx.fill();
  // cards
  for (let i = 0; i < 3; i++) {
    const x = 60 + i * 310;
    roundRect(ctx, x, 440, 280, 200, 24);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = ["#38e1ff", "#4d7cfe", "#8b5cf6"][i];
    roundRect(ctx, x + 24, 464, 44, 44, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    roundRect(ctx, x + 24, 536, 160, 14, 7);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    roundRect(ctx, x + 24, 566, 220, 10, 5);
    ctx.fill();
    roundRect(ctx, x + 24, 586, 180, 10, 5);
    ctx.fill();
  }
  return toTexture(c);
}

/** Wireframe UI layer for the UI/UX scene: `layer` 0 = frame, 1 = layout blocks, 2 = content. */
export function makeWireframeTexture(layer: 0 | 1 | 2) {
  const W = 640;
  const H = 440;
  const { c, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  const col = ["#9cc2ff", "#38e1ff", "#c4b5fd"][layer];
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.lineWidth = 3;
  ctx.setLineDash(layer === 0 ? [] : [10, 8]);
  if (layer === 0) {
    roundRect(ctx, 4, 4, W - 8, H - 8, 30);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.25;
    roundRect(ctx, 4, 4, W - 8, H - 8, 30);
    ctx.fillStyle = "#1b2650";
    ctx.fill();
  } else if (layer === 1) {
    roundRect(ctx, 30, 30, W - 60, 70, 14);
    ctx.stroke();
    roundRect(ctx, 30, 130, 360, 270, 14);
    ctx.stroke();
    roundRect(ctx, 420, 130, W - 450, 120, 14);
    ctx.stroke();
    roundRect(ctx, 420, 280, W - 450, 120, 14);
    ctx.stroke();
  } else {
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.9;
    roundRect(ctx, 50, 50, 120, 30, 10);
    ctx.fill();
    roundRect(ctx, 50, 160, 300, 22, 8);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    roundRect(ctx, 50, 200, 260, 14, 6);
    ctx.fill();
    roundRect(ctx, 50, 226, 200, 14, 6);
    ctx.fill();
    ctx.globalAlpha = 0.9;
    roundRect(ctx, 50, 330, 150, 44, 22);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(510, 190, 40, 0, Math.PI * 2);
    ctx.fill();
    roundRect(ctx, 440, 300, 150, 16, 8);
    ctx.fill();
  }
  return toTexture(c);
}

/** E-commerce product card: image placeholder, title, price, add-to-cart. */
export function makeProductTexture() {
  const W = 620;
  const H = 780;
  const { c, ctx } = canvas(W, H);
  roundRect(ctx, 0, 0, W, H, 40);
  ctx.fillStyle = "#12172e";
  ctx.fill();
  ctx.strokeStyle = "rgba(190,205,255,0.3)";
  ctx.lineWidth = 3;
  ctx.stroke();
  const img = ctx.createLinearGradient(30, 30, W - 30, 420);
  img.addColorStop(0, "#38e1ff");
  img.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = img;
  roundRect(ctx, 30, 30, W - 60, 400, 30);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(W / 2, 230, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#34d399";
  roundRect(ctx, 50, 50, 120, 40, 20);
  ctx.fill();
  ctx.fillStyle = "#0a0b10";
  ctx.font = `800 22px ${FONT}`;
  ctx.fillText("NEW", 84, 78);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 40px ${FONT}`;
  ctx.fillText("Product name", 40, 500);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText("★★★★★  4.9 · 2,318 reviews", 40, 545);
  ctx.fillStyle = "#38e1ff";
  ctx.font = `800 56px ${FONT}`;
  ctx.fillText("$129", 40, 630);
  roundRect(ctx, 40, 670, W - 80, 76, 38);
  const cta = ctx.createLinearGradient(40, 0, W - 40, 0);
  cta.addColorStop(0, "#4d7cfe");
  cta.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = cta;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 30px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("Add to cart", W / 2, 718);
  ctx.textAlign = "left";
  return toTexture(c);
}
