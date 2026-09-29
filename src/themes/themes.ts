export type ThemeId =
  | "candy"
  | "ocean"
  | "jungle"
  | "space"
  | "sunset"
  | "arctic";

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  /** CSS gradient for the fullscreen background */
  background: string;
  /** Decorative SVG / CSS pattern layered on top of the gradient */
  bgPattern: string;
  /** Large decorative emoji scattered in the background as scenery */
  scenery: string[];
  /** Theme-specific characters/animals shown on bubble pop (replaces generic emojis) */
  popEmojis: string[];
  /** Array of colours used for letter bubbles */
  bubbleColors: string[];
  /** Text/shadow colour for letters */
  letterColor: string;
  /** UI accent colour (counter, buttons) */
  accent: string;
  /** Base note frequency offset multiplier (1 = default) */
  pitchOffset: number;
}

const themes: Record<ThemeId, Theme> = {
  // ── Candy Land ───────────────────────────────────────────────────────────
  // Dusty rose + warm cream — soft and inviting, not neon-pink
  candy: {
    id: "candy",
    name: "Candy Land",
    emoji: "🍭",
    background:
      "linear-gradient(160deg, #f5e6ef 0%, #eddde8 35%, #e8d5e2 65%, #f0e2ec 100%)",
    bgPattern: `radial-gradient(circle at 20% 20%, #d4a0b518 0%, transparent 55%),
                radial-gradient(circle at 80% 75%, #c4849814 0%, transparent 50%),
                radial-gradient(circle at 50% 5%,  #e8c8d820 0%, transparent 45%)`,
    scenery: ["🍭", "🍬", "🍫", "🍰", "🧁", "🍩", "🎀", "🌸"],
    popEmojis: [
      "🍭","🍬","🧁","🍰","🎀","🦄","🍩","💖","🌈","🎉",
      "🍪","🍡","🍮","🍦","🎊","💝","🌸","⭐","🎠","🍫",
    ],
    // Muted berry + dusty rose — no pure saturated pinks
    bubbleColors: [
      "#c87aa0", "#b8698e", "#d4a0b8", "#c490a8",
      "#9e5070", "#b06080", "#a05878", "#cc90a8",
    ],
    letterColor: "#5c2a40",
    accent: "#a05070",
    pitchOffset: 1.0,
  },

  // ── Deep Ocean ────────────────────────────────────────────────────────────
  // Slate teal + deep navy — calm, like still water at dusk
  ocean: {
    id: "ocean",
    name: "Deep Ocean",
    emoji: "🌊",
    background:
      "linear-gradient(180deg, #d6eaf2 0%, #a8cfe0 28%, #6fa8c4 58%, #3a7a9c 100%)",
    bgPattern: `radial-gradient(ellipse at 15% 70%, #9ecfdf28 0%, transparent 55%),
                radial-gradient(ellipse at 85% 30%, #c4e4f018 0%, transparent 50%),
                radial-gradient(ellipse at 50% 90%, #4a8aac20 0%, transparent 45%)`,
    scenery: ["🐠", "🐟", "🐙", "🦑", "🐚", "🪸", "🐡", "🦀"],
    popEmojis: [
      "🐠","🐟","🐙","🦑","🐳","🐚","🦈","🪸","⭐","💧",
      "🐬","🦭","🪼","🦀","🐡","🌊","🐋","🦞","💎","🫧",
    ],
    // Slate-blue to dusty teal — no electric cyan
    bubbleColors: [
      "#5a9ab8", "#4a8aaa", "#6aaac8", "#80bcd0",
      "#3a7090", "#5090b0", "#7ab0c8", "#90c4d8",
    ],
    letterColor: "#1a3a4e",
    accent: "#3a7a9c",
    pitchOffset: 0.85,
  },

  // ── Jungle ───────────────────────────────────────────────────────────────
  // Sage + eucalyptus — earthy, like a sun-dappled canopy
  jungle: {
    id: "jungle",
    name: "Jungle",
    emoji: "🌴",
    background:
      "linear-gradient(160deg, #ddeedd 0%, #c4ddc4 30%, #a8c8a8 60%, #8ab89a 100%)",
    bgPattern: `radial-gradient(ellipse at 10% 55%, #b8d8b820 0%, transparent 55%),
                radial-gradient(ellipse at 88% 25%, #a0c8a018 0%, transparent 50%),
                radial-gradient(ellipse at 55% 88%, #d4e8d418 0%, transparent 45%)`,
    scenery: ["🌴", "🌿", "🦜", "🐒", "🌺", "🦎", "🐸", "🍃"],
    popEmojis: [
      "🐒","🦜","🐸","🦎","🐆","🌺","🦋","🐘","🌿","🍌",
      "🦁","🐅","🦚","🦩","🐛","🌵","🦔","🐝","🌼","🍀",
    ],
    // Muted moss + sage — not neon lime
    bubbleColors: [
      "#6a9e78", "#7aae88", "#5a8e68", "#8ab898",
      "#4a7e58", "#6a9878", "#90b898", "#a0c8a8",
    ],
    letterColor: "#2a4a30",
    accent: "#4e8858",
    pitchOffset: 0.9,
  },

  // ── Outer Space ───────────────────────────────────────────────────────────
  // Warm charcoal + dusty indigo — deep but not pure black, avoids eye strain
  space: {
    id: "space",
    name: "Outer Space",
    emoji: "🚀",
    background:
      "linear-gradient(145deg, #1e1e2e 0%, #252540 30%, #1a1a30 65%, #141422 100%)",
    bgPattern: `radial-gradient(circle at 22% 28%, #6a4a8820 0%, transparent 55%),
                radial-gradient(circle at 78% 72%, #3a6a8818 0%, transparent 55%),
                radial-gradient(circle at 50% 50%, #88446618 0%, transparent 60%)`,
    scenery: ["⭐", "🌙", "🪐", "☄️", "🌌", "💫", "🛸", "🌠"],
    popEmojis: [
      "🚀","👽","🛸","🪐","⭐","🌙","☄️","💫","🌠","🔭",
      "🌌","🛰️","👾","🌟","🪨","💥","🔮","⚡","🎆","⚗️",
    ],
    // Dusty violet + slate indigo — no hot magenta or electric cyan
    bubbleColors: [
      "#7a6a9e", "#8a7aae", "#6a5a8e", "#9a8abe",
      "#5a4a7e", "#705088", "#8878a8", "#a090c0",
    ],
    letterColor: "#d8d0f0",
    accent: "#8878b8",
    pitchOffset: 1.15,
  },

  // ── Sunset ────────────────────────────────────────────────────────────────
  // Terracotta + dusty amber — warm, painterly, like a real horizon
  sunset: {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    background:
      "linear-gradient(175deg, #e8d0c0 0%, #d4a880 28%, #c48858 55%, #b87848 80%, #a86838 100%)",
    bgPattern: `radial-gradient(ellipse at 50% 5%,  #d4986820 0%, transparent 55%),
                radial-gradient(ellipse at 18% 65%, #e0b07820 0%, transparent 50%),
                radial-gradient(ellipse at 82% 70%, #c8886018 0%, transparent 45%)`,
    scenery: ["🌅", "☀️", "🦅", "🌻", "🌴", "🦩", "🌙", "🌄"],
    popEmojis: [
      "🦩","🦅","🦜","🌻","🌈","☀️","🌺","🐦","🌸","🦋",
      "🌅","🏜️","🌄","🌇","🍊","🌶️","🥭","🌹","🦚","🎆",
    ],
    // Terracotta + sienna + dusty gold — no screaming orange or electric yellow
    bubbleColors: [
      "#c07848", "#b86840", "#d08858", "#c89868",
      "#a05830", "#b87040", "#d8a878", "#c89060",
    ],
    letterColor: "#3c1e0c",
    accent: "#9a5830",
    pitchOffset: 1.05,
  },

  // ── Arctic ────────────────────────────────────────────────────────────────
  // Pale steel + misty white — clean, cool, like fresh tundra snow
  arctic: {
    id: "arctic",
    name: "Arctic",
    emoji: "❄️",
    background:
      "linear-gradient(155deg, #eef4f8 0%, #ddeaf2 30%, #ccdde8 60%, #b8ceda 100%)",
    bgPattern: `radial-gradient(circle at 28% 32%, #ffffff30 0%, transparent 55%),
                radial-gradient(circle at 72% 68%, #8ab4c818 0%, transparent 50%),
                radial-gradient(circle at 50% 8%,  #d8eaf218 0%, transparent 45%)`,
    scenery: ["❄️", "🐧", "🦭", "🌨️", "🐻‍❄️", "🌊", "⛄", "🏔️"],
    popEmojis: [
      "🐧","🦭","🐻‍❄️","❄️","⛄","🦊","🐺","🌨️","🏔️","🦌",
      "🐼","🦥","🌬️","⛷️","🏂","🛷","🧊","💙","🦢","🕊️",
    ],
    // Steel blue + slate — no electric cyan or deep navy screaming contrast
    bubbleColors: [
      "#7898b0", "#6888a0", "#88a8c0", "#98b8c8",
      "#587890", "#688898", "#a0b8c8", "#b0c8d8",
    ],
    letterColor: "#2a3e4e",
    accent: "#4e7890",
    pitchOffset: 1.2,
  },
};

export const THEME_IDS = Object.keys(themes) as ThemeId[];
export default themes;
