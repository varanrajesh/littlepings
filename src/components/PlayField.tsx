import { useEffect, useRef } from "react";
import { useGame } from "@/context/GameContext";
import { useKeyboard } from "@/hooks/useKeyboard";
import { resumeAudio } from "@/hooks/useSound";
import { useConfetti } from "@/hooks/useConfetti";
import { useIdleAttract } from "@/hooks/useIdleAttract";
import { useParentLock } from "@/hooks/useParentLock";
import BubbleLayer from "./BubbleLayer";
import SceneryLayer from "./SceneryLayer";
import TouchZone from "./TouchZone";
import HUD from "./HUD";
import AttractScreen from "./AttractScreen";
import LockScreen from "./LockScreen";
import SessionEndScreen from "./SessionEndScreen";

export default function PlayField() {
  const { theme, state } = useGame();

  // Ref for the root container — needed by useParentLock for corner detection
  const containerRef = useRef<HTMLDivElement>(null);

  // Wire keyboard input
  useKeyboard();

  // Confetti on milestone counts (10 / 50 / 100 / 500)
  useConfetti({ smashCount: state.smashCount, accent: theme.accent });

  // Idle attract (5 s) and session end (10 s) screens
  const { isIdle, isSessionEnded, sessionStart, resetNow } = useIdleAttract();

  // Parent lock — 5× corner taps
  const { isLocked, unlock } = useParentLock(containerRef);

  // Unlock AudioContext on the very first user gesture anywhere on the page
  useEffect(() => {
    function unlockAudio() { resumeAudio(); }
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown",     unlockAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown",     unlockAudio);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: theme.background }}
    >
      {/* Render order (z-index):
            scenery (0) → touch zone (5) → bubbles (10) → HUD (30)
            → attract (50) → lock (60) */}
      <SceneryLayer />
      <TouchZone />
      <BubbleLayer />
      <HUD />
      <AttractScreen isIdle={isIdle && !isSessionEnded} />
      <SessionEndScreen
        isSessionEnded={isSessionEnded}
        sessionStart={sessionStart}
        onPlayAgain={resetNow}
      />
      <LockScreen isLocked={isLocked} onUnlock={unlock} />
    </div>
  );
}
