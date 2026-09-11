# KTV 提詞機

*[English](README.en.md)*

專為視障者設計的 KTV 演唱輔助工具。使用者戴著耳機，App 會在每一句歌詞開唱前幾秒，透過手機的螢幕閱讀器把下一句念進耳機，讓使用者不必依賴螢幕就能跟上演唱節奏。

離線優先：歌詞事先下載好，進了包廂沒網路也能用。

---

## 使用情境

1. 有網路時，在「下載」頁搜尋歌曲，把歌詞抓下來存進手機。
2. 到 KTV，點好歌、戴上耳機、打開 App，在「歌曲」頁選同一首。
3. 點播放。**同時**在點歌機上開始播放音樂。
4. 聽到第一句歌詞開唱的瞬間，按下「校正」—— App 的時間軸就對上真實音樂了。
5. 之後每一句都會提前幾秒被念進耳機。

第 4 步是關鍵：App 聽不到音樂，只能靠使用者手動對時。

---

## 快速開始

```bash
npm install
npm run dev
```

| 指令 | 用途 |
|---|---|
| `npm run dev` | 開發伺服器（加 `-- --host` 可用手機連進來測） |
| `npm run build` | `tsc -b && vite build`，型別錯誤會擋住建置 |
| `npm run typecheck` | 只跑 `tsc -b`（兩份 tsconfig 都設了 `noEmit`，所以是純型別檢查） |
| `npm run preview` | 預覽建置結果，**測 PWA 離線行為要用這個** |
| `npm run lint` | ESLint |

開發環境為 Node 20。`.npmrc` 設了 `legacy-peer-deps=true`，用來略過 shadcn / base-ui 之間的 peer dependency 衝突。

---

## 技術棧

| 領域 | 選用 | 版本 |
|---|---|---|
| 框架 | React（StrictMode） | 19 |
| 語言 | TypeScript | 6 |
| 建置 | Vite | 8 |
| 路由 | React Router（`createBrowserRouter`） | 7 |
| 狀態 | Zustand（含 `persist` middleware） | 5 |
| 樣式 | Tailwind CSS v4（CSS-first，**無 `tailwind.config.js`**） | 4 |
| UI 元件 | shadcn（base-nova style）+ Base UI | — |
| 圖示 | Heroicons | 2 |
| 字體 | Geist Variable（`@fontsource-variable/geist`） | — |
| PWA | `vite-plugin-pwa`（Workbox） | 1 |
| 歌詞來源 | [LRCLIB](https://lrclib.net) 開源歌詞 API | — |
| 部署 | Vercel（`vercel.json` 做 SPA rewrite） | — |

Tailwind v4 的設計 token 與共用 class 全部寫在 `src/index.css` 的 `@theme` 與 `@utility` 區塊，不要去找 config 檔。

---

## 核心機制

### 提詞是怎麼發出聲音的

**這個 App 沒有使用任何 TTS。** 沒有 Web Speech API、`speechSynthesis`，也沒有第三方語音套件。

實際發聲的是**使用者手機上的螢幕閱讀器**：iOS 的 VoiceOver、Android 的 TalkBack。流程如下：

```
usePlayer 判斷「該提詞了」
   └─▶ useAnnounce 的 say(text)
          ├─ 先把 state 設成 ''
          └─ 50ms 後設成 text
                 └─▶ React 更新這個節點：
                     <div aria-live="assertive" aria-atomic="true" class="sr-only">
                       {announcement}
                     </div>
                        └─▶ 螢幕閱讀器偵測到 DOM 變動 → 念出來 → 進耳機
```

幾個關鍵設計：

- **`aria-live="assertive"`**：會打斷螢幕閱讀器正在念的其他內容。這是刻意的 —— 遲到的提詞等於沒有提詞。
- **先清空再設值**：連續兩次播報相同字串時，若不先清空就不會產生 DOM 變動，螢幕閱讀器不會有反應。這是 `useAnnounce` 裡那 50ms 延遲的唯一理由。
- **`.sr-only` 而非 `display:none`**：必須用視覺隱藏但仍留在無障礙樹上的做法，`display:none` 會讓節點徹底消失、永久失聲。
- **視覺歌詞卡片全部 `aria-hidden="true"`**：`LyricCard` 的三種變體都對螢幕閱讀器隱藏，避免使用者滑動探索時念出的內容跟提詞節奏打架。畫面是給陪同的明眼人看的，`aria-live` 區塊是唯一的聽覺出口。

選擇螢幕閱讀器而非自帶 TTS 的理由：使用者已經熟悉自己慣用的語音與語速設定，不需要額外權限，也不需要網路。

### 歌詞從哪裡來、存在哪裡

**來源**：[LRCLIB](https://lrclib.net) 公開 API，無需 API key。`src/services/lrclibApi.ts` 包了兩個端點：

- `GET /api/search?q=` → 搜尋（取前 20 筆）
- `GET /api/get/:id` → 取單曲歌詞

**解析**：優先使用 `syncedLyrics`（LRC 格式，帶時間軸），用正則 `/^\[(\d+):(\d+\.\d+)\](.*)$/` 逐行解析成：

```ts
interface LyricLine {
  time: number                      // 開唱秒數
  text: string
  type: 'lyric' | 'interlude'       // 以 ♪ 或 ( 開頭者判為間奏
}
```

**沒有 `syncedLyrics` 的曲目會被擋掉**：搜尋結果只列出帶時間軸的歌，`getLyrics()` 遇到只有 `plainLyrics` 的資料會直接 `throw`，由 `DownloadPage` 播報「下載失敗」。沒有時間軸的歌詞當不了提詞機，寧可當場失敗也不要塞假時間軸。

**儲存**：整首歌連同歌詞陣列，透過 Zustand `persist` 寫進 **localStorage**。

| localStorage key | 內容 | 寫入者 |
|---|---|---|
| `ktv-songs` | 已下載歌曲陣列，含完整 `lyrics` | `stores/songStore.ts` |
| `ktv-settings` | 使用者設定（提前秒數、歌詞字級，以及尚無 UI 的 `haptic` / `hapticBeat` 旗標） | `stores/settingsStore.ts` |
| `ktv-onboarded` | 是否看過引導頁 | `pages/OnboardingPage.tsx`、`router/index.tsx` |

播放狀態（`elapsed` / `playing`）存在 `stores/playerStore.ts`，**只在記憶體中，不持久化**。至於正在播哪一首歌則完全不存 —— 網址才是唯一真相。

localStorage 約有 5MB 上限，可存約1000-2500首，歌量大時應改用 IndexedDB。

### 時間軸與校正

App 內部有一個自己數的碼表 `elapsed`，跟真實音樂沒有任何自動同步。三個時間變數：

- `line.time` —— 這句歌詞開唱的秒數（來自 LRC）
- `advance` —— 提詞要比開唱早幾秒（使用者可調 1–12 秒，預設 5）
- `elapsed` —— App 碼表現在走到幾秒

提詞觸發條件是 `elapsed ∈ [line.time - advance, line.time)`。

**校正按鈕**把 `elapsed` 一次性搬到「下一句尚未開唱的歌詞」的 `time` 上 —— 因為使用者是在聽到那句開唱的瞬間按下按鈕的。校正只改基準點，不影響提前量：

```
實際提前量 = advance − 校正誤差
```

注意 `advance` 算的是「開始念」到「開唱」的間隔，不是「念完」。一句中文歌詞 VoiceOver 要念 2–3 秒，這段時間會從提前量裡扣掉，所以預設值才設到 5 秒。

### 離線與 PWA

目標情境：**使用者人在 KTV 包廂、沒有網路，App 必須能開得起來並從頭唱到尾。**

達成這件事需要四項機制，分別解決不同的失敗點：

| 情境 | 靠什麼 | 設定在哪 | 產出在哪 |
|---|---|---|---|
| 沒網路時 App 能開起來 | precache app shell（HTML / JS / CSS / 字體 / icon，共 16 個檔案） | `vite.config.ts` → `workbox.globPatterns`、`includeAssets` | `dist/sw.js` 的 `precacheAndRoute()` |
| 沒網路時深層網址能開<br>（主畫面圖示直接進 `/player/123`、離線重新整理） | NavigationRoute 攔截導覽請求，回快取的 `index.html` | **plugin 預設值**，`vite.config.ts` 裡沒有 | `dist/sw.js` 的 `NavigationRoute` |
| 有網路時深層網址能開 | 伺服器把所有路徑 rewrite 到 `index.html` | `vercel.json` | Vercel 平台 |
| 唱歌時讀得到歌詞 | **localStorage，完全不經過 SW** | `stores/songStore.ts` 的 `persist({ name: 'ktv-songs' })` | 瀏覽器 localStorage |

第二、三項是同一個 SPA 路由問題的兩半，缺一不可：少了 `vercel.json`，線上直接開 `/library` 會 404；少了 NavigationRoute，離線時開 `/player/123` 會失敗。

第四項最容易誤解 —— **已下載歌曲的離線能力跟 service worker 無關**，歌詞在下載當下就寫進 localStorage 了。

另外還有一項不影響核心流程的：LRCLIB API 的 `NetworkFirst` 快取（`vite.config.ts` → `workbox.runtimeCaching` → `dist/sw.js` 的 `registerRoute()`，200 筆、30 天），只讓離線時還能重看先前的搜尋結果。

#### 幾個找不到東西時會卡住的點

- **`src/` 裡沒有任何 service worker 程式碼。** 沒有 `navigator.serviceWorker`、沒有 `registerSW`。整個 SW 由 `vite-plugin-pwa` 在 build 時生成，只存在於 `dist/`：`sw.js`（本體）、`registerSW.js`（註冊）、`workbox-*.js`（runtime），並在 `dist/index.html` 注入一行 `<script src="/registerSW.js">`。
- **有些行為來自 plugin 預設，翻 `vite.config.ts` 找不到。** `navigateFallback: "index.html"` 與 `cleanupOutdatedCaches: true` 定義在 `node_modules/vite-plugin-pwa/dist/index.js`，要改必須在 `workbox` 裡顯式覆蓋。
- **`registerType: 'autoUpdate'`** 讓 SW 帶上 `skipWaiting()` + `clientsClaim()`，新版本一部署就接管，使用者不必手動重新整理。
- **SW 只在 production build 生效**，`npm run dev` 不會產生。測離線請用 `npm run build && npm run preview`。

Manifest 設定為 `standalone` + `portrait`，可加到主畫面當原生 App 用。

---

## 專案結構

```
src/
├── components/          # 依 Atomic Design 分層
│   ├── atoms/           # Badge, ProgressBar, Spinner
│   ├── molecules/       # LyricCard, SongRow, SettingRow, StatusPill…
│   ├── organisms/       # LyricsDisplay, PlayerControls, SongList…
│   ├── templates/       # PageHeader, TabLayout
│   └── ui/              # shadcn 產生的元件（button, slider）
├── hooks/
│   ├── usePlayer.ts     # ★ 碼表、提詞觸發、校正 —— 專案核心
│   ├── useAnnounce.ts   # ★ 螢幕閱讀器播報
│   └── useHaptic.ts     # navigator.vibrate 包裝（iOS 不支援）
├── lib/
│   ├── songPalette.ts   # 字級對照表、依 id 決定的封面漸層
│   └── utils.ts         # cn()
├── pages/               # Onboarding, Library, Download, Player, Settings
├── router/index.tsx
├── services/lrclibApi.ts  # ★ LRCLIB 呼叫與 LRC 解析
├── stores/              # songStore, playerStore, settingsStore
├── types/               # song.ts, settings.ts
└── index.css            # ★ Tailwind v4 @theme / @utility 全在這
```

路徑別名 `@/*` → `src/*`（`tsconfig.app.json` 與 `vite.config.ts` 都有設）。

---

## 路由

| 路徑 | 頁面 | 說明 |
|---|---|---|
| `/` | — | 依 `ktv-onboarded` 導向 `/onboarding` 或 `/library` |
| `/onboarding` | OnboardingPage | 歡迎 + 三項功能介紹，共四頁，可略過 |
| `/library` | LibraryPage | 已下載歌曲清單（含底部 tab bar） |
| `/download` | DownloadPage | 搜尋並下載 LRCLIB 歌詞 |
| `/settings` | SettingsPage | 提前秒數、歌詞字級、清除快取 |
| `/player/:songId` | PlayerPage | 提詞畫面（**無 tab bar**） |

`/library`、`/download`、`/settings` 共用 `TabLayout`，切頁時會自動把焦點移到該頁的 `<h1>`，讓螢幕閱讀器知道換頁了。

`:songId` 是播放哪一首歌的唯一真相：`PlayerPage` 用它去 `songStore` 撈歌，所以這個網址可以直接開啟、也能重新整理。撈不到就導回 `/library`。

---

## 無障礙設計要點

這是本專案的主要需求，改動時請留意：

- 提詞透過 `aria-live="assertive"` 區塊送給螢幕閱讀器，視覺歌詞卡片一律 `aria-hidden`。
- 所有可點擊元素至少 44×44px。
- 換頁後自動聚焦標題，播放頁載入完成後聚焦歌詞區。
- 間奏會震動提示，但 `navigator.vibrate` 僅 Android 支援，iOS 上會靜默失敗且目前沒有替代提示。
- 全站深色配色（`index.html` 直接掛 `class="dark"`），歌詞字級 16–32px 可調。
- 支援 iOS safe area（`viewport-fit=cover` + `env(safe-area-inset-*)`）。

---

## 部署

推上 Git 由 Vercel 自動建置。`vercel.json` 把所有路徑 rewrite 到 `/index.html`，這是 SPA 前端路由的必要設定 —— 少了它，直接開啟 `/library` 會 404。它只負責「有網路」的情境，離線時由 service worker 的 NavigationRoute 接手 —— 兩者的分工見〈[離線與 PWA](#離線與-pwa)〉。

