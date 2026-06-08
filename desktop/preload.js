// Preload script — bridge between the sandboxed renderer and the Electron
// main process. Exposes only narrow, typed APIs through contextBridge — no
// raw `ipcRenderer` or Node access leaks into the page.

const { contextBridge, ipcRenderer } = require('electron');

// `window.mlnotes` is the host API surface for the web app. The web app
// detects it via `window.mlnotes?.isDesktop` to show desktop-only UI
// (currently: the "Check for updates" panel on the Dashboard).
contextBridge.exposeInMainWorld('mlnotes', {
  isDesktop: true,
  platform: process.platform,

  updater: {
    // Returns { ok: bool, version?: string, error?: string }.
    check:       () => ipcRenderer.invoke('updater:check'),
    // Returns { ok: bool, error?: string }. Starts a background download.
    download:    () => ipcRenderer.invoke('updater:download'),
    // Quits the app and runs the downloaded installer. Returns { ok: bool }.
    install:     () => ipcRenderer.invoke('updater:install'),
    // Reads the last-seen status object (state + version/percent/error).
    getStatus:   () => ipcRenderer.invoke('updater:get-status'),
    // The currently-running app version (semver from package.json).
    getVersion:  () => ipcRenderer.invoke('updater:get-version'),
    // True if running a packaged build (electron-updater requires this).
    isPackaged:  () => ipcRenderer.invoke('updater:is-packaged'),

    // Subscribe to live status events pushed from the main process. Returns
    // an unsubscribe function. Status objects look like:
    //   { state: 'idle' | 'checking' | 'available' | 'not-available'
    //          | 'downloading' | 'downloaded' | 'error',
    //     version?, percent?, message?, ... }
    onStatus: (callback) => {
      if (typeof callback !== 'function') return () => {};
      const listener = (_e, data) => {
        try { callback(data); } catch (err) { console.error('updater onStatus callback:', err); }
      };
      ipcRenderer.on('updater:status', listener);
      return () => ipcRenderer.removeListener('updater:status', listener);
    },

    // The Help → "Check for Updates…" menu item fires this so the renderer
    // can scroll the updater panel into view and trigger a fresh check.
    onMenuCheck: (callback) => {
      if (typeof callback !== 'function') return () => {};
      const listener = () => {
        try { callback(); } catch (err) { console.error('updater onMenuCheck callback:', err); }
      };
      ipcRenderer.on('updater:menu-check', listener);
      return () => ipcRenderer.removeListener('updater:menu-check', listener);
    },
  },
});
