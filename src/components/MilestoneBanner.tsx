/**
 * MilestoneBanner — brief animated toast that appears on milestone counts.
 *
 * Shown for 2.5 s then auto-dismisses. Sits above the HUD (z-index 40).
 * Driven by the smashCount passed from HUD; uses the same MILESTONES list
 * as useConfetti so the two are always in sync.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { MILESTONES, type Milestone } from "@/hooks/useConfetti";

const MESSAGES: Record<Milestone, string> = {
  10:   "10 keys! 🎉",
  50:   "50 smashes! 🔥",
  100:  "100! You're on fire! 🚀",
  500:  "500!!! LEGEND! 👑",
  1000: "1000!!! UNSTOPPABLE! 🌟",
  2000: "2000!!! ABSOLUTE CHAMPION! 🏆",
};

const DISPLAY_MS = 2500;

interface Props {
  smashCount: number;
}

export default function MilestoneBanner({ smashCount }: Props) {
  const { theme } = useGame();
  const [visible, setVisible] = useState<Milestone | null>(null);
  const firedRef = useRef<Set<number>>(new Set());
  const prevCountRef = useRef(smashCount);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset fired milestones on counter reset
    if (smashCount < prevCountRef.current) {
      firedRef.current.clear();
    }
    prevCountRef.current = smashCount;

    for (const m of MILESTONES) {
      if (smashCount >= m && !firedRef.current.has(m)) {
        firedRef.current.add(m);
        setVisible(m);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(null), DISPLAY_MS);
        break; // show one at a time (highest triggered wins next render)
      }
    }
  }, [smashCount]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <AnimatePresence>
      {visible !== null && (
        <motion.div
          key={visible}
          initial={{ y: -80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0,   opacity: 1, scale: 1   }}
          exit={{    y: -60, opacity: 0, scale: 0.9  }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full
                     font-black text-white text-xl sm:text-3xl shadow-2xl select-none
                     pointer-events-none whitespace-nowrap"
          style={{
            zIndex: 40,
            background: theme.accent,
            fontFamily: "Nunito, sans-serif",
            boxShadow: `0 8px 32px ${theme.accent}88`,
          }}
        >
          {MESSAGES[visible]}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
