/**
 * scripts/generate-og.mjs
 * Generates public/og-image.png (1200×630) for LittlePings
 * Run: node scripts/generate-og.mjs
 */

import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT  = join(ROOT, "public", "og-image.png");

const W = 1200;
const H = 630;

// ── Brand colours ─────────────────────────────────────────────────────────
const BRAND_PURPLE  = "#863bff";
const BRAND_PURPLE2 = "#b06bff";
const TEXT_DARK     = "#3a1f60";
const TEXT_MID      = "#6040a0";
const TEXT_MUTED    = "#a090c8";
const WHITE         = "#ffffff";

// ── Theme data — distinct, vivid dot colours matching actual app themes ───
const THEMES = [
  { id: "candy",  dot: "#d05888", name: "Candy",  bg: "#fde8f2" },
  { id: "ocean",  dot: "#1a90c8", name: "Ocean",  bg: "#d8f0fc" },
  { id: "jungle", dot: "#2ea84e", name: "Jungle", bg: "#d8f4e0" },
  { id: "space",  dot: "#9880f0", name: "Space",  bg: "#1e1a3a" },
  { id: "sunset", dot: "#e06820", name: "Sunset", bg: "#fdecd8" },
  { id: "arctic", dot: "#08b8c0", name: "Arctic", bg: "#d0f4f8" },
];

// ── Canvas ────────────────────────────────────────────────────────────────
const canvas = createCanvas(W, H);
const ctx    = canvas.getContext("2d");

// ── 1. Background — warm white centre, soft lavender edges ───────────────
const bgGrad = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, W * 0.72);
bgGrad.addColorStop(0,   "#ffffff");
bgGrad.addColorStop(0.5, "#f6eeff");
bgGrad.addColorStop(1,   "#e4d2ff");
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, W, H);

// ── 2. Soft radial blobs ──────────────────────────────────────────────────
radialBlob(W * 0.90, H * 0.04, 340, BRAND_PURPLE,  0.11);
radialBlob(W * 0.08, H * 0.96, 300, BRAND_PURPLE2, 0.09);
radialBlob(W * 0.48, H * 0.50, 240, BRAND_PURPLE,  0.03);

// ── 3. Decorative floating circles ───────────────────────────────────────
const decos = [
  { x: 68,   y: 68,  r: 48, a: 0.13 },
  { x: 162,  y: 538, r: 62, a: 0.09 },
  { x: 1132, y: 82,  r: 58, a: 0.11 },
  { x: 1070, y: 540, r: 42, a: 0.09 },
  { x: 600,  y: 22,  r: 30, a: 0.07 },
  { x: 965,  y: 308, r: 24, a: 0.07 },
  { x: 258,  y: 188, r: 16, a: 0.07 },
  { x: 410,  y: 596, r: 14, a: 0.06 },
  { x: 830,  y: 52,  r: 20, a: 0.06 },
  { x: 95,   y: 315, r: 12, a: 0.06 },
  { x: 1105, y: 345, r: 15, a: 0.06 },
];
for (const b of decos) {
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = BRAND_PURPLE + toHex(b.a);
  ctx.fill();
}

// ── 4. Logo pill ──────────────────────────────────────────────────────────
const PILL_CX = W / 2;
const PILL_CY = 150;
const PILL_S  = 130;
const PILL_R  = 36;

ctx.save();
ctx.shadowColor   = "rgba(134,59,255,0.30)";
ctx.shadowBlur    = 40;
ctx.shadowOffsetY = 12;
ctx.beginPath();
roundRect(ctx, PILL_CX - PILL_S / 2, PILL_CY - PILL_S / 2, PILL_S, PILL_S, PILL_R);
ctx.fillStyle = WHITE;
ctx.fill();
ctx.restore();

drawPianoIcon(ctx, PILL_CX, PILL_CY, 76);

// ── 5. Title ──────────────────────────────────────────────────────────────
ctx.textAlign    = "center";
ctx.textBaseline = "alphabetic";
ctx.font         = "bold 94px sans-serif";

const titleGrad = ctx.createLinearGradient(PILL_CX - 290, 0, PILL_CX + 290, 0);
titleGrad.addColorStop(0, "#6828e0");
titleGrad.addColorStop(0.5, BRAND_PURPLE);
titleGrad.addColorStop(1, "#b068ff");
ctx.fillStyle = titleGrad;
ctx.fillText("LittlePings", PILL_CX, 322);

// ── 6. Tagline ────────────────────────────────────────────────────────────
ctx.font      = "32px sans-serif";
ctx.fillStyle = TEXT_MID;
ctx.fillText("Fun keyboard toy for toddlers & babies", PILL_CX, 370);

// ── 7. Divider ────────────────────────────────────────────────────────────
const divGrad = ctx.createLinearGradient(PILL_CX - 220, 0, PILL_CX + 220, 0);
divGrad.addColorStop(0,   "rgba(134,59,255,0)");
divGrad.addColorStop(0.3, "rgba(134,59,255,0.30)");
divGrad.addColorStop(0.7, "rgba(134,59,255,0.30)");
divGrad.addColorStop(1,   "rgba(134,59,255,0)");
ctx.beginPath();
ctx.moveTo(PILL_CX - 220, 398);
ctx.lineTo(PILL_CX + 220, 398);
ctx.strokeStyle = divGrad;
ctx.lineWidth   = 1.5;
ctx.stroke();

// ── 8. Theme pills — 6 across, full bleed with padding ───────────────────
const PAD    = 44;
const PGAP   = 10;
const PH     = 66;
const PR     = 33;
const PROW_Y = 474;
const PW     = (W - PAD * 2 - PGAP * (THEMES.length - 1)) / THEMES.length;
let px       = PAD;

for (const theme of THEMES) {
  // pill shadow
  ctx.save();
  ctx.shadowColor   = theme.dot + "44";
  ctx.shadowBlur    = 14;
  ctx.shadowOffsetY = 4;

  // pill background — theme-tinted (Space uses deep dark bg)
  ctx.beginPath();
  roundRect(ctx, px, PROW_Y - PH / 2, PW, PH, PR);
  ctx.fillStyle = theme.bg;
  ctx.fill();
  ctx.restore();

  // pill border — theme colour, stronger for Space
  ctx.beginPath();
  roundRect(ctx, px, PROW_Y - PH / 2, PW, PH, PR);
  ctx.strokeStyle = theme.dot + "dd";
  ctx.lineWidth   = 2.2;
  ctx.stroke();

  // measure text to compute true centred dot+label block
  ctx.font = "bold 22px sans-serif";
  const nameW   = ctx.measureText(theme.name).width;
  const DOT_R   = 9;
  const DOT_GAP = 10;
  const blockW  = (DOT_R * 2) + DOT_GAP + nameW;
  const blockX  = px + (PW - blockW) / 2;   // left edge of block, centred in pill
  const DOT_X   = blockX + DOT_R;
  const nameX   = blockX + DOT_R * 2 + DOT_GAP;

  // dot — white ring + coloured fill + shadow
  ctx.save();
  ctx.shadowColor   = theme.dot + "55";
  ctx.shadowBlur    = 6;
  ctx.beginPath();
  ctx.arc(DOT_X, PROW_Y, DOT_R + 2.5, 0, Math.PI * 2);
  ctx.fillStyle = WHITE;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(DOT_X, PROW_Y, DOT_R, 0, Math.PI * 2);
  ctx.fillStyle = theme.dot;
  ctx.fill();
  ctx.restore();

  // name text — white for Space (dark bg), dark for all others
  ctx.font         = "bold 22px sans-serif";
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle    = theme.id === "space" ? "#ffffff" : TEXT_DARK;
  ctx.fillText(theme.name, nameX, PROW_Y);

  px += PW + PGAP;
}

// ── 9. Badge row — 4 across, perfectly centred icons+text ─────────────────
const BGAP   = 14;
const BH     = 48;
const BY     = 572;
const BW     = (W - PAD * 2 - BGAP * 3) / 4;

const BADGES = [
  { label: "Free",          fn: drawCheckIcon  },
  { label: "Safe",          fn: drawShieldIcon },
  { label: "No Ads",        fn: drawBanIcon    },
  { label: "Works Offline", fn: drawWifiIcon   },
];

let bx = PAD;
for (const badge of BADGES) {
  // pill
  ctx.beginPath();
  roundRect(ctx, bx, BY - BH / 2, BW, BH, BH / 2);
  ctx.fillStyle = "rgba(134,59,255,0.08)";
  ctx.fill();
  ctx.beginPath();
  roundRect(ctx, bx, BY - BH / 2, BW, BH, BH / 2);
  ctx.strokeStyle = "rgba(134,59,255,0.35)";
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // true-centre icon + text block inside badge pill
  ctx.font = "bold 17px sans-serif";
  const bTw    = ctx.measureText(badge.label).width;
  const bIconR = 10;
  const bGap   = 9;
  const bBlkW  = bIconR * 2 + bGap + bTw;
  const bBlkX  = bx + (BW - bBlkW) / 2;
  const bIconX = bBlkX + bIconR;

  badge.fn(ctx, bIconX, BY, bIconR, BRAND_PURPLE);

  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle    = TEXT_DARK;
  ctx.fillText(badge.label, bIconX + bIconR + bGap, BY);

  bx += BW + BGAP;
}

// ── 10. Domain watermark ──────────────────────────────────────────────────
ctx.font         = "19px sans-serif";
ctx.textAlign    = "right";
ctx.textBaseline = "alphabetic";
ctx.fillStyle    = TEXT_MUTED;
ctx.fillText("littlepings.com", W - 42, H - 22);

// ── Write ─────────────────────────────────────────────────────────────────
mkdirSync(join(ROOT, "public"), { recursive: true });
const buf = canvas.toBuffer("image/png");
writeFileSync(OUT, buf);
console.log(`✅  og-image.png  →  ${OUT}`);
console.log(`    ${W}×${H}px  |  ${(buf.length / 1024).toFixed(1)} KB`);

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function toHex(alpha) {
  return Math.round(alpha * 255).toString(16).padStart(2, "0");
}

function radialBlob(cx, cy, r, color, alpha) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color + toHex(alpha));
  g.addColorStop(1, color + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPianoIcon(ctx, cx, cy, s) {
  const keys = 5;
  const kw   = s / keys;
  const kh   = s * 0.82;
  const bw   = kw * 0.55;
  const bh   = kh * 0.58;
  const x0   = cx - s / 2;
  const y0   = cy - kh / 2;

  for (let i = 0; i < keys; i++) {
    ctx.beginPath();
    roundRect(ctx, x0 + i * kw + 1.5, y0, kw - 3, kh, 4);
    ctx.fillStyle   = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#c8a8e8";
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }
  for (const p of [0, 1, 3, 4]) {
    const bx = x0 + (p + 1) * kw - bw / 2;
    ctx.beginPath();
    roundRect(ctx, bx, y0, bw, bh, 3);
    ctx.fillStyle = BRAND_PURPLE;
    ctx.fill();
  }
}

function drawCheckIcon(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.2;
  ctx.lineJoin    = "round";
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy + 0.5);
  ctx.lineTo(cx - r * 0.08, cy + r * 0.42);
  ctx.lineTo(cx + r * 0.48, cy - r * 0.38);
  ctx.stroke();
  ctx.restore();
}

function drawShieldIcon(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.2;
  ctx.lineJoin    = "round";
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.88, cy - r * 0.34);
  ctx.lineTo(cx + r * 0.88, cy + r * 0.22);
  ctx.quadraticCurveTo(cx + r * 0.88, cy + r, cx, cy + r);
  ctx.quadraticCurveTo(cx - r * 0.88, cy + r, cx - r * 0.88, cy + r * 0.22);
  ctx.lineTo(cx - r * 0.88, cy - r * 0.34);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawBanIcon(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.2;
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.68, cy - r * 0.68);
  ctx.lineTo(cx + r * 0.68, cy + r * 0.68);
  ctx.stroke();
  ctx.restore();
}

function drawWifiIcon(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.2;
  ctx.lineCap     = "round";
  const BASE_Y = cy + r * 0.35;
  for (const scale of [0.30, 0.58, 0.90]) {
    const ar = r * scale;
    ctx.beginPath();
    ctx.arc(cx, BASE_Y, ar, Math.PI + 0.38, -0.38);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, BASE_Y, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}
