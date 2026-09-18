import * as THREE from "three";

/**
 * Canvas-drawn textures for the isometric diorama: a phone UI, app-icon
 * tiles, a notification bubble and a code slab. Flat, illustrative style.
 */

const FONT = "Inter, Manrope, system-ui, -apple-system, Segoe UI, sans-serif";
const MONO = "JetBrains Mono, ui-monospace, Menlo, monospace";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}
function tex(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Phone screen: header, chat-style cards, a chart card and a bottom nav. Tall so it can scroll. */
export function makePhoneScreenTexture() {
  const W = 640;
  const H = 1600;
  const { c, ctx } = canvas(W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#5b8cff");
  bg.addColorStop(1, "#7dd3ff");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // header
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  rr(ctx, 40, 70, 260, 26, 13);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(W - 70, 83, 22, 0, Math.PI * 2);
  ctx.fill();

  // message bubbles (alternating) + cards, repeated down the screen
  let y = 150;
  const rows = [
    ["bubble", 0.75, "#3b4fd8"],
    ["bubble", 0.55, "#3b4fd8"],
    ["card", 0.9, "#ffffff"],
    ["bubble", 0.65, "#3b4fd8"],
    ["chart", 0.9, "#ffffff"],
    ["bubble", 0.8, "#3b4fd8"],
    ["bubble", 0.5, "#3b4fd8"],
    ["card", 0.9, "#ffffff"],
    ["bubble", 0.7, "#3b4fd8"],
    ["chart", 0.9, "#ffffff"],
  ] as const;
  rows.forEach(([kind, w, col]) => {
    const bw = (W - 80) * w;
    if (kind === "bubble") {
      ctx.fillStyle = col;
      rr(ctx, 40, y, bw, 78, 24);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      rr(ctx, 64, y + 22, bw - 48, 12, 6);
      ctx.fill();
      rr(ctx, 64, y + 46, (bw - 48) * 0.6, 12, 6);
      ctx.fill();
      y += 104;
    } else if (kind === "card") {
      ctx.fillStyle = col;
      rr(ctx, 40, y, bw, 120, 24);
      ctx.fill();
      ctx.fillStyle = "#5b8cff";
      rr(ctx, 64, y + 26, 70, 70, 16);
      ctx.fill();
      ctx.fillStyle = "#c9d3ea";
      rr(ctx, 156, y + 34, bw - 200, 14, 7);
      ctx.fill();
      rr(ctx, 156, y + 62, (bw - 200) * 0.55, 14, 7);
      ctx.fill();
      y += 146;
    } else {
      ctx.fillStyle = col;
      rr(ctx, 40, y, bw, 160, 24);
      ctx.fill();
      const bars = [0.4, 0.6, 0.5, 0.85, 0.7, 1];
      bars.forEach((b, i) => {
        const bx = 70 + i * ((bw - 60) / bars.length);
        const bh = 100 * b;
        ctx.fillStyle = i === bars.length - 1 ? "#ff9f43" : "#5b8cff";
        rr(ctx, bx, y + 130 - bh, 34, bh, 8);
        ctx.fill();
      });
      y += 186;
    }
  });

  // bottom nav
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  rr(ctx, 0, H - 110, W, 110, 0);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 1 ? "#5b8cff" : "#c9d3ea";
    rr(ctx, 70 + i * 140, H - 78, 44, 44, 12);
    ctx.fill();
  }
  const t = tex(c);
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

export type IconKind = "play" | "image" | "mail" | "camera" | "chat" | "chart" | "code" | "bell";

/** App-icon tile face: a soft rounded square with a white glyph. */
export function makeIconTexture(kind: IconKind, color: string) {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, color);
  g.addColorStop(1, "#ffffff");
  ctx.fillStyle = color;
  rr(ctx, 0, 0, S, S, 96);
  ctx.fill();
  // subtle top-left sheen
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(S, 0);
  ctx.lineTo(0, S);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 34;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const cx = S / 2;
  const cy = S / 2;
  switch (kind) {
    case "play":
      ctx.beginPath();
      ctx.arc(cx, cy, 150, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy - 75);
      ctx.lineTo(cx + 85, cy);
      ctx.lineTo(cx - 45, cy + 75);
      ctx.closePath();
      ctx.fill();
      break;
    case "image":
      rr(ctx, cx - 150, cy - 120, 300, 240, 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 110, cy + 80);
      ctx.lineTo(cx - 30, cy - 10);
      ctx.lineTo(cx + 30, cy + 40);
      ctx.lineTo(cx + 70, cy);
      ctx.lineTo(cx + 120, cy + 80);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 70, cy - 55, 26, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "mail":
      rr(ctx, cx - 160, cy - 110, 320, 220, 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy - 90);
      ctx.lineTo(cx, cy + 20);
      ctx.lineTo(cx + 150, cy - 90);
      ctx.stroke();
      break;
    case "camera":
      rr(ctx, cx - 165, cy - 95, 330, 220, 36);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 15, 62, 0, Math.PI * 2);
      ctx.stroke();
      rr(ctx, cx - 60, cy - 140, 120, 50, 16);
      ctx.fill();
      break;
    case "chat":
      rr(ctx, cx - 160, cy - 120, 320, 210, 60);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 90, cy + 80);
      ctx.lineTo(cx - 110, cy + 150);
      ctx.lineTo(cx - 20, cy + 88);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color;
      [-70, 0, 70].forEach((dx) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy - 15, 20, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    case "chart":
      [
        [-120, 90],
        [-40, 150],
        [40, 110],
        [120, 210],
      ].forEach(([dx, h]) => {
        rr(ctx, cx + dx - 32, cy + 120 - h, 64, h, 14);
        ctx.fill();
      });
      break;
    case "code":
      ctx.font = `800 220px ${MONO}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("</>", cx, cy + 10);
      break;
    case "bell":
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 110, Math.PI, 0);
      ctx.lineTo(cx + 110, cy + 60);
      ctx.lineTo(cx + 150, cy + 100);
      ctx.lineTo(cx - 150, cy + 100);
      ctx.lineTo(cx - 110, cy + 60);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy + 135, 32, 0, Math.PI);
      ctx.fill();
      break;
  }
  return tex(c);
}

/** Notification bubble face with a big metric. */
export function makeBubbleTexture(title: string, value: string, color = "#ff9f43") {
  const W = 640;
  const H = 360;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = color;
  rr(ctx, 0, 0, W, H, 80);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = `600 40px ${FONT}`;
  ctx.fillText(title, 56, 110);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 130px ${FONT}`;
  ctx.fillText(value, 52, 250);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  rr(ctx, 56, 290, 220, 14, 7);
  ctx.fill();
  return tex(c);
}

/** Code slab top: a few lines of "code" in brand colours. */
export function makeCodeTexture() {
  const W = 768;
  const H = 512;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = "#151a2e";
  rr(ctx, 0, 0, W, H, 48);
  ctx.fill();
  ["#ff6b6b", "#ffd166", "#34d399"].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(52 + i * 40, 52, 12, 0, Math.PI * 2);
    ctx.fill();
  });
  const lines: [number, number, string][] = [
    [0, 0.55, "#38e1ff"],
    [1, 0.35, "#c4b5fd"],
    [1, 0.7, "#ffffff"],
    [2, 0.5, "#34d399"],
    [1, 0.4, "#c4b5fd"],
    [0, 0.25, "#38e1ff"],
    [1, 0.6, "#ffffff"],
    [0, 0.2, "#ff9f43"],
  ];
  lines.forEach(([indent, w, col], i) => {
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.9;
    rr(ctx, 52 + indent * 48, 110 + i * 46, (W - 120 - indent * 48) * w, 18, 9);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  return tex(c);
}
