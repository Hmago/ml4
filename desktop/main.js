// Electron main process for ML Study Notes desktop app.
// Wraps the existing single-page web app inside a native Win32 window.

const { app, BrowserWindow, Menu, shell, protocol, net, ipcMain } = require('electron');
const path = require('node:path');
const url = require('node:url');
const fs = require('node:fs');

const isDev = process.argv.includes('--dev');

// In dev mode we serve content directly from the repo root (../).
// In a packaged build we serve from `process.resourcesPath/app` (see electron-builder.extraResources).
function getContentRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app');
  }
  return path.resolve(__dirname, '..');
}

const CONTENT_ROOT = getContentRoot();

// Track the main window so the auto-updater event handlers can push status
// updates into the renderer.
let mainWindow = null;

// Register a custom `app://` scheme as privileged so it can use fetch + service workers
// and behaves like a secure origin (needed because the app uses fetch() to load .md files).
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function safeResolve(requestPath) {
  // Normalize and prevent path traversal outside CONTENT_ROOT.
  const decoded = decodeURIComponent(requestPath);
  const cleaned = decoded.replace(/^\/+/, '');
  const resolved = path.normalize(path.join(CONTENT_ROOT, cleaned));
  if (!resolved.startsWith(CONTENT_ROOT)) {
    return null;
  }
  return resolved;
}

function registerAppProtocol() {
  // Electron >= 25 exposes `protocol.handle`.
  protocol.handle('app', async (request) => {
    try {
      const reqUrl = new URL(request.url);
      // Treat host as ignored; only the pathname matters. e.g. app://./index.html
      let pathname = reqUrl.pathname;
      if (!pathname || pathname === '/' || pathname === '') {
        pathname = '/index.html';
      }
      const filePath = safeResolve(pathname);
      if (!filePath) {
        return new Response('Forbidden', { status: 403 });
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        return new Response('Not Found', { status: 404 });
      }
      return net.fetch(url.pathToFileURL(filePath).toString());
    } catch (err) {
      console.error('app:// protocol error:', err);
      return new Response('Internal Error', { status: 500 });
    }
  });
}

// ─── Auto-update (electron-updater) ────────────────────────────────────────
// Checks GitHub Releases for a newer version, downloads in the background,
// and lets the renderer trigger "Quit & install" via IPC. Configuration
// (provider: github, owner/repo) lives in package.json under `build.publish`.
//
// The updater is wired up only in packaged builds — in dev mode there is no
// stable app.getVersion() vs release flow to compare against, and trying to
// run it would fail noisily inside `npm start`.
let updateStatus = { state: 'idle' };

function broadcastUpdaterStatus(state, extras) {
  updateStatus = Object.assign({ state }, extras || {});
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:status', updateStatus);
  }
}

function setupAutoUpdater() {
  // Always register the IPC handlers (renderer asks for version even in dev).
  ipcMain.handle('updater:get-version', () => app.getVersion());
  ipcMain.handle('updater:get-status', () => updateStatus);
  ipcMain.handle('updater:is-packaged', () => app.isPackaged);

  if (!app.isPackaged) {
    // In dev mode, expose a stub so the renderer UI can still render with
    // a friendly "auto-update disabled in dev" message instead of crashing.
    ipcMain.handle('updater:check', () => ({ ok: false, error: 'Auto-update is disabled in dev mode.' }));
    ipcMain.handle('updater:download', () => ({ ok: false, error: 'Auto-update is disabled in dev mode.' }));
    ipcMain.handle('updater:install', () => ({ ok: false, error: 'Auto-update is disabled in dev mode.' }));
    return;
  }

  let autoUpdater;
  try {
    autoUpdater = require('electron-updater').autoUpdater;
  } catch (e) {
    console.error('electron-updater not installed; auto-update disabled.', e);
    broadcastUpdaterStatus('error', { message: 'electron-updater module not available' });
    return;
  }

  // We download only after explicit user consent (so the user always sees
  // the "Update available — Download now?" UI rather than a surprise
  // background fetch eating their bandwidth).
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;

  autoUpdater.on('checking-for-update', () => broadcastUpdaterStatus('checking'));
  autoUpdater.on('update-available', info => broadcastUpdaterStatus('available', {
    version: info && info.version,
    releaseNotes: info && info.releaseNotes,
    releaseName: info && info.releaseName,
  }));
  autoUpdater.on('update-not-available', info => broadcastUpdaterStatus('not-available', {
    version: info && info.version,
  }));
  autoUpdater.on('download-progress', p => broadcastUpdaterStatus('downloading', {
    percent: p && typeof p.percent === 'number' ? Math.round(p.percent) : 0,
    bytesPerSecond: p && p.bytesPerSecond,
    transferred: p && p.transferred,
    total: p && p.total,
  }));
  autoUpdater.on('update-downloaded', info => broadcastUpdaterStatus('downloaded', {
    version: info && info.version,
  }));
  autoUpdater.on('error', err => broadcastUpdaterStatus('error', {
    message: err && err.message ? err.message : String(err),
  }));

  ipcMain.handle('updater:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { ok: true, version: result && result.updateInfo && result.updateInfo.version };
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      broadcastUpdaterStatus('error', { message: msg });
      return { ok: false, error: msg };
    }
  });

  ipcMain.handle('updater:download', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { ok: true };
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      broadcastUpdaterStatus('error', { message: msg });
      return { ok: false, error: msg };
    }
  });

  ipcMain.handle('updater:install', () => {
    // `isSilent`, `isForceRunAfter` — restart the new version once the
    // installer finishes. The current app process exits immediately.
    autoUpdater.quitAndInstall(false, true);
    return { ok: true };
  });

  // Silent background check ~5s after launch. If an update is available,
  // the renderer gets a status message and can surface it (toast/badge).
  // We don't auto-download — user clicks "Download" from the Dashboard.
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => {
      // Network errors at startup are common (offline / corp proxy / GH
      // rate-limited). Log but don't surface — the user can still
      // manually retry via the Dashboard.
      console.warn('Background update check failed:', err && err.message);
    });
  }, 5000);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'ML Study Notes',
    backgroundColor: '#0f172a',
    autoHideMenuBar: !isDev,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  mainWindow.loadURL('app://./index.html');

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => { mainWindow = null; });

  // Open external links (http/https) in the user's default browser instead of a new Electron window.
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (/^https?:\/\//i.test(targetUrl)) {
      shell.openExternal(targetUrl);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, targetUrl) => {
    const current = mainWindow.webContents.getURL();
    if (targetUrl !== current && /^https?:\/\//i.test(targetUrl)) {
      event.preventDefault();
      shell.openExternal(targetUrl);
    }
  });
}

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates…',
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              // Renderer-side handler shows the Dashboard's updater section
              // and triggers a check. Falls back to invoking the IPC directly
              // if the renderer doesn't register a listener.
              mainWindow.webContents.send('updater:menu-check');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'About ML Study Notes',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox({
              type: 'info',
              title: 'About',
              message: 'ML Study Notes',
              detail:
                'A comprehensive ML learning platform.\n\n' +
                `Version: ${app.getVersion()}\n` +
                `Electron: ${process.versions.electron}\n` +
                `Chromium: ${process.versions.chrome}\n` +
                `Node: ${process.versions.node}`,
            });
          },
        },
        {
          label: 'View on GitHub',
          click: () => shell.openExternal('https://github.com/Hmago/ml4'),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  registerAppProtocol();
  buildMenu();
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
