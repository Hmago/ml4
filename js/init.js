// ═══════════════════════════════════════════════════════════
// ═══  init.js — boot: theme, sidebar, hash routing, SW     ═══
// ═══════════════════════════════════════════════════════════

// ─── Init ───
initTheme();
applyInteractiveMode();

// ─── Idle-decay: −5 XP per week idle after 14 days of inactivity ───
// Runs once per app load. Caps at −100 XP so returning users aren't devastated.
(function applyIdleDecay() {
  if (typeof interactiveMode === 'undefined' || !interactiveMode) return;
  if (typeof getXP !== 'function' || typeof saveXP !== 'function') return;
  const data = getXP();
  if (!data.lastActive) {
    data.lastActive = new Date().toISOString();
    saveXP(data);
    return;
  }
  const last = new Date(data.lastActive);
  if (isNaN(last.getTime())) return;
  const days = Math.floor((Date.now() - last.getTime()) / 86400000);
  if (days <= 14) return;
  const weeksBeyondGrace = Math.floor((days - 14) / 7);
  if (weeksBeyondGrace < 1) return;
  const decay = Math.min(weeksBeyondGrace * 5, 100);
  data.xp = Math.max(0, data.xp - decay);
  data.lastActive = new Date().toISOString();
  saveXP(data);
  setTimeout(() => {
    if (typeof showToast === 'function') {
      showToast(`−${decay} XP`, `Idle ${days} days — XP decay`, '💤');
    }
  }, 1500);
})();

// Restore sidebar state
if (localStorage.getItem('ml4-sidebar') === 'collapsed' && window.innerWidth > 768) {
  document.body.classList.add('sidebar-collapsed');
}
renderSidebar();
setupScrollProgress();

// Apply saved font size
if (fontSize !== 0) {
  const el = document.getElementById('content');
  if (fontSize === -1) el.classList.add('font-sm');
  if (fontSize === 1) el.classList.add('font-lg');
}

// ─── Router ───
// Defines pushHash(h) — used by render functions to push a new history entry
// and routeFromHash() — re-renders the current page when the user hits Back/Forward.
// A _navFromPopstate flag suppresses pushState during popstate-driven renders
// so Back/Forward doesn't create duplicate history entries.
//
// _lastRoutedHash records the hash currently on screen. Fragment-only history
// traversal fires BOTH popstate and hashchange, and both listeners below call
// routeFromHash — without this guard a single Back press would render the
// chapter twice (two fetches, two marked/KaTeX/highlight passes). pushHash
// keeps the key in sync so sidebar navigation doesn't leave it stale.
let _navFromPopstate = false;
let _lastRoutedHash = null;
function pushHash(h) {
  _lastRoutedHash = h;
  if (_navFromPopstate) return;
  if (window.location.hash.slice(1) === h) return;
  history.pushState(null, '', '#' + h);
}
function routeFromHash() {
  const hash = window.location.hash.slice(1);
  if (hash === _lastRoutedHash) return;
  _lastRoutedHash = hash;
  _navFromPopstate = true;
  try {
    if (hash === 'home' || hash === '') {
      renderWelcome();
    } else if (hash === 'dashboard') {
      showDashboard();
    } else if (hash === 'goals') {
      showGoals();
    } else if (hash === 'motivation') {
      showMotivation();
    } else if (hash === 'dsa-practice') {
      showDSAPractice();
    } else if (hash === 'mock-test') {
      showMockTest();
    } else if (hash.startsWith('dsa-problem-')) {
      showDSAProblem(hash.replace('dsa-problem-', ''));
    } else if (hash) {
      const hashLower = hash.toLowerCase();
      const idx = chapters.findIndex(ch => ch.file && ch.file.replace('.md', '').toLowerCase() === hashLower);
      if (idx >= 0) loadChapter(idx);
      else renderWelcome();
    }
  } finally {
    _navFromPopstate = false;
  }
}
window.addEventListener('popstate', routeFromHash);

// Anchor-driven hash changes (in-content cross-chapter links like
// `[Ch 29](#content/29_gpus_tpus_infrastructure)`) fire `hashchange`, not
// `popstate`, so they would otherwise rewrite the URL without navigating.
// Route only hashes we recognise — unknown fragments are in-page heading
// anchors and must keep their default scroll behaviour. The _lastRoutedHash
// check inside routeFromHash absorbs the duplicate call on Back/Forward.
function isRoutableHash(hash) {
  if (!hash) return true;
  if (['home', 'dashboard', 'goals', 'motivation', 'dsa-practice', 'mock-test'].includes(hash)) return true;
  if (hash.startsWith('dsa-problem-')) return true;
  const hashLower = hash.toLowerCase();
  return chapters.some(ch => ch.file && ch.file.replace('.md', '').toLowerCase() === hashLower);
}
// Match the reader TOC: scroll local anchors without replacing the chapter route.
document.getElementById('content').addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const hash = link.getAttribute('href').slice(1);
  if (isRoutableHash(hash)) return;
  const target = document.getElementById(hash);
  if (!target || !document.getElementById('content').contains(target)) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: 'smooth' });
});
window.addEventListener('hashchange', () => {
  if (isRoutableHash(window.location.hash.slice(1))) routeFromHash();
});

// Initial hash-based route (preserves the page across hard refresh)
routeFromHash();

// ─── Close DSA filter dropdowns when clicking outside ───
// Capture-phase so it runs BEFORE the panel's stopPropagation. We close every
// open <details.dsa-filter-dd> that doesn't contain the click target — which
// also handles "click another filter button" correctly (the clicked one stays
// in scope of `closest`, and native <details> toggles it as expected).
document.addEventListener('click', (e) => {
  const inside = e.target.closest && e.target.closest('details.dsa-filter-dd');
  document.querySelectorAll('details.dsa-filter-dd[open]').forEach(d => {
    if (d !== inside) d.removeAttribute('open');
  });
}, true);

// Also close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('details.dsa-filter-dd[open]').forEach(d => d.removeAttribute('open'));
  }
});

// ─── PWA Service Worker Registration ───
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Force SW update check on every page load (bypass 24h HTTP cache)
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(reg => {
      reg.update().catch(() => {});
    }).catch(() => {});
  });
}

// ─── Warm caches during idle ───
// Content warming is owned by the service worker (sw.js `warmContent`), which
// skips files it already has and refuses to run on a metered or slow link.
// The page only nudges it.
//
// This used to `fetch()` every chapter from the page instead. That was actively
// harmful on mobile: the .md fetch handler is stale-while-revalidate, so even a
// fully-cached chapter still hit the network to revalidate — roughly 5 MB of
// redundant requests on *every* page load, competing with the page's own.
//
// We also deliberately do NOT keep chapter markdown in JS memory
// (`cachedContent`) here. Pre-populating ~3MB of strings across 30+ chapters
// was contributing to memory pressure on iOS PWAs (per-process RAM is tight)
// and a contributing factor to "Loading…" hangs on the biggest chapters.
(function warmCachesWhenIdle() {
  // Don't prefetch anything on a metered or slow connection.
  const conn = navigator.connection;
  const cheapConnection = !conn
    || (!conn.saveData && !['slow-2g', '2g', '3g'].includes(conn.effectiveType));

  const warm = () => {
    if (!cheapConnection) return;
    if (typeof ensureDsaIndex === 'function') ensureDsaIndex().catch(() => {});
    navigator.serviceWorker?.ready
      .then(reg => reg.active && reg.active.postMessage({ type: 'warm-content' }))
      .catch(() => {});
  };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(warm, { timeout: 8000 });
  else setTimeout(warm, 3000);
})();
