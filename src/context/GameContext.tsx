import {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import themes, { THEME_IDS, type ThemeId } from "@/themes/themes";
import { playNote, resumeAudio } from "@/hooks/useSound";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Bubble {
  id: string;
  char: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  rotation: number;
  emoji?: string;
}

interface GameState {
  themeId: ThemeId;
  soundEnabled: boolean;
  bubbles: Bubble[];
  smashCount: number;
}

type Action =
  | { type: "ADD_BUBBLE"; payload: Bubble }
  | { type: "REMOVE_BUBBLE"; id: string }
  | { type: "SET_THEME"; id: ThemeId }
  | { type: "TOGGLE_SOUND" }
  | { type: "RESET_COUNTER" };

// ─── Reducer ──────────────────────────────────────────────────────────────────
const MAX_BUBBLES = 24;

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "ADD_BUBBLE":
      return {
        ...state,
        bubbles: [...state.bubbles.slice(-(MAX_BUBBLES - 1)), action.payload],
        smashCount: state.smashCount + 1,
      };
    case "REMOVE_BUBBLE":
      return { ...state, bubbles: state.bubbles.filter((b) => b.id !== action.id) };
    case "SET_THEME":
      return { ...state, themeId: action.id };
    case "TOGGLE_SOUND":
      return { ...state, soundEnabled: !state.soundEnabled };
    case "RESET_COUNTER":
      return { ...state, smashCount: 0, bubbles: [] };
    default:
      return state;
  }
}

// ─── Bubble factory ───────────────────────────────────────────────────────────
function makeBubble(char: string, colors: string[], emojis: string[]): Bubble {
  return {
    id: `${char}-${Date.now()}-${Math.random()}`,
    char: char.toUpperCase(),
    x: 5 + Math.random() * 80,
    y: 5 + Math.random() * 75,
    color: colors[Math.floor(Math.random() * colors.length)],
    fontSize: 5 + Math.random() * 8,
    rotation: -20 + Math.random() * 40,
    emoji:
      Math.random() < 0.4
        ? emojis[Math.floor(Math.random() * emojis.length)]
        : undefined,
  };
}

// ─── Context shape ────────────────────────────────────────────────────────────
interface GameContextValue {
  state: GameState;
  theme: (typeof themes)[ThemeId];
  handleChar: (char: string) => void;
  removeBubble: (id: string) => void;
  setTheme: (id: ThemeId) => void;
  toggleSound: () => void;
  resetCounter: () => void;
  cycleTheme: () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    themeId: "candy",
    soundEnabled: true,
    bubbles: [],
    smashCount: 0,
  });

  // ── Refs that shadow the latest state/theme so stable callbacks can read
  //    current values without being re-created on every render.
  const stateRef = useRef(state);
  stateRef.current = state;

  const themeRef = useRef(themes[state.themeId]);
  themeRef.current = themes[state.themeId];

  // dispatch from useReducer is already stable — but we ref it too so the
  // pattern is uniform and explicit.
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  // ── Core handler ─────────────────────────────────────────────────────────
  // Deps are [] → identity is STABLE FOR THE LIFETIME OF THE PROVIDER.
  // All mutable data (theme, soundEnabled) is read from refs at call-time.
  const handleChar = useCallback((char: string) => {
    // Read latest values from refs — never stale
    const theme        = themeRef.current;
    const soundEnabled = stateRef.current.soundEnabled;

    // 1. Audio — completely isolated. Any throw or async failure is swallowed.
    //    The counter ALWAYS increments regardless of audio state.
    resumeAudio();
    // Fire-and-forget: playNote handles its own try/catch internally
    playNote(char, theme.pitchOffset, soundEnabled);

    // 2. State — synchronous, always runs after audio is kicked off
    const bubble = makeBubble(char, theme.bubbleColors, theme.popEmojis);
    dispatchRef.current({ type: "ADD_BUBBLE", payload: bubble });
  }, []); // ← ZERO deps — truly stable reference

  // ── Other actions ─────────────────────────────────────────────────────────
  const removeBubble = useCallback((id: string) => {
    dispatchRef.current({ type: "REMOVE_BUBBLE", id });
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    dispatchRef.current({ type: "SET_THEME", id });
  }, []);

  const toggleSound = useCallback(() => {
    dispatchRef.current({ type: "TOGGLE_SOUND" });
  }, []);

  const resetCounter = useCallback(() => {
    dispatchRef.current({ type: "RESET_COUNTER" });
  }, []);

  const cycleTheme = useCallback(() => {
    const idx = THEME_IDS.indexOf(stateRef.current.themeId);
    dispatchRef.current({
      type: "SET_THEME",
      id: THEME_IDS[(idx + 1) % THEME_IDS.length],
    });
  }, []);

  // ── Memoised context value ────────────────────────────────────────────────
  // NOTE: we do NOT memoize the value object here on purpose.
  // Wrapping in useMemo with [state] dep would cause ALL consumers to
  // re-render anyway when state changes — same cost, more complexity.
  const value: GameContextValue = {
    state,
    theme: themeRef.current,
    handleChar,
    removeBubble,
    setTheme,
    toggleSound,
    resetCounter,
    cycleTheme,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
