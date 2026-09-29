/**
 * useConfetti — fires a canvas-confetti burst whenever smashCount crosses
 * a milestone (10 / 50 / 100 / 500).
 *
 * Rules:
 *  - Each milestone fires exactly once per session (tracked via a Set ref).
 *  - After RESET_COUNTER the milestone Set is cleared so they can fire again.
 *  - Confetti is fully fire-and-forget; any error is swallowed silently.
 */

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export const MILESTONES = [10, 50, 100, 500, 1000, 2000] as const;
export type Milestone = (typeof MILESTONES)[number];

interface ConfettiOptions {
  smashCount: number;
  /** Pass the accent colour of the current theme for the burst. */
  accent: string;
}

/** Per-milestone burst configs */
const BURST: Record<
  Milestone,
  Parameters<typeof confetti>[0]
> = {
  10: {
    particleCount: 80,
    spread: 70,
    origin: { y: 0.55 },
    colors: undefined,
    startVelocity: 35,
    scalar: 1.1,
    gravity: 1,
  },
  50: {
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5 },
    startVelocity: 45,
    scalar: 1.2,
    gravity: 0.9,
  },
  100: {
    particleCount: 250,
    spread: 130,
    origin: { y: 0.45 },
    startVelocity: 55,
    scalar: 1.3,
    gravity: 0.85,
    ticks: 200,
  },
  500: {
    particleCount: 500,
    spread: 180,
    origin: { y: 0.4 },
    startVelocity: 70,
    scalar: 1.5,
    gravity: 0.8,
    ticks: 300,
    shapes: ["star", "circle"],
  },
  1000: {
    particleCount: 800,
    spread: 200,
    origin: { y: 0.35 },
    startVelocity: 80,
    scalar: 1.6,
    gravity: 0.75,
    ticks: 400,
    shapes: ["star", "circle"],
  },
  2000: {
    particleCount: 1200,
    spread: 260,
    origin: { y: 0.3 },
    startVelocity: 95,
    scalar: 1.8,
    gravity: 0.7,
    ticks: 500,
    shapes: ["star", "circle"],
  },
};

export function useConfetti({ smashCount, accent }: ConfettiOptions) {
  /** Set of milestones already fired in this session. */
  const firedRef = useRef<Set<number>>(new Set());

  /** Track previous count so we can detect when count goes back to 0 (reset). */
  const prevCountRef = useRef(smashCount);

  useEffect(() => {
    // Detect reset — clear the fired-milestone set so they can trigger again
    if (smashCount < prevCountRef.current) {
      firedRef.current.clear();
    }
    prevCountRef.current = smashCount;

    // Check each milestone
    for (const milestone of MILESTONES) {
      if (smashCount >= milestone && !firedRef.current.has(milestone)) {
        firedRef.current.add(milestone);
        fireBurst(milestone, accent);
      }
    }
  }, [smashCount, accent]);
}

function fireBurst(milestone: Milestone, accent: string) {
  try {
    const base = BURST[milestone];
    // Build a palette from the theme accent + complementary whites/golds
    const colors = [accent, "#ffffff", "#ffd700", "#ff6b9d", "#4cc9f0"];

    if (milestone >= 1000) {
      // Four cannons (corners) + centre for 1000 and 2000
      confetti({ ...base, colors, origin: { x: 0.05, y: 0.5 } }).catch(() => {});
      confetti({ ...base, colors, origin: { x: 0.95, y: 0.5 } }).catch(() => {});
      confetti({ ...base, colors, origin: { x: 0.3,  y: 0.1 } }).catch(() => {});
      confetti({ ...base, colors, origin: { x: 0.7,  y: 0.1 } }).catch(() => {});
    } else if (milestone >= 100) {
      // Two side cannons for 100 and 500
      confetti({ ...base, colors, origin: { x: 0.1, y: 0.6 } }).catch(() => {});
      confetti({ ...base, colors, origin: { x: 0.9, y: 0.6 } }).catch(() => {});
    }
    // Centre burst (always)
    confetti({ ...base, colors }).catch(() => {});
  } catch {
    // Silently swallow — confetti should never break the game
  }
}
