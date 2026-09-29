/**
 * useParentLock — hidden 5× tap gesture on the top-right corner (≤ 60 × 60 px)
 * that activates a lock screen.
 *
 * Behaviour:
 *  - 5 taps within the corner zone within TAP_WINDOW_MS → lock activates.
 *  - Taps must be within TAP_WINDOW_MS of each other (not total sequence time).
 *  - Once locked, only a correct PIN clears the lock (handled by the UI layer).
 *  - `unlock()` is exposed so the caller can clear the lock after PIN entry.
 *
 * The hook attaches a pointer listener to the given ref element
 * (should be the full-screen container).
 */

import { useCallback, useEffect, useRef, useState } from "react";

const REQUIRED_TAPS = 5;
const TAP_WINDOW_MS = 1_500; // 1.5 s between each tap
const CORNER_SIZE_PX = 80;   // top-right square

function isInTopRightCorner(e: PointerEvent, el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return x >= rect.width - CORNER_SIZE_PX && y <= CORNER_SIZE_PX;
}

export function useParentLock(containerRef: React.RefObject<HTMLElement | null>) {
  const [isLocked, setIsLocked] = useState(false);

  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onPointerDown(e: PointerEvent) {
      if (!el) return;
      if (!isInTopRightCorner(e, el)) {
        // Any tap outside the corner resets the sequence
        tapCountRef.current = 0;
        return;
      }

      const now = Date.now();
      if (now - lastTapTimeRef.current > TAP_WINDOW_MS) {
        // Gap too large → restart sequence
        tapCountRef.current = 1;
      } else {
        tapCountRef.current += 1;
      }
      lastTapTimeRef.current = now;

      if (tapCountRef.current >= REQUIRED_TAPS) {
        tapCountRef.current = 0;
        setIsLocked(true);
      }
    }

    el.addEventListener("pointerdown", onPointerDown);
    return () => el.removeEventListener("pointerdown", onPointerDown);
  }, [containerRef]);

  const unlock = useCallback(() => setIsLocked(false), []);

  return { isLocked, unlock };
}
