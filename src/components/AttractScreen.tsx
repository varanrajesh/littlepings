/**
 * AttractScreen — animated full-screen overlay shown after 5 s of idle.
 *
 * Phase 1 (5 – 10 s): dense emoji rain + floating crackers + prompt.
 * Dismissed instantly on any keydown/pointerdown.
 * Hovering (pointermove) does NOT dismiss it.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import type { ThemeId } from "@/themes/themes";

// ── Per-theme emoji pools (30 each) ──────────────────────────────────────
const THEME_EMOJIS: Record<ThemeId, string[]> = {
  candy: [
    "🍭","🍬","🍫","🧁","🍰","🍩","🎀","🌈","🦄","💖",
    "🍪","🍡","🍮","🍦","🎉","✨","💝","🌸","🎊","🎈",
    "🍋","🍓","🍇","🍑","🍒","💫","⭐","🎠","🌺","🎆",
  ],
  ocean: [
    "🐠","🐟","🐙","🦑","🐚","🪸","🐡","🦀","🐳","🦈",
    "🐬","🦭","🐋","🌊","💧","🪼","🦞","⭐","💎","🫧",
    "🦐","🌀","🏄","🤿","⛵","🐊","🌊","🐾","💙","✨",
  ],
  jungle: [
    "🐒","🦜","🐸","🦎","🌴","🌺","🦋","🐘","🍌","🌿",
    "🐆","🦁","🐅","🦚","🦩","🌻","🍃","🐛","🌵","🍀",
    "🦊","🐝","🌼","🐍","🦔","🌱","🐜","🌾","🍂","✨",
  ],
  space: [
    "🚀","👽","🛸","🪐","⭐","🌙","☄️","💫","🌠","🔭",
    "🌌","🛰️","👾","🌟","🪨","💥","🔮","⚡","🎆","⚗️",
    "🌑","🌒","🌓","🌔","🌕","🕳️","🧿","🛡️","🌀","✨",
  ],
  sunset: [
    "🦩","🦅","🌻","🌈","☀️","🌺","🐦","🌸","🦋","🌅",
    "🏜️","🌄","🌇","🎆","🌠","🍊","🦜","🌶️","🍑","🥭",
    "🦚","🌹","🎑","🏖️","🌞","🎵","🌮","🍋","🌼","✨",
  ],
  arctic: [
    "🐧","🦭","🐻‍❄️","❄️","⛄","🦊","🌨️","🏔️","🦌","🌊",
    "🐺","🐼","🌬️","⛷️","🏂","🛷","🧊","💙","🦢","🕊️",
    "🪶","🌫️","⛰️","🌁","🐟","💎","🌀","🦥","💫","✨",
  ],
};

// ── Layout constants ──────────────────────────────────────────────────────
// 120 rain particles in 6 staggered waves of 20
const PARTICLES_PER_WAVE = 20;
const RAIN_WAVES         = 6;
const RAIN_TOTAL         = PARTICLES_PER_WAVE * RAIN_WAVES;

// 16 cracker-burst particles orbiting the centre prompt
const CRACKER_COUNT = 16;

// ── Rain particle ─────────────────────────────────────────────────────────
function RainParticle({
  index,
  wave,
  emojis,
}: {
  index: number;
  wave: number;
  emojis: string[];
}) {
  const emoji = emojis[(index + wave * 7) % emojis.length];

  const colWidth  = 100 / PARTICLES_PER_WAVE;
  const xBase     = index * colWidth;
  const xJitter   = (wave * colWidth) / 2;
  const x         = (xBase + xJitter) % 100;

  const waveDelay  = wave * 0.9;
  const localDelay = (index / PARTICLES_PER_WAVE) * 1.6;
  const delay      = waveDelay + localDelay;

  const duration   = 2.8 + (index % 7) * 0.3 + wave * 0.1;

  // 4 size tiers for depth
  const sizeTier   = (index + wave) % 4;
  const size       = [3.2, 2.6, 2.0, 1.5][sizeTier];

  // Wobble: swing left-right as it falls
  const drift      = ((index % 5) - 2) * 1.8;

  // Spin direction alternates by index
  const spinDir    = index % 2 === 0 ? 360 : -360;

  return (
    <motion.span
      aria-hidden="true"
      initial={{ y: "110vh", x: `${x}vw`, opacity: 0, scale: 0.2, rotate: 0 }}
      animate={{
        y:       "-18vh",
        x:       [`${x}vw`, `${x + drift}vw`, `${x - drift * 0.4}vw`, `${x}vw`],
        opacity: [0, 1, 1, 1, 0],
        scale:   [0.2, 1.2, 1.0, 0.8],
        rotate:  [0, spinDir * 0.4, spinDir * 0.7, spinDir],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        position:     "absolute",
        fontSize:     `${size}rem`,
        pointerEvents:"none",
        userSelect:   "none",
        lineHeight:   1,
        filter:       "drop-shadow(0 3px 8px rgba(0,0,0,0.22))",
      }}
    >
      {emoji}
    </motion.span>
  );
}

// ── Cracker-burst particle ────────────────────────────────────────────────
// These orbit the centre card and pop outward like party crackers.
function CrackerParticle({
  index,
  total,
  emojis,
}: {
  index: number;
  total: number;
  emojis: string[];
}) {
  const angle    = (index / total) * 360;
  const radius   = 36 + (index % 3) * 10; // 36 – 56 vmin
  const emoji    = emojis[(index * 3 + 5) % emojis.length];
  const size     = 2.0 + (index % 4) * 0.35;
  const delay    = (index / total) * 1.4;
  const duration = 3.5 + (index % 5) * 0.4;

  // Start at centre, burst outward then loop
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  return (
    <motion.span
      aria-hidden="true"
      initial={{ x: "0vmin", y: "0vmin", opacity: 0, scale: 0 }}
      animate={{
        x:       [`0vmin`, `${x * 0.6}vmin`, `${x}vmin`, `${x * 1.1}vmin`, `0vmin`],
        y:       [`0vmin`, `${y * 0.6}vmin`, `${y}vmin`, `${y * 1.1}vmin`, `0vmin`],
        opacity: [0, 1, 1, 0.8, 0],
        scale:   [0, 1.3, 1.0, 0.7, 0],
        rotate:  [0, 180, 360, 540, 720],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        position:     "absolute",
        fontSize:     `${size}rem`,
        pointerEvents:"none",
        userSelect:   "none",
        lineHeight:   1,
        filter:       "drop-shadow(0 2px 8px rgba(0,0,0,0.25))",
      }}
    >
      {emoji}
    </motion.span>
  );
}

// ── Main component ────────────────────────────────────────────────────────
interface AttractScreenProps {
  isIdle: boolean;
}

export default function AttractScreen({ isIdle }: AttractScreenProps) {
  const { theme } = useGame();
  const emojis = THEME_EMOJIS[theme.id as ThemeId] ?? THEME_EMOJIS.candy;

  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          key="attract"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
          style={{
            zIndex:         50,
            background:     `${theme.background}f0`,
            backdropFilter: "blur(5px)",
          }}
        >
          {/* ── Layer 1: dense 6-wave emoji rain — 120 particles ── */}
          {Array.from({ length: RAIN_TOTAL }, (_, i) => (
            <RainParticle
              key={`rain-${i}`}
              index={i % PARTICLES_PER_WAVE}
              wave={Math.floor(i / PARTICLES_PER_WAVE)}
              emojis={emojis}
            />
          ))}

          {/* ── Layer 2: centre prompt card ── */}
          <motion.div
            className="flex flex-col items-center gap-5 px-10 py-8 text-center"
            style={{
              zIndex:        2,
              position:      "relative",
              borderRadius:  "2rem",
              background:    "rgba(255,255,255,0.18)",
              backdropFilter:"blur(8px)",
              border:        "2px solid rgba(255,255,255,0.35)",
              boxShadow:     "0 8px 40px rgba(0,0,0,0.18)",
            }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* 16 cracker particles orbiting the card */}
            {Array.from({ length: CRACKER_COUNT }, (_, i) => (
              <CrackerParticle
                key={`cracker-${i}`}
                index={i}
                total={CRACKER_COUNT}
                emojis={emojis}
              />
            ))}

            {/* Hero emoji — bounces */}
            <motion.span
              style={{ fontSize: "5.5rem", lineHeight: 1 }}
              animate={{
                scale:  [1, 1.18, 0.95, 1.10, 1],
                rotate: [0, 12, -8, 6, 0],
              }}
              transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
            >
              {emojis[0]}
            </motion.span>

            <p
              className="text-4xl sm:text-5xl font-black leading-tight"
              style={{
                color:      theme.letterColor,
                fontFamily: "Nunito, sans-serif",
                textShadow: "0 3px 16px rgba(0,0,0,0.35)",
              }}
            >
              Press any key
              <br />
              to play! 🎵
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
