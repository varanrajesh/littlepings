import "@testing-library/jest-dom";

// ── Polyfill PointerEvent for jsdom ──────────────────────────────────────────
if (typeof PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    pointerType: string;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? "mouse";
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).PointerEvent = PointerEventPolyfill;
}

// ── Stub Web Audio API for jsdom ─────────────────────────────────────────────
// jsdom does not implement AudioContext. Stub enough surface area so that
// useSound.ts (playNote / resumeAudio) never throws during tests.
// The counter must still increment — this makes audio a silent no-op.
if (typeof AudioContext === "undefined") {
  class StubNode {
    connect() { return this; }
    disconnect() {}
  }
  class StubGainNode extends StubNode {
    gain = { setValueAtTime() {}, exponentialRampToValueAtTime() {}, value: 1 };
  }
  class StubOscillator extends StubNode {
    frequency = { setValueAtTime() {} };
    start() {}
    stop() {}
    onended: (() => void) | null = null;
    addEventListener(_: string, cb: EventListenerOrEventListenerObject) {
      // Fire "ended" synchronously so nodes are released in tests
      if (_ === "ended" && typeof cb === "function") setTimeout(cb, 0);
    }
    removeEventListener() {}
  }
  class StubAudioContext {
    state = "running" as AudioContextState;
    currentTime = 0;
    destination = new StubNode();
    resume() { return Promise.resolve(); }
    createOscillator() { return new StubOscillator(); }
    createGain() { return new StubGainNode(); }
    createPeriodicWave() { return {}; }
    close() { return Promise.resolve(); }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).AudioContext = StubAudioContext;
}
