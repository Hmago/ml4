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
├── main.js               # Electron main process — window, menu, app:// protocol handler
├── preload.js            # Sandboxed preload (currently a no-op)
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

## Common npm scripts

| Script                    | What it does                                                                       |
|---------------------------|------------------------------------------------------------------------------------|
| `npm start`               | Launch Electron against the live repo (no rebuild needed).                         |
| `npm run dev`             | Same as `start`, plus DevTools open and menu bar visible.                          |
| `npm run icon`            | Regenerate `build/icon.ico` from `../icon-512.svg`.                                |
| `npm run build`           | Full Windows build: NSIS installer **and** portable exe (x64).                     |
| `npm run build:installer` | NSIS installer only.                                                               |
| `npm run build:portable`  | Portable single-exe only.                                                          |

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
