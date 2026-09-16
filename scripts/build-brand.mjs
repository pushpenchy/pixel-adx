// Generates the Pixel ADX logo asset set into public/brand/ and the app icon.
// Run: node scripts/build-brand.mjs
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";

const out = resolve("public/brand");
mkdirSync(out, { recursive: true });

const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#38e1ff"/><stop offset="0.5" stop-color="#4d7cfe"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>`;

const mark = (corner, center, traceOp = 0.35) => `
<g stroke="${corner}" stroke-opacity="${traceOp}" stroke-width="1.5" stroke-linecap="round"><line x1="10" y1="10" x2="54" y2="54"/><line x1="54" y1="10" x2="10" y2="54"/></g>
<rect x="2" y="2" width="16" height="16" rx="4.5" fill="${corner}"/>
<rect x="46" y="2" width="16" height="16" rx="4.5" fill="${corner}"/>
<rect x="2" y="46" width="16" height="16" rx="4.5" fill="${corner}"/>
<rect x="46" y="46" width="16" height="16" rx="4.5" fill="${corner}"/>
<rect x="24" y="24" width="16" height="16" rx="4.5" fill="${center}"/>`;

const w = (name, svg) => writeFileSync(resolve(out, name), svg.trim() + "\n");

w("pixel-adx-mark.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${grad}${mark("url(#g)", "#ffffff")}</svg>`);
w("pixel-adx-mark-white.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${mark("#ffffff", "#ffffff", 0.3)}</svg>`);
w("pixel-adx-mark-black.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${mark("#0a0b10", "#0a0b10", 0.3)}</svg>`);

const lockup = (pixel, adx, corner, center, name) =>
  w(
    name,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" width="300" height="80">
${grad}
<g transform="translate(8 8)">${mark(corner, center)}</g>
<text x="84" y="53" font-family="Manrope, Inter, 'Segoe UI', Helvetica, Arial, sans-serif" font-weight="800" font-size="38" letter-spacing="-1.4" fill="${pixel}">Pixel<tspan fill="${adx}"> ADX</tspan></text>
</svg>`
  );
lockup("#ffffff", "url(#g)", "url(#g)", "#ffffff", "pixel-adx-logo-dark.svg"); // on dark bg
lockup("#0a0b10", "url(#g)", "url(#g)", "#0a0b10", "pixel-adx-logo-light.svg"); // on light bg
lockup("#ffffff", "#ffffff", "#ffffff", "#ffffff", "pixel-adx-logo-mono-white.svg");
lockup("#0a0b10", "#0a0b10", "#0a0b10", "#0a0b10", "pixel-adx-logo-mono-black.svg");

w(
  "pixel-adx-icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">${grad}
<rect width="96" height="96" rx="22" fill="#0a0b10"/>
<rect x="0.5" y="0.5" width="95" height="95" rx="21.5" fill="none" stroke="#ffffff" stroke-opacity="0.08"/>
<g transform="translate(16 16)">${mark("url(#g)", "#ffffff")}</g></svg>`
);

copyFileSync(resolve(out, "pixel-adx-icon.svg"), resolve("src/app/icon.svg"));
console.log("brand assets written to public/brand and src/app/icon.svg");
