// Electron main process for ML Study Notes desktop app.
// Wraps the existing single-page web app inside a native Win32 window.

const { app, BrowserWindow, Menu, shell, protocol, net } = require('electron');
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

function createWindow() {
  const win = new BrowserWindow({
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

  win.loadURL('app://./index.html');

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // Open external links (http/https) in the user's default browser instead of a new Electron window.
  win.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (/^https?:\/\//i.test(targetUrl)) {
      shell.openExternal(targetUrl);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.webContents.on('will-navigate', (event, targetUrl) => {
    const current = win.webContents.getURL();
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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
