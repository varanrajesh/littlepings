# 🎹 LittlePings

A keyboard-smashing toy for all ages. Every key press spawns an animated letter bubble, plays a piano-like ping, and increments your smash counter. Switch between six colour themes without losing your count.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5175)
./start.sh        # or: npm run dev

# Stop dev server
./stop.sh
```

---

## 🛠️ Scripts

| Command               | What it does                                  |
|-----------------------|-----------------------------------------------|
| `npm run dev`         | Vite dev server → `http://localhost:5175`     |
| `npm run build`       | Type-check + production build → `dist/`       |
| `npm run preview`     | Serve the production build locally            |
| `npm run lint`        | oxlint on `src/`                              |
| `npm test`            | Run all tests once (Vitest)                   |
| `npm run test:watch`  | Vitest in watch mode                          |

---

## 🎨 Themes

| Theme        | Emoji | Character          |
|--------------|-------|--------------------|
| Candy Land   | 🍭    | Warm pinks & purples |
| Deep Ocean   | 🌊    | Cool blues           |
| Jungle       | 🌴    | Greens & earth tones |
| Outer Space  | 🚀    | Dark purples & neons |
| Sunset       | 🌅    | Oranges & reds       |
| Arctic       | ❄️    | Icy blues & whites   |

Switch themes with the pill buttons at the bottom. Your smash count **always persists** across theme switches.

---

## 🧱 Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Framework   | React 19                                |
| Language    | TypeScript 5.4                          |
| Build tool  | Vite 5                                  |
| Styling     | Tailwind CSS 3                          |
| Animation   | Framer Motion 11                        |
| Audio       | Web Audio API (no external library)     |
| Testing     | Vitest + Testing Library                |
| Linting     | oxlint                                  |
| CI          | GitHub Actions                          |

---

## 📁 Project Structure

```
src/
  main.tsx              — App entry (no StrictMode — see architecture notes)
  App.tsx               — Root component
  index.css             — Tailwind + Nunito font

  context/
    GameContext.tsx      — Global state: counter, bubbles, theme, sound

  hooks/
    useKeyboard.ts       — Window keydown handler (debounce, blocked keys)
    useSound.ts          — Web Audio engine (piano pings, ≤16 simultaneous nodes)
    useFullscreen.ts     — Cross-browser fullscreen toggle

  themes/
    themes.ts            — 6 theme definitions

  components/
    PlayField.tsx        — Layout root
    HUD.tsx              — Counter, reset, theme switcher, controls
    BubbleLayer.tsx      — Animated letter bubbles
    SceneryLayer.tsx     — Background emoji scenery
    TouchZone.tsx        — Mobile tap handler

  test/
    themes.test.ts       — Theme schema validation (5 tests)
    GameContext.test.tsx — State/counter/audio stress tests (7 tests)

  hooks/
    useKeyboard.test.tsx — Key filtering, blocked keys, debounce (18 tests)
```

---

## ✅ Tests

```bash
npm test
```

All **30 tests** across 3 suites must pass before merging.

| Suite                        | Tests | Covers                                         |
|------------------------------|-------|------------------------------------------------|
| `themes.test.ts`             | 5     | Schema validation for all 6 themes             |
| `GameContext.test.tsx`       | 7     | Counter, reset, theme persistence, stress test |
| `useKeyboard.test.tsx`       | 18    | Blocked keys, modifiers, valid keys, debounce  |

---

## 🏗️ Architecture Notes

### No `StrictMode`
`StrictMode` is deliberately omitted from `main.tsx`. It double-invokes effects in development, which breaks the module-level `AudioContext` singleton and causes duplicate `window.addEventListener` registrations.

### Stable Callbacks
All core handlers (`handleChar`, `removeBubble`, `setTheme`, etc.) use a zero-dependency `useCallback` + ref pattern. The window keyboard listener is registered **once** on mount and reads the latest handler through a ref — no re-registration on re-render.

### Audio Isolation
Audio code never propagates exceptions into the counter/state path. The smash counter always increments even if the audio engine fails.

### Counter Persistence
`smashCount` lives in the reducer and is **never reset on theme change**. Only the explicit "reset" button triggers `RESET_COUNTER`.

---

## 📄 Licence

MIT
