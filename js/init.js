// ═══════════════════════════════════════════════════════════
// ═══  init.js — boot: theme, sidebar, hash routing, SW     ═══
// ═══════════════════════════════════════════════════════════

// ─── Init ───
initTheme();
applyInteractiveMode();

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

// Load from URL hash (preserves the page across hard refresh)
const hash = window.location.hash.slice(1);
if (hash === 'home' || hash === '') {
  renderWelcome();
} else if (hash === 'dashboard') {
  showDashboard();
} else if (hash === 'goals') {
  showGoals();
} else if (hash === 'dsa-practice') {
  showDSAPractice();
} else if (hash.startsWith('dsa-problem-')) {
  const problemId = hash.replace('dsa-problem-', '');
  showDSAProblem(problemId);
} else if (hash) {
  const idx = chapters.findIndex(ch => ch.file && ch.file.replace('.md', '') === hash);
  if (idx >= 0) loadChapter(idx);
}

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
