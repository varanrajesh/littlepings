/**
 * ParentLockInfo — a discreet info tooltip in the bottom-left corner
 * that tells parents how to activate the lock screen.
 *
 * Design:
 *  - A small 🔒 icon with the label "Parent Lock" sits quietly at the bottom-left.
 *  - Tapping/hovering it reveals a tooltip explaining the 5× corner-tap gesture.
 *  - Dismisses on outside click or pressing the × button.
 *  - z-index 35 — above HUD (30) but below attract (50) and lock (60).
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";

function stopPtr(e: React.PointerEvent) {
  e.stopPropagation();
}

export default function ParentLockInfo() {
  const { theme } = useGame();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside the tooltip
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div
      ref={ref}
      className="absolute bottom-14 left-4 flex flex-col items-start"
      style={{ zIndex: 35 }}
      onPointerDown={stopPtr}
      onPointerUp={stopPtr}
    >
      {/* ── Tooltip ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="lock-tooltip"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 8,  scale: 0.95  }}
            transition={{ duration: 0.2 }}
            className="mb-2 rounded-2xl shadow-2xl p-4 max-w-[260px] text-sm leading-relaxed"
            style={{
              background: "rgba(0,0,0,0.88)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              color: "#fff",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            {/* Close button */}
            <button
              className="absolute top-2 right-3 text-white/50 hover:text-white text-lg leading-none"
              onPointerDown={(e) => { e.stopPropagation(); setOpen(false); }}
            >
              ×
            </button>

            <p className="font-black text-base mb-2" style={{ color: theme.accent }}>
              🔒 Parent Lock
            </p>

            <p className="mb-3 opacity-90">
              Lock the screen so your child can play freely without leaving the app.
            </p>

            <div
              className="rounded-xl p-3 mb-3"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <p className="font-bold mb-1" style={{ color: theme.accent }}>
                How to lock:
              </p>
              <ol className="list-decimal list-inside space-y-1 opacity-90">
                <li>Tap the <strong>top-right corner</strong> of the screen</li>
                <li>Tap it <strong>5 times quickly</strong></li>
                <li>Lock screen activates instantly</li>
              </ol>
            </div>

            <div
              className="rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <p className="font-bold mb-1" style={{ color: theme.accent }}>
                How to unlock:
              </p>
              <p className="opacity-90">
                Enter PIN <strong>1234</strong> on the keypad.
              </p>
            </div>

            <p className="mt-3 text-xs opacity-50 text-center">
              Tip: hand the tablet to your child after locking.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trigger button ────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                   transition-all duration-200 hover:scale-105 active:scale-95 select-none"
        style={{
          background: open ? theme.accent : "rgba(0,0,0,0.35)",
          color: open ? "#fff" : "rgba(255,255,255,0.75)",
          border: `1.5px solid ${open ? theme.accent : "rgba(255,255,255,0.2)"}`,
          fontFamily: "Nunito, sans-serif",
          backdropFilter: "blur(6px)",
        }}
        title="How to use Parent Lock"
      >
        🔒 <span>Parent Lock</span>
      </button>
    </div>
  );
}
