import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { GameContext } from "@/context/GameContext";
import { useKeyboard } from "@/hooks/useKeyboard";
import type { ThemeId } from "@/themes/themes";

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */

function fireKey(key: string, extra: Partial<KeyboardEventInit> = {}) {
  act(() => {
    fireEvent.keyDown(window, { key, ...extra });
  });
}

function makeCtx(handleChar: (c: string) => void) {
  return {
    state: {
      themeId: "candy" as ThemeId,
      soundEnabled: false,
      bubbles: [],
      smashCount: 0,
    },
    theme: {} as any,
    handleChar,
    removeBubble: vi.fn(),
    setTheme: vi.fn(),
    toggleSound: vi.fn(),
    resetCounter: vi.fn(),
    cycleTheme: vi.fn(),
  };
}

/**
 * Renders a minimal component that actually calls useKeyboard() so the
 * window listener is registered — giving us real hook coverage.
 */
function HookHarness(_props: { handleChar: (c: string) => void }) {
  useKeyboard();
  return null;
}

function renderWithHook(handleChar: (c: string) => void) {
  return render(
    <GameContext.Provider value={makeCtx(handleChar)}>
      <HookHarness handleChar={handleChar} />
    </GameContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tests
───────────────────────────────────────────────────────────────────────────── */

describe("useKeyboard — blocked keys", () => {
  it("does NOT fire for apostrophe '", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("'");
    expect(fn).not.toHaveBeenCalled();
  });

  it("does NOT fire for forward slash /", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("/");
    expect(fn).not.toHaveBeenCalled();
  });

  it("does NOT fire for back-slash \\", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("\\");
    expect(fn).not.toHaveBeenCalled();
  });

  it("does NOT fire for backtick `", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("`");
    expect(fn).not.toHaveBeenCalled();
  });

  it("does NOT fire for double-quote \"", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey('"');
    expect(fn).not.toHaveBeenCalled();
  });

  it("does NOT fire for Dead key", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("Dead");
    expect(fn).not.toHaveBeenCalled();
  });

  it("does NOT fire for Unidentified key", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("Unidentified");
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("useKeyboard — modifier combos", () => {
  it("does NOT fire for Ctrl+C", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("c", { ctrlKey: true });
    expect(fn).not.toHaveBeenCalled();
  });

  it("does NOT fire for Meta+R (Cmd+R)", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("r", { metaKey: true });
    expect(fn).not.toHaveBeenCalled();
  });

  it("does NOT fire for Alt+F", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("f", { altKey: true });
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("useKeyboard — valid keys", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("fires with uppercase char for letter keys", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("a");
    expect(fn).toHaveBeenCalledWith("A");
  });

  it("fires with uppercase char for digit keys", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("5");
    expect(fn).toHaveBeenCalledWith("5");
  });

  it("fires with ★ for Space", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey(" ");
    expect(fn).toHaveBeenCalledWith("★");
  });

  it("fires with ★ for Enter", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("Enter");
    expect(fn).toHaveBeenCalledWith("★");
  });

  it("fires with ↑ for ArrowUp", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("ArrowUp");
    expect(fn).toHaveBeenCalledWith("↑");
  });

  it("fires with ↓ for ArrowDown", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("ArrowDown");
    expect(fn).toHaveBeenCalledWith("↓");
  });

  it("fires with ← for ArrowLeft", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("ArrowLeft");
    expect(fn).toHaveBeenCalledWith("←");
  });

  it("fires with → for ArrowRight", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("ArrowRight");
    expect(fn).toHaveBeenCalledWith("→");
  });

  it("does NOT fire for unknown/punctuation key (e.g. Tab)", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("Tab");
    expect(fn).not.toHaveBeenCalled();
  });

  it("debounces rapid repeated presses of the same key within 80 ms", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    // Fire same key 3× within 80 ms — only first should go through
    fireKey("z");
    fireKey("z");
    fireKey("z");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("Z");
  });

  it("allows same key again after 80 ms debounce window", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("z");
    expect(fn).toHaveBeenCalledTimes(1);
    // Advance past debounce window
    act(() => { vi.advanceTimersByTime(100); });
    fireKey("z");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("allows interleaved different keys without debounce interference", () => {
    const fn = vi.fn();
    renderWithHook(fn);
    fireKey("a");
    fireKey("b"); // different key — should pass through immediately
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, "A");
    expect(fn).toHaveBeenNthCalledWith(2, "B");
  });
});
