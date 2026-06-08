# ML Study Notes — Win32 Desktop App

An [Electron](https://www.electronjs.org/) wrapper around the ML Study Notes web app, packaged as a native Windows (x64) desktop application. The web assets (`index.html`, `styles.css`, `js/`, `content/`, …) live at the repo root and are bundled at build time — there is no duplication.

---

## Contents

- [Prerequisites](#prerequisites)
- [Quick start (run from source)](#quick-start-run-from-source)
- [Building a Windows desktop build](#building-a-windows-desktop-build)
- [Installing the app](#installing-the-app)
- [Uninstalling](#uninstalling)
- [Project layout](#project-layout)
- [How it works](#how-it-works)
- [Auto-update](#auto-update)
- [Releasing a new version](#releasing-a-new-version)
- [Common npm scripts](#common-npm-scripts)
- [Troubleshooting](#troubleshooting)
- [Code signing (optional)](#code-signing-optional)

---

## Prerequisites

| Requirement | Version                | Notes                                                                                                  |
|-------------|------------------------|--------------------------------------------------------------------------------------------------------|
| Windows     | 10 or 11 (x64)         | Building and running.                                                                                  |
| Node.js     | 18.x or newer          | Tested on Node 24. `node --version` / `npm --version` to check.                                        |
| npm         | bundled with Node      | Used to install dev deps and run build scripts.                                                        |
| Disk space  | ~1 GB free             | `node_modules/` + cached Electron binary + `dist/` artifacts.                                          |

> **First build only:** electron-builder downloads the Electron runtime (~250 MB cached under `%LOCALAPPDATA%\electron\Cache`) and NSIS tooling (~25 MB). Subsequent builds reuse these caches and finish in seconds.

---

## Quick start (run from source)

To launch the desktop app against the live repo without producing an installer (great for iterating on `index.html`, `styles.css`, `js/`, or `content/`):

```powershell
cd desktop
npm install
npm start
```

For DevTools open and the menu bar always visible:

```powershell
npm run dev
```

Any changes to web assets in the parent directory are picked up on the next launch (or via `Ctrl+R` to reload).

---

## Building a Windows desktop build

From the `desktop/` folder:

```powershell
npm install            # one-time
npm run build          # produces BOTH the NSIS installer and the portable exe
```

Or build a single target:

```powershell
npm run build:installer   # NSIS installer only
npm run build:portable    # single-file portable exe only
```

Artifacts are written to `desktop/dist/`:

| File                                                | Type             | Size   | Description                                                                                              |
|-----------------------------------------------------|------------------|--------|----------------------------------------------------------------------------------------------------------|
| `ML Study Notes-<version>-x64-Setup.exe`            | NSIS installer   | ~80 MB | Installs to `%LOCALAPPDATA%\Programs\ML Study Notes` (per-user), creates Start Menu + Desktop shortcuts. |
| `ML Study Notes-<version>-x64-Portable.exe`         | Portable exe     | ~80 MB | Self-contained single executable. No installation required.                                              |
| `win-unpacked/ML Study Notes.exe`                   | Unpacked build   | —      | Runnable unpacked tree, useful for inspection or smoke testing without installing.                       |

The icon is regenerated from `../icon-512.svg` automatically before every build (via the `prebuild` script). To regenerate manually:

```powershell
npm run icon
```

---

## Installing the app

You have three ways to run the desktop build on Windows.

### Option 1 — NSIS Installer (recommended for end users)

1. Double-click **`ML Study Notes-<version>-x64-Setup.exe`** from `desktop\dist\`.
2. On the **SmartScreen** warning (the installer is unsigned), click **More info** → **Run anyway**. See [Code signing](#code-signing-optional) below if you want to remove this warning.
3. Choose an install location when prompted (default: `%LOCALAPPDATA%\Programs\ML Study Notes`).
4. The installer creates:
   - **Start Menu** entry: *ML Study Notes*
   - **Desktop** shortcut: *ML Study Notes*
   - **Add/Remove Programs** entry (per-user) for clean uninstall.
5. Launch from the Start Menu or Desktop shortcut.

### Option 2 — Portable executable (no install)

1. Copy **`ML Study Notes-<version>-x64-Portable.exe`** anywhere — a USB stick, a network share, your `Downloads` folder, etc.
2. Double-click to run. On first launch the exe self-extracts to `%LOCALAPPDATA%\Temp` (managed automatically by the runtime; cleaned up by the OS).
3. Dismiss the SmartScreen warning the first time as in Option 1.

### Option 3 — Run the unpacked build directly

For inspection / debugging without installing:

```powershell
& "desktop\dist\win-unpacked\ML Study Notes.exe"
```

---

## Uninstalling

- **NSIS install:** *Settings → Apps → Installed apps → ML Study Notes → Uninstall*, or run the uninstaller from the install folder.
- **Portable:** Delete the `.exe`. Optionally clear leftover settings under `%APPDATA%\ML Study Notes\`.
- **User data** (LocalStorage, chapter read-progress, quiz state, theme, etc.) lives under `%APPDATA%\ML Study Notes\` and is *not* removed by the uninstaller; delete it manually if you want a clean slate.

---

## Project layout

```
desktop/
├── main.js               # Electron main process — window, menu, app:// protocol handler, auto-updater
├── preload.js            # Sandboxed preload — exposes `window.mlnotes` API to the renderer
├── package.json          # Dependencies + electron-builder config
├── scripts/
│   └── make-icon.js      # Rasterizes ../icon-512.svg → build/icon.ico
├── build/                # Generated build resources (icon.ico, icon.png)
└── dist/                 # Output: installer, portable exe, win-unpacked/ (gitignored)
```

The repo root supplies the actual app content (`index.html`, `styles.css`, `js/`, `content/`, `manifest.json`, SVG icons). It is referenced by `extraResources` in `package.json` and bundled into `resources/app/` inside the packaged build.

---

## How it works

- **Single-process architecture.** The web app is a static SPA already — no Node server is needed at runtime.
- **Custom `app://` protocol.** Electron registers a privileged `app://` scheme at startup. The window loads `app://./index.html`, and every relative `fetch('content/foo.md')` resolves against the bundled `resources/app/` directory. This avoids the CORS / file-fetch restrictions Chromium enforces on `file://` URLs.
- **Sandboxed renderer.** `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. The page has no access to Node APIs.
- **External links** (`http://`, `https://`) are intercepted by `setWindowOpenHandler` / `will-navigate` and opened in the user's default browser instead of a new Electron window.
- **Service worker.** The web app's `sw.js` registration is wrapped in `.catch(() => {})`, so it silently no-ops if the SW fails to register inside Electron. Chapter prefetching still works through the in-memory `cachedContent` warm-cache path.

---

## Auto-update

The desktop app ships with **[electron-updater](https://www.electron.build/auto-update)** wired against **GitHub Releases**. Updates are *opt-in download* — users always click before any data is pulled.

**What users see:**

1. On every launch the app silently checks GitHub Releases ~5 s after startup. No notification if nothing's new.
2. The **Dashboard** has an **App Updates** card showing the current version, status, and a *Check for Updates* button.
3. The menu bar exposes the same flow under **Help → Check for Updates…**.
4. When a new version is found:
   - Status flips to *"Update available: vX.Y.Z"* and the button becomes **Download vX.Y.Z**.
   - Clicking *Download* streams the installer in the background (live progress bar — never blocks the UI).
   - When the download completes, the button becomes **Restart & Install**. Clicking it relaunches the app on the new version.
5. Errors and *"You are on the latest version"* messages render in-place; no modal dialogs interrupt reading.

**How it's wired** (developer reference):

| Piece                                    | Role                                                                                              |
|------------------------------------------|---------------------------------------------------------------------------------------------------|
| `desktop/main.js` → `setupAutoUpdater()` | Lazy-loads `electron-updater`, registers IPC handlers, forwards all 6 updater events to renderer. |
| `desktop/preload.js`                     | Exposes `window.mlnotes.updater` via `contextBridge` (no raw IPC reaches the page).               |
| `js/pages.js` → `renderDesktopUpdaterCard()` / `setupDesktopUpdater()` | Renders the Dashboard panel and subscribes to status pushes. |
| `desktop/package.json` → `build.publish` | Tells electron-builder to publish to `https://github.com/Hmago/ml4/releases`.                     |

**Dev-mode behaviour:** `npm start` runs unpackaged, where electron-updater refuses to operate. The IPC handlers return `{ ok: false, error: '…disabled in dev mode' }` so the renderer can grey-out the button instead of crashing.

> **First-time setup caveat.** Builds before **v1.0.2** do *not* include the updater. To start the auto-update chain, users must install **v1.0.2** manually from the [GitHub Releases page](https://github.com/Hmago/ml4/releases) — every release after that is delivered in-app.

---

## Releasing a new version

Releases are automated by **`.github/workflows/release-desktop.yml`**. Pushing a tag named `desktop-vX.Y.Z` triggers a Windows runner that builds the installer + portable exe and uploads them — along with `latest.yml` (the metadata electron-updater reads) — to a new GitHub Release.

**Full release flow** (5-step recipe):

```powershell
# 1. Bump the version in desktop/package.json
#    (e.g. "version": "1.0.3")
cd desktop
npm version 1.0.3 --no-git-tag-version

# 2. Commit the bump on main
cd ..
git add desktop/package.json desktop/package-lock.json
git commit -m "Desktop v1.0.3"
git push origin main

# 3. Tag the release and push the tag — this is what fires the workflow
git tag desktop-v1.0.3
git push origin desktop-v1.0.3
```

4. Watch the run at <https://github.com/Hmago/ml4/actions/workflows/release-desktop.yml>. It takes ~5–8 min on a fresh runner.

5. Confirm the new Release at <https://github.com/Hmago/ml4/releases>. You should see:
   - `ML Study Notes-1.0.3-x64-Setup.exe`
   - `ML Study Notes-1.0.3-x64-Portable.exe`
   - `latest.yml` ← critical — electron-updater fetches this first
   - `*.blockmap` files (used for delta downloads)

Existing v1.0.2+ users see the new version within ~5 s of next launch.

**Manual / local publish.** To publish from your own machine (e.g. for code-signed builds), set `GH_TOKEN` to a Personal Access Token with `repo` scope and run:

```powershell
cd desktop
$env:GH_TOKEN = "ghp_…"
npm run release
```

**Re-running a failed release.** The workflow also accepts `workflow_dispatch` — open the Actions page → *Build & publish desktop app* → *Run workflow* and pick the tag. electron-builder is idempotent: if the release already exists, it adds missing artifacts; it never overwrites existing ones.

---

## Common npm scripts

| Script                    | What it does                                                                       |
|---------------------------|------------------------------------------------------------------------------------|
| `npm start`               | Launch Electron against the live repo (no rebuild needed).                         |
| `npm run dev`             | Same as `start`, plus DevTools open and menu bar visible.                          |
| `npm run icon`            | Regenerate `build/icon.ico` from `../icon-512.svg`.                                |
| `npm run build`           | Full Windows build: NSIS installer **and** portable exe (x64).                     |
| `npm run build:installer` | NSIS installer only.                                                               |
| `npm run build:portable`  | Portable single-exe only.                                                          |
| `npm run release`         | Build + publish to GitHub Releases (needs `GH_TOKEN`). Used by the CI workflow.    |

---

## Troubleshooting

**`npm install` is slow or fails behind a corporate proxy.**
electron-builder downloads the Electron runtime on first build. Set `ELECTRON_MIRROR`, `HTTP_PROXY`, `HTTPS_PROXY` as needed, then retry.

**Windows SmartScreen blocks the installer / portable exe.**
Expected — the build is unsigned. Click *More info → Run anyway*, or sign the binary (see below).

**Build fails with `cannot find icon.ico`.**
Run `npm run icon` to regenerate it from the SVG, then rebuild. The `prebuild` hook usually handles this automatically.

**Window opens blank or content fails to load.**
Launch with `npm run dev` and check the DevTools console. Most likely a typo in a chapter filename — every `.md` referenced from `js/data/*.js` must exist under `content/`.

**Stale build artifacts.**
Delete `desktop\dist\` and rebuild. The output directory is fully regenerated each time.

---

## Code signing (optional)

The default build is unsigned. For a smoother end-user experience (no SmartScreen warning), supply a code-signing certificate to electron-builder via environment variables:

```powershell
$env:CSC_LINK = "C:\path\to\cert.pfx"          # or a base64-encoded PFX
$env:CSC_KEY_PASSWORD = "<your-pfx-password>"
npm run build
```

electron-builder will sign `ML Study Notes.exe`, the uninstaller, and the installer with `signtool.exe` automatically. See the [electron-builder code-signing docs](https://www.electron.build/code-signing) for more options (EV certs, Azure Key Vault, etc.).
