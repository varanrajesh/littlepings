// ─── Frequencies for every character ─────────────────────────────────────────
const NOTE_FREQ: Record<string, number> = {
  A: 130.81, B: 146.83, C: 164.81, D: 174.61, E: 196.0,
  F: 220.0,  G: 246.94, H: 261.63, I: 293.66, J: 329.63,
  K: 349.23, L: 392.0,  M: 440.0,  N: 493.88, O: 523.25,
  P: 587.33, Q: 659.25, R: 698.46, S: 783.99, T: 880.0,
  U: 987.77, V: 1046.5, W: 1174.66,X: 1318.51,Y: 1396.91,
  Z: 1567.98,
  "0": 261.63,"1": 293.66,"2": 329.63,"3": 349.23,"4": 392.0,
  "5": 440.0, "6": 493.88,"7": 523.25,"8": 587.33,"9": 659.25,
  "★": 440.0, "↑": 523.25,"↓": 349.23,"←": 392.0, "→": 493.88,
};

// ─── Single AudioContext for the entire app ───────────────────────────────────
// Created once, never recreated. All playback shares this context.
let _ctx: AudioContext | null = null;
let _wave: PeriodicWave | null = null;

function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === "closed") {
    _ctx  = new AudioContext();
    _wave = null;
  }
  return _ctx;
}

function getWave(c: AudioContext): PeriodicWave {
  if (!_wave) {
    const real = new Float32Array([0, 1, 0.5, 0.3, 0.15, 0.08, 0.05, 0.02]);
    const imag = new Float32Array(real.length);
    _wave = c.createPeriodicWave(real, imag, { disableNormalization: false });
  }
  return _wave;
}

// ─── Node pool — hard cap prevents Chrome's ~128-node AudioContext limit ──────
// Each note creates exactly 3 oscillators + 4 gain nodes = 7 nodes.
// We allow at most 16 simultaneous notes → max 112 nodes, safely under 128.
interface NoteNodes {
  master:  GainNode;
  oscs:    OscillatorNode[];
  gains:   GainNode[];
  stopAt:  number; // AudioContext timestamp when note is fully silent
}
const pool: NoteNodes[] = [];
const MAX_SIMULTANEOUS = 16;

function evictExpired(c: AudioContext) {
  const now = c.currentTime;
  for (let i = pool.length - 1; i >= 0; i--) {
    if (pool[i].stopAt <= now) {
      killNote(pool[i]);
      pool.splice(i, 1);
    }
  }
}

function killNote(note: NoteNodes) {
  // Stop all oscillators first — this frees their internal processing thread
  for (const osc of note.oscs) {
    try { osc.stop(); }    catch { /* already stopped */ }
    try { osc.disconnect(); } catch { /* already disconnected */ }
  }
  for (const g of note.gains) {
    try { g.disconnect(); } catch { /* already disconnected */ }
  }
  try { note.master.disconnect(); } catch { /* already disconnected */ }
}

function evictOldest() {
  if (pool.length === 0) return;
  killNote(pool.shift()!);
}

/** Resume the AudioContext after a user gesture. */
export function resumeAudio() {
  const c = getCtx();
  if (c.state === "suspended") c.resume().catch(() => {});
}

/** Play a piano-like ping. Never throws — all errors are caught internally. */
export function playNote(char: string, pitchOffset = 1.0, enabled = true) {
  if (!enabled) return;
  try {
    const c = getCtx();
    if (c.state === "suspended") {
      // Resume then play — both paths call scheduleNote
      c.resume()
        .then(() => scheduleNote(c, char, pitchOffset))
        .catch(() => {});
    } else {
      scheduleNote(c, char, pitchOffset);
    }
  } catch {
    // Audio failure must NEVER propagate — counter must keep working
  }
}

function scheduleNote(c: AudioContext, char: string, pitchOffset: number) {
  if (typeof c.createPeriodicWave !== "function") return;

  // 1. Free expired notes first
  evictExpired(c);

  // 2. If still at cap, kill the oldest note to make room
  while (pool.length >= MAX_SIMULTANEOUS) evictOldest();

  const upper    = char.toUpperCase();
  const baseFreq = NOTE_FREQ[upper] ?? NOTE_FREQ[char] ?? 440;
  const freq     = baseFreq * pitchOffset;
  const now      = c.currentTime;
  const DECAY    = 1.4; // seconds until fully silent

  // Master gain — controls overall envelope
  const master = c.createGain();
  master.gain.setValueAtTime(0.7, now);
  master.gain.exponentialRampToValueAtTime(0.001, now + DECAY);
  master.connect(c.destination);

  // Piano body oscillator
  const body = c.createOscillator();
  body.setPeriodicWave(getWave(c));
  body.frequency.setValueAtTime(freq, now);
  const bodyGain = c.createGain();
  bodyGain.gain.setValueAtTime(0, now);
  bodyGain.gain.linearRampToValueAtTime(0.55, now + 0.008);
  bodyGain.gain.exponentialRampToValueAtTime(0.28, now + 0.1);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + DECAY);
  body.connect(bodyGain);
  bodyGain.connect(master);

  // Attack transient (hammer strike)
  const attack = c.createOscillator();
  attack.type = "sine";
  attack.frequency.setValueAtTime(freq * 2, now);
  const attackGain = c.createGain();
  attackGain.gain.setValueAtTime(0, now);
  attackGain.gain.linearRampToValueAtTime(0.3, now + 0.005);
  attackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  attack.connect(attackGain);
  attackGain.connect(master);

  // Overtone warmth
  const overtone = c.createOscillator();
  overtone.type = "sine";
  overtone.frequency.setValueAtTime(freq * 3, now);
  const overtoneGain = c.createGain();
  overtoneGain.gain.setValueAtTime(0, now);
  overtoneGain.gain.linearRampToValueAtTime(0.08, now + 0.01);
  overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  overtone.connect(overtoneGain);
  overtoneGain.connect(master);

  // Schedule start/stop on all oscillators
  body.start(now);      body.stop(now + DECAY);
  attack.start(now);    attack.stop(now + 0.06);
  overtone.start(now);  overtone.stop(now + 0.5);

  // Track in pool for lifecycle management
  const note: NoteNodes = {
    master,
    oscs:   [body, attack, overtone],
    gains:  [bodyGain, attackGain, overtoneGain],
    stopAt: now + DECAY + 0.05,
  };
  pool.push(note);

  // Auto-disconnect from graph after decay — releases internal WebAudio memory
  // even if evictExpired() hasn't been called yet.
  setTimeout(() => {
    killNote(note);
    const idx = pool.indexOf(note);
    if (idx !== -1) pool.splice(idx, 1);
  }, (DECAY + 0.1) * 1000);
}
