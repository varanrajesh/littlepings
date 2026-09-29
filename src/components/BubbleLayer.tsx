import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useCallback } from "react";
import { useGame } from "@/context/GameContext";

function BubbleItem({
  bubble,
  onDone,
}: {
  bubble: import("@/context/GameContext").Bubble;
  onDone: (id: string) => void;
}) {
  // Keep onDone in a ref so the timeout always calls the latest version
  // even if the parent re-renders and passes a new reference.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const firedRef = useRef(false);

  useEffect(() => {
    // Each bubble lives for 2200 ms then removes itself from state.
    const t = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onDoneRef.current(bubble.id);
      }
    }, 2200);
    return () => {
      clearTimeout(t);
      // Mark as fired on unmount too — prevents double-dispatch if
      // AnimatePresence unmounts the element before the timer fires.
      firedRef.current = true;
    };
  }, [bubble.id]); // bubble.id never changes — runs once per bubble

  return (
    <motion.div
      layoutId={undefined}
      initial={{ scale: 0, opacity: 0, rotate: bubble.rotation - 15, y: 20 }}
      animate={{ scale: 1, opacity: 1, rotate: bubble.rotation, y: 0 }}
      exit={{ scale: 0.2, opacity: 0, y: -60, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      style={{
        position: "absolute",
        left: `${bubble.x}vw`,
        top: `${bubble.y}vh`,
        pointerEvents: "none",
        willChange: "transform, opacity",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.1em",
        lineHeight: 1,
        fontFamily: "'Nunito', 'Fredoka One', 'Comic Sans MS', sans-serif",
        fontWeight: 900,
      }}
    >
      {/* ── Emoji — rendered FIRST (top), bigger than the letter ── */}
      {bubble.emoji && (
        <motion.span
          // Cracker-burst: pops out from centre, wobbles, then settles
          initial={{ scale: 0, rotate: -30, y: 10 }}
          animate={{
            scale:  [0, 1.45, 0.95, 1.15, 1.0],
            rotate: [-30, 12, -8, 4, 0],
            y:      [10, -4, 0],
          }}
          transition={{
            duration: 0.55,
            ease: "easeOut",
            times: [0, 0.35, 0.55, 0.75, 1],
          }}
          style={{
            // 1.35× the letter size — emoji is the hero, letter is the label
            fontSize: `${bubble.fontSize * 1.35}rem`,
            display: "block",
            filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.28))",
            lineHeight: 1,
          }}
        >
          {bubble.emoji}
        </motion.span>
      )}

      {/* ── Letter — smaller, sits below the emoji ── */}
      <span
        style={{
          fontSize: `${bubble.fontSize}rem`,
          color: bubble.color,
          textShadow: `0 2px 8px ${bubble.color}44, 0 1px 0 rgba(0,0,0,0.10)`,
          display: "block",
          lineHeight: 1,
        }}
      >
        {bubble.char}
      </span>
    </motion.div>
  );
}

export default function BubbleLayer() {
  const { state, removeBubble } = useGame();

  // Stable wrapper — removeBubble is already stable ([] deps) but wrapping
  // in useCallback makes the guarantee explicit and protects BubbleItem
  // from unnecessary re-renders.
  const onDone = useCallback(
    (id: string) => removeBubble(id),
    [removeBubble]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence mode="popLayout">
        {state.bubbles.map((bubble) => (
          <BubbleItem key={bubble.id} bubble={bubble} onDone={onDone} />
        ))}
      </AnimatePresence>
    </div>
  );
}
