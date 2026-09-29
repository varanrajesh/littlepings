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
        gap: "0.15em",
        lineHeight: 1,
        fontFamily: "'Nunito', 'Fredoka One', 'Comic Sans MS', sans-serif",
        fontWeight: 900,
      }}
    >
      <span
        style={{
          fontSize: `${bubble.fontSize}rem`,
          color: bubble.color,
          textShadow: `
            0 4px 24px ${bubble.color}99,
            0 0 60px ${bubble.color}55,
            0 2px 0 rgba(0,0,0,0.15)
          `,
          display: "block",
        }}
      >
        {bubble.char}
      </span>

      {bubble.emoji && (
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 18, delay: 0.05 }}
          style={{
            /* 0.82× gives the emoji nearly the same visual weight as the
               letter above it — emojis render smaller than text glyphs at
               the same font-size, so we compensate here. */
            fontSize: `${bubble.fontSize * 0.82}rem`,
            display: "block",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.30))",
          }}
        >
          {bubble.emoji}
        </motion.span>
      )}
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
