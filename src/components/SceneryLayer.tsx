import { motion } from "framer-motion";
import { useMemo } from "react";
import { useGame } from "@/context/GameContext";

interface SceneryItem {
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  duration: number;
  delay: number;
}

/** Generates a stable, deterministic set of scattered scenery items per theme */
function buildScenery(emojis: string[], seed: string): SceneryItem[] {
  const items: SceneryItem[] = [];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const h = (i * 2654435761 + seed.charCodeAt(i % seed.length)) >>> 0;
    const r1 = (h & 0xff) / 255;
    const r2 = ((h >> 8) & 0xff) / 255;
    const r3 = ((h >> 16) & 0xff) / 255;
    const r4 = ((h >> 24) & 0xff) / 255;
    items.push({
      emoji: emojis[i % emojis.length],
      x: 2 + r1 * 94,
      y: 2 + r2 * 88,
      size: 2.5 + r3 * 3.5,
      rotation: -30 + r4 * 60,
      opacity: 0.12 + r1 * 0.18,
      duration: 3 + r2 * 4,
      delay: r3 * 3,
    });
  }
  return items;
}

export default function SceneryLayer() {
  const { theme } = useGame();

  const items = useMemo(
    () => buildScenery(theme.scenery, theme.id),
    [theme.scenery, theme.id]
  );

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Radial glow / CSS pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: theme.bgPattern,
          mixBlendMode: "overlay",
          opacity: 0.6,
        }}
      />

      {/* Floating theme-specific scenery emoji */}
      {items.map((item, i) => (
        <motion.span
          key={`${theme.id}-${i}`}
          style={{
            position: "absolute",
            left: `${item.x}vw`,
            top: `${item.y}vh`,
            fontSize: `${item.size}rem`,
            opacity: item.opacity,
            rotate: `${item.rotation}deg`,
            userSelect: "none",
            willChange: "transform",
            lineHeight: 1,
          }}
          animate={{
            y: ["0%", "-8%", "0%", "6%", "0%"],
            rotate: [
              `${item.rotation}deg`,
              `${item.rotation + 6}deg`,
              `${item.rotation}deg`,
              `${item.rotation - 6}deg`,
              `${item.rotation}deg`,
            ],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </div>
  );
}
