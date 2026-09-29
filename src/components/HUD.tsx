import { useGame } from "@/context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { THEME_IDS } from "@/themes/themes";
import themes from "@/themes/themes";
import { useFullscreen } from "@/hooks/useFullscreen";
import MilestoneBanner from "./MilestoneBanner";
import ParentLockInfo from "./ParentLockInfo";

/**
 * Stops pointer events from bubbling through HUD buttons into TouchZone.
 * Used on every interactive HUD wrapper so TouchZone never sees their events.
 */
function stopPtr(e: React.PointerEvent) {
  e.stopPropagation();
}

export default function HUD() {
  const { state, theme, toggleSound, setTheme, resetCounter } = useGame();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  // Display the count directly — no animation queue, no Framer Motion on
  // the number itself. This prevents queue overflow at high smash counts.
  const [displayCount, setDisplayCount] = useState(state.smashCount);
  const countRef = useRef(state.smashCount);

  // Sync display count every frame via ref — bypasses React batching issues
  useEffect(() => {
    countRef.current = state.smashCount;
    setDisplayCount(state.smashCount);
  }, [state.smashCount]);

  return (
    <>
      {/* ── Smash counter — top left ──────────────────────────────────── */}
      <div
        className="absolute top-4 left-5 flex flex-col items-start gap-1"
        style={{ zIndex: 30 }}
        onPointerDown={stopPtr}
        onPointerUp={stopPtr}
      >
        {/* Plain span — no Framer Motion, no animation queue.
            Counter ALWAYS updates immediately regardless of smash speed. */}
        <span
          className="text-5xl font-black leading-none select-none"
          style={{
            color: theme.accent,
            fontFamily: "Nunito, sans-serif",
            textShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {displayCount}
        </span>

        <span
          className="text-xs font-bold uppercase tracking-widest opacity-70 select-none"
          style={{ color: theme.accent }}
        >
          keys smashed
        </span>

        {/* Reset button — plain conditional render, no AnimatePresence.
            AnimatePresence exit animations were blocking onClick at high counts. */}
        {state.smashCount > 0 && (
          <button
            className="mt-1 text-xs font-bold underline cursor-pointer opacity-70 hover:opacity-100"
            style={{ color: theme.accent }}
            onPointerDown={stopPtr}
            onPointerUp={stopPtr}
            onClick={() => {
              resetCounter();
            }}
          >
            reset
          </button>
        )}
      </div>

      {/* ── Top-right controls ────────────────────────────────────────── */}
      <div
        className="absolute top-4 right-5 flex items-center gap-3"
        style={{ zIndex: 30 }}
        onPointerDown={stopPtr}
        onPointerUp={stopPtr}
      >
        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="select-none hover:scale-125 transition-transform flex items-center justify-center"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          style={{ color: theme.accent }}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"/>
              <path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"/>
              <path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V3h4"/>
              <path d="M21 7V3h-4"/>
              <path d="M3 17v4h4"/>
              <path d="M21 17v4h-4"/>
            </svg>
          )}
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="text-3xl select-none hover:scale-125 transition-transform"
          title={state.soundEnabled ? "Mute" : "Unmute"}
        >
          {state.soundEnabled ? "🔊" : "🔇"}
        </button>
      </div>

      {/* ── Theme switcher — bottom centre ────────────────────────────── */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 flex-wrap justify-center px-2"
        style={{ zIndex: 30 }}
        onPointerDown={stopPtr}
        onPointerUp={stopPtr}
      >
        {THEME_IDS.map((id) => {
          const t = themes[id];
          const active = id === state.themeId;
          return (
            <button
              key={id}
              onClick={() => setTheme(id)}
              title={t.name}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold
                transition-all duration-200 shadow-md
                ${active
                  ? "scale-110 ring-4 ring-white/60"
                  : "opacity-70 hover:opacity-100 hover:scale-105"}
              `}
              style={{
                background: active ? theme.accent : "#ffffff55",
                color: active ? "#fff" : theme.accent,
                fontFamily: "Nunito, sans-serif",
              }}
            >
              <span>{t.emoji}</span>
              <span className="hidden sm:inline">{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Parent lock info — bottom left ───────────────────────────── */}
      <ParentLockInfo />

      {/* ── Milestone banner — top centre ────────────────────────────── */}
      <MilestoneBanner smashCount={state.smashCount} />

      {/* ── Idle hint — centre ────────────────────────────────────────── */}
      <AnimatePresence>
        {state.smashCount === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <span className="text-6xl mb-4">🎹</span>
            <p
              className="text-2xl sm:text-4xl font-black text-center px-6 leading-tight"
              style={{
                color: theme.letterColor,
                fontFamily: "Nunito, sans-serif",
                textShadow: "0 3px 12px rgba(0,0,0,0.2)",
              }}
            >
              Press any key or tap the screen!
            </p>
            <p
              className="mt-3 text-base sm:text-lg opacity-80 font-bold"
              style={{ color: theme.letterColor }}
            >
              LittlePings 🎵
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
