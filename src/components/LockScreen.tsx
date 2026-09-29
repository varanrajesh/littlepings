/**
 * LockScreen — parent lock overlay.
 *
 * Activated by 5× taps in the top-right corner within 1.5 s each.
 * Dismissed by entering the 4-digit PIN "1234".
 *
 * Design decisions:
 *  - PIN is hardcoded to "1234" for simplicity (toddler app — parent just needs
 *    to unlock quickly; no security threat model here).
 *  - Wrong PIN shakes the input and clears it.
 *  - The overlay sits at z-index 60 (above AttractScreen at 50).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";

const PIN = "1234";
const PIN_LENGTH = 4;

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export default function LockScreen({ isLocked, onUnlock }: LockScreenProps) {
  const { theme } = useGame();
  const [entered, setEntered] = useState("");
  const [shake, setShake] = useState(false);
  const [wrongMsg, setWrongMsg] = useState(false);

  function handleDigit(digit: string) {
    const next = entered + digit;
    if (next.length === PIN_LENGTH) {
      if (next === PIN) {
        setEntered("");
        onUnlock();
      } else {
        setShake(true);
        setWrongMsg(true);
        setTimeout(() => {
          setShake(false);
          setWrongMsg(false);
          setEntered("");
        }, 800);
      }
    } else {
      setEntered(next);
    }
  }

  function handleDelete() {
    setEntered((p) => p.slice(0, -1));
  }

  // Digit pad layout
  const digits = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "⌫"],
  ];

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          key="lock"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-8"
          style={{
            zIndex: 60,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
          }}
          /* Swallow all pointer events so nothing bleeds through */
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Lock icon */}
          <motion.div
            className="text-6xl select-none"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔒
          </motion.div>

          <p
            className="text-2xl font-black text-white"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            Screen Locked
          </p>

          {/* PIN dots */}
          <motion.div
            className="flex gap-4"
            animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border-2 border-white transition-all duration-150"
                style={{
                  background: i < entered.length ? theme.accent : "transparent",
                }}
              />
            ))}
          </motion.div>

          {wrongMsg && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold"
              style={{ color: "#ff6b6b" }}
            >
              Incorrect PIN
            </motion.p>
          )}

          {/* Digit pad */}
          <div className="flex flex-col gap-3">
            {digits.map((row, ri) => (
              <div key={ri} className="flex gap-3 justify-center">
                {row.map((d, di) => {
                  if (d === "") {
                    return <div key={di} className="w-16 h-16" />;
                  }
                  const isDelete = d === "⌫";
                  return (
                    <button
                      key={di}
                      className="w-16 h-16 rounded-full text-xl font-black text-white select-none
                                 transition-all duration-100 active:scale-90"
                      style={{
                        background: isDelete
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(255,255,255,0.12)",
                        border: "2px solid rgba(255,255,255,0.25)",
                        fontFamily: "Nunito, sans-serif",
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (isDelete) handleDelete();
                        else handleDigit(d);
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <p
            className="text-xs opacity-40 text-white mt-2 select-none"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            Enter PIN to unlock
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
