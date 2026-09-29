/**
 * useIdleAttract — two-phase idle detection.
 *
 * Phase 1 — ATTRACT (5 s of no input):
 *   `isIdle` flips true → AttractScreen (emoji rain) is shown.
 *
 * Phase 2 — SESSION END (10 s of no input, i.e. 5 s after attract starts):
 *   `isSessionEnded` flips true → SessionEndScreen is shown over the top.
 *
 * Any deliberate gesture (keydown / pointerdown) at any phase:
 *   - clears both flags
 *   - restarts both timers from zero
 *
 * NOTE: pointermove is intentionally excluded so hovering over the
 * session-end screen / Play Again button does NOT dismiss it.
 *
 * `resetNow()` — callable externally (e.g. "Play Again" button) to
 *   dismiss both screens immediately and restart the idle timers.
 *
 * Design notes:
 *  - Single useEffect, two stacked setTimeouts.
 *  - resetFnRef lets the Play Again button call the same reset the event
 *    listeners call, without any extra deps or re-registrations.
 *  - Cleans up fully on unmount.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export const ATTRACT_TIMEOUT_MS     = 5_000;  // 5 s  → emoji rain
export const SESSION_END_TIMEOUT_MS = 10_000; // 10 s → session summary

export function useIdleAttract() {
  const [isIdle, setIsIdle]                 = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  // Capture session start once on mount; re-use across resets via ref
  const sessionStartRef = useRef(Date.now());
  const [sessionStart, setSessionStart]     = useState(() => sessionStartRef.current);

  const attractTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mutable ref to the reset fn — so the event listeners always call the
  // latest version without being re-registered on every render.
  const resetFnRef = useRef<() => void>(() => {});

  useEffect(() => {
    function reset() {
      // Clear both screens immediately
      setIsIdle(false);
      setIsSessionEnded(false);

      // Clear running timers
      if (attractTimerRef.current)    clearTimeout(attractTimerRef.current);
      if (sessionEndTimerRef.current) clearTimeout(sessionEndTimerRef.current);

      // Phase 1 — attract after ATTRACT_TIMEOUT_MS
      attractTimerRef.current = setTimeout(() => {
        setIsIdle(true);

        // Phase 2 — session end ATTRACT_TIMEOUT_MS later
        sessionEndTimerRef.current = setTimeout(() => {
          setIsSessionEnded(true);
        }, SESSION_END_TIMEOUT_MS - ATTRACT_TIMEOUT_MS);
      }, ATTRACT_TIMEOUT_MS);
    }

    // Store so resetNow() can call the same function.
    // NOTE: resetNow (called by Play Again) stamps a new sessionStart
    //       BEFORE calling reset() so the stat cards always show 0 on a
    //       fresh session. Input-event resets (keydown / pointerdown) do
    //       NOT stamp a new sessionStart — they only dismiss the overlays
    //       and restart the idle timers so the current session continues.
    resetFnRef.current = reset;

    // Kick off timers immediately on mount
    reset();

    // NOTE: pointermove intentionally excluded — hovering over the session-end
    // screen (e.g. the Play Again button) must NOT dismiss it. Only deliberate
    // gestures (keydown / pointerdown) reset the idle state.
    const events = ["keydown", "pointerdown"] as const;
    events.forEach((ev) => window.addEventListener(ev, reset));

    return () => {
      if (attractTimerRef.current)    clearTimeout(attractTimerRef.current);
      if (sessionEndTimerRef.current) clearTimeout(sessionEndTimerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable callback — called from "Play Again" button
  const resetNow = useCallback(() => {
    // New session starts from now
    sessionStartRef.current = Date.now();
    setSessionStart(sessionStartRef.current);
    resetFnRef.current();
  }, []);

  return { isIdle, isSessionEnded, sessionStart, resetNow };
}
