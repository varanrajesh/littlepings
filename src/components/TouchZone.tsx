import { useRef } from "react";
import { useGame } from "@/context/GameContext";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function TouchZone() {
  const { handleChar } = useGame();

  // Keep a ref to handleChar so the pointer handler never goes stale.
  // handleChar is already stable ([] deps in GameContext), but using a ref
  // here makes this component immune to any future change in that guarantee.
  const handleCharRef = useRef(handleChar);
  handleCharRef.current = handleChar;

  // Debounce rapid taps (same 80 ms window as keyboard)
  const lastTimeRef = useRef(0);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Primary mouse button or any touch/pen
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const now = Date.now();
    if (now - lastTimeRef.current < 80) return;
    lastTimeRef.current = now;

    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    // Call via ref — always the latest handleChar, zero stale-closure risk
    handleCharRef.current(char);
  }

  return (
    <div
      className="absolute inset-0 cursor-pointer select-none"
      style={{ zIndex: 5 }}
      aria-hidden="true"
      onPointerDown={onPointerDown}
    />
  );
}
