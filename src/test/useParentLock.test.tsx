/// <reference types="vitest/globals" />
import { render, act } from "@testing-library/react";
import { useRef } from "react";
import { useParentLock } from "@/hooks/useParentLock";

// ── Harness ───────────────────────────────────────────────────────────────────
let capturedLock: { isLocked: boolean; unlock: () => void } | null = null;

function Harness() {
  const ref = useRef<HTMLDivElement>(null);
  const result = useParentLock(ref);
  capturedLock = result;
  return (
    <div
      ref={ref}
      data-testid="container"
      style={{ width: 400, height: 600 }}
    />
  );
}

/** Fire a pointerdown on the element at a given (x, y) relative to its rect. */
function tap(el: HTMLElement, x: number, y: number) {
  // getBoundingClientRect returns zeros in jsdom — we need to mock it
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    left: 0, top: 0, width: 400, height: 600,
    right: 400, bottom: 600, x: 0, y: 0, toJSON: () => {},
  } as DOMRect);

  el.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      clientX: x,
      clientY: y,
    })
  );
}

/** Tap the top-right corner (within 80 × 80 px) */
function cornerTap(el: HTMLElement) {
  tap(el, 380, 20); // x ≥ 400-80=320, y ≤ 80
}

/** Tap somewhere outside the corner */
function bodyTap(el: HTMLElement) {
  tap(el, 100, 300);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("useParentLock", () => {
  beforeEach(() => {
    capturedLock = null;
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function setup() {
    const { getByTestId } = render(<Harness />);
    return getByTestId("container") as HTMLDivElement;
  }

  it("starts unlocked", () => {
    setup();
    expect(capturedLock!.isLocked).toBe(false);
  });

  it("does NOT lock on fewer than 5 corner taps", () => {
    const el = setup();
    act(() => {
      for (let i = 0; i < 4; i++) {
        cornerTap(el);
        vi.advanceTimersByTime(200);
      }
    });
    expect(capturedLock!.isLocked).toBe(false);
  });

  it("locks after exactly 5 rapid corner taps", () => {
    const el = setup();
    act(() => {
      for (let i = 0; i < 5; i++) {
        cornerTap(el);
        vi.advanceTimersByTime(200);
      }
    });
    expect(capturedLock!.isLocked).toBe(true);
  });

  it("resets tap sequence when a body tap interrupts", () => {
    const el = setup();
    act(() => {
      cornerTap(el); vi.advanceTimersByTime(200);
      cornerTap(el); vi.advanceTimersByTime(200);
      bodyTap(el);   vi.advanceTimersByTime(200); // resets
      cornerTap(el); vi.advanceTimersByTime(200);
      cornerTap(el); vi.advanceTimersByTime(200);
    });
    // Only 2 corner taps after reset — should not be locked
    expect(capturedLock!.isLocked).toBe(false);
  });

  it("resets tap sequence when gap > 1500 ms between taps", () => {
    const el = setup();
    act(() => {
      cornerTap(el); vi.advanceTimersByTime(200);
      cornerTap(el); vi.advanceTimersByTime(200);
      cornerTap(el);
      vi.advanceTimersByTime(2000); // gap > TAP_WINDOW_MS (1500)
      cornerTap(el); vi.advanceTimersByTime(200);
      cornerTap(el); vi.advanceTimersByTime(200);
      // 3rd tap after gap restarts sequence → only 3 taps total in new sequence
    });
    expect(capturedLock!.isLocked).toBe(false);
  });

  it("unlock() clears the lock", () => {
    const el = setup();
    act(() => {
      for (let i = 0; i < 5; i++) {
        cornerTap(el);
        vi.advanceTimersByTime(200);
      }
    });
    expect(capturedLock!.isLocked).toBe(true);
    act(() => { capturedLock!.unlock(); });
    expect(capturedLock!.isLocked).toBe(false);
  });

  it("can lock again after unlocking", () => {
    const el = setup();
    act(() => {
      for (let i = 0; i < 5; i++) {
        cornerTap(el); vi.advanceTimersByTime(200);
      }
    });
    act(() => { capturedLock!.unlock(); });
    expect(capturedLock!.isLocked).toBe(false);
    act(() => {
      for (let i = 0; i < 5; i++) {
        cornerTap(el); vi.advanceTimersByTime(200);
      }
    });
    expect(capturedLock!.isLocked).toBe(true);
  });
});
