/**
 * LittlePings — runtime diagnostics logger
 * Prints tagged, timestamped lines to the browser console.
 * Remove this file (and its imports) before production release.
 */

const t = () => (performance.now() / 1000).toFixed(3) + "s";

export const log = {
  key:     (char: string) => console.log(`[KEY    ${t()}] char="${char}"`),
  touch:   (char: string) => console.log(`[TOUCH  ${t()}] char="${char}"`),
  handle:  (char: string, src: string) => console.log(`[HANDLE ${t()}] src=${src} char="${char}"`),
  spawn:   (char: string, theme: string) => console.log(`[SPAWN  ${t()}] char="${char}" theme=${theme}`),
  sound:   (char: string, freq: number, enabled: boolean, ctxState: string) =>
    console.log(`[SOUND  ${t()}] char="${char}" freq=${freq.toFixed(1)}Hz enabled=${enabled} ctx=${ctxState}`),
  reset:   () => console.log(`[RESET  ${t()}] resetCounter dispatched`),
  theme:   (id: string) => console.log(`[THEME  ${t()}] → ${id}`),
  counter: (n: number) => console.log(`[COUNT  ${t()}] smashCount=${n}`),
  focus:   (el: string) => console.log(`[FOCUS  ${t()}] → ${el}`),
  ctx:     (state: string) => console.log(`[CTX    ${t()}] AudioContext state=${state}`),
};
