/**
 * SessionEndScreen — shown 10 s after the last input.
 *
 * Layout (dark overlay, z-55):
 *  ┌──────────────────────────────────────────┐
 *  │        🏆  (animated bounce)             │
 *  │   "Great Session!"                       │
 *  │                                          │
 *  │  ┌────────┐  ┌────────┐  ┌────────┐     │
 *  │  │ Keys   │  │  Time  │  │ Best   │     │
 *  │  │ 🎹 42  │  │ ⏱ 1m  │  │ 🏅 100 │     │
 *  │  └────────┘  └────────┘  └────────┘     │
 *  │                                          │
 *  │  Milestones reached:                     │
 *  │  🎉10  🔥50  🚀100                        │
 *  │                                          │
 *  │       [ 🎮 Play Again ]                  │
 *  └──────────────────────────────────────────┘
 *
 * Triggering a "Play Again" resets the counter and restores the attract timer.
 * The confetti burst fires once on mount via canvas-confetti.
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useGame } from "@/context/GameContext";
import { MILESTONES } from "@/hooks/useConfetti";

interface SessionEndScreenProps {
  isSessionEnded: boolean;
  sessionStart: number;       // Date.now() captured at session/reset time
  onPlayAgain: () => void;
}

/** Pretty-print elapsed ms → "Xm Ys" or "Xs" */
function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const minutes  = Math.floor(totalSec / 60);
  const seconds  = totalSec % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Milestone badge with label */
function MilestoneBadge({ milestone }: { milestone: number }) {
  const labels: Record<number, string> = {
    10:   "🎉",
    50:   "🔥",
    100:  "🚀",
    500:  "👑",
    1000: "🌟",
    2000: "🏆",
  };
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="flex flex-col items-center gap-1"
    >
      <span style={{ fontSize: "1.6rem" }}>{labels[milestone] ?? "🎯"}</span>
      <span
        className="text-xs font-black"
        style={{
          color: "#fff",
          fontFamily: "Nunito, sans-serif",
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        {milestone.toLocaleString()}
      </span>
    </motion.div>
  );
}

/** Stat card */
function StatCard({
  emoji,
  label,
  value,
  delay,
}: {
  emoji: string;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.10)",
        border: "1.5px solid rgba(255,255,255,0.18)",
        minWidth: "90px",
      }}
    >
      <span style={{ fontSize: "1.8rem" }}>{emoji}</span>
      <span
        className="text-xl font-black text-white"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {value}
      </span>
      <span
        className="text-xs font-bold uppercase tracking-wider opacity-60 text-white"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {label}
      </span>
    </motion.div>
  );
}

export default function SessionEndScreen({
  isSessionEnded,
  sessionStart,
  onPlayAgain,
}: SessionEndScreenProps) {
  const { state, theme, resetCounter } = useGame();

  // ── Snapshot stats the instant the session-end screen appears ────────────
  // We freeze smashCount and sessionStart at the moment isSessionEnded flips
  // true so that calling resetCounter() (which zeros smashCount) or
  // onPlayAgain() (which updates sessionStart) does NOT mutate the numbers
  // displayed on THIS session's summary card.
  const snapshotRef = useRef<{ keys: number; start: number } | null>(null);

  useEffect(() => {
    if (isSessionEnded) {
      // Capture once, never overwrite while the screen is visible
      snapshotRef.current = {
        keys:  state.smashCount,
        start: sessionStart,
      };
    } else {
      // Screen dismissed — clear snapshot so next session starts fresh
      snapshotRef.current = null;
    }
  // We intentionally read state.smashCount and sessionStart only when
  // isSessionEnded flips to true — not on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionEnded]);

  // Use the frozen snapshot while visible; fallback to live values before
  // the first snapshot is taken (should never render in that window, but
  // keeps TypeScript happy).
  const keys  = snapshotRef.current?.keys  ?? state.smashCount;
  const start = snapshotRef.current?.start ?? sessionStart;

  // Confetti burst once when screen appears
  useEffect(() => {
    if (!isSessionEnded) return;
    const fire = (opts: confetti.Options) =>
      confetti({ zIndex: 56, ...opts });

    fire({ particleCount: 60, spread: 80, origin: { x: 0.3, y: 0.4 } });
    fire({ particleCount: 60, spread: 80, origin: { x: 0.7, y: 0.4 } });
    setTimeout(() =>
      fire({ particleCount: 40, spread: 120, origin: { x: 0.5, y: 0.3 } }), 300);
  }, [isSessionEnded]);

  // Computed stats — all derived from the frozen snapshot
  const elapsedMs  = Date.now() - start;
  const duration   = formatDuration(elapsedMs);
  const keysPerMin = elapsedMs > 0
    ? Math.round(keys / (elapsedMs / 60_000))
    : 0;

  // Which milestones did the child reach this session?
  const reached = MILESTONES.filter((m) => keys >= m);

  // Pick a headline based on performance
  function headline() {
    if (keys >= 2000) return "ABSOLUTE CHAMPION! 🏆";
    if (keys >= 1000) return "UNSTOPPABLE! 🌟";
    if (keys >= 500)  return "LEGENDARY SESSION! 👑";
    if (keys >= 100)  return "You're on fire! 🚀";
    if (keys >= 50)   return "Amazing effort! 🔥";
    if (keys >= 10)   return "Great session! 🎉";
    return "Nice try! Keep going! 🎹";
  }

  function handlePlayAgain() {
    // 1. Reset game counter → smashCount = 0, bubbles cleared
    resetCounter();
    // 2. Stamp new sessionStart + dismiss screens + restart idle timers.
    //    Called directly (not via setTimeout) because the pointerdown that
    //    triggered this click is already stopped at the overlay level, so
    //    the window listener will NOT fire and race with this reset.
    onPlayAgain();
  }

  return (
    <AnimatePresence>
      {isSessionEnded && (
        <motion.div
          key="session-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
          style={{
            zIndex: 55,
            background: "rgba(10,10,30,0.92)",
            backdropFilter: "blur(10px)",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            animate-loop={{ y: [0, -10, 0] }}
            style={{ fontSize: "5rem", lineHeight: 1 }}
          >
            🏆
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl sm:text-4xl font-black text-white text-center leading-tight"
            style={{ fontFamily: "Nunito, sans-serif", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            {headline()}
          </motion.h1>

          {/* Stat cards */}
          <div className="flex gap-3 flex-wrap justify-center">
            <StatCard emoji="🎹" label="Keys" value={keys.toLocaleString()} delay={0.3} />
            <StatCard emoji="⏱" label="Time" value={duration} delay={0.4} />
            <StatCard emoji="⚡" label="Keys/min" value={String(keysPerMin)} delay={0.5} />
          </div>

          {/* Milestones reached */}
          {reached.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex flex-col items-center gap-3"
            >
              <p
                className="text-sm font-bold uppercase tracking-widest opacity-60 text-white"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Milestones reached
              </p>
              <div className="flex gap-4 flex-wrap justify-center">
                {reached.map((m, i) => (
                  <motion.div
                    key={m}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.65 + i * 0.08, type: "spring", stiffness: 280 }}
                  >
                    <MilestoneBadge milestone={m} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Play Again button */}
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.75, type: "spring", stiffness: 250 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="mt-2 px-10 py-4 rounded-full text-xl font-black text-white shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
              fontFamily: "Nunito, sans-serif",
              boxShadow: `0 8px 32px ${theme.accent}66`,
              border: "2px solid rgba(255,255,255,0.25)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handlePlayAgain}
          >
            🎮 Play Again
          </motion.button>

          {/* LittlePings brand */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
            className="text-xs text-white"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            LittlePings 🎵
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
