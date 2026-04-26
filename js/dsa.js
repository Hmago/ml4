// ═══════════════════════════════════════════════════════════
// ═══  dsa.js — DSA practice: list, problem, test runner    ═══
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// ═══  DSA PRACTICE — Code Editor + Progress Tracking    ═══
// ═══════════════════════════════════════════════════════════

function getDSAProgress() {
  return JSON.parse(localStorage.getItem('ml4-dsa') || '{}');
}
function saveDSAProgress(data) {
  localStorage.setItem('ml4-dsa', JSON.stringify(data));
}
function getCustomDSAProblems() {
  return JSON.parse(localStorage.getItem('ml4-dsa-custom') || '[]');
}
function saveCustomDSAProblems(list) {
  localStorage.setItem('ml4-dsa-custom', JSON.stringify(list));
}
function getAllDSAProblems() {
  return [...DSA_PROBLEMS, ...getCustomDSAProblems()];
}

// Lazy-loader for DSA starter code. The practice list renders from metadata
// (dsa_problems_index.js, loaded up-front); starter code lives in
// dsa_problems_full.js and is fetched only when the user opens a problem.
let _dsaFullLoadPromise = null;
function ensureDsaFullData() {
  if (typeof window !== 'undefined' && window.__dsaFullLoaded) return Promise.resolve();
  if (_dsaFullLoadPromise) return _dsaFullLoadPromise;
  _dsaFullLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'js/data/dsa_problems_full.js';
    s.onload = () => resolve();
    s.onerror = () => { _dsaFullLoadPromise = null; reject(new Error('Failed to load DSA starter code')); };
    document.head.appendChild(s);
  });
  return _dsaFullLoadPromise;
}

let dsaSearchQuery = '';
let dsaSortMode = 'default';   // 'default' | 'difficulty-asc' | 'difficulty-desc' | 'alpha' | 'unsolved-first'
// Multi-select filter sets — empty = no filter applied for that dimension
let dsaDiffSet = [];           // subset of ['Easy','Medium','Hard']
let dsaStatusSet = [];         // subset of ['solved','attempted','not-started']
let dsaCompanySet = [];        // any company names
let dsaTagSet = [];            // any tag/topic names
let dsaImportantOnly = false;  // when true, show only important-flagged problems
let dsaCurrentProblem = null;
let dsaAutoSaveTimer = null;
let dsaTimerInterval = null;
let dsaTimerSeconds = 0;
let dsaTimerRunning = false;
let dsaNoteSaveTimer = null;

// Restore DSA list view preferences from localStorage
(function() {
  try {
    const saved = JSON.parse(localStorage.getItem('ml4-dsa-view') || '{}');
    if (saved.sort) dsaSortMode = saved.sort;
    if (Array.isArray(saved.diff)) dsaDiffSet = saved.diff;
    if (Array.isArray(saved.status)) dsaStatusSet = saved.status;
    if (Array.isArray(saved.companies)) dsaCompanySet = saved.companies;
    if (Array.isArray(saved.tags)) dsaTagSet = saved.tags;
    if (saved.importantOnly) dsaImportantOnly = true;
  } catch (e) { /* ignore */ }
})();
function saveDSAView() {
  localStorage.setItem('ml4-dsa-view', JSON.stringify({
    sort: dsaSortMode,
    diff: dsaDiffSet,
    status: dsaStatusSet,
    companies: dsaCompanySet,
    tags: dsaTagSet,
    importantOnly: dsaImportantOnly,
  }));
}

// Debounced search input — re-renders the list as the user types without losing focus
let _dsaSearchDebounce = null;
function dsaOnSearchInput(e) {
  const newQuery = e.target.value;
  // Toggle clear button visibility immediately for snappy UI
  const clearBtn = document.getElementById('dsaSearchClear');
  if (clearBtn) clearBtn.classList.toggle('visible', newQuery.length > 0);
  clearTimeout(_dsaSearchDebounce);
  _dsaSearchDebounce = setTimeout(() => {
    dsaSearchQuery = newQuery;
    showDSAPractice();
    // Restore focus + cursor position to the search input after re-render
    const input = document.getElementById('dsaSearchInput');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, 180);
}
function dsaClearSearch() {
  dsaSearchQuery = '';
  showDSAPractice();
  const input = document.getElementById('dsaSearchInput');
  if (input) input.focus();
}
function dsaSetSort(mode) {
  dsaSortMode = mode;
  saveDSAView();
  dsaRefreshList();
}
function dsaResetFilters() {
  dsaSearchQuery = '';
  dsaSortMode = 'default';
  dsaDiffSet = [];
  dsaStatusSet = [];
  dsaCompanySet = [];
  dsaTagSet = [];
  dsaImportantOnly = false;
  saveDSAView();
  showDSAPractice();
}

// ─── Multi-select filter helpers ───
// type: 'diff' | 'status' | 'company' | 'tag'
function _dsaSetFor(type) {
  if (type === 'diff') return dsaDiffSet;
  if (type === 'status') return dsaStatusSet;
  if (type === 'company') return dsaCompanySet;
  if (type === 'tag') return dsaTagSet;
  return [];
}
function dsaToggleFilter(type, value) {
  const set = _dsaSetFor(type);
  const i = set.indexOf(value);
  if (i >= 0) set.splice(i, 1);
  else set.push(value);
  saveDSAView();
  // Update only the list + active-chips area; keep dropdown open (don't full re-render)
  dsaRefreshList();
  dsaRefreshActiveChips();
  // Update the filter button badge count
  const summary = document.querySelector('details.dsa-filter-dd[data-type="' + type + '"] > summary .badge');
  if (summary) {
    const n = set.length;
    summary.textContent = n > 0 ? n : '';
    summary.style.display = n > 0 ? 'inline-block' : 'none';
  }
  // Update checkbox visual state inside the dropdown
  const opt = document.querySelector('.dsa-dd-option[data-type="' + type + '"][data-value="' + CSS.escape(value) + '"]');
  if (opt) {
    opt.classList.toggle('checked', set.includes(value));
    const cb = opt.querySelector('input[type="checkbox"]');
    if (cb) cb.checked = set.includes(value);
  }
}
function dsaClearFilterType(type) {
  if (type === 'diff') dsaDiffSet = [];
  else if (type === 'status') dsaStatusSet = [];
  else if (type === 'company') dsaCompanySet = [];
  else if (type === 'tag') dsaTagSet = [];
  saveDSAView();
  showDSAPractice();
}

// Select every option of a filter type at once (bulk-action button)
function dsaSelectAllFilter(type, values) {
  if (!Array.isArray(values)) return;
  if (type === 'diff') dsaDiffSet = values.slice();
  else if (type === 'status') dsaStatusSet = values.slice();
  else if (type === 'company') dsaCompanySet = values.slice();
  else if (type === 'tag') dsaTagSet = values.slice();
  saveDSAView();
  showDSAPractice();
}
function dsaFilterDDSearch(type, query) {
  const q = (query || '').toLowerCase();
  document.querySelectorAll('.dsa-dd-panel[data-type="' + type + '"] .dsa-dd-option').forEach(el => {
    const v = (el.getAttribute('data-value') || '').toLowerCase();
    el.style.display = v.includes(q) ? 'flex' : 'none';
  });
}

// ─── Group collapse state (per-category, persisted) ───
// Semantic: state[cat] === false  → expanded.
//           state[cat] === true   → collapsed (explicit).
//           state[cat] === undefined → collapsed (default).
// Default is *collapsed* so the list view stays tidy; users expand categories
// they are actively working on, and that preference persists.
//
// One-time cleanup: users who had "Expand all" active in the old code would
// have every category stored as false (expanded). Drop those so they see the
// new collapsed-default view; future user expansions still persist normally.
(function cleanUpCollapseV2() {
  if (localStorage.getItem('ml4-dsa-collapse-clean-v2') === 'done') return;
  // Reset all groups to collapsed (default) so sections open collapsed
  localStorage.removeItem('ml4-dsa-collapsed');
  localStorage.setItem('ml4-dsa-collapse-clean-v2', 'done');
})();

function getCollapsedGroups() {
  try { return JSON.parse(localStorage.getItem('ml4-dsa-collapsed') || '{}'); }
  catch { return {}; }
}
function saveCollapsedGroups(state) {
  localStorage.setItem('ml4-dsa-collapsed', JSON.stringify(state));
}
function isCatCollapsed(state, cat) {
  return state[cat] !== false;
}
function dsaToggleGroup(cat) {
  const state = getCollapsedGroups();
  const wasCollapsed = isCatCollapsed(state, cat);
  state[cat] = !wasCollapsed;
  saveCollapsedGroups(state);
  // Toggle the DOM directly without re-rendering (snappy + preserves scroll position)
  const el = document.querySelector('.dsa-group[data-cat="' + CSS.escape(cat) + '"]');
  if (el) el.classList.toggle('collapsed', state[cat]);
}
function dsaExpandAll() {
  const cats = [...new Set(getAllDSAProblems().map(p => p.category))];
  const state = {};
  cats.forEach(c => state[c] = false);
  saveCollapsedGroups(state);
  showDSAPractice();
}
function dsaCollapseAll() {
  const cats = [...new Set(getAllDSAProblems().map(p => p.category))];
  const state = {};
  cats.forEach(c => state[c] = true);
  saveCollapsedGroups(state);
  showDSAPractice();
}

// Build a multi-select <details> dropdown: button + panel of checkbox options
// type: 'diff' | 'status' | 'company' | 'tag'
// label: button text
// options: [{ value, label?, count }]
// activeSet: array of currently-selected values
// withSearch: if true, render a small search input above the options
function dsaBuildFilterDropdown(type, label, options, activeSet, withSearch) {
  const n = activeSet.length;
  const optionsHTML = options.map(o => {
    const v = o.value;
    const lbl = o.label || v;
    const checked = activeSet.includes(v);
    const safeV = String(v).replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return `<label class="dsa-dd-option ${checked ? 'checked' : ''}" data-type="${type}" data-value="${String(v).replace(/"/g,'&quot;')}">
      <input type="checkbox" ${checked ? 'checked' : ''} onclick="event.stopPropagation();dsaToggleFilter('${type}','${safeV}')">
      <span>${lbl}</span>
      ${o.count != null ? `<span class="dd-count">${o.count}</span>` : ''}
    </label>`;
  }).join('');
  // Stable JSON of the option *values* for the "Select all" handler — values only,
  // single-quote-safe inside the onclick attribute
  const allValues = options.map(o => o.value);
  const allValuesJSON = JSON.stringify(allValues).replace(/'/g, "\\'");
  const allSelected = options.length > 0 && activeSet.length >= options.length
                       && allValues.every(v => activeSet.includes(v));
  return `<details class="dsa-filter-dd" data-type="${type}">
    <summary>
      <span>${label}</span>
      <span class="badge" style="${n > 0 ? '' : 'display:none;'}">${n > 0 ? n : ''}</span>
      <span class="caret">▾</span>
    </summary>
    <div class="dsa-dd-panel" data-type="${type}" onclick="event.stopPropagation();">
      ${withSearch ? `<input type="text" class="dsa-dd-search" placeholder="Search…" oninput="dsaFilterDDSearch('${type}', this.value)">` : ''}
      ${options.length > 0 ? `<div class="dsa-dd-bulk">
        <span class="dsa-dd-hint">Select multiple</span>
        <div class="dsa-dd-bulk-btns">
          <button onclick="dsaSelectAllFilter('${type}', JSON.parse('${allValuesJSON.replace(/"/g, '&quot;')}'))" ${allSelected ? 'disabled' : ''}>Select all</button>
          <button onclick="dsaClearFilterType('${type}')" ${activeSet.length === 0 ? 'disabled' : ''}>Clear</button>
        </div>
      </div>` : ''}
      <div class="dsa-dd-options">
        ${options.length === 0 ? '<div class="dsa-dd-empty">No options available</div>' : optionsHTML}
      </div>
    </div>
  </details>`;
}

// ─── Filter pipeline (used by full + partial renders) ───
function dsaApplyFilters(allProblems, progress) {
  const q = (dsaSearchQuery || '').trim().toLowerCase();
  let result = allProblems.filter(p => {
    // Difficulty (OR)
    if (dsaDiffSet.length && !dsaDiffSet.includes(p.difficulty)) return false;
    // Status (OR)
    if (dsaStatusSet.length) {
      const pr = progress[p.id];
      const statuses = [];
      if (pr?.solved) statuses.push('solved');
      else if (pr?.code) statuses.push('attempted');
      else statuses.push('not-started');
      if (pr?.skipped) statuses.push('skipped');
      if (!dsaStatusSet.some(s => statuses.includes(s))) return false;
    }
    // Companies (OR — problem must list at least one of the selected companies)
    if (dsaCompanySet.length) {
      const cs = p.companies || [];
      if (!cs.some(c => dsaCompanySet.includes(c))) return false;
    }
    // Topic tags (OR — same logic)
    if (dsaTagSet.length) {
      const ts = p.tags || [];
      if (!ts.some(t => dsaTagSet.includes(t))) return false;
    }
    // Important filter
    if (dsaImportantOnly && !progress[p.id]?.important) return false;
    // Search haystack
    if (q) {
      const hay = (p.title + ' ' + p.category + ' ' + p.difficulty + ' ' + (p.tags || []).join(' ') + ' ' + (p.companies || []).join(' ')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  // Sort
  if (dsaSortMode === 'difficulty-asc' || dsaSortMode === 'difficulty-desc') {
    const ord = { 'Easy': 0, 'Medium': 1, 'Hard': 2 };
    const dir = dsaSortMode === 'difficulty-asc' ? 1 : -1;
    result = [...result].sort((a, b) => dir * ((ord[a.difficulty] ?? 9) - (ord[b.difficulty] ?? 9)));
  } else if (dsaSortMode === 'alpha') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title));
  } else if (dsaSortMode === 'unsolved-first') {
    result = [...result].sort((a, b) => {
      const aDone = progress[a.id]?.solved ? 1 : 0;
      const bDone = progress[b.id]?.solved ? 1 : 0;
      return aDone - bDone;
    });
  }
  return result;
}

// Build the grouped-list HTML for a given filtered set
function dsaBuildGroupsHTML(filtered, progress) {
  if (filtered.length === 0) {
    return '<p style="text-align:center;color:var(--text-secondary);padding:24px;">No problems match the current filters.</p>';
  }
  const seenCats = [];
  const byCat = {};
  for (const p of filtered) {
    if (!byCat[p.category]) { byCat[p.category] = []; seenCats.push(p.category); }
    byCat[p.category].push(p);
  }
  const collapsedState = getCollapsedGroups();
  const catMeta = {};
  if (typeof DSA_CATEGORIES !== 'undefined') {
    for (const c of DSA_CATEGORIES) catMeta[c.name] = c;
  }
  return '<div class="dsa-groups">' + seenCats.map(cat => {
    const items = byCat[cat];
    const solvedInCat = items.filter(p => progress[p.id]?.solved).length;
    const isCollapsed = isCatCollapsed(collapsedState, cat);
    const meta = catMeta[cat] || {};
    const icon = meta.icon || '📁';
    const pct = items.length > 0 ? Math.round((solvedInCat / items.length) * 100) : 0;
    const safeCat = cat.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return `<div class="dsa-group ${isCollapsed ? 'collapsed' : ''}" data-cat="${cat.replace(/"/g, '&quot;')}">
      <div class="dsa-group-header" onclick="dsaToggleGroup('${safeCat}')">
        <span class="dsa-group-caret">▼</span>
        <span class="dsa-group-icon">${icon}</span>
        <span class="dsa-group-title">${cat}</span>
        <span class="dsa-group-count"><strong>${solvedInCat}</strong>/${items.length} solved</span>
        <div class="dsa-group-progress" title="${pct}% complete"><div class="dsa-group-progress-fill" style="width:${pct}%;"></div></div>
      </div>
      <div class="dsa-group-body">
        ${items.map((p, i) => {
          const pr = progress[p.id];
          const status = pr?.solved ? '✅' : pr?.code ? '🔶' : '⬜';
          const isCustom = !!p._custom;
          const tagChips = (p.tags || []).slice(0, 2).map(t => `<span class="row-tag">${t}</span>`).join('');
          const compChips = (p.companies || []).slice(0, 2).map(c => `<span class="row-company">${c}</span>`).join('');
          const solvedChip = (pr?.solved && pr.solvedDate)
            ? `<span class="row-solved-date" title="${dsaFormatSolvedDateAbsolute(pr.solvedDate)}">&#10003; ${dsaFormatSolvedDateRelative(pr.solvedDate)}</span>`
            : '';
          const hintChip = pr?.hintUsed ? '<span class="row-hint-used" title="Hint was used">💡</span>' : '';
          const importantChip = pr?.important ? '<span class="row-important" title="Important">&#9733;</span>' : '';
          const metaRow = importantChip + tagChips + compChips + solvedChip + hintChip;
          return `<div class="dsa-problem-row ${pr?.solved ? 'solved' : ''}" onclick="showDSAProblem('${p.id}')">
            <span class="seq">#${i + 1}</span>
            <span class="status">${status}</span>
            <div class="title-wrap">
              <span class="title">${p.title}${isCustom ? '<span class="dsa-custom-badge">custom</span>' : ''}</span>
              ${metaRow ? `<div class="row-meta">${metaRow}</div>` : ''}
            </div>
            <span class="dsa-diff-badge ${p.difficulty.toLowerCase()}">${p.difficulty}</span>
            ${p.link ? `<a class="link-icon" href="${p.link}" target="_blank" rel="noopener" onclick="event.stopPropagation();" title="Open on LeetCode">&#8599;</a>` : ''}
            ${isCustom ? `<button class="link-icon" onclick="event.stopPropagation();deleteCustomDSA('${p.id}');" title="Delete custom problem" style="border:none;background:none;cursor:pointer;color:var(--text-secondary);">&#10005;</button>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('') + '</div>';
}

// Build the active-filter chips ("Easy ✕  Google ✕")
function dsaBuildActiveChipsHTML() {
  const chips = [];
  for (const v of dsaDiffSet) chips.push({type:'diff', value:v, cls:'diff-' + v.toLowerCase()});
  for (const v of dsaStatusSet) {
    const label = v === 'not-started' ? 'Not started' : (v.charAt(0).toUpperCase() + v.slice(1));
    chips.push({type:'status', value:v, label});
  }
  for (const v of dsaCompanySet) chips.push({type:'company', value:v});
  for (const v of dsaTagSet) chips.push({type:'tag', value:v});
  if (chips.length === 0) return '';
  return '<span class="label">Active:</span>' + chips.map(c => {
    const lbl = (c.label || c.value).replace(/"/g, '&quot;');
    const safeV = c.value.replace(/'/g, "\\'");
    return `<span class="dsa-active-filter ${c.cls || ''}">${lbl}<span class="x" onclick="dsaToggleFilter('${c.type}','${safeV}')" title="Remove">✕</span></span>`;
  }).join('');
}

// Re-render only the list section + active chips (keep dropdowns open)
function dsaRefreshList() {
  const progress = getDSAProgress();
  const allProblems = getAllDSAProblems();
  const filtered = dsaApplyFilters(allProblems, progress);
  const list = document.getElementById('dsaListContainer');
  if (list) list.innerHTML = dsaBuildGroupsHTML(filtered, progress);
  const info = document.getElementById('dsaResultsInfo');
  if (info) {
    const anyFilter = dsaSearchQuery || dsaDiffSet.length || dsaStatusSet.length || dsaCompanySet.length || dsaTagSet.length || dsaImportantOnly;
    info.innerHTML = `Showing <strong>${filtered.length}</strong> of ${allProblems.length}` + (anyFilter ? ' &middot; <a href="javascript:dsaResetFilters()" style="color:var(--accent);text-decoration:none;">reset</a>' : '');
  }
}
function dsaRefreshActiveChips() {
  const el = document.getElementById('dsaActiveFilters');
  if (el) el.innerHTML = dsaBuildActiveChipsHTML();
}

// Pick the next problem to resume on:
//   1. most recently run problem that has code saved but isn't solved → resume
//   2. else, in the category of the most recently touched problem, the first
//      not-started problem after that position (so working through Fundamentals
//      doesn't suddenly suggest a much earlier item in the same list)
//   3. else any not-started problem in that category (gap-fill)
//   4. else the first not-started problem anywhere
//   5. else null (everything solved)
function dsaPickContinueProblem() {
  const progress = getDSAProgress();
  const allProblems = getAllDSAProblems();

  // (1) resume: most recently run attempted-not-solved
  let bestAttempted = null;
  let bestRunTime = 0;
  for (const p of allProblems) {
    const pr = progress[p.id];
    if (!pr || pr.solved || !pr.code) continue;
    const t = pr.lastRun ? Date.parse(pr.lastRun) : 0;
    if (t >= bestRunTime) { bestRunTime = t; bestAttempted = p; }
  }
  if (bestAttempted) return { problem: bestAttempted, kind: 'resume' };

  // Identify the most recently touched problem (by last run or last solve).
  let lastTouchedTime = 0;
  let lastTouched = null;
  for (const p of allProblems) {
    const pr = progress[p.id];
    if (!pr) continue;
    const t = Math.max(
      pr.lastRun ? Date.parse(pr.lastRun) : 0,
      pr.solvedDate ? Date.parse(pr.solvedDate) : 0
    );
    if (t > lastTouchedTime) { lastTouchedTime = t; lastTouched = p; }
  }

  if (lastTouched) {
    const catList = allProblems.filter(p => p.category === lastTouched.category);
    const startIdx = catList.findIndex(p => p.id === lastTouched.id);
    // (2) first not-started AFTER the user's current position in the category
    const after = catList.slice(startIdx + 1).find(p => !progress[p.id]);
    if (after) return { problem: after, kind: 'start' };
    // (3) gap-fill: first not-started anywhere in this category
    const inCat = catList.find(p => !progress[p.id]);
    if (inCat) return { problem: inCat, kind: 'start' };
  }

  // (4) final fallback: first not-started anywhere
  const fresh = allProblems.find(p => !progress[p.id]);
  if (fresh) return { problem: fresh, kind: 'start' };
  return null;
}

function dsaContinue() {
  const next = dsaPickContinueProblem();
  if (!next) {
    if (typeof showToast === 'function') showToast('All clear', 'No problems left to continue', '🎉');
    return;
  }
  showDSAProblem(next.problem.id);
}

function showDSAPractice() {
  exitFocusMode();
  trackChapterClose();
  currentIndex = -1;
  currentPage = 'dsa';
  renderSidebar();
  closeSidebar();
  document.getElementById('tocPanel').classList.remove('visible');
  document.getElementById('breadcrumb').textContent = '💻 DSA Practice';
  document.getElementById('readBtn').style.display = 'none';

  document.getElementById('focusBtn').style.display = 'none';
  pushHash('dsa-practice');
  const el = document.getElementById('readingTime'); if (el) el.remove();
  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view');

  const progress = getDSAProgress();
  const allProblems = getAllDSAProblems();
  const total = allProblems.length;
  const solved = Object.values(progress).filter(p => p.solved).length;
  const attempted = Object.keys(progress).length;
  const easySolved = allProblems.filter(p => p.difficulty === 'Easy' && progress[p.id]?.solved).length;
  const medSolved = allProblems.filter(p => p.difficulty === 'Medium' && progress[p.id]?.solved).length;
  const hardSolved = allProblems.filter(p => p.difficulty === 'Hard' && progress[p.id]?.solved).length;
  const easyTotal = allProblems.filter(p => p.difficulty === 'Easy').length;
  const medTotal = allProblems.filter(p => p.difficulty === 'Medium').length;
  const hardTotal = allProblems.filter(p => p.difficulty === 'Hard').length;

  // Filter pipeline. Across types = AND. Within a type = OR (matches any selected value).
  // Status meaning: 'solved' = solved; 'attempted' = has code but not solved; 'not-started' = nothing.
  let filtered = dsaApplyFilters(allProblems, progress);

  // Apply sort
  if (dsaSortMode === 'difficulty-asc' || dsaSortMode === 'difficulty-desc') {
    const ord = { 'Easy': 0, 'Medium': 1, 'Hard': 2 };
    const dir = dsaSortMode === 'difficulty-asc' ? 1 : -1;
    filtered = [...filtered].sort((a, b) => dir * ((ord[a.difficulty] ?? 9) - (ord[b.difficulty] ?? 9)));
  } else if (dsaSortMode === 'alpha') {
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  } else if (dsaSortMode === 'unsolved-first') {
    filtered = [...filtered].sort((a, b) => {
      const aDone = progress[a.id]?.solved ? 1 : 0;
      const bDone = progress[b.id]?.solved ? 1 : 0;
      return aDone - bDone;
    });
  }

  contentEl.innerHTML = `
    <div style="max-width:80%;margin:0 auto;">
      <div class="dsa-header">
        <div>
          <h1 style="font-size:26px;border:none;margin-bottom:2px;">💻 DSA Coding Practice</h1>
          <p style="color:var(--text-secondary);font-size:14px;">Google's most asked Data Structures & Algorithms problems</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-shrink:0;">
          ${(() => {
            const next = dsaPickContinueProblem();
            if (!next) return '';
            const label = next.kind === 'resume' ? '▶ Continue' : '▶ Start next';
            const safeTitle = next.problem.title.replace(/"/g, '&quot;');
            const tip = (next.kind === 'resume' ? 'Resume: ' : 'Start: ') + safeTitle;
            return `<button class="dsa-continue-btn" onclick="dsaContinue()" title="${tip}">${label}<span class="dsa-continue-title">${next.problem.title}</span></button>`;
          })()}
          <button onclick="showMotivation()" style="padding:6px 14px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);cursor:pointer;font-size:13px;transition:all 0.15s;white-space:nowrap;" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">💪 Motivation</button>
          <button class="dsa-add-btn" onclick="toggleDSAAddForm()">+ Add Question</button>
        </div>
      </div>
      <div id="dsaAddFormWrap" style="display:none;"></div>

      <div class="dsa-stats-bar">
        <div class="dsa-stat">
          <div class="num" style="color:var(--accent);">${total > 0 ? Math.round((solved / total) * 100) : 0}<small style="font-size:14px;opacity:0.5;">%</small></div>
          <div class="label">Overall</div>
        </div>
        <div class="dsa-stat">
          <div class="num" style="color:var(--accent);">${solved}<small style="font-size:14px;opacity:0.5;">/${total}</small></div>
          <div class="label">Solved</div>
        </div>
        <div class="dsa-stat">
          <div class="num" style="color:#3b82f6;">${easySolved}<small style="font-size:14px;opacity:0.5;">/${easyTotal}</small></div>
          <div class="label">Easy</div>
        </div>
        <div class="dsa-stat">
          <div class="num" style="color:#f59e0b;">${medSolved}<small style="font-size:14px;opacity:0.5;">/${medTotal}</small></div>
          <div class="label">Medium</div>
        </div>
        <div class="dsa-stat">
          <div class="num" style="color:#ef4444;">${hardSolved}<small style="font-size:14px;opacity:0.5;">/${hardTotal}</small></div>
          <div class="label">Hard</div>
        </div>
        <div class="dsa-stat">
          <div class="num">${attempted}</div>
          <div class="label">Attempted</div>
        </div>
      </div>

      <div class="dsa-search-wrap">
        <input type="text" id="dsaSearchInput" class="dsa-search-input" placeholder="Search by title, category, difficulty, tag, or company…" value="${(dsaSearchQuery || '').replace(/"/g,'&quot;')}" oninput="dsaOnSearchInput(event)" autocomplete="off">
        <button class="dsa-search-clear ${dsaSearchQuery ? 'visible' : ''}" id="dsaSearchClear" onclick="dsaClearSearch()" title="Clear">&#10005;</button>
      </div>

      <div class="dsa-filter-row">
        <strong>Filters:</strong>
        ${dsaBuildFilterDropdown('diff', '🎚 Difficulty', [
          { value: 'Easy', count: allProblems.filter(p => p.difficulty === 'Easy').length },
          { value: 'Medium', count: allProblems.filter(p => p.difficulty === 'Medium').length },
          { value: 'Hard', count: allProblems.filter(p => p.difficulty === 'Hard').length },
        ], dsaDiffSet)}
        ${dsaBuildFilterDropdown('status', '⚡ Status', [
          { value: 'not-started', label: 'Not started', count: allProblems.filter(p => !progress[p.id]).length },
          { value: 'attempted',   label: 'Attempted',   count: allProblems.filter(p => progress[p.id]?.code && !progress[p.id]?.solved).length },
          { value: 'solved',      label: 'Solved',      count: allProblems.filter(p => progress[p.id]?.solved).length },
          { value: 'skipped',     label: 'Skipped',     count: allProblems.filter(p => progress[p.id]?.skipped).length },
        ], dsaStatusSet)}
        ${(() => {
          const counts = {};
          for (const p of allProblems) for (const c of (p.companies || [])) counts[c] = (counts[c] || 0) + 1;
          const opts = Object.keys(counts).sort((a,b) => counts[b] - counts[a]).map(c => ({ value: c, count: counts[c] }));
          return dsaBuildFilterDropdown('company', '🏢 Companies', opts, dsaCompanySet, true);
        })()}
        <button class="dsa-important-filter ${dsaImportantOnly ? 'active' : ''}" id="dsaImportantFilterBtn" onclick="dsaToggleImportantFilter()">&#9733; Important <span class="badge">${allProblems.filter(p => progress[p.id]?.important).length}</span></button>
        ${(() => {
          const counts = {};
          for (const p of allProblems) for (const t of (p.tags || [])) counts[t] = (counts[t] || 0) + 1;
          const opts = Object.keys(counts).sort((a,b) => counts[b] - counts[a]).map(t => ({ value: t, count: counts[t] }));
          return dsaBuildFilterDropdown('tag', '🏷 Topics', opts, dsaTagSet, true);
        })()}
      </div>

      <div class="dsa-active-filters" id="dsaActiveFilters">${dsaBuildActiveChipsHTML()}</div>

      <div class="dsa-toolbar">
        <select class="dsa-sort-select" onchange="dsaSetSort(this.value)">
          <option value="default" ${dsaSortMode === 'default' ? 'selected' : ''}>Sort: Default</option>
          <option value="difficulty-asc" ${dsaSortMode === 'difficulty-asc' ? 'selected' : ''}>Sort: Easy → Hard</option>
          <option value="difficulty-desc" ${dsaSortMode === 'difficulty-desc' ? 'selected' : ''}>Sort: Hard → Easy</option>
          <option value="alpha" ${dsaSortMode === 'alpha' ? 'selected' : ''}>Sort: A → Z</option>
          <option value="unsolved-first" ${dsaSortMode === 'unsolved-first' ? 'selected' : ''}>Sort: Unsolved first</option>
        </select>
        <span class="dsa-group-controls">
          <button onclick="dsaExpandAll()" title="Expand all groups">⊞ Expand all</button>
          <button onclick="dsaCollapseAll()" title="Collapse all groups">⊟ Collapse all</button>
        </span>
        <span class="dsa-results-info" id="dsaResultsInfo">
          Showing <strong>${filtered.length}</strong> of ${total}
          ${(dsaSearchQuery || dsaDiffSet.length || dsaStatusSet.length || dsaCompanySet.length || dsaTagSet.length) ? ' &middot; <a href="javascript:dsaResetFilters()" style="color:var(--accent);text-decoration:none;">reset</a>' : ''}
        </span>
      </div>

      <div id="dsaListContainer">${dsaBuildGroupsHTML(filtered, progress)}</div>
    </div>`;
  document.getElementById('contentWrapper').scrollTop = 0;
}

function toggleDSAAddForm() {
  const wrap = document.getElementById('dsaAddFormWrap');
  if (!wrap) return;
  if (wrap.style.display !== 'none') { wrap.style.display = 'none'; wrap.innerHTML = ''; return; }

  const allProblems = getAllDSAProblems();
  const existingCats = [...new Set(allProblems.map(p => p.category))];
  const existingTags = [...new Set(allProblems.flatMap(p => p.tags || []))].sort();
  wrap.style.display = 'block';
  wrap.innerHTML = `
    <div class="dsa-add-form">
      <div class="dsa-add-form-header">
        <h3>Add a New Question</h3>
        <p>Saved locally. Appears in your problem list and counts toward stats.</p>
      </div>
      <div class="dsa-add-form-body">
        <div class="dsa-add-form-section">
          <div class="dsa-add-form-section-title">Basic Info</div>
          <label>Title *</label>
          <input id="dsaAddTitle" placeholder="e.g. Merge K Sorted Lists">
          <div class="row-3" style="margin-top:2px;">
            <div>
              <label>Difficulty *</label>
              <select id="dsaAddDiff">
                <option value="Easy">Easy</option>
                <option value="Medium" selected>Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label>Category *</label>
              <input id="dsaAddCat" list="dsaCatList" placeholder="e.g. Trees, DP...">
              <datalist id="dsaCatList">${existingCats.map(c => '<option value="'+c+'">').join('')}</datalist>
            </div>
            <div>
              <label>Link</label>
              <input id="dsaAddLink" placeholder="https://leetcode.com/...">
            </div>
          </div>
        </div>

        <div class="dsa-add-form-section">
          <div class="dsa-add-form-section-title">Tags</div>
          <div style="position:relative;">
            <div id="dsaSelectedTags" style="display:flex;flex-wrap:wrap;gap:4px;min-height:24px;margin-bottom:6px;"></div>
            <input id="dsaAddTags" placeholder="Search tags or type new ones (comma-separated)..." onfocus="document.getElementById('dsaTagDropdown').style.display='block'" oninput="filterDSATags(this.value)">
            <div id="dsaTagDropdown" style="display:none;position:absolute;z-index:10;left:0;right:0;max-height:160px;overflow-y:auto;background:var(--bg);border:1px solid var(--border);border-radius:8px;box-shadow:0 4px 16px var(--shadow);margin-top:2px;">
              ${existingTags.map(t => `<div class="dsa-tag-option" data-tag="${t.replace(/"/g,'&quot;')}" onclick="pickDSATag('${t.replace(/'/g, "\\'")}')" style="padding:7px 14px;cursor:pointer;font-size:13px;display:flex;align-items:center;gap:8px;transition:background 0.1s;">
                <span class="dsa-tag-check" style="width:16px;text-align:center;color:var(--accent);font-weight:bold;"></span>${t}
              </div>`).join('')}
            </div>
          </div>
        </div>

        <div class="dsa-add-form-section">
          <div class="dsa-add-form-section-title">Problem Details</div>
          <label>Description</label>
          <textarea id="dsaAddDesc" rows="3" placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."></textarea>
          <label>Examples</label>
          <textarea id="dsaAddExamples" rows="2" placeholder="Input: nums = [2,7,11,15], target = 9&#10;Output: [0,1]"></textarea>
        </div>

        <div class="dsa-add-form-section">
          <div class="dsa-add-form-section-title">Starter Code</div>
          <textarea id="dsaAddCode" rows="8" style="font-family:'JetBrains Mono','Fira Code',monospace;font-size:13px;background:#0f172a;color:#e2e8f0;border-color:#334155;" placeholder="public class Main {&#10;    public static void main(String[] args) {&#10;        // your code here&#10;    }&#10;}"></textarea>
          <div class="dsa-field-hint">Java 22 (OpenJDK). Class must be named <code>Main</code>.</div>
        </div>
      </div>

      <div class="dsa-add-actions">
        <button class="cancel" onclick="toggleDSAAddForm()">Cancel</button>
        <button class="save" onclick="saveNewDSAProblem()">Add Question</button>
      </div>
    </div>`;
  wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  document.getElementById('dsaAddTitle').focus();
}

function getDSASelectedTags() {
  const input = document.getElementById('dsaAddTags');
  return input.dataset.tags ? input.dataset.tags.split(',').filter(Boolean) : [];
}
function setDSASelectedTags(tags) {
  const input = document.getElementById('dsaAddTags');
  input.dataset.tags = tags.join(',');
  input.value = '';
  // Render chips
  const container = document.getElementById('dsaSelectedTags');
  if (container) container.innerHTML = tags.map(t =>
    `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:12px;font-size:12px;background:var(--accent);color:#fff;">
      ${t}<span onclick="removeDSATag('${t.replace(/'/g,"\\'")}')" style="cursor:pointer;font-size:14px;line-height:1;">&times;</span>
    </span>`
  ).join('');
  // Update checkmarks
  document.querySelectorAll('.dsa-tag-option').forEach(el => {
    const check = el.querySelector('.dsa-tag-check');
    if (check) check.textContent = tags.includes(el.dataset.tag) ? '✓' : '';
  });
}
function pickDSATag(tag) {
  const tags = getDSASelectedTags();
  const idx = tags.indexOf(tag);
  if (idx >= 0) tags.splice(idx, 1); else tags.push(tag);
  setDSASelectedTags(tags);
}
function removeDSATag(tag) {
  const tags = getDSASelectedTags().filter(t => t !== tag);
  setDSASelectedTags(tags);
}
function filterDSATags(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.dsa-tag-option').forEach(el => {
    el.style.display = el.dataset.tag.toLowerCase().includes(q) ? '' : 'none';
  });
  document.getElementById('dsaTagDropdown').style.display = 'block';
}
// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const dd = document.getElementById('dsaTagDropdown');
  if (dd && !e.target.closest('#dsaTagDropdown') && e.target.id !== 'dsaAddTags') dd.style.display = 'none';
});

function saveNewDSAProblem() {
  const title = document.getElementById('dsaAddTitle').value.trim();
  const difficulty = document.getElementById('dsaAddDiff').value;
  const category = document.getElementById('dsaAddCat').value.trim();
  if (!title) { document.getElementById('dsaAddTitle').focus(); return showToast('Missing title', 'Please enter a question title', '⚠️'); }
  if (!category) { document.getElementById('dsaAddCat').focus(); return showToast('Missing category', 'Please enter a category', '⚠️'); }

  const typedTags = document.getElementById('dsaAddTags').value.split(',').map(t => t.trim()).filter(Boolean);
  const selectedTags = getDSASelectedTags();
  const tags = [...new Set([...selectedTags, ...typedTags])];
  const link = document.getElementById('dsaAddLink').value.trim();
  const description = document.getElementById('dsaAddDesc').value.trim() || 'No description provided.';
  const examples = (document.getElementById('dsaAddExamples')?.value || '').trim();
  const starterCode = document.getElementById('dsaAddCode').value || 'public class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}';

  const id = 'custom-' + Date.now() + '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  const problem = { id, title, category, difficulty, link: link || '', tags, description, examples, starterCode, _custom: true };

  const custom = getCustomDSAProblems();
  custom.push(problem);
  saveCustomDSAProblems(custom);

  showToast('Question Added', title, '✓');
  const scrollPos = document.getElementById('contentWrapper').scrollTop;
  showDSAPractice();
  document.getElementById('contentWrapper').scrollTop = scrollPos;
}

function deleteCustomDSA(id) {
  const custom = getCustomDSAProblems();
  const problem = custom.find(p => p.id === id);
  if (!problem) return;
  if (!confirm(`Delete "${problem.title}"?`)) return;
  saveCustomDSAProblems(custom.filter(p => p.id !== id));
  // Also clean up progress for this problem
  const progress = getDSAProgress();
  delete progress[id];
  saveDSAProgress(progress);
  showToast('Deleted', problem.title, '↺');
  const scrollPos = document.getElementById('contentWrapper').scrollTop;
  showDSAPractice();
  document.getElementById('contentWrapper').scrollTop = scrollPos;
}

function dsaFormatExamples(raw) {
  // Parse examples string into structured Input/Output/Explanation blocks
  const lines = raw.split('\n');
  let html = '<div class="dsa-example-block">';
  let hasContent = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('Input:')) {
      if (hasContent) html += '</div><div class="dsa-example-block">';
      html += '<span class="dsa-example-label input">Input</span><div class="dsa-example-code">' + escapeHTML(trimmed.slice(6).trim()) + '</div>';
      hasContent = true;
    } else if (trimmed.startsWith('Output:')) {
      html += '<span class="dsa-example-label output">Output</span><div class="dsa-example-code">' + escapeHTML(trimmed.slice(7).trim()) + '</div>';
    } else if (trimmed.startsWith('Explanation:')) {
      html += '<span class="dsa-example-label explain">Explanation</span><div class="dsa-example-code">' + escapeHTML(trimmed.slice(12).trim()) + '</div>';
    } else {
      html += '<div class="dsa-example-code">' + escapeHTML(trimmed) + '</div>';
      hasContent = true;
    }
  }
  html += '</div>';
  return html;
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function dsaUpdateLineNumbers() {
  const editor = document.getElementById('dsaCodeEditor');
  const gutter = document.getElementById('dsaLineNums');
  if (!editor || !gutter) return;
  const lineCount = editor.value.split('\n').length;
  let html = '';
  for (let i = 1; i <= lineCount; i++) html += '<div>' + i + '</div>';
  gutter.innerHTML = html;
}

function dsaSyncLineScroll() {
  const editor = document.getElementById('dsaCodeEditor');
  const gutter = document.getElementById('dsaLineNums');
  if (editor && gutter) gutter.scrollTop = editor.scrollTop;
}

async function showDSAProblem(id) {
  // Custom (user-authored) problems carry their own starterCode so we only need
  // the shared lookup for built-in problems. Attempt to load; if it fails for a
  // custom problem we still proceed.
  try { await ensureDsaFullData(); } catch (e) { console.warn(e); }

  const allProblems = getAllDSAProblems();
  const problem = allProblems.find(p => p.id === id);
  if (!problem) return;

  // Stop any existing timer
  dsaStopTimer();

  dsaCurrentProblem = id;
  currentPage = 'dsa-problem';
  document.getElementById('breadcrumb').textContent = '💻 ' + problem.title;
  document.getElementById('readBtn').style.display = 'none';

  pushHash('dsa-problem-' + id);

  const progress = getDSAProgress();
  const saved = progress[id] || {};
  const code = saved.code || problem.starterCode;
  const notes = saved.notes || '';

  // Category progress + prev/next scoped to the filtered view the user just
  // clicked from. The practice list numbers rows per-category within the
  // active filter (#1…#N), so using the full global list here made the
  // counter and arrows disagree with what the user saw. Fall back to the
  // unfiltered category if this problem is filtered out (e.g. opened via
  // direct hash).
  const catProblems = allProblems.filter(p => p.category === problem.category);
  const catSolved = catProblems.filter(p => progress[p.id]?.solved).length;
  const visibleInCat = dsaApplyFilters(allProblems, progress)
    .filter(p => p.category === problem.category);
  const navList = visibleInCat.some(p => p.id === id) ? visibleInCat : catProblems;
  const currentIdx = navList.findIndex(p => p.id === id);
  const prevProblem = currentIdx > 0 ? navList[currentIdx - 1] : null;
  const nextProblem = currentIdx < navList.length - 1 ? navList[currentIdx + 1] : null;

  // Restore timer from saved progress
  dsaTimerSeconds = saved.timerSeconds || 0;
  dsaTimerRunning = false;

  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view');

  const renderMd = (md) => (typeof marked !== 'undefined')
    ? marked.parse(md)
    : md.replace(/`([^`]+)`/g, '<code>$1</code>')
         .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
         .replace(/\*([^*]+)\*/g, '<em>$1</em>')
         .replace(/\n/g, '<br>');

  // Split description: first paragraph = problem statement, rest = hint.
  // An explicit `hint` field on the problem takes priority over auto-split.
  const rawDesc = problem.description || '';
  const splitIdx = rawDesc.indexOf('\n\n');
  const problemText = splitIdx > 0 ? rawDesc.slice(0, splitIdx) : rawDesc;
  const autoHint = splitIdx > 0 ? rawDesc.slice(splitIdx + 2) : '';
  const hintText = problem.hint || autoHint;
  const descHtml = renderMd(problemText);
  const hintHtml = hintText ? renderMd(hintText) : '';
  const hintUsed = saved.hintUsed || false;
  const diffClass = problem.difficulty.toLowerCase();
  const examplesHtml = dsaFormatExamples(problem.examples);

  contentEl.innerHTML = `
    <div class="dsa-problem-page">
      <div class="dsa-nav-row">
        <button class="dsa-back-btn" onclick="showDSAPractice();">&#8592; All</button>
        <span class="dsa-diff-badge ${diffClass}" style="font-size:10px;">${problem.difficulty}</span>
        <h1 style="font-size:17px;font-weight:700;border:none;margin:0;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${problem.title}</h1>
        ${saved.solved ? '<span class="dsa-solved-pill" title="Solved">&#10003; Solved</span>' : ''}
        <button class="dsa-important-btn ${saved.important ? 'active' : ''}" id="dsaImportantBtn" onclick="dsaToggleImportant('${id}')" title="${saved.important ? 'Marked as important' : 'Mark as important'}">${saved.important ? '&#9733; Important' : '&#9734; Important'}</button>
        <button class="dsa-skip-btn" onclick="dsaSkipProblem()" title="Skip to next unsolved">Skip &#9197;</button>
        <div class="dsa-nav-btns">
          <button class="dsa-nav-btn" onclick="showDSAProblem('${prevProblem ? prevProblem.id : ''}')" ${!prevProblem ? 'disabled' : ''} title="${prevProblem ? prevProblem.title : ''}">&#8592;</button>
          <span class="dsa-nav-counter" title="${problem.category}">${currentIdx + 1}/${navList.length}</span>
          <button class="dsa-nav-btn" onclick="showDSAProblem('${nextProblem ? nextProblem.id : ''}')" ${!nextProblem ? 'disabled' : ''} title="${nextProblem ? nextProblem.title : ''}">&#8594;</button>
        </div>
      </div>

      <div class="dsa-split">
        <!-- Left pane: problem description -->
        <div class="dsa-split-left" id="dsaSplitLeft">
          <div class="dsa-pane-header">
            <div class="dsa-problem-meta" style="padding:12px 16px 8px;">
              ${problem.tags.map(t => `<span class="dsa-tag">${t}</span>`).join('')}
              ${(problem.companies || []).map(c => `<span class="dsa-company-tag" title="Asked at ${c}">${c}</span>`).join('')}
              <a class="dsa-link" href="${problem.link}" target="_blank" rel="noopener">LeetCode &#8599;</a>
              <span class="dsa-cat-progress"><strong>${catSolved}</strong>/${catProblems.length} ${problem.category}</span>
              ${saved.solved ? `<span class="dsa-solved-badge" title="${dsaFormatSolvedDateAbsolute(saved.solvedDate)}">&#10003; Solved ${dsaFormatSolvedDateRelative(saved.solvedDate)}</span>` : ''}
            </div>
          </div>
          <div class="dsa-pane-section">
            <div class="dsa-desc-toggle" onclick="dsaToggleDesc()">
              <h3><i class="ico">&#128196;</i> Problem</h3>
              <span class="chevron" id="dsaDescChevron">&#9660;</span>
            </div>
            <div class="dsa-desc-body" id="dsaDescBody">
              <div class="dsa-description">${descHtml}</div>
            </div>
          </div>
          <div class="dsa-pane-section">
            <h3><i class="ico">&#128221;</i> Examples</h3>
            ${examplesHtml}
          </div>
          ${hintHtml ? `<div class="dsa-pane-section dsa-hint-section">
            <div class="dsa-hint-header">
              <h3 style="margin:0;"><i class="ico">&#128161;</i> Hint</h3>
              ${hintUsed ? '<span class="dsa-hint-used-badge">used</span>' : ''}
            </div>
            <div class="dsa-hint-body ${hintUsed ? 'revealed' : ''}" id="dsaHintBody">
              <div class="dsa-hint-content">${hintHtml}</div>
            </div>
            ${!hintUsed ? `<button class="dsa-hint-btn" id="dsaHintBtn" onclick="dsaRevealHint('${id}')">Show Hint</button>` : ''}
          </div>` : ''}
          <div class="dsa-pane-section dsa-notes-wrap">
            <div class="dsa-notes-header">
              <h3 style="margin:0;"><i class="ico">&#9998;</i> Notes</h3>
              <span class="dsa-notes-saved" id="dsaNotesSaved">Saved</span>
            </div>
            <textarea class="dsa-notes" id="dsaNotes" placeholder="Approach, complexity, edge cases...">${escapeCode(notes)}</textarea>
          </div>
        </div>

        <!-- Draggable divider -->
        <div class="dsa-split-divider" id="dsaSplitDivider"></div>

        <!-- Right pane: editor + output -->
        <div class="dsa-split-right">
          <div class="dsa-editor-wrap">
            <div class="dsa-editor-toolbar">
              <span class="lang">Java</span>
              <div class="dsa-timer-wrap">
                <span class="dsa-timer" id="dsaTimer">${dsaFormatTime(dsaTimerSeconds)}</span>
                <button class="dsa-timer-btn" id="dsaTimerBtn" onclick="dsaToggleTimer('${id}')" title="Start/pause timer">&#9654;</button>
                <button class="dsa-timer-btn" onclick="dsaResetTimer('${id}')" title="Reset timer">&#9201;</button>
              </div>
              <span class="dsa-save-indicator" id="dsaSaveInd">Saved</span>
              <div class="actions">
                <button onclick="dsaFormatCode()" title="Auto-indent code">{ }</button>
                <button onclick="dsaResetCode('${id}')" title="Reset to starter code">&#8635;</button>
                <button class="dsa-fs-btn" onclick="dsaToggleFullscreen()" id="dsaFsBtn" title="Fullscreen">&#x26F6;</button>
                <button class="run-btn" onclick="dsaRunCode()" id="dsaRunBtn">&#9654; Run</button>
              </div>
            </div>
            <div class="dsa-editor-area">
              <div class="dsa-line-numbers" id="dsaLineNums"></div>
              <textarea class="dsa-editor" id="dsaCodeEditor" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">${escapeCode(code)}</textarea>
            </div>
          </div>

          <div class="dsa-output-wrap">
            <div class="dsa-output-header">
              <span>Output</span>
              <button style="margin-left:auto;padding:3px 10px;border:1px solid rgba(255,255,255,0.12);border-radius:6px;background:rgba(255,255,255,0.06);color:#94a3b8;font-size:11px;cursor:pointer;transition:all 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'" onclick="document.getElementById('dsaOutput').textContent='';document.getElementById('dsaTestResultsWrap').classList.remove('visible');">Clear</button>
            </div>
            <div class="dsa-output" id="dsaOutput">${saved.lastOutput || 'Click "Run" to execute your code.'}</div>
          </div>
          <div class="dsa-test-results-wrap" id="dsaTestResultsWrap"></div>
        </div>
      </div>

      <div class="dsa-hint">
        <span><kbd>Tab</kbd> Insert spaces</span>
        <span><kbd>Ctrl</kbd>+<kbd>Enter</kbd> Run code</span>
        <span><kbd>Esc</kbd> Exit fullscreen</span>
      </div>
      <button class="dsa-fs-exit" onclick="dsaToggleFullscreen()" style="display:none;" id="dsaFsExit">&#10005; Exit Fullscreen</button>
    </div>`;
  document.getElementById('contentWrapper').scrollTop = 0;

  // ── Line numbers ──
  dsaUpdateLineNumbers();

  // ── Set up editor behaviors ──
  const editor = document.getElementById('dsaCodeEditor');
  editor.addEventListener('scroll', dsaSyncLineScroll);
  // Insert text into the editor in a way that preserves native Undo/Redo.
  // document.execCommand('insertText', ...) is the only reliable way to add
  // a script-driven edit to the browser's undo stack. Deprecated but still
  // universally supported in 2026 browsers (no replacement exists for textarea).
  function insertWithUndo(text) {
    if (document.activeElement !== editor) editor.focus();
    const ok = document.execCommand && document.execCommand('insertText', false, text);
    if (!ok) {
      // Fallback for browsers that rejected execCommand: mutate directly.
      // Undo will still break in that path but the edit goes through.
      const s = editor.selectionStart, e2 = editor.selectionEnd;
      editor.value = editor.value.substring(0, s) + text + editor.value.substring(e2);
      editor.selectionStart = editor.selectionEnd = s + text.length;
    }
  }

  // Auto-close pairs. Typing an opener inserts its close with cursor between.
  // Typing a closer when the next char is already that closer skips over it
  // (so `foo()` flows naturally without double `))`).
  const BRACKET_PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
  const CLOSERS = new Set([')', ']', '}']);

  editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertWithUndo('    ');
      dsaAutoSave(id);
      dsaUpdateLineNumbers();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      dsaRunCode();
      return;
    }
    if (e.key === 'Escape' && document.getElementById('content').classList.contains('dsa-fullscreen')) {
      dsaToggleFullscreen();
    }

    // ── Auto-close brackets & quotes ──
    // Skip modifiers so Ctrl+C etc. still work. Only trigger for bare keypresses.
    if (BRACKET_PAIRS[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const nextChar = this.value[start] || '';
      // If next char is the same quote, treat as skip-over (don't duplicate)
      if ((e.key === '"' || e.key === "'") && nextChar === e.key && start === end) {
        e.preventDefault();
        this.selectionStart = this.selectionEnd = start + 1;
        return;
      }
      e.preventDefault();
      const close = BRACKET_PAIRS[e.key];
      if (start !== end) {
        // Wrap the current selection
        const selected = this.value.substring(start, end);
        insertWithUndo(e.key + selected + close);
      } else {
        insertWithUndo(e.key + close);
        // Place the cursor between the two characters
        this.selectionStart = this.selectionEnd = start + 1;
      }
      dsaAutoSave(id);
      dsaUpdateLineNumbers();
      return;
    }

    // ── Skip over existing closer ──
    if (CLOSERS.has(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const start = this.selectionStart;
      if (start === this.selectionEnd && this.value[start] === e.key) {
        e.preventDefault();
        this.selectionStart = this.selectionEnd = start + 1;
        return;
      }
    }

    // ── Backspace deletes both sides of a matched empty pair ──
    if (e.key === 'Backspace' && this.selectionStart === this.selectionEnd) {
      const pos = this.selectionStart;
      const prev = this.value[pos - 1];
      const next = this.value[pos];
      if (prev && next && BRACKET_PAIRS[prev] === next) {
        e.preventDefault();
        this.selectionStart = pos - 1;
        this.selectionEnd = pos + 1;
        document.execCommand('delete');
        dsaAutoSave(id);
        dsaUpdateLineNumbers();
        return;
      }
    }
    // ── Ctrl+/ — toggle line comment ──
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const val = this.value;
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = val.indexOf('\n', end);
      const block = val.substring(lineStart, lineEnd < 0 ? val.length : lineEnd);
      const lines = block.split('\n');
      const allCommented = lines.every(l => /^\s*\/\//.test(l));
      const toggled = allCommented
        ? lines.map(l => l.replace(/^(\s*)\/\/ ?/, '$1')).join('\n')
        : lines.map(l => l.replace(/^(\s*)/, '$1// ')).join('\n');
      this.selectionStart = lineStart;
      this.selectionEnd = lineEnd < 0 ? val.length : lineEnd;
      insertWithUndo(toggled);
      this.selectionStart = lineStart;
      this.selectionEnd = lineStart + toggled.length;
      dsaAutoSave(id);
      dsaUpdateLineNumbers();
      return;
    }
    // ── Ctrl+] — indent right ──
    if ((e.ctrlKey || e.metaKey) && e.key === ']') {
      e.preventDefault();
      const val = this.value;
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = val.indexOf('\n', end);
      const block = val.substring(lineStart, lineEnd < 0 ? val.length : lineEnd);
      const indented = block.split('\n').map(l => '    ' + l).join('\n');
      this.selectionStart = lineStart;
      this.selectionEnd = lineEnd < 0 ? val.length : lineEnd;
      insertWithUndo(indented);
      this.selectionStart = lineStart;
      this.selectionEnd = lineStart + indented.length;
      dsaAutoSave(id);
      dsaUpdateLineNumbers();
      return;
    }
    // ── Ctrl+[ — indent left ──
    if ((e.ctrlKey || e.metaKey) && e.key === '[') {
      e.preventDefault();
      const val = this.value;
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = val.indexOf('\n', end);
      const block = val.substring(lineStart, lineEnd < 0 ? val.length : lineEnd);
      const dedented = block.split('\n').map(l => l.replace(/^( {1,4}|\t)/, '')).join('\n');
      this.selectionStart = lineStart;
      this.selectionEnd = lineEnd < 0 ? val.length : lineEnd;
      insertWithUndo(dedented);
      this.selectionStart = lineStart;
      this.selectionEnd = lineStart + dedented.length;
      dsaAutoSave(id);
      dsaUpdateLineNumbers();
      return;
    }
    // ── Ctrl+D — duplicate line ──
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      const val = this.value;
      const pos = this.selectionStart;
      const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
      let lineEnd = val.indexOf('\n', pos);
      if (lineEnd < 0) lineEnd = val.length;
      const line = val.substring(lineStart, lineEnd);
      this.selectionStart = lineEnd;
      this.selectionEnd = lineEnd;
      insertWithUndo('\n' + line);
      this.selectionStart = this.selectionEnd = lineEnd + 1 + line.length;
      dsaAutoSave(id);
      dsaUpdateLineNumbers();
      return;
    }
    // ── Ctrl+Shift+K — delete line ──
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      const val = this.value;
      const pos = this.selectionStart;
      const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
      let lineEnd = val.indexOf('\n', pos);
      if (lineEnd < 0) lineEnd = val.length;
      else lineEnd += 1;
      this.selectionStart = lineStart;
      this.selectionEnd = lineEnd;
      document.execCommand('delete');
      dsaAutoSave(id);
      dsaUpdateLineNumbers();
      return;
    }
    // ── Auto-indent on plain Enter ──
    // Match current line's leading whitespace; if previous non-space char is an
    // opening bracket add one level; if cursor sits between { and } split onto
    // three lines with the } on its own row at the original indent.
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const val = this.value;
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const currentLine = val.substring(lineStart, start);
      const indent = (currentLine.match(/^[ \t]*/) || [''])[0];
      const prevChar = start > 0 ? val[start - 1] : '';
      const nextChar = val[end] || '';
      const opens = prevChar === '{' || prevChar === '[' || prevChar === '(';
      const matchedClose =
        (prevChar === '{' && nextChar === '}') ||
        (prevChar === '[' && nextChar === ']') ||
        (prevChar === '(' && nextChar === ')');
      let insertBefore, insertAfter;
      if (matchedClose) {
        insertBefore = '\n' + indent + '    ';
        insertAfter = '\n' + indent;
      } else if (opens) {
        insertBefore = '\n' + indent + '    ';
        insertAfter = '';
      } else {
        insertBefore = '\n' + indent;
        insertAfter = '';
      }
      // Insert both halves so Undo sees a single edit; then move the cursor
      // back between them if the closing brace was split onto its own line.
      insertWithUndo(insertBefore + insertAfter);
      if (insertAfter) {
        this.selectionStart = this.selectionEnd = this.selectionStart - insertAfter.length;
      }
      dsaAutoSave(id);
      dsaUpdateLineNumbers();
      dsaSyncLineScroll();
    }
  });
  editor.addEventListener('input', function() {
    dsaAutoSave(id);
    dsaUpdateLineNumbers();
  });

  // ── Preserve fullscreen state across Prev/Next navigation ──
  if (document.getElementById('content').classList.contains('dsa-fullscreen')) {
    const exitBtn = document.getElementById('dsaFsExit');
    if (exitBtn) exitBtn.style.display = '';
  }

  // ── Notes auto-save ──
  const notesEl = document.getElementById('dsaNotes');
  notesEl.addEventListener('input', function() { dsaAutoSaveNotes(id); });

  // ── Draggable split divider ──
  const divider = document.getElementById('dsaSplitDivider');
  const splitLeft = document.getElementById('dsaSplitLeft');
  if (divider && splitLeft) {
    let startX, startW;
    function onDragMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const newW = startW + (clientX - startX);
      const container = splitLeft.parentElement;
      const min = 220, max = container.clientWidth * 0.65;
      splitLeft.style.width = Math.max(min, Math.min(max, newW)) + 'px';
    }
    function onDragEnd() {
      divider.classList.remove('dragging');
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    function onDragStart(e) {
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startW = splitLeft.offsetWidth;
      divider.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
      document.addEventListener('touchmove', onDragMove, {passive:true});
      document.addEventListener('touchend', onDragEnd);
    }
    divider.addEventListener('mousedown', onDragStart);
    divider.addEventListener('touchstart', onDragStart, {passive:true});
  }
}

function dsaToggleFullscreen() {
  const contentEl = document.getElementById('content');
  const isFS = contentEl.classList.toggle('dsa-fullscreen');
  const exitBtn = document.getElementById('dsaFsExit');
  if (isFS) {
    document.body.style.overflow = 'hidden';
    if (exitBtn) exitBtn.style.display = '';
  } else {
    document.body.style.overflow = '';
    if (exitBtn) exitBtn.style.display = 'none';
  }
  var ed = document.getElementById('dsaCodeEditor');
  if (ed) ed.focus();
}

function escapeCode(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function dsaAutoSave(id) {
  clearTimeout(dsaAutoSaveTimer);
  dsaAutoSaveTimer = setTimeout(() => {
    const code = document.getElementById('dsaCodeEditor').value;
    const progress = getDSAProgress();
    if (!progress[id]) progress[id] = {};
    progress[id].code = code;
    progress[id].lastEdited = new Date().toISOString();
    saveDSAProgress(progress);
    const ind = document.getElementById('dsaSaveInd');
    if (ind) { ind.classList.add('show'); setTimeout(() => ind.classList.remove('show'), 1500); }
  }, 800);
}

function dsaFormatCode() {
  const ed = document.getElementById('dsaCodeEditor');
  if (!ed) return;
  const lines = ed.value.split('\n');
  const indent = '    ';
  let depth = 0;
  const result = [];
  for (let raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) { result.push(''); continue; }
    // Only track { and } for indentation (parens/brackets balance within a line)
    const leadingCloses = (trimmed.match(/^}+/) || [''])[0].length;
    depth = Math.max(0, depth - leadingCloses);
    result.push(indent.repeat(depth) + trimmed);
    // Net brace change for subsequent lines — leading closes already applied
    const allOpens = (trimmed.match(/\{/g) || []).length;
    const allCloses = (trimmed.match(/\}/g) || []).length;
    depth = Math.max(0, depth + allOpens - (allCloses - leadingCloses));
  }
  ed.value = result.join('\n');
  ed.dispatchEvent(new Event('input'));
  if (typeof showToast === 'function') showToast('Formatted', 'Code indentation applied', '✓');
}

function dsaResetCode(id) {
  const problem = getAllDSAProblems().find(p => p.id === id);
  if (!problem) return;
  if (!confirm('Reset code to the starter template? Your current code will be lost.')) return;
  const ed = document.getElementById('dsaCodeEditor');
  ed.value = problem.starterCode;
  const progress = getDSAProgress();
  if (progress[id]) { progress[id].code = problem.starterCode; saveDSAProgress(progress); }
  // Setting .value does not fire 'input'; refresh the line-number gutter manually.
  dsaUpdateLineNumbers();
}

// Format an ISO timestamp as a compact relative string: "today", "yesterday",
// "3 days ago", "2 wks ago", or the absolute date for anything older.
// Uses calendar-day comparison (not elapsed hours) so a timestamp from
// yesterday evening reads as "yesterday" even if only 10 hours have passed.
function dsaFormatSolvedDateRelative(iso) {
  if (!iso) return '';
  const then = new Date(iso);
  if (isNaN(then.getTime())) return '';
  const now = new Date();
  const thenDay = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((nowDay - thenDay) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return days + ' days ago';
  if (days < 14) return '1 wk ago';
  if (days < 30) return Math.floor(days / 7) + ' wks ago';
  if (days < 60) return '1 mo ago';
  if (days < 365) return Math.floor(days / 30) + ' mos ago';
  if (days < 730) return '1 yr ago';
  return Math.floor(days / 365) + ' yrs ago';
}
function dsaFormatSolvedDateAbsolute(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return 'Solved ' + d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function dsaToggleImportant(id) {
  const progress = getDSAProgress();
  if (!progress[id]) progress[id] = {};
  progress[id].important = !progress[id].important;
  saveDSAProgress(progress);
  const btn = document.getElementById('dsaImportantBtn');
  if (btn) {
    btn.classList.toggle('active', progress[id].important);
    btn.innerHTML = progress[id].important ? '&#9733; Important' : '&#9734; Important';
    btn.title = progress[id].important ? 'Marked as important' : 'Mark as important';
  }
}

function dsaToggleImportantFilter() {
  dsaImportantOnly = !dsaImportantOnly;
  saveDSAView();
  dsaRefreshList();
  dsaRefreshActiveChips();
  const btn = document.getElementById('dsaImportantFilterBtn');
  if (btn) btn.classList.toggle('active', dsaImportantOnly);
}

function dsaRevealHint(id) {
  const progress = getDSAProgress();
  if (!progress[id]) progress[id] = {};
  progress[id].hintUsed = true;
  saveDSAProgress(progress);
  const body = document.getElementById('dsaHintBody');
  if (body) body.classList.add('revealed');
  const btn = document.getElementById('dsaHintBtn');
  if (btn) btn.remove();
  const header = document.querySelector('.dsa-hint-header');
  if (header && !header.querySelector('.dsa-hint-used-badge')) {
    const badge = document.createElement('span');
    badge.className = 'dsa-hint-used-badge';
    badge.textContent = 'used';
    header.appendChild(badge);
  }
}

function dsaSkipProblem() {
  if (!dsaCurrentProblem) return;
  const allProblems = getAllDSAProblems();
  const progress = getDSAProgress();
  const problem = allProblems.find(p => p.id === dsaCurrentProblem);
  if (!problem) return;
  if (!progress[dsaCurrentProblem]) progress[dsaCurrentProblem] = {};
  progress[dsaCurrentProblem].skipped = true;
  saveDSAProgress(progress);
  const catList = allProblems.filter(p => p.category === problem.category);
  const idx = catList.findIndex(p => p.id === dsaCurrentProblem);
  const next = catList.slice(idx + 1).find(p => !progress[p.id]?.solved);
  if (next) {
    showDSAProblem(next.id);
  } else if (typeof showToast === 'function') {
    showToast('End of category', 'No more unsolved problems in ' + problem.category, '🏁');
  }
}

function dsaToggleSolved(id) {
  const progress = getDSAProgress();
  if (!progress[id]) progress[id] = {};
  progress[id].solved = !progress[id].solved;
  if (progress[id].solved) progress[id].solvedDate = new Date().toISOString();
  else delete progress[id].solvedDate;
  // Save current code too
  const editor = document.getElementById('dsaCodeEditor');
  if (editor) progress[id].code = editor.value;
  saveDSAProgress(progress);
  if (progress[id].solved && interactiveMode) addXP(15, 'Solved DSA problem');
  // Update solved badge in hero card with relative date + absolute on hover
  const meta = document.querySelector('.dsa-problem-meta');
  const existing = meta?.querySelector('.dsa-solved-badge');
  if (progress[id].solved) {
    const relative = dsaFormatSolvedDateRelative(progress[id].solvedDate);
    const absolute = dsaFormatSolvedDateAbsolute(progress[id].solvedDate);
    if (existing) {
      existing.innerHTML = '&#10003; Solved ' + relative;
      existing.title = absolute;
    } else if (meta) {
      const badge = document.createElement('span');
      badge.className = 'dsa-solved-badge';
      badge.innerHTML = '&#10003; Solved ' + relative;
      badge.title = absolute;
      meta.appendChild(badge);
    }
  } else if (existing) {
    existing.remove();
  }
}

// ─── Timer functions ───
function dsaFormatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function dsaToggleTimer(id) {
  if (dsaTimerRunning) {
    dsaPauseTimer(id);
  } else {
    dsaStartTimer(id);
  }
}

function dsaStartTimer(id) {
  dsaTimerRunning = true;
  const btn = document.getElementById('dsaTimerBtn');
  if (btn) { btn.innerHTML = '&#10074;&#10074;'; btn.classList.add('running'); btn.title = 'Pause timer'; }
  dsaTimerInterval = setInterval(() => {
    dsaTimerSeconds++;
    const display = document.getElementById('dsaTimer');
    if (display) display.textContent = dsaFormatTime(dsaTimerSeconds);
    // Auto-save timer every 10 seconds
    if (dsaTimerSeconds % 10 === 0) dsaSaveTimer(id);
  }, 1000);
}

function dsaPauseTimer(id) {
  dsaTimerRunning = false;
  clearInterval(dsaTimerInterval);
  dsaTimerInterval = null;
  const btn = document.getElementById('dsaTimerBtn');
  if (btn) { btn.innerHTML = '&#9654;'; btn.classList.remove('running'); btn.title = 'Start timer'; }
  dsaSaveTimer(id);
}

function dsaStopTimer() {
  dsaTimerRunning = false;
  clearInterval(dsaTimerInterval);
  dsaTimerInterval = null;
  // Save final time for current problem
  if (dsaCurrentProblem && dsaTimerSeconds > 0) {
    dsaSaveTimer(dsaCurrentProblem);
  }
}

function dsaResetTimer(id) {
  dsaPauseTimer(id);
  dsaTimerSeconds = 0;
  const display = document.getElementById('dsaTimer');
  if (display) display.textContent = dsaFormatTime(0);
  dsaSaveTimer(id);
}

function dsaSaveTimer(id) {
  const progress = getDSAProgress();
  if (!progress[id]) progress[id] = {};
  progress[id].timerSeconds = dsaTimerSeconds;
  saveDSAProgress(progress);
}

// ─── Collapsible description ───
function dsaToggleDesc() {
  const body = document.getElementById('dsaDescBody');
  const chevron = document.getElementById('dsaDescChevron');
  if (!body) return;
  body.classList.toggle('collapsed');
  if (chevron) chevron.classList.toggle('collapsed');
}

// ─── Notes auto-save ───
function dsaAutoSaveNotes(id) {
  clearTimeout(dsaNoteSaveTimer);
  dsaNoteSaveTimer = setTimeout(() => {
    const notesEl = document.getElementById('dsaNotes');
    if (!notesEl) return;
    const progress = getDSAProgress();
    if (!progress[id]) progress[id] = {};
    progress[id].notes = notesEl.value;
    saveDSAProgress(progress);
    const ind = document.getElementById('dsaNotesSaved');
    if (ind) { ind.classList.add('show'); setTimeout(() => ind.classList.remove('show'), 1500); }
  }, 800);
}

// ─── Test runner: parse expected outputs from `// expected` comments in main() ───
// Handles three conventions used across the problem set:
//   1. Same line:    System.out.println(x);  // expected
//   2. Next line:    System.out.println(x);
//                    // expected
//   3. Multi-line args:
//                    System.out.println(foo(a,
//                        b));   // expected
function dsaParseExpectedFromCode(code) {
  const tests = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.match(/System\.out\.println\s*\(/)) continue;

    // Walk forward until we find the line that closes the statement (ends with ';')
    let end = i;
    while (end < lines.length) {
      const codePart = lines[end].split('//')[0].trimEnd();
      if (codePart.endsWith(';')) break;
      end++;
    }
    if (end >= lines.length) continue;

    // Pattern 1 / 3: `; // expected` on the closing line
    const inlineMatch = lines[end].match(/;\s*\/\/\s*(.+?)\s*$/);
    if (inlineMatch) {
      tests.push(dsaCleanExpected(inlineMatch[1]));
      i = end;
      continue;
    }

    // Pattern 2: `// expected` on the next non-empty line
    for (let j = end + 1; j < lines.length; j++) {
      const next = lines[j].trim();
      if (next === '') continue;
      const cmtMatch = next.match(/^\/\/\s*(.+?)\s*$/);
      if (cmtMatch) {
        tests.push(dsaCleanExpected(cmtMatch[1]));
        i = j;
      }
      break; // stop after first non-empty line either way
    }
  }
  return tests;
}

// Strip a trailing human-readable annotation like "3 (5+5+5)" → "3"
// (only when there's whitespace before the `(`, so we don't damage
// real outputs like "(0,0,0)" or "[(1,2)]")
function dsaCleanExpected(s) {
  return (s || '').trim().replace(/\s+\([^)]*\)\s*$/, '').trim();
}

// Forgiving comparison: trim + collapse whitespace, and ignore spacing around
// brackets/parens/commas so [1, 2, 3] and [1,2,3] compare equal. Java's
// Arrays.toString / List.toString always add a space after each comma, but
// expected-output comments in the starter code often don't.
function dsaNormalizeLine(s) {
  return (s || '').trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .replace(/\s*\[\s*/g, '[')
    .replace(/\s*\]\s*/g, ']');
}

function dsaCompareTests(actualOutput, expectedLines) {
  const actualLines = (actualOutput || '').split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);
  return expectedLines.map((expected, i) => {
    const actual = i < actualLines.length ? actualLines[i] : null;
    const pass = actual !== null && dsaNormalizeLine(actual) === dsaNormalizeLine(expected);
    return {
      idx: i + 1,
      pass,
      expected,
      actual: actual === null ? '(no output)' : actual,
    };
  });
}

function dsaRenderTestResults(results) {
  if (!results || results.length === 0) return '';
  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  const allPass = passed === total;

  const banner = `<div class="dsa-test-banner ${allPass ? 'pass' : 'fail'}">
      <span class="dsa-test-banner-icon">${allPass ? '&#10003;' : '&#10007;'}</span>
      <span>${allPass
        ? 'All ' + total + ' tests passed!'
        : passed + ' / ' + total + ' tests passed'}</span>
    </div>`;

  const rows = results.map(r => `
    <div class="dsa-test-row ${r.pass ? 'pass' : 'fail'}">
      <span class="dsa-test-icon">${r.pass ? '&#10003;' : '&#10007;'}</span>
      <span class="dsa-test-num">Test ${r.idx}</span>
      <span class="dsa-test-detail">${r.pass
        ? '<span class="dsa-test-chip">' + escapeHTML(r.expected) + '</span>'
        : 'expected <span class="dsa-test-chip expected">' + escapeHTML(r.expected) + '</span> &middot; got <span class="dsa-test-chip actual">' + escapeHTML(r.actual) + '</span>'
      }</span>
    </div>`).join('');

  return banner + '<div class="dsa-test-rows">' + rows + '</div>';
}

async function dsaRunCode() {
  const editor = document.getElementById('dsaCodeEditor');
  const output = document.getElementById('dsaOutput');
  const runBtn = document.getElementById('dsaRunBtn');
  const testWrap = document.getElementById('dsaTestResultsWrap');
  if (!editor || !output) return;

  // Remove 'public' from class declaration — Wandbox saves as prog.java,
  // but Java requires filename to match the public class name.
  // Making the class non-public avoids the mismatch.
  const userCode = editor.value;
  const code = userCode.replace(/public\s+(class\s+)/g, '$1');
  output.className = 'dsa-output running';
  output.textContent = 'Compiling and running...';
  if (testWrap) { testWrap.classList.remove('visible'); testWrap.innerHTML = ''; }
  runBtn.disabled = true;
  runBtn.innerHTML = '&#9203; Running...';

  let programOutput = '';
  let executionFailed = false;

  try {
    const resp = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, compiler: 'openjdk-jdk-22+36', save: false })
    });

    if (!resp.ok) throw new Error('API returned ' + resp.status);
    const data = await resp.json();

    if (data.compiler_error) {
      output.className = 'dsa-output error';
      output.textContent = 'Compilation Error:\n' + data.compiler_error;
      executionFailed = true;
    } else if (data.program_error) {
      output.className = 'dsa-output error';
      output.textContent = 'Runtime Error:\n' + data.program_error + (data.program_output ? '\n\nOutput:\n' + data.program_output : '');
      executionFailed = true;
    } else if (data.signal) {
      output.className = 'dsa-output error';
      output.textContent = 'Process killed (signal: ' + data.signal + ')';
      executionFailed = true;
    } else {
      output.className = 'dsa-output';
      output.textContent = data.program_output || '(No output)';
      programOutput = data.program_output || '';
    }

    // ── Run automated tests if we can parse `// expected` comments ──
    if (!executionFailed && testWrap) {
      const expected = dsaParseExpectedFromCode(userCode);
      if (expected.length > 0) {
        const results = dsaCompareTests(programOutput, expected);
        testWrap.innerHTML = dsaRenderTestResults(results);
        testWrap.classList.add('visible');

        // Auto-mark solved on first all-pass
        if (dsaCurrentProblem && results.every(r => r.pass)) {
          const progress = getDSAProgress();
          const wasSolved = progress[dsaCurrentProblem]?.solved;
          if (!wasSolved) {
            dsaToggleSolved(dsaCurrentProblem);
            if (typeof showToast === 'function') {
              showToast('Solved!', 'All ' + results.length + ' tests passed', '&#10003;');
            }
            if (typeof fireConfetti === 'function') fireConfetti();
          }
        }
      }
    }

    // Save output + test summary
    if (dsaCurrentProblem) {
      const progress = getDSAProgress();
      if (!progress[dsaCurrentProblem]) progress[dsaCurrentProblem] = {};
      progress[dsaCurrentProblem].lastOutput = output.textContent;
      progress[dsaCurrentProblem].lastRun = new Date().toISOString();
      progress[dsaCurrentProblem].code = userCode;
      saveDSAProgress(progress);
    }
  } catch (err) {
    output.className = 'dsa-output error';
    output.textContent = 'Failed to execute code.\n\n' + err.message + '\n\nMake sure you have an internet connection.\nThe code runs on Wandbox API — it may be temporarily unavailable.';
  } finally {
    runBtn.disabled = false;
    runBtn.innerHTML = '&#9654; Run';
  }
}
