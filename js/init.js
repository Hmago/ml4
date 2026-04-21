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
let _navFromPopstate = false;
function pushHash(h) {
  if (_navFromPopstate) return;
  if (window.location.hash.slice(1) === h) return;
  history.pushState(null, '', '#' + h);
}
function routeFromHash() {
  const hash = window.location.hash.slice(1);
  _navFromPopstate = true;
  try {
    if (hash === 'home' || hash === '') {
      renderWelcome();
    } else if (hash === 'dashboard') {
      showDashboard();
    } else if (hash === 'goals') {
      showGoals();
    } else if (hash === 'dsa-practice') {
      showDSAPractice();
    } else if (hash.startsWith('dsa-problem-')) {
      showDSAProblem(hash.replace('dsa-problem-', ''));
    } else if (hash) {
      const idx = chapters.findIndex(ch => ch.file && ch.file.replace('.md', '') === hash);
      if (idx >= 0) loadChapter(idx);
    }
  } finally {
    _navFromPopstate = false;
  }
}
window.addEventListener('popstate', routeFromHash);

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
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
