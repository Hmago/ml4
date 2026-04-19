// ═══════════════════════════════════════════════════════════
// ═══  pins.js — Floating note pins in the chapter margin   ═══
// ═══════════════════════════════════════════════════════════
//
// Pins are comments that carry an `anchor` field. Data lives in ml4-comments
// (the same store as unanchored notes). The bottom notes section is the one
// place to edit / resolve / reply / delete — pins are just a shortcut for
// seeing *where* a note is attached. Clicking a pin scrolls to the matching
// comment in that list and flashes it.
//
// A note becomes a pin when it is created from a text selection via the
// sel-popup — `noteFromSelection()` records the anchor automatically.

// ─── One-time migration: merge any old ml4-pins into ml4-comments ───
(function migratePinsV1() {
  if (localStorage.getItem('ml4-pins-merged-v1') === 'done') return;
  try {
    const pins = JSON.parse(localStorage.getItem('ml4-pins') || '{}');
    if (pins && typeof pins === 'object' && Object.keys(pins).length > 0) {
      const comments = JSON.parse(localStorage.getItem('ml4-comments') || '{}');
      for (const file of Object.keys(pins)) {
        if (!Array.isArray(pins[file])) continue;
        if (!comments[file]) comments[file] = [];
        for (const p of pins[file]) {
          if (!p || !p.text) continue; // drop empty drafts
          comments[file].unshift({
            text: p.text,
            date: p.date || new Date().toISOString(),
            replies: [],
            anchor: p.anchor,
          });
        }
      }
      localStorage.setItem('ml4-comments', JSON.stringify(comments));
    }
    localStorage.removeItem('ml4-pins');
  } catch (e) { /* ignore; keep going */ }
  localStorage.setItem('ml4-pins-merged-v1', 'done');
})();

// ─── Anchor helpers ───
// Store: tag + index-among-same-tag-siblings + first 60 chars of text. On
// re-render we try tag+index first and fall back to a text match. This
// survives cosmetic re-renders where tag counts stay stable.
const PIN_BLOCK_TAGS = new Set(['P','H1','H2','H3','H4','H5','H6','LI','BLOCKQUOTE','PRE','TABLE','UL','OL']);

function pinAnchorFromElement(el) {
  const content = document.getElementById('content');
  if (!content || !content.contains(el)) return null;
  let target = el;
  while (target && target !== content && !PIN_BLOCK_TAGS.has(target.tagName)) {
    target = target.parentElement;
  }
  if (!target || target === content) return null;
  const tag = target.tagName;
  const siblings = content.querySelectorAll(tag);
  const index = Array.from(siblings).indexOf(target);
  const text = (target.textContent || '').trim().substring(0, 60);
  return { tag, index, text, _el: target };
}

function pinResolveAnchor(anchor) {
  const content = document.getElementById('content');
  if (!content || !anchor) return null;
  const siblings = content.querySelectorAll(anchor.tag);
  if (siblings[anchor.index]) return siblings[anchor.index];
  if (anchor.text) {
    for (const s of siblings) {
      if ((s.textContent || '').trim().substring(0, 60) === anchor.text) return s;
    }
  }
  return null;
}

// ─── Render all pins for the current chapter ───
function renderPins(file) {
  const content = document.getElementById('content');
  if (!content) return;
  let layer = document.getElementById('pinsLayer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'pinsLayer';
    layer.className = 'pins-layer';
    content.appendChild(layer);
  }
  layer.innerHTML = '';
  if (typeof getComments !== 'function') { updatePinCountBadge(0); return; }
  const list = (getComments()[file] || []);
  const contentRect = content.getBoundingClientRect();
  let shown = 0;
  let stackOffset = 0; // vertical stack slot for unanchored comments
  list.forEach((c, idx) => {
    if (!c) return;
    let top;
    const target = c.anchor ? pinResolveAnchor(c.anchor) : null;
    if (target) {
      const rect = target.getBoundingClientRect();
      top = (rect.top - contentRect.top) + (rect.height * (c.anchor.offsetY || 0));
    } else {
      // Unanchored note (or anchor could not be resolved after a re-render):
      // stack it at the top of the chapter so every comment still surfaces a pin.
      top = 16 + stackOffset * 38;
      stackOffset++;
    }
    const btn = document.createElement('button');
    btn.className = 'pin' + (c.resolved ? ' pin-resolved' : '') + (c.anchor ? '' : ' pin-unanchored');
    btn.style.top = top + 'px';
    btn.dataset.idx = String(idx);
    const previewText = (c.text || '').trim().substring(0, 120) || 'Note';
    btn.title = (c.resolved ? '✓ Resolved\n' : '') + previewText + '\n\nClick to jump to this note.';
    btn.textContent = '💬';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      jumpToCommentAndFlash(file, idx);
    });
    layer.appendChild(btn);
    shown++;
  });
  updatePinCountBadge(shown);
}

// Scroll to the comment-{idx} entry at the bottom, flash it. If the current
// filter hides it (e.g., viewing "Open" but the note is resolved), flip to
// "All" so the target is rendered.
function jumpToCommentAndFlash(file, idx) {
  if (typeof commentFilter !== 'undefined' && typeof renderComments === 'function') {
    const all = getComments()[file] || [];
    const target = all[idx];
    if (target) {
      const hiddenByFilter =
        (commentFilter === 'open' && target.resolved) ||
        (commentFilter === 'resolved' && !target.resolved);
      if (hiddenByFilter) {
        commentFilter = 'all';
        renderComments(file);
      }
    }
  }
  const el = document.getElementById('comment-' + idx);
  const wrapper = document.getElementById('contentWrapper');
  if (!el || !wrapper) return;
  wrapper.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  el.classList.remove('pin-flash');
  void el.offsetWidth; // restart the CSS animation
  el.classList.add('pin-flash');
  setTimeout(() => el.classList.remove('pin-flash'), 1800);
}

function updatePinCountBadge(n) {
  const btn = document.getElementById('pinModeBtn');
  if (!btn) return;
  let badge = btn.querySelector('.pin-count');
  if (n > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'pin-count';
      btn.appendChild(badge);
    }
    badge.textContent = String(n);
  } else if (badge) {
    badge.remove();
  }
}

// Topbar 📍 button: jumps to the bottom notes section so users can see or add
// a note. No "pin mode" toggle — pins are created by selecting text in the
// chapter and clicking 💬 Note on the selection popup.
function togglePinMode() {
  const wrapper = document.getElementById('contentWrapper');
  const section = document.getElementById('commentsSection');
  if (wrapper && section) {
    wrapper.scrollTo({ top: section.offsetTop - 80, behavior: 'smooth' });
  }
}

// Re-position pins when the viewport changes (debounced)
let _pinResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_pinResizeTimer);
  _pinResizeTimer = setTimeout(() => {
    if (typeof currentPage !== 'undefined' && currentPage === 'chapter'
        && typeof currentIndex !== 'undefined' && currentIndex >= 0
        && chapters[currentIndex] && chapters[currentIndex].file) {
      renderPins(chapters[currentIndex].file);
    }
  }, 150);
});
