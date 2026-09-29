# LittlePings — Agent Memory

> Persistent context for AI-assisted development sessions.
> Update this file whenever architecture, conventions, or open tasks change.

---

## 🏷️ Project Identity

| Field          | Value                                                        |
|----------------|--------------------------------------------------------------|
| Name           | **LittlePings**                                              |
| Root           | `/Users/rajesh-2755/LittlePings`                             |
| npm name       | `littlepings` (lowercase, npm convention)                    |
| Version        | `0.0.0` (pre-release)                                        |
| Entry point    | `index.html` → `src/main.tsx`                                |
| Dev URL        | `http://localhost:5175/`                                     |
| **Live URL**   | **`https://littlepings.pages.dev/`**                         |
| GitHub repo    | `https://github.com/varanrajesh/littlepings`                 |
| Hosting        | Cloudflare Pages (edge CDN, 300+ PoPs, free tier)            |
| Deploy trigger | Every push to `main` → GitHub Actions CI → Cloudflare Pages  |

---

## 🧱 Tech Stack

| Layer         | Technology                                          |
|---------------|-----------------------------------------------------|
| Framework     | React 19 (no StrictMode — intentional, see below)   |
| Language      | TypeScript 5.4                                      |
| Build tool    | Vite 5 + vite-plugin-pwa (Workbox)                  |
| Styling       | Tailwind CSS 3 + PostCSS + Autoprefixer             |
| Animation     | Framer Motion 11                                    |
| Audio         | Web Audio API (raw, no library)                     |
| Confetti      | canvas-confetti                                     |
| PWA           | vite-plugin-pwa + workbox-window (SW auto-update)   |
| Testing       | Vitest 2 + Testing Library React 16 (React 19 compat) |
| Linting       | oxlint                                              |
| CI            | GitHub Actions (`.github/workflows/ci.yml`)         |
| Path alias    | `@/` → `src/`                                       |

---

## 📁 Source Map

```
src/
  main.tsx                    — App bootstrap (no StrictMode — deliberate)
  App.tsx                     — Root: wraps PlayField in GameProvider
  index.css                   — Tailwind directives + Nunito font import
  debug.ts                    — Dev-only logger (LittlePings runtime diagnostics)

  context/
    GameContext.tsx            — Single source of truth: state, reducer, stable callbacks

  hooks/
    useKeyboard.ts             — Window keydown listener; debounce, blocked keys, arrows
    useKeyboard.test.tsx       — Unit tests: key filtering & modifier combos
    useSound.ts                — Web Audio engine: piano-like pings, node pool (≤16)
    useFullscreen.ts           — Cross-browser fullscreen toggle (webkit/moz/ms)
    useConfetti.ts             — Milestone confetti bursts (10/50/100/500/1000/2000); reset-aware
    useIdleAttract.ts          — Two-phase idle: 5 s → attract, 10 s → session end; resetNow() for Play Again
    useParentLock.ts           — 5× corner-tap gesture → isLocked state + unlock()

  themes/
    themes.ts                  — 6 themes: candy, ocean, jungle, space, sunset, arctic

  components/
    PlayField.tsx              — Layout root: mounts all layers + wires keyboard/audio unlock, confetti, idle, lock
    HUD.tsx                    — Counter, reset, theme switcher, sound toggle, fullscreen, idle hint, milestone banner
    BubbleLayer.tsx            — Animated letter bubbles (Framer Motion)
    SceneryLayer.tsx           — Decorative background emoji scenery
    TouchZone.tsx              — Full-screen tap handler (mobile support)
    AttractScreen.tsx          — Animated idle overlay (shown at 5 s inactivity; 48 emoji particles)
    SessionEndScreen.tsx       — Full-dark overlay at 10 s; trophy, stats (keys/time/keys-per-min), milestones reached, Play Again
    LockScreen.tsx             — Parent lock overlay; PIN "1234"; z-60
    MilestoneBanner.tsx        — Toast banner at 10/50/100/500/1000/2000 smashes
    ParentLockInfo.tsx         — 🔒 bottom-left tooltip explaining the 5× corner-tap lock gesture

  test/
    themes.test.ts             — 5 tests: theme schema validation
    GameContext.test.tsx        — 7 tests: counter, reset, theme switch, audio stress (226 smashes)
```

---

## 🎮 Core Architecture

### State (`GameContext`)
- Single `useReducer` with `GameState`: `{ themeId, soundEnabled, bubbles, smashCount }`
- All callbacks (`handleChar`, `removeBubble`, `setTheme`, `toggleSound`, `resetCounter`, `cycleTheme`) are **stable** (zero-dep `useCallback` + refs) — no re-registration of window listeners on re-render.
- `handleChar` reads theme and soundEnabled from **refs** at call-time → never stale.

### Counter
- `smashCount` lives in reducer state — always persists across theme switches.
- `RESET_COUNTER` action zeroes both `smashCount` and `bubbles`.
- `MAX_BUBBLES = 24` — oldest bubble evicted when limit reached; counter is not affected.

### Audio (`useSound.ts`)
- Single module-level `AudioContext` shared across all notes.
- Node pool capped at **16 simultaneous notes** (7 nodes each = max 112 nodes, safely under Chrome's ~128 limit).
- `resumeAudio()` called on first user gesture (pointer or keydown) to satisfy autoplay policy.
- Audio failure is fully isolated — counter always increments even if audio throws.
- `playNote()` never throws; all errors are caught internally.

### Keyboard (`useKeyboard.ts`)
- Registered **once** on mount — never re-registered.
- Reads `handleChar` from a ref → always latest value.
- Blocked keys: `' / \ ` " Dead Unidentified`
- Modifier combos (Ctrl, Meta, Alt) are silently ignored.
- Arrow keys and Space are mapped to symbols (`↑ ↓ ← → ★`) and `e.preventDefault()` is called to suppress page scroll.
- 80 ms per-key debounce on key-hold.
  - ✅ All debug `console.log` calls removed.

### No `StrictMode`
- Deliberately omitted from `main.tsx`.
- StrictMode double-invokes effects in dev, which breaks the module-level `AudioContext` singleton and causes duplicate `window.addEventListener` registrations.

---

## 🎨 Themes

| ID      | Name         | Emoji | Pitch Offset |
|---------|--------------|-------|--------------|
| candy   | Candy Land   | 🍭    | 1.00         |
| ocean   | Deep Ocean   | 🌊    | 0.85         |
| jungle  | Jungle       | 🌴    | 0.90         |
| space   | Outer Space  | 🚀    | 1.15         |
| sunset  | Sunset       | 🌅    | 1.05         |
| arctic  | Arctic       | ❄️    | 1.20         |

Each theme provides: `background`, `bgPattern`, `scenery[]`, `popEmojis[]`, `bubbleColors[]`, `letterColor`, `accent`, `pitchOffset`.

---

## ✅ Test Suite (58 tests — all passing)

| File                              | Tests | Covers                                                                     |
|-----------------------------------|-------|----------------------------------------------------------------------------|
| `src/test/themes.test.ts`         | 5     | Schema validation for all 6 themes                                         |
| `src/test/GameContext.test.tsx`   | 7     | Counter, reset, theme-switch persistence, 226-smash stress                 |
| `src/hooks/useKeyboard.test.tsx`  | 22    | All blocked keys, modifier combos, valid keys, arrow/space maps, debounce  |
| `src/test/useConfetti.test.ts`    | 14    | Milestone firing (all 6), single-fire guard, reset re-fire, cannon counts  |
| `src/test/useIdleAttract.test.ts` | 13    | Phase-1 attract (5 s), Phase-2 session end (10 s), resetNow(), sessionStart update, **pointermove must NOT dismiss** |
| `src/test/useParentLock.test.tsx` | 7     | 5-tap lock, body-tap reset, time-gap reset, unlock, re-lock                |

Total: **72 tests, all passing.**

Run tests:
```bash
npm test          # single run
npm run test:watch  # watch mode
```

---

## 🛠️ Dev Scripts

| Script              | Command              | Notes                              |
|---------------------|----------------------|------------------------------------|
| Start dev server    | `./start.sh`         | Runs `npm run dev`, logs to file   |
| Stop dev server     | `./stop.sh`          | Kills process on port 5175         |
| Manual dev          | `npm run dev`        | Vite dev server → localhost:5175   |
| Build               | `npm run build`      | `tsc -b && vite build`             |
| Preview build       | `npm run preview`    | Serves `dist/` locally             |
| Lint                | `npm run lint`       | oxlint on `src/`                   |
| Test (once)         | `npm test`           | Vitest run                         |
| Test (watch)        | `npm run test:watch` | Vitest watch                       |

---

## 🌐 Deployment

### Cloudflare Pages
| Field               | Value                                              |
|---------------------|----------------------------------------------------|
| Project name        | `littlepings`                                      |
| Production URL      | `https://littlepings.pages.dev/`                   |
| Production branch   | `main`                                             |
| Build command       | `npm run build`                                    |
| Build output dir    | `dist`                                             |
| Node version        | `20` (pinned via `.nvmrc` + `.node-version`)       |
| Deploy command      | Blank (GitHub Actions handles deploy)              |
| wrangler.toml       | `pages_build_output_dir = "./dist"` — Pages config |

### GitHub Actions CI (`.github/workflows/ci.yml`)
On every push to `main`:
1. `npm ci` — install deps
2. `npm run lint` — oxlint
3. `npm test` — 72 Vitest tests
4. `npm run build` — `tsc -b && vite build`
5. `npx wrangler@4 pages deploy dist --project-name=littlepings --branch=main`

### Required GitHub Secrets
| Secret             | Purpose                          |
|--------------------|----------------------------------|
| `CF_API_TOKEN`     | Cloudflare API token (Pages Edit)|
| `CF_ACCOUNT_ID`    | Cloudflare account ID            |

### Custom Domain (pending)
To connect a custom domain (e.g. `littlepings.com`):
- Cloudflare Dashboard → Workers & Pages → `littlepings` → Custom domains → Add domain
- Cloudflare auto-provisions DNS + SSL (~60 seconds)

---

## ⚠️ Known Issues / Open Tasks

### 🔴 Must Fix
_(none currently)_

### 🟡 Pending Cleanup
_(none — all debug `console.log` calls removed)_

### 🟢 Enhancement Ideas
1. **Custom domain** — connect `littlepings.com` via Cloudflare Pages → Custom domains.
2. **PWA icons** — SVG icons work but PNG (192 × 512 px) recommended for full iOS/Android home-screen compatibility. Add a `sharp`-based generation script.
3. **Parent lock PIN** — currently hardcoded to `1234`. Consider a settings screen to customise it.
4. **Mobile keyboard overlay** — `TouchZone` generates a random char on tap. A virtual keyboard overlay would give a richer mobile experience.
5. **Attract screen personalisation** — show last session's milestone/high-score to entice kids back.
6. **Analytics** — Cloudflare Pages Analytics (free, privacy-first) to track visits and usage.

---

## 📐 Conventions

- **Path alias**: always use `@/` for `src/` imports (e.g. `@/context/GameContext`).
- **Stable callbacks**: zero-dep `useCallback` + refs pattern — do not add state deps to core handlers.
- **Audio isolation**: audio code must never propagate exceptions to the counter/state path.
- **Theme switching**: never reset `smashCount` on theme change — counter must persist.
- **Cross-browser**: fullscreen, audio resume, and input handling must work on Chrome, Firefox, Safari, and Edge.
- **Font**: Nunito (imported via CSS) for all game UI text.
- **No StrictMode** in `main.tsx` — document reason in any PR that touches this.

---

## 🗓️ Session Log

| Date       | Changes                                                                 |
|------------|-------------------------------------------------------------------------|
| 2026-09-29 | **🚀 Deployed to Cloudflare Pages.** Live at `https://littlepings.pages.dev/`. GitHub Actions CI pipeline: lint → 72 tests → build → `wrangler pages deploy`. Fixed peer dependency conflict (`@testing-library/react@15` → `@16`, `vitest@1` → `@2`, `vite-plugin-pwa@1.3.0` → `@0.21.2`). Added `.nvmrc`, `.node-version` (Node 20), `wrangler.toml` (`pages_build_output_dir`), `public/_redirects`, `public/_headers`. Pushed 94 objects to `github.com/varanrajesh/littlepings`. Cloudflare Pages project created via `wrangler pages project create`. Restore point `v1.2.0` tagged. |
| 2026-09-29 | **Calmer theme palette.** All 6 themes redesigned with eye-friendly, classy colours instead of saturated/neon tones. Backgrounds use muted gradients (dusty rose, slate teal, sage green, warm charcoal, terracotta, pale steel). `bubbleColors` desaturated to muted berry/slate/moss/violet/sienna/steel tones. `accent` & `letterColor` updated to match. `bgPattern` overlay switched from `mixBlendMode: overlay @ 0.6` → `multiply @ 0.35` to prevent halo bleed. Bubble letter `textShadow` softened (removed wide 60px glow). 72 tests, all passing. |
| 2025-07-10 | Project renamed from `LttlePings` → `LittlePings`. Fixed `index.html` `<title>` from `littlepings` → `LittlePings`. Created this `MEMORY.md`. |
| 2025-07-10 | Removed debug `console.log` from `useKeyboard.ts` and `HUD.tsx`. Rewrote `useKeyboard.test.tsx` with real hook mount (`HookHarness`), covering all blocked keys, modifier combos, valid keys, arrow/space symbol maps, and debounce — 22 tests. Updated `README.md` with full LittlePings docs. All 34 tests passing. |
| 2025-07-10 | Implemented 4 major features: (1) Confetti burst at milestones 10/50/100/500 (`useConfetti.ts` + `MilestoneBanner.tsx`). (2) Parent lock screen — 5× top-right corner taps within 1.5 s, PIN "1234" (`useParentLock.ts` + `LockScreen.tsx`). (3) Idle attract screen after 30 s inactivity (`useIdleAttract.ts` + `AttractScreen.tsx`). (4) PWA support — `manifest.json`, `vite-plugin-pwa` Workbox service worker, full `<head>` meta tags, SVG icons. Added 24 new tests (useConfetti × 10, useIdleAttract × 7, useParentLock × 7). Total: 58 tests, all passing. |
| 2025-07-10 | Extended milestones: added 1000 ("UNSTOPPABLE! 🌟") and 2000 ("ABSOLUTE CHAMPION! 🏆") to `useConfetti.ts` and `MilestoneBanner.tsx`. 1000/2000 fire 4 corner cannons + centre (5 bursts). Increased `AttractScreen` emoji rain from 8 types × 1 pass to 24 emoji types × 48 particles (full-viewport coverage). Added `ParentLockInfo.tsx` — bottom-left 🔒 button that opens an in-app tooltip explaining the 5× corner-tap gesture and PIN unlock for parents. Added 4 new confetti tests (1000/2000 milestone + cannon-count assertions). Total: 62 tests, all passing. |
| 2025-07-10 | **Alphabet size reduced + emoji promoted to hero.** `makeBubble` in `GameContext.tsx`: `fontSize` range cut from 5–13 rem → **2.5–5 rem**; every bubble now always has an emoji (no random skip). `BubbleLayer.tsx` layout inverted: emoji is now rendered **above** the letter, at `fontSize × 1.35` (was below at `0.82×`) — emoji is the hero, letter is the small label beneath. Emoji entry animation changed from simple scale-in to a **cracker-burst** (scale overshoot → wobble → settle with rotation). `AttractScreen.tsx` rebuilt as 120-particle 6-wave rain + 16 cracker-burst particles orbiting the centre card. Centre card now has frosted-glass styling. All 72 tests passing.  |
| 2025-07-10 | **3 fixes + 2 enhancements:** (1) **Hover bug fixed** — removed `pointermove` from idle-reset listeners so hovering the Play Again button no longer dismisses the session-end screen. `handlePlayAgain` simplified (no more `setTimeout(0)` race). (2) **Attract screen** — rebuilt as 4-wave × 20 particles = 80 particles total; theme-aware emoji pools (30 per theme); 3 size tiers; horizontal drift per particle. (3) **Emoji size in bubbles** — `BubbleLayer.tsx` emoji multiplier raised from `0.45×` to `0.82×` so emoji visually matches the letter above it. (4) **`popEmojis` expanded** — all 6 themes now have 20 theme-specific emojis (was 10). (5) **1 regression test added** (`pointermove must NOT reset idle timer`). Total: 72 tests, all passing. |
| 2025-07-10 | Idle attract refactored to two-phase: Phase 1 = 5 s → emoji rain (`AttractScreen`), Phase 2 = 10 s → session summary (`SessionEndScreen`). Created `SessionEndScreen.tsx`: full dark overlay with animated 🏆, headline (scales with smash count), stat cards (keys / time / keys-per-min), milestone badges reached, confetti burst on mount, themed "Play Again" button that calls `resetNow()`. `useIdleAttract` now exposes `isSessionEnded`, `sessionStart`, and `resetNow()`. `AttractScreen` suppressed while session end is active. `PlayField` wired. `useIdleAttract` tests expanded: Phase-1 suite (6 tests) + Phase-2 suite (6 tests). Total: 67 tests, all passing. |
