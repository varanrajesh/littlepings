/// <reference types="vitest/globals" />
import { renderHook, act } from "@testing-library/react";
import {
  useIdleAttract,
  ATTRACT_TIMEOUT_MS,
  SESSION_END_TIMEOUT_MS,
} from "@/hooks/useIdleAttract";

// ─────────────────────────────────────────────────────────────────────────────
// Regression: "Play Again must start a FRESH session, not continue the old one"
//
// Root cause that was fixed:
//   SessionEndScreen called resetCounter() (zeroed smashCount) then called
//   onPlayAgain() (which calls resetNow() in the hook).  However the stat
//   cards on the session-end overlay were reading state.smashCount directly —
//   which React had already zeroed — so the displayed stats showed 0 before
//   the screen even dismissed.  Worse, if the user pressed Play Again without
//   the counter ever resetting, the *next* session would inherit the previous
//   smashCount.
//
//   The fix: SessionEndScreen snapshots {keys, sessionStart} into a ref the
//   moment isSessionEnded flips true and renders from that frozen snapshot
//   until it unmounts.  resetNow() in the hook stamps a brand-new sessionStart
//   so the next session always starts from t=0 with smashCount=0.
// ─────────────────────────────────────────────────────────────────────────────
describe("useIdleAttract — Play Again / session reset contract", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("sessionStart is updated by resetNow() — next session gets a new origin", () => {
    const { result } = renderHook(() => useIdleAttract());
    const original = result.current.sessionStart;

    // Let session end
    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS); });
    expect(result.current.isSessionEnded).toBe(true);

    // Advance clock so there is a measurable gap between old and new sessionStart
    act(() => { vi.advanceTimersByTime(2_000); });

    // Simulate Play Again
    act(() => { result.current.resetNow(); });

    // sessionStart must be strictly later than the original
    expect(result.current.sessionStart).toBeGreaterThan(original);
    // Both overlays must be dismissed immediately
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isSessionEnded).toBe(false);
  });

  it("input events (keydown) do NOT update sessionStart — session continues", () => {
    const { result } = renderHook(() => useIdleAttract());
    const original = result.current.sessionStart;

    // Trigger attract screen
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS); });
    expect(result.current.isIdle).toBe(true);

    // User presses a key — dismisses attract, continues the same session
    act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "A" })); });
    expect(result.current.isIdle).toBe(false);

    // sessionStart must be unchanged — same session
    expect(result.current.sessionStart).toBe(original);
  });

  it("after resetNow(), idle timer restarts — new session can go idle again", () => {
    const { result } = renderHook(() => useIdleAttract());

    // Full session end
    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS); });
    act(() => { result.current.resetNow(); });

    // Should NOT go idle before ATTRACT_TIMEOUT_MS from the reset point
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS - 1); });
    expect(result.current.isIdle).toBe(false);

    // Should go idle exactly at ATTRACT_TIMEOUT_MS from the reset point
    act(() => { vi.advanceTimersByTime(1); });
    expect(result.current.isIdle).toBe(true);
  });

  it("consecutive resetNow() calls each stamp a newer sessionStart", () => {
    const { result } = renderHook(() => useIdleAttract());

    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS); });
    act(() => { vi.advanceTimersByTime(500); result.current.resetNow(); });
    const second = result.current.sessionStart;

    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS); });
    act(() => { vi.advanceTimersByTime(500); result.current.resetNow(); });
    const third = result.current.sessionStart;

    expect(third).toBeGreaterThan(second);
  });
});

describe("useIdleAttract — Phase 1 (attract)", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("starts with isIdle=false and isSessionEnded=false", () => {
    const { result } = renderHook(() => useIdleAttract());
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isSessionEnded).toBe(false);
  });

  it("flips isIdle after ATTRACT_TIMEOUT_MS with no input", () => {
    const { result } = renderHook(() => useIdleAttract());
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS); });
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isSessionEnded).toBe(false);
  });

  it("does NOT flip isIdle before ATTRACT_TIMEOUT_MS", () => {
    const { result } = renderHook(() => useIdleAttract());
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS - 1); });
    expect(result.current.isIdle).toBe(false);
  });

  it("resets Phase-1 timer on keydown", () => {
    const { result } = renderHook(() => useIdleAttract());
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS - 500); });
    act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "A" })); });
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS / 2); });
    expect(result.current.isIdle).toBe(false);
  });

  it("resets Phase-1 timer on pointerdown", () => {
    const { result } = renderHook(() => useIdleAttract());
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS - 500); });
    act(() => { window.dispatchEvent(new PointerEvent("pointerdown")); });
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS / 2); });
    expect(result.current.isIdle).toBe(false);
  });

  it("pointermove does NOT reset the idle timer (hover must not dismiss screen)", () => {
    const { result } = renderHook(() => useIdleAttract());
    // Advance to just before attract
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS - 100); });
    // Mouse move — must be ignored
    act(() => { window.dispatchEvent(new PointerEvent("pointermove")); });
    // Timer continues unaffected — screen appears 100 ms later
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current.isIdle).toBe(true);
  });

  it("returns to isIdle=false when input arrives while idle (Phase 1)", () => {
    const { result } = renderHook(() => useIdleAttract());
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS); });
    expect(result.current.isIdle).toBe(true);
    act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Z" })); });
    expect(result.current.isIdle).toBe(false);
  });
});

describe("useIdleAttract — Phase 2 (session end)", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("flips isSessionEnded at SESSION_END_TIMEOUT_MS with no input", () => {
    const { result } = renderHook(() => useIdleAttract());
    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS); });
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isSessionEnded).toBe(true);
  });

  it("does NOT flip isSessionEnded before SESSION_END_TIMEOUT_MS", () => {
    const { result } = renderHook(() => useIdleAttract());
    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS - 1); });
    expect(result.current.isSessionEnded).toBe(false);
  });

  it("clears BOTH phases on input during Phase 2", () => {
    const { result } = renderHook(() => useIdleAttract());
    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS); });
    expect(result.current.isSessionEnded).toBe(true);
    act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "A" })); });
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isSessionEnded).toBe(false);
  });

  it("resetNow() immediately clears both phases", () => {
    const { result } = renderHook(() => useIdleAttract());
    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS); });
    expect(result.current.isSessionEnded).toBe(true);
    act(() => { result.current.resetNow(); });
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isSessionEnded).toBe(false);
  });

  it("resetNow() restarts Phase-1 timer from zero", () => {
    const { result } = renderHook(() => useIdleAttract());
    // Let session end
    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS); });
    act(() => { result.current.resetNow(); });
    // Half of attract time — should still not be idle
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS / 2); });
    expect(result.current.isIdle).toBe(false);
    // Full attract time from reset — now idle
    act(() => { vi.advanceTimersByTime(ATTRACT_TIMEOUT_MS / 2); });
    expect(result.current.isIdle).toBe(true);
  });

  it("resetNow() updates sessionStart to current time", () => {
    const { result } = renderHook(() => useIdleAttract());
    const firstStart = result.current.sessionStart;
    act(() => { vi.advanceTimersByTime(SESSION_END_TIMEOUT_MS); });
    act(() => {
      vi.advanceTimersByTime(1000); // simulate 1 s gap
      result.current.resetNow();
    });
    expect(result.current.sessionStart).toBeGreaterThan(firstStart);
  });
});
