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
  candy: {
    id: "candy",
    name: "Candy Land",
    emoji: "🍭",
    background:
      "linear-gradient(160deg, #ff9de2 0%, #ffc3e1 30%, #ffe4f5 60%, #ffd6f0 100%)",
    bgPattern: `radial-gradient(circle at 20% 20%, #ff6b9d22 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, #b5179e22 0%, transparent 50%),
                radial-gradient(circle at 50% 10%, #ffc8dd33 0%, transparent 40%)`,
    scenery: ["🍭", "🍬", "🍫", "🍰", "🧁", "🍩", "🎀", "🌸"],
    popEmojis: [
      "🍭","🍬","🧁","🍰","🎀","🦄","🍩","💖","🌈","🎉",
      "🍪","🍡","🍮","🍦","🎊","💝","🌸","⭐","🎠","🍫",
    ],
    bubbleColors: [
      "#ff6b9d", "#ff8fab", "#ffc8dd", "#ffb3c6",
      "#f72585", "#b5179e", "#ff006e", "#ff4d6d",
    ],
    letterColor: "#7b0a4a",
    accent: "#ff006e",
    pitchOffset: 1.0,
  },

  ocean: {
    id: "ocean",
    name: "Deep Ocean",
    emoji: "🌊",
    background:
      "linear-gradient(180deg, #48cae4 0%, #0096c7 25%, #0077b6 55%, #023e8a 100%)",
    bgPattern: `radial-gradient(ellipse at 15% 70%, #ade8f444 0%, transparent 55%),
                radial-gradient(ellipse at 85% 30%, #caf0f833 0%, transparent 45%),
                radial-gradient(ellipse at 50% 90%, #0077b644 0%, transparent 40%)`,
    scenery: ["🐠", "🐟", "🐙", "🦑", "🐚", "🪸", "🐡", "🦀"],
    popEmojis: [
      "🐠","🐟","🐙","🦑","🐳","🐚","🦈","🪸","⭐","💧",
      "🐬","🦭","🪼","🦀","🐡","🌊","🐋","🦞","💎","🫧",
    ],
    bubbleColors: [
      "#0096c7", "#00b4d8", "#48cae4", "#90e0ef",
      "#ade8f4", "#caf0f8", "#023e8a", "#0077b6",
    ],
    letterColor: "#fff",
    accent: "#90e0ef",
    pitchOffset: 0.85,
  },

  jungle: {
    id: "jungle",
    name: "Jungle",
    emoji: "🌴",
    background:
      "linear-gradient(160deg, #52b788 0%, #40916c 25%, #2d6a4f 55%, #1b4332 100%)",
    bgPattern: `radial-gradient(ellipse at 10% 50%, #95d5b255 0%, transparent 50%),
                radial-gradient(ellipse at 90% 20%, #74c69d44 0%, transparent 45%),
                radial-gradient(ellipse at 60% 85%, #d8f3dc22 0%, transparent 40%)`,
    scenery: ["🌴", "🌿", "🦜", "🐒", "🌺", "🦎", "🐸", "🍃"],
    popEmojis: [
      "🐒","🦜","🐸","🦎","🐆","🌺","🦋","🐘","🌿","🍌",
      "🦁","🐅","🦚","🦩","🐛","🌵","🦔","🐝","🌼","🍀",
    ],
    bubbleColors: [
      "#52b788", "#74c69d", "#95d5b2", "#b7e4c7",
      "#d8f3dc", "#40916c", "#2d6a4f", "#1b4332",
    ],
    letterColor: "#fff",
    accent: "#95d5b2",
    pitchOffset: 0.9,
  },

  space: {
    id: "space",
    name: "Outer Space",
    emoji: "🚀",
    background:
      "linear-gradient(135deg, #03045e 0%, #240046 35%, #10002b 70%, #000000 100%)",
    bgPattern: `radial-gradient(circle at 25% 25%, #7b2d8b33 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, #4cc9f033 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, #f7258511 0%, transparent 60%)`,
    scenery: ["⭐", "🌙", "🪐", "☄️", "🌌", "💫", "🛸", "🌠"],
    popEmojis: [
      "🚀","👽","🛸","🪐","⭐","🌙","☄️","💫","🌠","🔭",
      "🌌","🛰️","👾","🌟","🪨","💥","🔮","⚡","🎆","⚗️",
    ],
    bubbleColors: [
      "#7b2d8b", "#9d4edd", "#c77dff", "#e0aaff",
      "#3a0ca3", "#560bad", "#f72585", "#4cc9f0",
    ],
    letterColor: "#e0aaff",
    accent: "#4cc9f0",
    pitchOffset: 1.15,
  },

  sunset: {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    background:
      "linear-gradient(180deg, #6a0572 0%, #d62828 20%, #f77f00 50%, #fcbf49 80%, #eae2b7 100%)",
    bgPattern: `radial-gradient(ellipse at 50% 0%, #f7258533 0%, transparent 50%),
                radial-gradient(ellipse at 20% 60%, #fcbf4933 0%, transparent 45%),
                radial-gradient(ellipse at 80% 70%, #f77f0022 0%, transparent 40%)`,
    scenery: ["🌅", "☀️", "🦅", "🌻", "🌴", "🦩", "🌙", "🌄"],
    popEmojis: [
      "🦩","🦅","🦜","🌻","🌈","☀️","🌺","🐦","🌸","🦋",
      "🌅","🏜️","🌄","🌇","🍊","🌶️","🥭","🌹","🦚","🎆",
    ],
    bubbleColors: [
      "#f77f00", "#fcbf49", "#d62828", "#e85d04",
      "#fb8500", "#ffb703", "#6a0572", "#9c27b0",
    ],
    letterColor: "#fff",
    accent: "#fcbf49",
    pitchOffset: 1.05,
  },

  arctic: {
    id: "arctic",
    name: "Arctic",
    emoji: "❄️",
    background:
      "linear-gradient(160deg, #e8f4f8 0%, #caf0f8 25%, #ade8f4 55%, #90e0ef 100%)",
    bgPattern: `radial-gradient(circle at 30% 30%, #ffffff66 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, #0096c733 0%, transparent 45%),
                radial-gradient(circle at 50% 10%, #caf0f844 0%, transparent 40%)`,
    scenery: ["❄️", "🐧", "🦭", "🌨️", "🐻‍❄️", "🌊", "⛄", "🏔️"],
    popEmojis: [
      "🐧","🦭","🐻‍❄️","❄️","⛄","🦊","🐺","🌨️","🏔️","🦌",
      "🐼","🦥","🌬️","⛷️","🏂","🛷","🧊","💙","🦢","🕊️",
    ],
    bubbleColors: [
      "#0096c7", "#00b4d8", "#48cae4", "#ade8f4",
      "#023e8a", "#0077b6", "#caf0f8", "#90e0ef",
    ],
    letterColor: "#023e8a",
    accent: "#0077b6",
    pitchOffset: 1.2,
  },
};

export const THEME_IDS = Object.keys(themes) as ThemeId[];
export default themes;
