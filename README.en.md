# KTV Lyrics Prompter (KTV 提詞機)

*[中文版](README.md)*

A karaoke singing aid built for blind and low-vision users. The singer wears headphones; a few seconds before each line is due, the app feeds the upcoming lyric to the phone's screen reader, which speaks it into their ear. No need to look at the screen to stay on tempo.

Offline-first: download the lyrics ahead of time and the app works with no connection inside the karaoke room.

---

## How it's used

1. While online, search for a song on the **Download** tab and save its lyrics to the phone.
2. At the karaoke place: queue the song on the karaoke machine, put on headphones, open the app, pick the same song on the **Songs** tab.
3. Hit play — **at the same time** as the music starts on the karaoke machine.
4. The moment the first sung line is heard, tap **Calibrate**. The app's timeline is now locked to the real music.
5. From then on, every line is spoken into the headphones a few seconds early.

Step 4 is the crux: **the app cannot hear the music.** Manual calibration is the only way it ever learns where the song actually is.

---

## Quick start

```bash
npm install
npm run dev
```

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (add `-- --host` to reach it from a phone on the same network) |
| `npm run build` | `tsc -b && vite build` — type errors block the build |
| `npm run typecheck` | `tsc -b` on its own (both tsconfigs set `noEmit`, so this is a pure type check) |
| `npm run preview` | Serve the production build — **required for testing PWA offline behaviour** |
| `npm run lint` | ESLint |

Developed on Node 20. `.npmrc` sets `legacy-peer-deps=true` to sidestep peer dependency conflicts between shadcn and Base UI.

---

## Stack

| Area | Choice | Version |
|---|---|---|
| Framework | React (StrictMode) | 19 |
| Language | TypeScript | 6 |
| Build | Vite | 8 |
| Routing | React Router (`createBrowserRouter`) | 7 |
| State | Zustand (with `persist` middleware) | 5 |
| Styling | Tailwind CSS v4 (CSS-first — **no `tailwind.config.js`**) | 4 |
| Components | shadcn (base-nova style) + Base UI | — |
| Icons | Heroicons | 2 |
| Font | Geist Variable (`@fontsource-variable/geist`) | — |
| PWA | `vite-plugin-pwa` (Workbox) | 1 |
| Lyrics source | [LRCLIB](https://lrclib.net) open lyrics API | — |
| Hosting | Vercel (`vercel.json` handles SPA rewrites) | — |

Tailwind v4 design tokens and shared utility classes all live in the `@theme` and `@utility` blocks of `src/index.css`. Don't go looking for a config file.

---

## How it works

### How a prompt actually becomes sound

**This app uses no TTS.** No Web Speech API, no `speechSynthesis`, no third-party speech library.

The voice you hear is **the screen reader already running on the user's phone** — VoiceOver on iOS, TalkBack on Android:

```
usePlayer decides "time to prompt"
   └─▶ useAnnounce's say(text)
          ├─ sets state to '' first
          └─ sets it to text 50ms later
                 └─▶ React updates this node:
                     <div aria-live="assertive" aria-atomic="true" class="sr-only">
                       {announcement}
                     </div>
                        └─▶ screen reader notices the DOM change → speaks it → headphones
```

Four decisions in there that are easy to break:

- **`aria-live="assertive"`** interrupts whatever the screen reader is currently saying. That's deliberate — a prompt that arrives late is no prompt at all.
- **Clear-then-set.** Announcing the same string twice in a row produces no DOM mutation, and no mutation means no announcement. That 50ms delay in `useAnnounce` exists for this reason alone.
- **`.sr-only`, never `display:none`.** The live region must stay in the accessibility tree while being visually hidden. `display:none` removes the node entirely and silences it permanently.
- **Every visual lyric card is `aria-hidden="true"`.** All three `LyricCard` variants are hidden from the screen reader so that swipe-exploring the screen doesn't fight the prompt rhythm. The visuals are for a sighted companion; the live region is the only audio channel.

Why lean on the screen reader instead of shipping a TTS engine: the user is already fluent with their own voice and speech-rate settings, it needs no extra permissions, and it works with no network.

### Where lyrics come from and where they live

**Source:** the public [LRCLIB](https://lrclib.net) API, no API key required. `src/services/lrclibApi.ts` wraps two endpoints:

- `GET /api/search?q=` → search (first 20 results)
- `GET /api/get/:id` → fetch one track's lyrics

**Parsing:** `syncedLyrics` (LRC format, with timestamps) is parsed line by line with `/^\[(\d+):(\d+\.\d+)\](.*)$/` into:

```ts
interface LyricLine {
  time: number                      // seconds into the song when the line is sung
  text: string
  type: 'lyric' | 'interlude'       // lines starting with ♪ or ( are treated as interludes
}
```

**Tracks without `syncedLyrics` are rejected.** Search results list only timestamped tracks, and `getLyrics()` throws when it receives a track that only has `plainLyrics`, which `DownloadPage` surfaces as "download failed". Untimed lyrics cannot drive a prompter, so failing loudly beats fabricating a timeline.

**Storage:** each song, lyrics array included, is written to **localStorage** via Zustand's `persist`.

| localStorage key | Contents | Written by |
|---|---|---|
| `ktv-songs` | Downloaded songs, each with its full `lyrics` array | `stores/songStore.ts` |
| `ktv-settings` | User settings (lead time, lyric font size, plus `haptic` / `hapticBeat` flags that have no UI yet) | `stores/settingsStore.ts` |
| `ktv-onboarded` | Whether onboarding has been seen | `pages/OnboardingPage.tsx`, `router/index.tsx` |

Playback state (`elapsed` / `playing`) lives in `stores/playerStore.ts` and is **in-memory only, never persisted**. Which song is playing is not stored at all — the URL is the source of truth.

localStorage caps out around 5MB, roughly 1,000–2,500 songs. Move to IndexedDB if the library needs to grow beyond that.

### Timeline and calibration

The app runs its own stopwatch, `elapsed`, with no automatic sync to the real music. Three values matter:

- `line.time` — when this line is sung, in seconds (from the LRC file)
- `advance` — how many seconds *before* that the prompt should fire (user-adjustable, 1–12s, default 5)
- `elapsed` — where the app's stopwatch currently is

A prompt fires when `elapsed ∈ [line.time - advance, line.time)`.

**The Calibrate button** moves `elapsed` onto the `time` of the next not-yet-sung line — because the user presses it at the instant they hear that line begin. Calibration only shifts the origin; it never touches the lead time:

```
effective lead = advance − calibration error
```

Note that `advance` measures from *start of speech* to *start of singing*, not from end of speech. A line of Mandarin takes VoiceOver 2–3 seconds to read, and that comes out of the lead. Hence the default of 5 seconds.

### Offline and PWA

The target scenario: **the user is in a karaoke room with no connection, and the app has to launch and run an entire song.**

Four mechanisms get that done, each covering a different failure point:

| Scenario | Mechanism | Configured in | Emitted to |
|---|---|---|---|
| App launches with no network | Precached app shell (HTML / JS / CSS / fonts / icons — 16 files) | `vite.config.ts` → `workbox.globPatterns`, `includeAssets` | `precacheAndRoute()` in `dist/sw.js` |
| Deep URLs open with no network<br>(home-screen icon straight into `/player/123`, offline reload) | NavigationRoute intercepts navigation requests and serves the cached `index.html` | **Plugin default** — not present in `vite.config.ts` | `NavigationRoute` in `dist/sw.js` |
| Deep URLs open *with* network | Server rewrites every path to `index.html` | `vercel.json` | Vercel platform |
| Lyrics are readable while singing | **localStorage — the service worker is not involved at all** | `persist({ name: 'ktv-songs' })` in `stores/songStore.ts` | Browser localStorage |

Rows two and three are two halves of the same SPA-routing problem and you need both: without `vercel.json`, opening `/library` directly in production 404s; without NavigationRoute, opening `/player/123` offline fails.

Row four is the one people get wrong — **offline playback of downloaded songs has nothing to do with the service worker.** The lyrics were written to localStorage at download time.

There's one more mechanism that doesn't affect the core flow: a `NetworkFirst` cache for the LRCLIB API (`vite.config.ts` → `workbox.runtimeCaching` → `registerRoute()` in `dist/sw.js`, 200 entries, 30 days). It only lets you revisit earlier search results while offline.

#### Things you'll waste time looking for

- **There is no service worker code in `src/`.** No `navigator.serviceWorker`, no `registerSW`. The whole thing is generated by `vite-plugin-pwa` at build time and exists only in `dist/`: `sw.js` (the worker), `registerSW.js` (registration), `workbox-*.js` (runtime), plus a `<script src="/registerSW.js">` injected into `dist/index.html`.
- **Some behaviour comes from plugin defaults and is absent from `vite.config.ts`.** `navigateFallback: "index.html"` and `cleanupOutdatedCaches: true` are defined in `node_modules/vite-plugin-pwa/dist/index.js` and merged under your config via `Object.assign`. Override them by naming them explicitly under `workbox`.
- **`registerType: 'autoUpdate'`** (this one *is* in `vite.config.ts`; the plugin default is `'prompt'`) gives the worker `skipWaiting()` + `clientsClaim()`, so a new deploy takes over immediately without asking the user to reload.
- **The service worker only exists in production builds.** `npm run dev` generates nothing. Test offline behaviour with `npm run build && npm run preview`.

The manifest is `standalone` + `portrait`, so the app can be added to the home screen and run like a native app.

---

## Project layout

```
src/
├── components/          # Atomic Design layers
│   ├── atoms/           # Badge, ProgressBar, Spinner
│   ├── molecules/       # LyricCard, SongRow, SettingRow, StatusPill…
│   ├── organisms/       # LyricsDisplay, PlayerControls, SongList…
│   ├── templates/       # PageHeader, TabLayout
│   └── ui/              # shadcn-generated components (button, slider)
├── hooks/
│   ├── usePlayer.ts     # ★ stopwatch, prompt triggering, calibration — the core
│   ├── useAnnounce.ts   # ★ screen reader announcements
│   └── useHaptic.ts     # navigator.vibrate wrapper (unsupported on iOS)
├── lib/
│   ├── songPalette.ts   # font-size map, per-id cover art gradients
│   └── utils.ts         # cn()
├── pages/               # Onboarding, Library, Download, Player, Settings
├── router/index.tsx
├── services/lrclibApi.ts  # ★ LRCLIB calls and LRC parsing
├── stores/              # songStore, playerStore, settingsStore
├── types/               # song.ts, settings.ts
└── index.css            # ★ all Tailwind v4 @theme / @utility lives here
```

Path alias `@/*` → `src/*`, declared in both `tsconfig.app.json` and `vite.config.ts`.

---

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | — | Redirects to `/onboarding` or `/library` based on `ktv-onboarded` |
| `/onboarding` | OnboardingPage | Welcome + three feature screens, four pages total, skippable |
| `/library` | LibraryPage | Downloaded songs (with bottom tab bar) |
| `/download` | DownloadPage | Search and download from LRCLIB |
| `/settings` | SettingsPage | Lead time, lyric font size, clear cache |
| `/player/:songId` | PlayerPage | Prompter screen (**no tab bar**) |

`/library`, `/download` and `/settings` share `TabLayout`, which moves focus to the new page's `<h1>` on every navigation so the screen reader announces the change.

`:songId` is the single source of truth for which song is playing: `PlayerPage` looks it up in `songStore`, so the URL can be opened directly and survives a reload. If the lookup fails, it redirects to `/library`.

---

## Accessibility notes

Accessibility is the whole point of this project, so tread carefully:

- Prompts reach the screen reader through an `aria-live="assertive"` region; every visual lyric card is `aria-hidden`.
- Every tappable target is at least 44×44px.
- Focus moves to the heading after navigation, and to the lyrics region once the player finishes loading.
- Interludes trigger a vibration, but `navigator.vibrate` is Android-only — on iOS it fails silently and there is currently no substitute cue.
- Dark theme throughout (`index.html` hardcodes `class="dark"`); lyric font size is adjustable from 16 to 32px.
- iOS safe areas are handled via `viewport-fit=cover` and `env(safe-area-inset-*)`.

---

## Deployment

Push to Git and Vercel builds it. `vercel.json` rewrites every path to `/index.html`, which is mandatory for client-side routing — without it, opening `/library` directly returns a 404. That only covers the online case; offline, the service worker's NavigationRoute takes over. See [Offline and PWA](#offline-and-pwa) for how the two divide the work.
