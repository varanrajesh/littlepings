/**
 * scripts/generate-icons.mjs
 * Generates public/icons/icon-192.png and icon-512.png for LittlePings
 * Run: node scripts/generate-icons.mjs
 */

import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "public", "icons");
mkdirSync(ICONS_DIR, { recursive: true });

const BRAND_PURPLE  = "#863bff";
const BRAND_PURPLE2 = "#b06bff";
const PINK_START    = "#ff9de2";
const PINK_END      = "#ff006e";
const WHITE         = "#ffffff";

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext("2d");
  const r      = size * 0.218;   // corner radius (~42px at 192)
  const cx     = size / 2;
  const cy     = size / 2;

  // ── 1. Rounded-rect clip ─────────────────────────────────────────────
  roundRect(ctx, 0, 0, size, size, r);
  ctx.clip();

  // ── 2. Background gradient (pink → hot pink) ─────────────────────────
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, PINK_START);
  bg.addColorStop(1, PINK_END);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // ── 3. Soft radial highlight (top-left) ──────────────────────────────
  const hl = ctx.createRadialGradient(cx * 0.55, cy * 0.45, 0, cx * 0.55, cy * 0.45, size * 0.55);
  hl.addColorStop(0, "rgba(255,255,255,0.28)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, size, size);

  // ── 4. White card (piano stage) ──────────────────────────────────────
  const cardPad = size * 0.145;
  const cardW   = size - cardPad * 2;
  const cardH   = cardW * 0.72;
  const cardX   = cardPad;
  const cardY   = cy - cardH * 0.52;
  const cardR   = size * 0.075;

  ctx.save();
  ctx.shadowColor   = "rgba(80,0,160,0.28)";
  ctx.shadowBlur    = size * 0.10;
  ctx.shadowOffsetY = size * 0.025;
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = WHITE;
  ctx.fill();
  ctx.restore();

  // ── 5. Piano keys (inside card) ──────────────────────────────────────
  drawPianoKeys(ctx, cx, cardY + cardH / 2, cardW * 0.82, cardH * 0.72, size);

  // ── 6. "LP" word-mark below card ─────────────────────────────────────
  const textY  = cardY + cardH + size * 0.085;
  const fontSize = size * 0.132;
  ctx.font         = `bold ${fontSize}px sans-serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "alphabetic";

  // white glow
  ctx.save();
  ctx.shadowColor = "rgba(255,255,255,0.55)";
  ctx.shadowBlur  = size * 0.04;
  ctx.fillStyle   = WHITE;
  ctx.fillText("LittlePings", cx, textY);
  ctx.restore();

  return canvas.toBuffer("image/png");
}

function drawPianoKeys(ctx, cx, cy, totalW, totalH, size) {
  const KEYS   = 5;
  const KW     = totalW / KEYS;
  const KH     = totalH;
  const x0     = cx - totalW / 2;
  const y0     = cy - KH / 2;
  const BORDER = size * 0.004;
  const KR     = size * 0.025;

  // White keys
  for (let i = 0; i < KEYS; i++) {
    ctx.beginPath();
    roundRect(ctx, x0 + i * KW + BORDER, y0, KW - BORDER * 2, KH, KR);
    ctx.fillStyle   = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e0c8f0";
    ctx.lineWidth   = BORDER * 1.5;
    ctx.stroke();
  }

  // Black keys (between keys 0-1, 1-2, skip, 3-4, 4-5)
  const blackKW = KW * 0.55;
  const blackKH = KH * 0.60;
  const blackKR = KR * 0.7;

  const blackGrad = ctx.createLinearGradient(0, y0, 0, y0 + blackKH);
  blackGrad.addColorStop(0, BRAND_PURPLE);
  blackGrad.addColorStop(1, BRAND_PURPLE2);

  for (const pos of [0, 1, 3, 4]) {
    const bx = x0 + (pos + 1) * KW - blackKW / 2;
    ctx.beginPath();
    roundRect(ctx, bx, y0, blackKW, blackKH, blackKR);
    ctx.fillStyle = blackGrad;
    ctx.fill();

    // key shine
    const shine = ctx.createLinearGradient(bx, y0, bx + blackKW, y0);
    shine.addColorStop(0,   "rgba(255,255,255,0.18)");
    shine.addColorStop(0.5, "rgba(255,255,255,0.00)");
    ctx.beginPath();
    roundRect(ctx, bx, y0, blackKW, blackKH, blackKR);
    ctx.fillStyle = shine;
    ctx.fill();
  }
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

// ── Generate both sizes ───────────────────────────────────────────────────
for (const size of [192, 512]) {
  const buf  = generateIcon(size);
  const out  = join(ICONS_DIR, `icon-${size}.png`);
  writeFileSync(out, buf);
  console.log(`✅  icon-${size}.png  →  ${out}  (${(buf.length / 1024).toFixed(1)} KB)`);
}
