/**
 * AttractScreen — animated full-screen overlay shown after 5 s of idle.
 *
 * Dismissed instantly on any keydown/pointerdown.
 * Hovering (pointermove) does NOT dismiss it.
 *
 * Design: dense multi-layer emoji rain (theme-aware) + pulsing prompt.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import type { ThemeId } from "@/themes/themes";

// ── Per-theme emoji pools ─────────────────────────────────────────────────
const THEME_EMOJIS: Record<ThemeId, string[]> = {
  candy: [
    "🍭","🍬","🍫","🧁","🍰","🍩","🎀","🌈","🦄","💖",
    "🍪","🍡","🍮","🧇","🍦","🎉","✨","💝","🌸","🎊",
    "🍋","🍓","🍇","🍑","🍒","💫","⭐","🎈","🎠","🌺",
  ],
  ocean: [
    "🐠","🐟","🐙","🦑","🐚","🪸","🐡","🦀","🐳","🦈",
    "🐬","🦭","🐋","🌊","💧","🪼","🐊","🦞","⭐","💎",
    "🐚","🦐","🌀","🫧","🏄","🤿","⛵","🐾","🌊","✨",
  ],
  jungle: [
    "🐒","🦜","🐸","🦎","🌴","🌺","🦋","🐘","🍌","🌿",
    "🐆","🦁","🐅","🦚","🦩","🌻","🍃","🐛","🌵","🍀",
    "🦊","🐝","🌾","🐍","🦔","🌼","🍂","🌱","🐜","✨",
  ],
  space: [
    "🚀","👽","🛸","🪐","⭐","🌙","☄️","💫","🌠","🔭",
    "🌌","🛰️","👾","🌟","🪨","🌑","🌒","🌓","🌔","🌕",
    "🔮","⚡","💥","🎆","🌀","🕳️","🧿","🛡️","⚗️","✨",
  ],
  sunset: [
    "🦩","🦅","🌻","🌈","☀️","🌺","🐦","🌸","🦋","🌅",
    "🏜️","🌄","🌇","🎆","🌠","🍊","🌻","🦜","🌮","🎵",
    "🌶️","🍑","🥭","🌻","🦚","🌹","🎑","🏖️","🌞","✨",
  ],
  arctic: [
    "🐧","🦭","🐻‍❄️","❄️","⛄","🦊","🌨️","🏔️","🦌","🌊",
    "🐺","🐼","🦥","❄️","🌬️","⛷️","🏂","🛷","🧊","💙",
    "🪶","🌀","🌫️","⛰️","🌁","🐟","🦢","🕊️","💎","✨",
  ],
};

// ── Particle layout constants ─────────────────────────────────────────────
// 80 particles in 4 staggered waves of 20 — dense enough to fill any screen
const PARTICLES_PER_WAVE = 20;
const WAVES = 4;
const TOTAL_PARTICLES = PARTICLES_PER_WAVE * WAVES;

interface ParticleProps {
  index: number;
  wave: number;
  emojis: string[];
}

/** One rain-drop emoji particle */
function Particle({ index, wave, emojis }: ParticleProps) {
  const emoji = emojis[(index + wave * 7) % emojis.length];

  // Even column spread: each wave offsets by half a column-width so
  // different waves interleave and gaps are filled
  const colWidth = 100 / PARTICLES_PER_WAVE;
  const xBase    = index * colWidth;
  const xJitter  = (wave * colWidth) / 2;
  const x        = (xBase + xJitter) % 100;

  // Wave stagger: each wave starts 1.2 s after the previous
  const waveDelay = wave * 1.2;
  // Particles within a wave spread out over 2 s
  const localDelay = (index / PARTICLES_PER_WAVE) * 2.0;
  const delay = waveDelay + localDelay;

  // Duration varies so not all particles arrive at same time
  const duration = 3.2 + (index % 6) * 0.4 + wave * 0.15;

  // Three size tiers — big particles feel closer, small ones far
  const sizeTier = (index + wave) % 3;
  const size = sizeTier === 0 ? 2.6 : sizeTier === 1 ? 2.0 : 1.5;

  // Slight horizontal drift per particle
  const drift = ((index % 5) - 2) * 1.2; // −2.4 to +2.4 vw

  return (
    <motion.span
      aria-hidden="true"
      initial={{ y: "108vh", x: `${x}vw`, opacity: 0, scale: 0.3, rotate: -15 }}
      animate={{
        y: "-15vh",
        x: [`${x}vw`, `${x + drift}vw`, `${x}vw`],
        opacity: [0, 0.95, 0.95, 0],
        scale:   [0.3, 1.15, 1.0, 0.6],
        rotate:  [-15, 5, -5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        position: "absolute",
        fontSize: `${size}rem`,
        pointerEvents: "none",
        userSelect: "none",
        lineHeight: 1,
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.20))",
      }}
    >
      {emoji}
    </motion.span>
  );
}

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
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
          style={{
            zIndex: 50,
            background: `${theme.background}ee`,
            backdropFilter: "blur(4px)",
          }}
        >
          {/* 4-wave emoji rain — 80 particles staggered across full viewport */}
          {Array.from({ length: TOTAL_PARTICLES }, (_, i) => (
            <Particle
              key={i}
              index={i % PARTICLES_PER_WAVE}
              wave={Math.floor(i / PARTICLES_PER_WAVE)}
              emojis={emojis}
            />
          ))}

          {/* Centre prompt — sits above the rain */}
          <motion.div
            className="flex flex-col items-center gap-6 px-8 text-center"
            style={{ zIndex: 2, position: "relative" }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              style={{ fontSize: "5rem" }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              {emojis[0]}
            </motion.span>

            <p
              className="text-3xl sm:text-5xl font-black leading-tight"
              style={{
                color: theme.letterColor,
                fontFamily: "Nunito, sans-serif",
                textShadow: "0 4px 20px rgba(0,0,0,0.45)",
              }}
            >
              Press any key
              <br />
              to play!
            </p>

            <p
              className="text-lg font-bold opacity-80"
              style={{ color: theme.letterColor }}
            >
              LittlePings 🎵
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
