import { useEffect, useRef, useContext } from "react";
import { GameContext } from "@/context/GameContext";

const BLOCKED_KEYS = new Set([
  "'", "/", "\\", "`", '"', "Dead", "Unidentified",
]);

const SPECIAL_KEYS: Record<string, string> = {
  " ":          "★",
  "Enter":      "★",
  "ArrowUp":    "↑",
  "ArrowDown":  "↓",
  "ArrowLeft":  "←",
  "ArrowRight": "→",
};

const VALID = /^[a-zA-Z0-9]$/;

export function useKeyboard() {
  const ctx = useContext(GameContext);

  // Store handleChar in a ref — the window listener never needs to be
  // torn down and re-added when the component re-renders.
  const handleCharRef = useRef(ctx?.handleChar);
  handleCharRef.current = ctx?.handleChar;

  // Module-level debounce (survives re-renders)
  const lastKeyRef  = useRef("");
  const lastTimeRef = useRef(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Ignore modifier combos
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Block browser-shortcut keys unconditionally
      if (BLOCKED_KEYS.has(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Map key to display character
      const char =
        SPECIAL_KEYS[e.key] ??
        (VALID.test(e.key) ? e.key.toUpperCase() : null);

      if (!char) return;

      // Prevent page scroll on space/arrows
      if (e.key === " " || e.key.startsWith("Arrow")) e.preventDefault();

      // Debounce key-hold (80 ms per unique char)
      const now = Date.now();
      if (char === lastKeyRef.current && now - lastTimeRef.current < 80) return;
      lastKeyRef.current  = char;
      lastTimeRef.current = now;

      // Always read the latest handleChar via the ref — no stale closure
      handleCharRef.current?.(char);
    }

    // Register ONCE — never re-register on re-renders
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []); // ← empty deps: register once, read fresh values via refs
}
