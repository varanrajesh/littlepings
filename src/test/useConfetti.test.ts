/// <reference types="vitest/globals" />
import { renderHook, act } from "@testing-library/react";
import { useConfetti, MILESTONES } from "@/hooks/useConfetti";

// ── Mock canvas-confetti so no real DOM canvas is needed in tests ─────────────
vi.mock("canvas-confetti", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Import AFTER vi.mock so we get the mocked version
import confetti from "canvas-confetti";

// Typed mock reference — avoids repeated unsafe casts
const confettiMock = confetti as unknown as ReturnType<typeof vi.fn>;

const ACCENT = "#ff006e";

// Helper: render hook with a given starting count then update to a new count
function setup(initial = 0) {
  return renderHook(
    ({ count }: { count: number }) =>
      useConfetti({ smashCount: count, accent: ACCENT }),
    { initialProps: { count: initial } }
  );
}

describe("useConfetti", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("does not fire confetti below the first milestone", () => {
    const { rerender } = setup(0);
    rerender({ count: 9 });
    expect(confettiMock).not.toHaveBeenCalled();
  });

  it.each(MILESTONES)("fires confetti at milestone %i", (milestone) => {
    const { rerender } = setup(milestone - 1);
    act(() => { rerender({ count: milestone }); });
    expect(confettiMock).toHaveBeenCalled();
  });

  it("fires confetti exactly once per milestone — no double-fire on further increments", () => {
    const { rerender } = setup(9);
    act(() => { rerender({ count: 10 }); });   // milestone hit
    const callsAfterMilestone = confettiMock.mock.calls.length;
    act(() => { rerender({ count: 11 }); });   // one more smash
    act(() => { rerender({ count: 20 }); });   // many more
    expect(confettiMock.mock.calls.length).toBe(callsAfterMilestone);
  });

  it("re-fires milestones after a counter reset (count drops back to 0)", () => {
    const { rerender } = setup(0);
    // Hit milestone 10
    act(() => { rerender({ count: 10 }); });
    const callsBefore = confettiMock.mock.calls.length;
    expect(callsBefore).toBeGreaterThan(0);

    // Simulate reset
    act(() => { rerender({ count: 0 }); });
    vi.clearAllMocks();

    // Hit milestone 10 again
    act(() => { rerender({ count: 10 }); });
    expect(confettiMock).toHaveBeenCalled();
  });

  it("fires multiple milestones as count climbs past them sequentially", () => {
    const { rerender } = setup(0);
    act(() => { rerender({ count: 10 });  });
    act(() => { rerender({ count: 50 });  });
    act(() => { rerender({ count: 100 }); });
    // 10→1 burst, 50→1 burst, 100→3 bursts (left + right + centre)
    expect(confettiMock.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it("fires 3 confetti calls at milestone 100 (left + right + centre)", () => {
    // Start at 99 — milestones 10 and 50 fire on mount; clear those calls
    const { rerender } = setup(99);
    vi.clearAllMocks();
    act(() => { rerender({ count: 100 }); });
    expect(confettiMock).toHaveBeenCalledTimes(3);
  });

  it("fires 3 confetti calls at milestone 500 (left + right + centre)", () => {
    // Start at 499 — milestones 10, 50, 100 fire on mount; clear those calls
    const { rerender } = setup(499);
    vi.clearAllMocks();
    act(() => { rerender({ count: 500 }); });
    expect(confettiMock).toHaveBeenCalledTimes(3);
  });

  it("fires 5 confetti calls at milestone 1000 (4 corner cannons + centre)", () => {
    // Start at 999 — all lower milestones fire on mount; clear those calls
    const { rerender } = setup(999);
    vi.clearAllMocks();
    act(() => { rerender({ count: 1000 }); });
    expect(confettiMock).toHaveBeenCalledTimes(5);
  });

  it("fires 5 confetti calls at milestone 2000 (4 corner cannons + centre)", () => {
    // Start at 1999 — all lower milestones fire on mount; clear those calls
    const { rerender } = setup(1999);
    vi.clearAllMocks();
    act(() => { rerender({ count: 2000 }); });
    expect(confettiMock).toHaveBeenCalledTimes(5);
  });
});
