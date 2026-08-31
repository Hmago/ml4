// ═══════════════════════════════════════════════════════════
// ═══  chapter.js — chapter reader: sidebar, loading, TOC, ═══
// ═══  comments, highlights, quizzes, notebook, pyodide      ═══
// ═══════════════════════════════════════════════════════════

// ─── Chapter Data (with section dividers) ───
const chapters = [
  // ── QUICK REFERENCE (always at hand) ──
  { section: 'Quick Reference' },
  { id: '★',   file: 'content/00p_dl_llm_playbook.md', title: 'DL & LLMs — Playbook', ref: true },
  { id: '00',  file: 'content/00_quick_reference_cheat_sheet.md', title: 'Cheat Sheet — All Topics', ref: true },

  // ── STRATEGY & PLANNING ──
  { section: 'Strategy & Planning' },
  { id: '01', file: 'content/01_google_ai_engineer_strategy.md', title: 'Google AI Engineer Strategy' },
  { id: '⌂', file: 'README.md', title: 'Learning Roadmap' },
  { id: '02', file: 'content/02_behavioral_interview.md', title: 'Behavioral Interview (Google)' },
  { id: '03', file: 'content/03_staying_relevant_ai_era.md', title: 'Staying Relevant in AI Era' },

  // ── APTITUDE & BRAIN TRAINING ──
  { section: 'Aptitude & Brain Training' },
  { id: '04', file: 'content/04_aptitude_mental_math.md', title: 'Aptitude & Mental Math' },
  { id: '05', file: 'content/05_brain_training.md', title: 'Brain Training & Memory' },
  { id: '05b', file: 'content/05b_brain_upgrade_30_days.md', title: 'Sharper, Younger Brain (Program)' },

  // ── MATH FOUNDATIONS ──
  { section: 'Math Foundations' },
  { id: '06', file: 'content/06_math_fundamentals.md', title: 'Math for ML & AI' },

  // ── ML CURRICULUM ──
  { section: 'ML Curriculum' },
  { id: '07', file: 'content/07_introduction.md', title: 'Introduction to ML' },
  { id: '08', file: 'content/08_core_concepts.md', title: 'Core Concepts & Terminology' },
  { id: '09', file: 'content/09_data_preprocessing.md', title: 'Data Preprocessing' },
  { id: '10', file: 'content/10_supervised_learning.md', title: 'Supervised Learning' },
  { id: '11', file: 'content/11_unsupervised_learning.md', title: 'Unsupervised Learning' },
  { id: '12', file: 'content/12_key_algorithms.md', title: 'Key Algorithms Deep Dive' },
  { id: '13', file: 'content/13_model_evaluation.md', title: 'Model Evaluation & Tuning' },
  { id: '14', file: 'content/14_neural_networks.md', title: 'Neural Networks' },
  { id: '15', file: 'content/15_reinforcement_learning.md', title: 'Reinforcement Learning' },
  { id: '↻', file: 'content/15s_ml_curriculum_recap.md', title: 'ML Curriculum — Quick Revision', ref: true, recap: true },

  // ── DEEP LEARNING & LLMs ──
  { section: 'Deep Learning & LLMs' },
  { id: '16', file: 'content/16_deep_learning.md', title: 'Deep Learning Reference' },
  { id: '17', file: 'content/17_llm.md', title: 'LLMs — How They Work' },
  { id: '17b', file: 'content/17b_llm_applications.md', title: 'LLMs — How You Use Them' },
  { id: '17c', file: 'content/17c_llm_systems.md', title: 'LLM Systems — Serving & Scale' },
  { id: '18', file: 'content/18_ai_agents.md', title: 'AI Agents & Tool Use' },
  { id: '18b', file: 'content/18b_agents_in_production.md', title: 'Agents in Production' },
  { id: '19', file: 'content/19_ai_frameworks.md', title: 'AI Frameworks & Engineering' },
  { id: '20', file: 'content/20_2026_landscape.md', title: 'The 2026 AI Landscape' },
  { id: '↻', file: 'content/20s_deep_learning_llms_recap.md', title: 'Deep Learning & LLMs — Quick Revision', ref: true, recap: true },

  // ── SYSTEM DESIGN ──
  { section: 'System Design' },
  { id: '21', file: 'content/21_design_fundamentals.md', title: 'OO Design & SOLID (Java)' },
  { id: '22', file: 'content/22_engineering_tools.md', title: 'Engineering Tools (Kafka/Redis/Spark/K8s)' },
  { id: '23', file: 'content/23_system_design_fundamentals_deep_dive.md', title: 'Sys Design Pt 1: Foundations & Protocols' },
  { id: '24', file: 'content/24_system_design_data_distributed.md', title: 'Sys Design Pt 2: Data & Distributed Systems' },
  { id: '25', file: 'content/25_system_design_operations_case_studies.md', title: 'Sys Design Pt 3: Operations & Case Studies' },
  { id: '26', file: 'content/26_ml_system_design.md', title: 'ML System Design (Google)' },
  { id: '↻', file: 'content/26s_system_design_recap.md', title: 'System Design — Quick Revision', ref: true, recap: true },

  // ── SYSTEM DESIGN — CASE STUDIES ──
  { section: 'System Design — Case Studies' },
  { id: '35', file: 'content/35_system_design_cases_realtime.md', title: 'Design Cases 1: Real-Time & Comms' },
  { id: '36', file: 'content/36_system_design_cases_search_media.md', title: 'Design Cases 2: Search, Geo & Media' },
  { id: '37', file: 'content/37_system_design_cases_scale_infra.md', title: 'Design Cases 3: Scale, Infra & Money' },

  // ── PRACTICAL & INFRASTRUCTURE ──
  { section: 'Practical & Infrastructure' },
  { id: '27',  file: 'content/27_practical_ml.md', title: 'Practical ML: Zero to Production' },
  { id: '27b', file: 'content/27_practical_ml.ipynb', title: 'Practical ML Notebook', notebook: true },
  { id: '28',  file: 'content/28_semantic_search.md', title: 'Building Semantic Search' },
  { id: '29',  file: 'content/29_gpus_tpus_infrastructure.md', title: 'GPUs, TPUs & AI Infrastructure' },
  { id: '30',  file: 'content/30_google_ml_ecosystem.md', title: 'Google ML Ecosystem (TPUs, JAX, Vertex AI)' },

  // ── DSA / CODING ──
  { section: 'DSA / Coding' },
  { id: '31', file: 'content/31_dsa_coding.md', title: 'DSA & ML Coding (Java)' },

  // ── INTERVIEW PREP ──
  { section: 'Interview Prep' },
  { id: '32', file: 'content/32_interview_questions.md', title: 'ML Interview Questions' },
  { id: '33',  file: 'content/33_llm_interview_questions.md', title: 'LLM Interview Questions — Pt 1' },
  { id: '33b', file: 'content/33b_llm_interview_questions_part2.md', title: 'LLM Interview Questions — Pt 2' },
  { id: '34',  file: 'content/34_google_top10_ml_interview.md', title: "Google's Top 10 ML Topics — Pt 1" },
  { id: '34b', file: 'content/34b_google_top10_ml_interview_part2.md', title: "Google's Top 10 ML Topics — Pt 2" },
];

// ─── Sidebar ───
function renderSidebar() {
  const list = document.getElementById('chapterList');
  list.innerHTML = chapters.map((ch, i) => {
    // Section divider (not a chapter)
    if (ch.section) {
      return `<div class="section-divider">${ch.section}</div>`;
    }
    return `<div class="chapter-item ${i === currentIndex ? 'active' : ''}" onclick="loadChapter(${i})">
      <span class="check">${ch.ref ? '&#128278;' : (readChapters[ch.file] ? '&#10003;' : '')}</span>
      <span class="num">${ch.id}</span>
      <span>${ch.title}</span>
    </div>`;
  }).join('');
  updateProgress();
  const realChapters = chapters.filter(ch => !ch.section);
  document.getElementById('chapter-count').textContent = `${realChapters.length} chapters`;
}

function updateProgress() {
  // Progress display is now on the Dashboard page — nothing to update in sidebar
}

// ─── Load Chapter ───
async function loadChapter(index) {
  if (index < 0 || index >= chapters.length) return;
  // Skip section dividers
  if (chapters[index].section) return;
  currentIndex = index;
  currentPage = 'chapter';
  const ch = chapters[index];
  trackChapterOpen(ch.file);

  document.getElementById('breadcrumb').textContent = `${ch.id} — ${ch.title}`;
  document.getElementById('readBtn').style.display = ch.ref ? 'none' : '';
  document.getElementById('findBtn').style.display = '';
  document.getElementById('focusBtn').style.display = '';
  document.getElementById('ttsBtn').style.display = '';
  ttsStop();
  document.getElementById('welcome')?.remove();
  renderSidebar();
  closeSidebar();

  const contentEl = document.getElementById('content');
  contentEl.classList.toggle('recap-view', !!ch.recap);
  contentEl.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

  try {
    let md;
    if (cachedContent[ch.file]) {
      md = cachedContent[ch.file];
    } else {
      // 20s timeout — iOS PWA fetches occasionally hang on flaky networks or
      // when the service worker can't reach the network. Without a timeout
      // the UI sits on "Loading…" forever.
      const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, 20000);
      let res;
      try {
        res = await fetch(ch.file, ctrl ? { signal: ctrl.signal } : undefined);
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      md = await res.text();
      cachedContent[ch.file] = md;
    }

    // Self-correct the reading-time estimate from the live content: measure the
    // real word count once per open (cheap; cached & deduped in recordChapterWords).
    if (typeof recordChapterWords === 'function' && !ch.notebook) {
      recordChapterWords(ch.file, md.split(/\s+/).filter(Boolean).length);
    }

    var mathProtected = protectMath(md);
    contentEl.innerHTML = restoreMath(marked.parse(mathProtected.md), mathProtected.store);
    // insertAdjacentHTML appends without re-serializing/re-parsing the chapter
    // we just rendered (which `innerHTML +=` would force).
    contentEl.insertAdjacentHTML('beforeend', renderNavButtons());

    // Render LaTeX math with KaTeX — skip the full-tree walk when the chapter
    // contains no '$' delimiter at all (most non-math chapters).
    if (window.renderMathInElement && contentEl.textContent.indexOf('$') !== -1) {
      renderMathInElement(contentEl, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
        trust: true,
      });
    }

    buildTOC();
    document.getElementById('contentWrapper').scrollTop = 0;

    // Update URL hash
    pushHash(ch.file.replace('.md', ''));

    // Update read button
    document.getElementById('readBtn').classList.toggle('active', !!readChapters[ch.file]);

    // Defer syntax highlighting of unlabeled/unknown-language code blocks
    // until after first paint. Chunked via requestIdleCallback so the iOS
    // PWA main thread stays responsive on huge chapters (previously this
    // ran synchronously inside marked.parse() and blocked rendering long
    // enough that iOS WebKit would kill the page renderer).
    if (typeof lazyHighlightCodeBlocks === 'function') {
      lazyHighlightCodeBlocks(contentEl);
    }

  } catch (err) {
    const isAbort = err && (err.name === 'AbortError' || /aborted/i.test(err.message || ''));
    const msg = isAbort ? 'Request timed out (20s).' : `Failed to load ${ch.file}: ${err.message}`;
    contentEl.innerHTML = `<div class="loading" style="color:#b91c1c;flex-direction:column;gap:14px;text-align:center;">
      <div>${msg}</div>
      <button onclick="loadChapter(${index})"
              style="background:var(--accent);color:white;border:none;border-radius:8px;padding:10px 22px;font-size:14px;cursor:pointer;font-weight:600;">
        &#8635; Retry
      </button>
      <small style="color:var(--text-secondary);max-width:360px;">
        If this keeps happening on iOS, try closing the app fully (swipe up from the app switcher) and reopening it &mdash; iOS sometimes serves stale or partial cached responses for large chapters.
      </small>
    </div>`;
  }
}

// ─── Nav Buttons ───
function findPrevChapter(from) {
  for (let i = from - 1; i >= 0; i--) {
    if (!chapters[i].section) return i;
  }
  return -1;
}
function findNextChapter(from) {
  for (let i = from + 1; i < chapters.length; i++) {
    if (!chapters[i].section) return i;
  }
  return -1;
}
function renderNavButtons() {
  const prevIdx = findPrevChapter(currentIndex);
  const nextIdx = findNextChapter(currentIndex);
  const prev = prevIdx >= 0 ? chapters[prevIdx] : null;
  const next = nextIdx >= 0 ? chapters[nextIdx] : null;
  return `<div class="nav-buttons">
    <button class="nav-btn" onclick="loadChapter(${prevIdx})" ${!prev ? 'disabled' : ''}>
      <div class="nav-btn-label">&larr; Previous</div>
      ${prev ? prev.title : ''}
    </button>
    <button class="nav-btn" onclick="loadChapter(${nextIdx})" ${!next ? 'disabled' : ''}>
      <div class="nav-btn-label">Next &rarr;</div>
      ${next ? next.title : ''}
    </button>
  </div>`;
}

// ─── Table of Contents (right panel) ───
function buildTOC() {
  const headings = document.querySelectorAll('#content h2, #content h3');
  const tocPanel = document.getElementById('tocPanel');
  const tocLinks = document.getElementById('tocLinks');

  if (headings.length === 0) {
    tocPanel.classList.remove('visible');
    return;
  }

  tocPanel.classList.add('visible');
  tocLinks.innerHTML = Array.from(headings).map((h, i) => {
    const id = 'heading-' + i;
    h.id = id;
    const cls = h.tagName === 'H3' ? 'h3' : '';
    const text = h.textContent.length > 40 ? h.textContent.slice(0, 40) + '...' : h.textContent;
    return `<a href="#${id}" class="${cls}" onclick="event.preventDefault(); document.getElementById('${id}').scrollIntoView({behavior:'smooth'})">${text}</a>`;
  }).join('');
}

// ─── Read Status ───
function toggleReadStatus() {
  if (currentIndex < 0) return;
  const file = chapters[currentIndex].file;
  if (readChapters[file]) return;
  readChapters[file] = true;
  localStorage.setItem('ml4-read', JSON.stringify(readChapters));
  document.getElementById('readBtn').classList.toggle('active', true);
  renderSidebar();
}

// ─── Search ───
// Sidebar global search. Primary path consumes a prebuilt, lazy-loaded index
// (js/data/search_index.js → global SEARCH_INDEX) and scans it in memory — no
// per-keystroke markdown fetches. Results are grouped by chapter, weighted so
// title/heading matches rank first, keyboard-navigable, and each snippet
// deep-links to the matched text in #content with a brief flash. A network
// fetch fallback keeps search working when the index can't be loaded.
let searchTimeout;
let _searchIndexData = null;     // resolved SEARCH_INDEX (or fallback pseudo-index) once loaded
let _searchIndexPromise = null;  // de-dupes the lazy <script> injection
let _fallbackData = null;        // pseudo-index built from fetched markdown (offline fallback)
let _fileToRegistry = null;      // file path → registry index in `chapters`
let _searchSeq = 0;              // guards against out-of-order async renders
let _searchSelectedIndex = -1;   // keyboard-selected snippet (index into rendered .search-result-item list)
let _searchState = { query: '', items: [], visible: false }; // items[] carries deep-link payloads in document order
// Lowercased mirror per index-chapter, built once on first use. Keyed by the
// chapter object (WeakMap) so the real index and the fallback pseudo-index don't
// collide. We deliberately keep ONLY the lowercased-lines mirror (+ title/headings)
// and reject chapters by scanning it for the first token's stem — no separate
// permanently-stored joined "lowerConcat" blob (avoids the old double-storage).
const _lowerCache = new WeakMap();

// Lazy-load the prebuilt index exactly once (mirrors the quizzes.js loader).
function loadSearchIndex() {
  if (typeof SEARCH_INDEX !== 'undefined') return Promise.resolve(SEARCH_INDEX);
  if (_searchIndexPromise) return _searchIndexPromise;
  _searchIndexPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'js/data/search_index.js';
    s.onload = () => {
      if (typeof SEARCH_INDEX !== 'undefined') resolve(SEARCH_INDEX);
      else { _searchIndexPromise = null; reject(new Error('search_index.js loaded but SEARCH_INDEX is undefined')); }
    };
    s.onerror = () => { _searchIndexPromise = null; reject(new Error('search_index.js failed to load')); };
    document.head.appendChild(s);
  });
  return _searchIndexPromise;
}

// file → registry index, so a matched index-chapter maps back to loadChapter().
function getFileToRegistry() {
  if (!_fileToRegistry) {
    _fileToRegistry = {};
    chapters.forEach((ch, i) => { if (ch.file) _fileToRegistry[ch.file] = i; });
  }
  return _fileToRegistry;
}

function getLowerCache(ich) {
  let c = _lowerCache.get(ich);
  if (!c) {
    const lines = ich.lines || [];
    c = {
      lowerTitle: (ich.title || '').toLowerCase(),
      lowerHeadings: (ich.headings || []).map(h => (h || '').toLowerCase()),
      lowerLines: lines.map(l => ((l && l[0]) || '').toLowerCase()),
    };
    _lowerCache.set(ich, c);
  }
  return c;
}

// Fetch one chapter's markdown (from cache when available); returns null on
// failure. Retained for the offline fallback path only — NOT the hot path.
async function fetchSearchContent(ch) {
  if (cachedContent[ch.file]) return cachedContent[ch.file];
  try {
    const res = await fetch(ch.file);
    if (res.ok) {
      const md = await res.text();
      cachedContent[ch.file] = md;
      return md;
    }
  } catch {}
  return null;
}

// ── Query analysis & matching ──────────────────────────────────────────────
function _escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function _escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Light, dependency-free stemmer: strip one common trailing suffix on words long
// enough to keep a ≥3-char stem. Used for typo/morphology tolerance ("embedding"
// ⇄ "embeddings"). The stem is always a substring of any exact OR fuzzy hit, so
// it doubles as a sound quick-reject key.
function _stemToken(t) {
  if (t.length <= 3) return t;
  const suffixes = ['ing', 'es', 'ed', 's'];
  for (const sfx of suffixes) {
    if (t.length - sfx.length >= 3 && t.slice(-sfx.length) === sfx) return t.slice(0, -sfx.length);
  }
  return t;
}

// Returns 0 = no match, 1 = fuzzy (stem) match, 2 = exact (every token is a
// substring). A line/title/heading matches only if EVERY token matches.
function _matchText(lowText, tokens, stems) {
  if (!lowText) return 0;
  let allExact = true;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (lowText.indexOf(t) !== -1) continue;        // exact substring for this token
    allExact = false;
    const st = stems[i];
    if (st !== t && lowText.indexOf(st) !== -1) continue; // fuzzy (stemmed) match
    return 0;
  }
  return allExact ? 2 : 1;
}

// Tokenise + stem + build the highlight regex ONCE per query.
function _buildQueryParts(query) {
  const tokens = query.split(/\s+/).filter(Boolean);
  const stems = tokens.map(_stemToken);
  const terms = [];
  if (tokens.length > 1) terms.push(_escapeRegex(query));   // whole-phrase match wins
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i], st = stems[i];
    // Expand reasonably long stems to whole words so morphological variants
    // (embedding/embeddings) highlight fully; short tokens stay literal.
    if (st !== t && st.length >= 3) terms.push(_escapeRegex(st) + '\\w*');
    else terms.push(_escapeRegex(t));
  }
  const uniq = Array.from(new Set(terms)).sort((a, b) => b.length - a.length);
  const highlightRe = uniq.length ? new RegExp('(' + uniq.join('|') + ')', 'gi') : null;
  return { tokens, stems, highlightRe };
}

// Strip residual markdown so snippets read as plain prose.
function _cleanLine(s) {
  return (s || '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')   // images → alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // links → label
    .replace(/`+/g, '')                          // inline-code backticks
    .replace(/[*_~]{1,3}/g, '')                   // **bold** _italic_ ~~strike~~
    .replace(/^\s{0,3}#{1,6}\s*/, '')             // leading heading hashes
    .replace(/^\s*>+\s?/, '')                     // blockquote markers
    .replace(/\|/g, ' ')                          // table pipes
    .replace(/\s+/g, ' ')
    .trim();
}

// Build a clean, windowed, highlighted snippet around the first match.
function _makeSnippet(rawText, parts, query) {
  const { tokens, highlightRe } = parts;
  const text = _cleanLine(rawText);
  if (!text) return '';
  const lower = text.toLowerCase();
  let idx = lower.indexOf(query);
  let mlen = query.length;
  if (idx < 0) {
    idx = Infinity;
    for (const t of tokens) {
      let p = lower.indexOf(t), len = t.length;
      if (p < 0) { const st = _stemToken(t); if (st !== t) { p = lower.indexOf(st); len = st.length; } }
      if (p >= 0 && p < idx) { idx = p; mlen = len; }
    }
    if (!isFinite(idx)) { idx = 0; mlen = 0; }
  }
  const RAD = 40;
  let start = Math.max(0, idx - RAD);
  let end = Math.min(text.length, idx + mlen + RAD);
  // Nudge to nearby word boundaries so we don't slice mid-word.
  if (start > 0) { const sp = text.lastIndexOf(' ', start); if (sp > start - 15 && sp > 0) start = sp + 1; }
  if (end < text.length) { const sp = text.indexOf(' ', end); if (sp !== -1 && sp < end + 15) end = sp; }
  let snip = _escapeHtml(text.slice(start, end));
  if (highlightRe) { highlightRe.lastIndex = 0; snip = snip.replace(highlightRe, '<mark>$1</mark>'); }
  return (start > 0 ? '… ' : '') + snip + (end < text.length ? ' …' : '');
}

// ── Index scan (primary path) ──────────────────────────────────────────────
function scanSearchIndex(data, query, parts) {
  const { tokens, stems } = parts;
  const needle = stems[0] || tokens[0] || query;   // sound quick-reject key
  const reg = getFileToRegistry();
  const list = (data && data.chapters) || [];
  const groups = [];
  let totalMatches = 0;

  for (const ich of list) {
    const registryIndex = reg[ich.file];
    if (registryIndex === undefined) continue;       // not a registered chapter
    const lc = getLowerCache(ich);

    // Quick-reject: every exact OR fuzzy hit must contain the first token's stem,
    // so a chapter with the stem nowhere (title/headings/body) can't match. Scans
    // the lowercased mirror only — no separate joined blob is stored.
    let maybe = lc.lowerTitle.indexOf(needle) !== -1;
    if (!maybe) for (let h = 0; h < lc.lowerHeadings.length; h++) { if (lc.lowerHeadings[h].indexOf(needle) !== -1) { maybe = true; break; } }
    if (!maybe) for (let i = 0; i < lc.lowerLines.length; i++) { if (lc.lowerLines[i].indexOf(needle) !== -1) { maybe = true; break; } }
    if (!maybe) continue;

    const titleM = _matchText(lc.lowerTitle, tokens, stems);

    let headingExact = false, headingFuzzy = false, headingHitText = null, headingHitIndex = -1;
    for (let h = 0; h < lc.lowerHeadings.length; h++) {
      const m = _matchText(lc.lowerHeadings[h], tokens, stems);
      if (!m) continue;
      if (m === 2 && !headingExact) { headingExact = true; headingHitText = ich.headings[h]; headingHitIndex = h; }
      else if (!headingHitText) { headingFuzzy = true; headingHitText = ich.headings[h]; headingHitIndex = h; }
    }

    const bodyHits = [];
    const lines = ich.lines || [];
    for (let i = 0; i < lines.length; i++) {
      const m = _matchText(lc.lowerLines[i], tokens, stems);
      if (!m) continue;
      const ln = lines[i];
      bodyHits.push({
        text: (ln && ln[0]) || '',
        headingIndex: (ln && ln[1] != null) ? ln[1] : -1,
        exact: m === 2,
      });
    }

    if (!titleM && !headingExact && !headingFuzzy && bodyHits.length === 0) continue;

    bodyHits.sort((a, b) => (b.exact ? 1 : 0) - (a.exact ? 1 : 0));   // exact first within chapter

    let items = bodyHits.slice(0, 3);
    if (items.length === 0) {
      // Title/heading-only match — synthesise one preview item so the group is clickable.
      if (headingHitText) {
        items = [{ text: headingHitText, headingIndex: headingHitIndex, exact: headingExact, isHeading: true }];
      } else if (titleM) {
        const first = lines.find(l => l && l[0] && /[a-z0-9]/i.test(l[0]));
        items = [first
          ? { text: first[0], headingIndex: (first[1] != null ? first[1] : -1), exact: false, titleOnly: true }
          : { text: ich.title, headingIndex: -1, exact: false, titleOnly: true }];
      }
    }

    let exactBody = 0, fuzzyBody = 0;
    for (const b of bodyHits) { if (b.exact) exactBody++; else fuzzyBody++; }
    let score = 0;
    if (titleM) score += (titleM === 2 ? 2000 : 1200);
    if (headingExact) score += 400; else if (headingFuzzy) score += 200;
    score += exactBody * 4 + fuzzyBody * 1;

    const count = bodyHits.length || items.length;   // title/heading-only counts its preview
    totalMatches += count;
    const badge = titleM ? 'title' : ((headingExact || headingFuzzy) ? 'heading' : null);
    groups.push({ registryIndex, title: ich.title, headings: ich.headings || [], score, count, badge, items });
  }

  groups.sort((a, b) => b.score - a.score || a.registryIndex - b.registryIndex);
  return { groups, totalMatches, totalGroups: groups.length };
}

// ── Offline fallback (network fetch of the markdown corpus) ─────────────────
async function ensureFallbackData() {
  if (_fallbackData) return _fallbackData;
  const searchable = chapters.filter(ch => !ch.section);   // skip section dividers
  await Promise.all(searchable.map(fetchSearchContent));
  const pseudo = { v: 0, chapters: [] };
  for (const ch of searchable) {
    const md = cachedContent[ch.file];
    if (!md) continue;
    // No heading map in the fallback — each line carries headingIndex -1.
    const lines = md.split('\n').map(l => [l, -1]);
    pseudo.chapters.push({ id: ch.id, file: ch.file, title: ch.title, headings: [], lines });
  }
  _fallbackData = pseudo;
  return pseudo;
}

// ── Rendering ───────────────────────────────────────────────────────────────
function renderSearchResults(render, query, parts) {
  const resultsEl = document.getElementById('searchResults');
  resultsEl.classList.add('visible');
  document.getElementById('chapterList').style.display = 'none';
  _searchSelectedIndex = -1;

  const { groups, totalMatches, totalGroups } = render;
  if (!groups.length) {
    resultsEl.innerHTML = '<div class="search-result-empty">No matches for &ldquo;' + _escapeHtml(query) +
      '&rdquo;. Try a chapter title, a single keyword, or open <strong>DSA Practice</strong> for coding problems.</div>';
    _searchState = { query, items: [], visible: true };
    return;
  }

  const MAX_GROUPS = 12, MAX_ITEMS = 30, MAX_PER_GROUP = 3;
  const stateItems = [];
  let html = '', shownItems = 0, shownGroups = 0;

  for (const g of groups) {
    if (shownGroups >= MAX_GROUPS || shownItems >= MAX_ITEMS) break;
    shownGroups++;

    const badgeHtml = g.badge === 'title' ? '<span class="sr-badge title">Title</span>'
      : g.badge === 'heading' ? '<span class="sr-badge heading">Heading</span>' : '';
    html += '<div class="search-result-group">';
    html += '<div class="search-result-group-header" data-registry="' + g.registryIndex + '">'
      + '<span class="srg-title">' + _escapeHtml(g.title) + '</span>'
      + badgeHtml
      + '<span class="srg-count">' + g.count + (g.count === 1 ? ' match' : ' matches') + '</span>'
      + '</div>';

    const budget = Math.min(MAX_PER_GROUP, MAX_ITEMS - shownItems);
    for (const it of g.items.slice(0, budget)) {
      const snippet = _makeSnippet(it.text, parts, query);
      if (!snippet) continue;   // skip lines that clean to nothing
      const headingLabel = (!it.isHeading && it.headingIndex >= 0 && g.headings[it.headingIndex])
        ? g.headings[it.headingIndex] : null;
      const idx = stateItems.length;
      stateItems.push({
        registryIndex: g.registryIndex,
        query,
        lineText: it.text,
        headingText: headingLabel || (it.isHeading ? it.text : ''),
      });
      html += '<div class="search-result-item" data-idx="' + idx + '">';
      if (headingLabel) html += '<div class="sr-heading">&rsaquo; ' + _escapeHtml(headingLabel) + '</div>';
      html += '<div class="match">' + snippet + '</div>';
      html += '</div>';
      shownItems++;
      if (shownItems >= MAX_ITEMS) break;
    }
    html += '</div>';
  }

  if (shownItems < totalMatches || shownGroups < totalGroups) {
    html += '<div class="search-result-more">Showing ' + shownItems + ' of ' + totalMatches
      + ' matches across ' + totalGroups + (totalGroups === 1 ? ' chapter' : ' chapters') + '</div>';
  }

  resultsEl.innerHTML = html;
  _searchState = { query, items: stateItems, visible: true };
}

// ── Activation & deep-linking ───────────────────────────────────────────────
function resetSearchUI() {
  const s = document.getElementById('search');
  if (s) s.value = '';
  const r = document.getElementById('searchResults');
  if (r) { r.classList.remove('visible'); r.innerHTML = ''; }
  const cl = document.getElementById('chapterList');
  if (cl) cl.style.display = '';
  _searchSelectedIndex = -1;
  _searchState = { query: '', items: [], visible: false };
}

// Group-header click: open the chapter at its top (no scroll target).
function openSearchChapter(registryIndex) {
  resetSearchUI();
  loadChapter(registryIndex);   // loadChapter() also calls closeSidebar()
}

// Snippet click / keyboard-Enter: open the chapter AND scroll to the match.
async function openSearchResult(registryIndex, query, lineText, headingText) {
  resetSearchUI();
  await loadChapter(registryIndex);
  _deepLinkScroll(query, lineText, headingText);
}

// Locate the match in #content (exact line → query → heading) and flash it.
function _deepLinkScroll(query, lineText, headingText) {
  const content = document.getElementById('content');
  if (!content) return;
  const candidates = [];
  if (lineText) candidates.push(_cleanLine(lineText));
  if (query) candidates.push(query);
  if (headingText) candidates.push(_cleanLine(headingText));
  for (const cand of candidates) {
    if (cand && cand.length >= 2 && _flashMatch(content, cand)) return;
  }
}

// Walk the text nodes of `root` (reusing restoreHighlight's spanning technique),
// case-insensitively find `needle`, wrap it in <mark class="search-flash">,
// scroll it into view, and auto-clear after the CSS fade completes.
function _flashMatch(root, needle) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (p && p.closest('pre, code, script, .sel-popup, .comments-section')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [], starts = [];
  let combined = '', node;
  while ((node = walker.nextNode())) { starts.push(combined.length); nodes.push(node); combined += node.nodeValue; }
  if (!nodes.length) return false;

  const at = combined.toLowerCase().indexOf(needle.toLowerCase());
  if (at < 0) return false;
  const endAt = at + needle.length;
  const locate = (pos) => {
    for (let k = nodes.length - 1; k >= 0; k--) { if (pos >= starts[k]) return { node: nodes[k], offset: pos - starts[k] }; }
    return { node: nodes[0], offset: 0 };
  };

  try {
    const s = locate(at), e = locate(endAt);
    const range = document.createRange();
    range.setStart(s.node, s.offset);
    range.setEnd(e.node, e.offset);
    const marks = _wrapFlash(range);
    if (marks.length) {
      marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => _unwrapFlash(marks), 2300);   // matches the 2.2s CSS fade
      return true;
    }
  } catch (e) { /* fall through */ }
  return false;
}

// Wrap every text-node fragment inside `range` in a temporary flash mark.
function _wrapFlash(range) {
  const marks = [];
  let rootEl = range.commonAncestorContainer;
  if (rootEl.nodeType === Node.TEXT_NODE) rootEl = rootEl.parentNode;
  if (!rootEl) return marks;
  const startC = range.startContainer, startO = range.startOffset;
  const endC = range.endContainer, endO = range.endOffset;
  const nodes = [];
  const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue) return NodeFilter.FILTER_REJECT;
      if (!range.intersectsNode(n)) return NodeFilter.FILTER_REJECT;
      const p = n.parentElement;
      if (p && p.closest('pre, code, script')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let n;
  while ((n = w.nextNode())) nodes.push(n);
  nodes.forEach(node => {
    const st = (node === startC) ? startO : 0;
    const en = (node === endC) ? endO : node.nodeValue.length;
    if (st >= en) return;
    try {
      const sub = document.createRange();
      sub.setStart(node, st);
      sub.setEnd(node, en);
      const mk = document.createElement('mark');
      mk.className = 'search-flash';
      sub.surroundContents(mk);
      marks.push(mk);
    } catch (e) { /* skip this fragment */ }
  });
  return marks;
}

function _unwrapFlash(marks) {
  marks.forEach(m => {
    const p = m.parentNode;
    if (!p) return;
    while (m.firstChild) p.insertBefore(m.firstChild, m);
    p.removeChild(m);
    p.normalize();
  });
}

// ── Driver: debounce → load (first time) → scan → render ────────────────────
async function performSearch(query) {
  const resultsEl = document.getElementById('searchResults');
  _searchSeq++;
  const seq = _searchSeq;
  const parts = _buildQueryParts(query);

  // Fast path: index already in memory — scan + render synchronously.
  if (_searchIndexData) {
    renderSearchResults(scanSearchIndex(_searchIndexData, query, parts), query, parts);
    return;
  }

  // First query: show the busy row before awaiting the lazy-loaded index.
  resultsEl.classList.add('visible');
  document.getElementById('chapterList').style.display = 'none';
  resultsEl.innerHTML = '<div class="search-result-loading">Searching…</div>';

  try {
    const data = await loadSearchIndex();
    if (seq !== _searchSeq) return;   // superseded by a newer keystroke
    _searchIndexData = data;
    renderSearchResults(scanSearchIndex(data, query, parts), query, parts);
  } catch (err) {
    // Fallback: scan the fetched markdown corpus so search still works offline.
    try {
      const data = await ensureFallbackData();
      if (seq !== _searchSeq) return;
      renderSearchResults(scanSearchIndex(data, query, parts), query, parts);
    } catch (e2) {
      if (seq !== _searchSeq) return;
      resultsEl.innerHTML = '<div class="search-result-empty">Search is unavailable right now. Check your connection and try again.</div>';
    }
  }
}

// Move the keyboard selection and keep it visible within the results panel.
function _applySearchSelection(items) {
  items.forEach((el, i) => el.classList.toggle('selected', i === _searchSelectedIndex));
  const sel = items[_searchSelectedIndex];
  if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

(function initSearch() {
  const searchInput = document.getElementById('search');
  const resultsEl = document.getElementById('searchResults');
  if (!searchInput || !resultsEl) return;

  searchInput.addEventListener('input', function (e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim().toLowerCase();

    if (query.length < 2) {
      resultsEl.classList.remove('visible');
      resultsEl.innerHTML = '';
      document.getElementById('chapterList').style.display = '';
      _searchState = { query: '', items: [], visible: false };
      _searchSelectedIndex = -1;
      return;
    }

    // Reveal the panel immediately; show the busy row up front on the first
    // (pre-index-load) query so there's instant feedback during the debounce.
    document.getElementById('chapterList').style.display = 'none';
    resultsEl.classList.add('visible');
    if (!_searchIndexData) resultsEl.innerHTML = '<div class="search-result-loading">Searching…</div>';

    searchTimeout = setTimeout(() => performSearch(query), 200);
  });

  // Keyboard navigation across all snippet rows while the input is focused.
  searchInput.addEventListener('keydown', function (e) {
    if (!resultsEl.classList.contains('visible')) return;   // Escape handled globally
    const items = Array.from(resultsEl.querySelectorAll('.search-result-item'));
    if (e.key === 'ArrowDown') {
      if (!items.length) return;
      e.preventDefault();   // don't scroll the page
      _searchSelectedIndex = (_searchSelectedIndex + 1) % items.length;
      _applySearchSelection(items);
    } else if (e.key === 'ArrowUp') {
      if (!items.length) return;
      e.preventDefault();
      _searchSelectedIndex = (_searchSelectedIndex - 1 + items.length) % items.length;
      _applySearchSelection(items);
    } else if (e.key === 'Enter') {
      if (_searchSelectedIndex >= 0 && items[_searchSelectedIndex]) {
        e.preventDefault();
        items[_searchSelectedIndex].click();   // → delegated handler → openSearchResult
      }
    }
  });

  // Delegated activation (avoids fragile inline onclick with quoted snippet text).
  resultsEl.addEventListener('click', function (e) {
    const item = e.target.closest('.search-result-item');
    if (item && item.dataset.idx !== undefined) {
      const d = _searchState.items[+item.dataset.idx];
      if (d) openSearchResult(d.registryIndex, d.query, d.lineText, d.headingText);
      return;
    }
    const header = e.target.closest('.search-result-group-header');
    if (header && header.dataset.registry !== undefined) {
      openSearchChapter(+header.dataset.registry);
    }
  });
})();

// ─── In-chapter Find (Ctrl+F) ───
// A browser-style "find in page" scoped to the open chapter: highlights every
// match in #content, shows "n/total", and steps through with Enter / Shift+Enter
// (or the ↑ ↓ buttons). Matching is per-text-node and case-insensitive — a phrase
// split across inline elements (e.g. **bold**) won't match, the same limitation
// the saved-highlight feature has.
let findMatches = [];
let findCurrent = -1;
let findDebounce = null;
let findCapped = false;
const FIND_MAX = 2000;   // cap DOM wrapping so a 1-char query on a huge chapter stays responsive

function openFind() {
  if (currentPage !== 'chapter') return;
  const bar = document.getElementById('findBar');
  const input = document.getElementById('findInput');
  if (!bar || !input) return;
  bar.classList.add('visible');
  // Seed from the current text selection, like the browser does.
  const sel = (window.getSelection && window.getSelection().toString().trim()) || '';
  if (sel && sel.length <= 80 && sel.indexOf('\n') === -1) input.value = sel;
  input.focus();
  input.select();
  if (input.value.trim()) runFind(input.value);
  else updateFindCount();
}

function closeFind() {
  const bar = document.getElementById('findBar');
  if (bar) bar.classList.remove('visible');
  clearFindHighlights();
  updateFindCount();
}

// Drop highlights + state without re-normalizing the DOM — used when a new
// chapter's innerHTML replaces the old content out from under us.
function resetFind() {
  const bar = document.getElementById('findBar');
  if (bar) bar.classList.remove('visible');
  findMatches = [];
  findCurrent = -1;
  findCapped = false;
}

function clearFindHighlights() {
  const content = document.getElementById('content');
  if (content) {
    const parents = new Set();
    content.querySelectorAll('mark.find-match').forEach(m => {
      const parent = m.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parents.add(parent);
    });
    parents.forEach(p => p.normalize());   // merge the split text nodes back together
  }
  findMatches = [];
  findCurrent = -1;
  findCapped = false;
}

function runFind(query) {
  clearFindHighlights();
  const q = (query || '');
  if (!q.trim()) { updateFindCount(); return; }
  const content = document.getElementById('content');
  if (!content) return;
  const lowerQ = q.toLowerCase();

  // Collect candidate text nodes first, then mutate — replacing nodes mid-walk
  // would invalidate the TreeWalker.
  const nodes = [];
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const v = node.nodeValue;
      if (!v || !v.trim()) return NodeFilter.FILTER_REJECT;
      if (v.toLowerCase().indexOf(lowerQ) === -1) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      // Skip KaTeX internals (mathml duplicates the text), app chrome, the find
      // bar itself, and editable areas (notebook code cells).
      if (p.closest('script, style, .katex, .find-bar, .comments-section, .nav-buttons, .code-lang-badge, .copy-btn, [contenteditable]')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);

  findCapped = false;
  for (const node of nodes) {
    const text = node.nodeValue;
    const lower = text.toLowerCase();
    let idx = lower.indexOf(lowerQ);
    if (idx === -1) continue;
    const frag = document.createDocumentFragment();
    let last = 0;
    while (idx !== -1) {
      if (idx > last) frag.appendChild(document.createTextNode(text.slice(last, idx)));
      const mark = document.createElement('mark');
      mark.className = 'find-match';
      mark.textContent = text.slice(idx, idx + q.length);
      frag.appendChild(mark);
      findMatches.push(mark);
      last = idx + q.length;
      if (findMatches.length >= FIND_MAX) { findCapped = true; break; }
      idx = lower.indexOf(lowerQ, last);
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
    if (findCapped) break;
  }

  if (findMatches.length) {
    setFindCurrent(pickInitialMatch(), true);
  } else {
    findCurrent = -1;
    updateFindCount();
  }
}

// Start from the first match at or below the current scroll position, so opening
// find doesn't yank the reader back to the top of the chapter.
function pickInitialMatch() {
  const wrapper = document.getElementById('contentWrapper');
  const top = wrapper ? wrapper.getBoundingClientRect().top : 0;
  for (let i = 0; i < findMatches.length; i++) {
    if (findMatches[i].getBoundingClientRect().top >= top - 1) return i;
  }
  return 0;
}

function setFindCurrent(i, scroll) {
  if (!findMatches.length) { updateFindCount(); return; }
  if (findCurrent >= 0 && findMatches[findCurrent]) {
    findMatches[findCurrent].classList.remove('find-current');
  }
  findCurrent = ((i % findMatches.length) + findMatches.length) % findMatches.length;
  const m = findMatches[findCurrent];
  if (m) {
    m.classList.add('find-current');
    // Reveal scroll-reveal ancestors (opacity:0 until the IntersectionObserver
    // fires) so the match isn't invisible when we jump to it.
    const reveal = m.closest('h1,h2,h3,p,pre,.code-wrapper,table,ul,ol,blockquote,.katex-display,li');
    if (reveal) reveal.classList.add('vis');
    if (scroll) m.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  updateFindCount();
}

function findNavigate(dir) {
  if (!findMatches.length) return;
  setFindCurrent(findCurrent + (dir < 0 ? -1 : 1), true);
}

function updateFindCount() {
  const el = document.getElementById('findCount');
  if (!el) return;
  const input = document.getElementById('findInput');
  const hasQuery = !!(input && input.value.trim());
  if (!findMatches.length) {
    el.textContent = hasQuery ? 'No results' : '0/0';
    el.classList.toggle('none', hasQuery);
  } else {
    el.textContent = (findCurrent + 1) + '/' + findMatches.length + (findCapped ? '+' : '');
    el.classList.remove('none');
  }
}

// Wire up the find bar's own input (top-level, like the sidebar search). chapter.js
// is deferred, so #findInput already exists in the parsed shell when this runs.
(function setupFindBar() {
  const input = document.getElementById('findInput');
  if (!input) return;
  input.addEventListener('input', () => {
    clearTimeout(findDebounce);
    findDebounce = setTimeout(() => runFind(input.value), 120);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (findMatches.length) findNavigate(e.shiftKey ? -1 : 1);
      else runFind(input.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();   // don't also trigger the global Escape handler
      closeFind();
    }
  });
})();

// ─── Mobile Sidebar ───
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('visible');
}

document.getElementById('hamburger').addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    // Mobile: slide sidebar in/out with overlay
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('visible');
  } else {
    // Desktop: collapse/expand sidebar
    document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('ml4-sidebar', document.body.classList.contains('sidebar-collapsed') ? 'collapsed' : 'expanded');
  }
});

document.getElementById('overlay').addEventListener('click', closeSidebar);

// ─── Keyboard Shortcuts ───
document.addEventListener('keydown', (e) => {
  // Ctrl+K — focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('search').focus();
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.add('open');
      document.getElementById('overlay').classList.add('visible');
    }
  }
  // Ctrl+F — in-chapter find. Override the browser's native find only while a
  // chapter is open; elsewhere let the native find work.
  if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
    if (currentPage === 'chapter') { e.preventDefault(); openFind(); return; }
  }
  // Escape — close the find bar first, then exit focus mode, then search / sidebar
  if (e.key === 'Escape') {
    const fb = document.getElementById('findBar');
    if (fb && fb.classList.contains('visible')) { closeFind(); return; }
    if (focusModeActive) { toggleFocusMode(); return; }
    document.getElementById('search').blur();
    resetSearchUI();   // clears input, hides + empties results, restores #chapterList, resets nav state
    closeSidebar();
  }
  // Arrow keys: navigate prev/next chapter — only when actually on a chapter page
  // AND not typing in an input/textarea/contenteditable (so the DSA editor,
  // comment box, notebook cells, etc. keep native cursor movement).
  const ae = document.activeElement;
  const typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
  if (currentPage === 'chapter' && !typing) {
    if (e.key === 'ArrowLeft') { const p = findPrevChapter(currentIndex); if (p >= 0) loadChapter(p); }
    if (e.key === 'ArrowRight') { const n = findNextChapter(currentIndex); if (n >= 0) loadChapter(n); }
  }
  // Ctrl+D — dark mode
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); toggleTheme(); }
  // F — toggle focus mode
  if ((e.key === 'f' || e.key === 'F') && currentPage === 'chapter' && !typing && !e.ctrlKey && !e.metaKey) toggleFocusMode();
  // M — mark as read. Skip when the user is typing (comment input, pin textarea,
  // DSA editor, search box, etc.) so the letter 'm' stays a letter.
  if ((e.key === 'm' || e.key === 'M') && currentPage === 'chapter' && !typing) toggleReadStatus();
});


// ─── Scroll Progress Bar ───
let _scrollProgressBound = false;
function setupScrollProgress() {
  const wrapper = document.getElementById('contentWrapper');
  const bar = document.getElementById('scrollProgress');
  if (_scrollProgressBound) return;   // bind once for the app's lifetime
  _scrollProgressBound = true;
  let ticking = false;
  // Throttle to one layout read+write per frame; passive lets the browser
  // keep scrolling without waiting on the handler.
  wrapper.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollHeight = wrapper.scrollHeight - wrapper.clientHeight;
      const progress = scrollHeight > 0 ? (wrapper.scrollTop / scrollHeight) * 100 : 0;
      bar.style.width = progress + '%';
      ticking = false;
    });
  }, { passive: true });
}

// ─── Enhanced Content ───
function enhanceContent() {
  if (!interactiveMode) return;
  const contentEl = document.getElementById('content');
  contentEl.classList.add('chapter-view');

  // Page enter animation
  contentEl.classList.add('page-enter');
  setTimeout(() => contentEl.classList.remove('page-enter'), 600);

  // 1. Copy buttons + language badges on code blocks
  contentEl.querySelectorAll('pre').forEach(pre => {
    if (pre.parentElement?.classList.contains('code-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    // Language badge
    const codeEl = pre.querySelector('code');
    if (codeEl) {
      const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
      if (langClass) {
        const lang = langClass.replace('language-', '');
        if (lang !== 'chart' && lang !== 'mermaid') {
          const badge = document.createElement('span');
          badge.className = 'code-lang-badge';
          badge.textContent = lang;
          wrapper.appendChild(badge);
        }
      }
    }

    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.onclick = () => {
      navigator.clipboard.writeText(pre.textContent).then(() => {
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
      });
    };
    wrapper.appendChild(btn);
  });

  // 2. Scroll-reveal with IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  contentEl.querySelectorAll('h1,h2,h3,p,pre,.code-wrapper,table,ul,ol,blockquote,.katex-display,hr').forEach(el => {
    observer.observe(el);
  });

  // 3. Reading time — study pace (~55 words/min for technical content with diagrams)
  const words = (contentEl.textContent || '').trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 55);
  window.__chapterReadMinutes = minutes;   // remembered so the completion reward can scale with length
  let badge = document.getElementById('readingTime');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'reading-time';
    badge.id = 'readingTime';
    document.getElementById('breadcrumb').appendChild(badge);
  }
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    badge.textContent = m > 0 ? `~${h}h ${m}m study` : `~${h}h study`;
  } else {
    badge.textContent = `~${minutes} min study`;
  }

  // 4. Scroll spy for TOC
  setupScrollSpy();

  // 5. Mermaid diagrams — lazy-load the (large) library only if this chapter
  // actually has a mermaid block. We render in small batches so the main
  // thread stays responsive on chapters with many diagrams (e.g. Ch 34 has 80+,
  // which would otherwise freeze the page for ~20 seconds).
  if (contentEl.querySelector('code.language-mermaid')) {
    ensureMermaid().then(() => {
      contentEl.querySelectorAll('code.language-mermaid').forEach(block => {
        const pre = block.parentElement;
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = block.textContent;
        // Lightweight placeholder so the user sees something immediately
        // while batches further down the page are still pending.
        div.dataset.pendingRender = '1';
        pre.replaceWith(div);
      });
      const divs = Array.from(contentEl.querySelectorAll('.mermaid'));
      const BATCH = 4;
      const schedule = window.requestIdleCallback
        ? (fn) => requestIdleCallback(fn, { timeout: 250 })
        : (fn) => setTimeout(fn, 50);
      let i = 0;
      (function renderBatch() {
        const batch = divs.slice(i, i + BATCH);
        if (batch.length) {
          try { mermaid.init(undefined, batch); } catch (e) {}
          batch.forEach(d => { delete d.dataset.pendingRender; });
        }
        i += BATCH;
        if (i < divs.length) schedule(renderBatch);
      })();
    }).catch(() => {});
  }

  // 5b. Chart.js charts
  renderCharts(contentEl);

  // 6. Python Run buttons on code blocks
  addRunButtons(contentEl);
}

// ─── Focus Mode (browser fullscreen) ───
let focusModeActive = false;

function exitFocusMode() {
  if (!focusModeActive) return;
  focusModeActive = false;
  document.body.classList.remove('focus-mode');
  document.getElementById('focusBtn').classList.remove('active');
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

function toggleFocusMode() {
  if (focusModeActive) {
    exitFocusMode();
    return;
  }

  focusModeActive = true;
  document.body.classList.add('focus-mode');
  document.getElementById('focusBtn').classList.add('active');

  const focusBar = document.getElementById('focusBar');
  if (currentIndex >= 0 && chapters[currentIndex]) {
    document.getElementById('focusBarTitle').textContent = chapters[currentIndex].title;
    focusBar.classList.add('visible');
    setTimeout(() => focusBar.classList.remove('visible'), 3000);
  }

  document.documentElement.requestFullscreen().catch(() => {});
}

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && focusModeActive) {
    focusModeActive = false;
    document.body.classList.remove('focus-mode');
    document.getElementById('focusBtn').classList.remove('active');
  }
});

let _scrollSpyHandler = null;
function setupScrollSpy() {
  const wrapper = document.getElementById('contentWrapper');
  const tocLinks = document.querySelectorAll('#tocLinks a');
  // Remove the previous chapter's handler so scroll listeners don't accumulate
  // across navigations (each one swept every heading with getBoundingClientRect
  // on every scroll event — a compounding leak).
  if (_scrollSpyHandler) {
    wrapper.removeEventListener('scroll', _scrollSpyHandler);
    _scrollSpyHandler = null;
  }
  if (!tocLinks.length) return;
  let ticking = false;
  _scrollSpyHandler = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      let current = '';
      document.querySelectorAll('#content h2, #content h3').forEach(h => {
        if (h.getBoundingClientRect().top < 150) current = h.id;
      });
      tocLinks.forEach(a => a.classList.toggle('spy-active', a.getAttribute('href') === '#' + current));
      ticking = false;
    });
  };
  wrapper.addEventListener('scroll', _scrollSpyHandler, { passive: true });
}


// ─── Quiz System ───
let quizState = { questions: [], current: 0, score: 0, answered: false };

// Quiz data (225KB) is lazy-loaded the first time a quiz is opened, mirroring
// the DSA starter-code lazy-load pattern.
let _quizDataPromise = null;
function ensureQuizData() {
  if (window.__quizDataLoaded || typeof QUIZ_DATA !== 'undefined') return Promise.resolve();
  if (_quizDataPromise) return _quizDataPromise;
  _quizDataPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'js/data/quizzes.js';
    s.onload = () => resolve();
    s.onerror = () => { _quizDataPromise = null; reject(new Error('Quiz data failed to load')); };
    document.head.appendChild(s);
  });
  return _quizDataPromise;
}

function startQuiz(file) {
  ensureQuizData().then(() => {
    const key = file.replace(/^content\//, '');
    const questions = (typeof QUIZ_DATA !== 'undefined' && (QUIZ_DATA[key] || QUIZ_DATA[file])) || [];
    if (!questions.length) {
      showToast('📝 No quiz yet', 'Quiz coming soon for this chapter', '📚');
      return;
    }
    quizState = {
      questions: [...questions],
      current: 0,
      score: 0,
      answered: false,
      startTime: Date.now(), // used to detect "rushed" (< 1s/question) attempts
    };
    // Shuffle questions
    for (let i = quizState.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quizState.questions[i], quizState.questions[j]] = [quizState.questions[j], quizState.questions[i]];
    }
    renderQuizQuestion();
  }).catch(() => {
    showToast('❌ Error', 'Quiz data failed to load', '📝');
  });
}

function renderQuizQuestion() {
  const { questions, current, score } = quizState;

  // Results screen
  if (current >= questions.length) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 80 ? 'great' : pct >= 50 ? 'good' : 'needs-work';
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📖';
    const msg = pct >= 80 ? 'Excellent! You know this well!' : pct >= 50 ? 'Good job! Review the ones you missed.' : 'Keep studying — you\'ll get there!';

    // XP: 5 XP per correct answer, +50 bonus for a perfect score.
    // Anti-spam: 0 XP if rushed (less than 1 second per question elapsed).
    const perfect = questions.length > 0 && score === questions.length;
    const elapsedSec = (Date.now() - (quizState.startTime || Date.now())) / 1000;
    const rushed = questions.length > 0 && (elapsedSec / questions.length) < 1;
    const netXp = rushed ? 0 : (score * 5 + (perfect ? 50 : 0));
    const reasonParts = [`Quiz ${pct}% (${score}/${questions.length})`];
    if (rushed) reasonParts.push('rushed — no XP');
    else {
      reasonParts.push(`+${score * 5} for ${score} correct`);
      if (perfect) reasonParts.push('+50 perfect bonus');
    }
    if (netXp !== 0) addXP(netXp, reasonParts.join(', '));

    // Save quiz score (best score)
    const scores = JSON.parse(localStorage.getItem('ml4-quiz-scores') || '{}');
    const file = chapters[currentIndex]?.file;
    if (file) {
      if (!scores[file] || pct > scores[file]) scores[file] = pct;
      safeSetItem('ml4-quiz-scores', JSON.stringify(scores));
      // Save detailed quiz history
      const hist = getQuizHistory();
      if (!hist[file]) hist[file] = { attempts: 0, bestScore: 0, lastScore: 0, scores: [] };
      hist[file].attempts++;
      hist[file].lastScore = pct;
      if (pct > hist[file].bestScore) hist[file].bestScore = pct;
      hist[file].scores.push({ pct, date: new Date().toISOString() });
      // Cap per-chapter history at last 20 attempts to prevent unbounded growth
      if (hist[file].scores.length > 20) {
        hist[file].scores = hist[file].scores.slice(-20);
      }
      saveQuizHistory(hist);
    }
    // Check if course is complete
    const realCh = chapters.filter(c => !c.section && !c.ref);
    if (realCh.every(c => readChapters[c.file])) {
      const sd = getStudyData();
      if (!sd.completionDate) { sd.completionDate = new Date().toISOString(); saveStudyData(sd); }
    }

    document.querySelector('.quiz-overlay').innerHTML = `
      <div class="quiz-modal">
        <div class="quiz-results">
          <div style="font-size:48px;margin-bottom:8px;">${emoji}</div>
          <div class="quiz-score">${pct}%</div>
          <div class="quiz-score-label">${score} of ${questions.length} correct</div>
          <div class="quiz-score-bar"><div class="quiz-score-fill ${grade}" style="width:0%"></div></div>
          <p style="margin:16px 0;color:var(--text-secondary)">${msg}</p>
          <p style="font-size:13px;color:${netXp > 0 ? 'var(--accent)' : 'var(--text-secondary)'};font-weight:600;">${netXp >= 0 ? '+' : ''}${netXp} XP${rushed ? ' (rushed — no XP)' : (perfect ? ' · incl. +50 perfect bonus 🎉' : '')}</p>
          <button class="quiz-next-btn" onclick="closeQuiz()">Close</button>
          <button class="quiz-next-btn" onclick="quizState.current=0;quizState.score=0;renderQuizQuestion();" style="margin-top:8px;background:var(--bg-secondary);color:var(--text);border:1px solid var(--border);">🔄 Retake Quiz</button>
        </div>
      </div>`;
    // Animate score bar
    setTimeout(() => {
      const fill = document.querySelector('.quiz-score-fill');
      if (fill) fill.style.width = pct + '%';
    }, 100);
    if (pct >= 80) fireConfetti();
    return;
  }

  const q = questions[current];
  quizState.answered = false;

  // Shuffle options for this question, remap correct answer
  const indices = q.options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  quizState.shuffledOptions = indices.map(i => q.options[i]);
  quizState.shuffledAnswer = indices.indexOf(q.answer);

  let overlay = document.querySelector('.quiz-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'quiz-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="quiz-modal">
      <div class="quiz-header" style="position:relative;">
        <button onclick="closeQuiz()" style="position:absolute;top:0;right:0;background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-secondary);padding:4px 8px;" title="Close quiz">&times;</button>
        <h2>📝 Chapter Quiz</h2>
        <div class="quiz-progress">Question ${current + 1} of ${questions.length} &nbsp;|&nbsp; Score: ${score}</div>
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${(current/questions.length)*100}%"></div></div>
      </div>
      <div class="quiz-question">${current + 1}. ${marked.parseInline(q.q)}</div>
      ${quizState.shuffledOptions.map((opt, i) => `
        <button class="quiz-option" onclick="answerQuiz(${i})" id="qopt${i}">${String.fromCharCode(65+i)}. ${marked.parseInline(opt)}</button>
      `).join('')}
      <div id="quizFeedback"></div>
    </div>`;
  if (window.renderMathInElement) renderMathInElement(overlay, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
}

function closeQuiz() {
  const { questions, current, score } = quizState;
  if (current >= questions.length) {
    // Already on results screen — just close (no abandon penalty)
    document.querySelector('.quiz-overlay')?.remove();
    return;
  }
  const answered = current + (quizState.answered ? 1 : 0);
  const remaining = questions.length - answered;
  if (remaining > 0) {
    const confirmed = confirm(`You have ${remaining} question${remaining > 1 ? 's' : ''} remaining.\nYour current score: ${score}/${answered}\n\nQuitting costs 15 XP.\n\nAre you sure you want to quit the quiz?`);
    if (!confirmed) return;
  }
  document.querySelector('.quiz-overlay')?.remove();
  // Save partial best-score (so the attempt still counts if it beats prior)
  if (answered > 0) {
    const pct = Math.round((score / questions.length) * 100);
    const scores = JSON.parse(localStorage.getItem('ml4-quiz-scores') || '{}');
    const file = chapters[currentIndex]?.file;
    if (file && (!scores[file] || pct > scores[file])) {
      scores[file] = pct;
      localStorage.setItem('ml4-quiz-scores', JSON.stringify(scores));
    }
    showToast('Quiz ended early', `Score: ${score}/${answered} answered (${pct}% overall)`, '📝');
  }
  // Abandon penalty: quitting a quiz with unanswered questions costs 15 XP.
  if (remaining > 0) addXP(-15, 'Abandoned a quiz');
}

function answerQuiz(selected) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.current];
  const correct = quizState.shuffledAnswer;
  const isCorrect = selected === correct;
  if (isCorrect) quizState.score++;

  // Mark options
  document.querySelectorAll('.quiz-option').forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === correct) btn.classList.add('correct');
    if (i === selected && !isCorrect) btn.classList.add('wrong');
  });

  // Show explanation
  const fb = document.getElementById('quizFeedback');
  fb.innerHTML = `
    <div class="quiz-explanation">
      ${isCorrect ? '✅ Correct!' : '❌ Incorrect.'} ${marked.parseInline(q.explanation)}
    </div>
    <button class="quiz-next-btn" onclick="quizState.current++; renderQuizQuestion()">
      ${quizState.current + 1 < quizState.questions.length ? 'Next Question →' : 'See Results'}
    </button>`;
  if (window.renderMathInElement) renderMathInElement(fb, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
}

// ─── Override toggleReadStatus to trigger quiz + confetti + XP ───
const _originalToggleRead = toggleReadStatus;
toggleReadStatus = function() {
  const wasRead = currentIndex >= 0 && readChapters[chapters[currentIndex]?.file];
  _originalToggleRead();
  if (!wasRead && currentIndex >= 0 && readChapters[chapters[currentIndex]?.file]) {
    const file = chapters[currentIndex].file;
    trackChapterComplete(file);
    const _readMins = window.__chapterReadMinutes || 60;
    const _readXp = Math.max(10, Math.round(25 * _readMins / 60));   // 25 XP per hour of reading length
    addXP(_readXp, 'Completed: ' + (chapters[currentIndex]?.title || 'chapter'));
    fireConfetti();
    // Launch quiz after a brief delay
    setTimeout(() => startQuiz(file), 800);
  }
};

// ─── Hook into loadChapter to add interactive enhancements ───
const _origLoadChapter = loadChapter;
loadChapter = async function(index) {
  // Tear down any open find bar — the chapter's DOM is about to be replaced.
  resetFind();
  // Check if this is a notebook file
  if (index >= 0 && index < chapters.length && chapters[index].notebook) {
    if (chapters[index].section) return;
    currentIndex = index;
    currentPage = 'chapter';
    const ch = chapters[index];
    trackChapterOpen(ch.file);
    document.getElementById('breadcrumb').textContent = `${ch.id} — ${ch.title}`;
    document.getElementById('readBtn').style.display = '';
    document.getElementById('findBtn').style.display = '';
    document.getElementById('tocPanel').classList.remove('visible');
    renderSidebar();
    closeSidebar();
    await loadNotebook(ch.file);
    loadHighlights(ch.file);
    injectComments(ch.file);
    if (typeof renderPins === 'function') setTimeout(() => renderPins(ch.file), 60);
    return;
  }
  await _origLoadChapter(index);
  if (index >= 0 && index < chapters.length && !chapters[index].section) {
    enhanceContent();
    // Always render charts and run buttons (even in classic mode)
    if (!interactiveMode) {
      renderCharts(document.getElementById('content'));
      addRunButtons(document.getElementById('content'));
    }
    // Restore saved highlights
    loadHighlights(chapters[index].file);
    // Always inject comments at bottom of chapter
    injectComments(chapters[index].file);
    // Render any saved floating-note pins (Figma-style). Small delay so markdown,
    // math, and highlighting finish first — otherwise anchor offsets would be wrong.
    if (typeof renderPins === 'function') setTimeout(() => renderPins(chapters[index].file), 120);
  }
};

// ─── Lazy diagram / chart libraries ───
// mermaid (~2.7MB) and chart.js (~200KB) are loaded on demand — only the
// handful of chapters that embed a ```mermaid or ```chart block pay the cost.
let _mermaidReady = null;
function ensureMermaid() {
  if (window.mermaid) return Promise.resolve();
  if (_mermaidReady) return _mermaidReady;
  _mermaidReady = loadExternalScript(
    'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.0/mermaid.min.js',
    'sha384-6F4Ibv/ylL12O35KFWTeGTHuBKDz5L6yjKsgv3QHQ8s4NTqlDXq7kMlYXGs7MHFc'
  ).then(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
  });
  return _mermaidReady;
}
let _chartReady = null;
function ensureChart() {
  if (window.Chart) return Promise.resolve();
  if (_chartReady) return _chartReady;
  _chartReady = loadExternalScript(
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',
    'sha384-vsrfeLOOY6KuIYKDlmVH5UiBmgIdB1oEf7p01YgWHuqmOHfZr374+odEv96n9tNC'
  );
  return _chartReady;
}

// ─── Render Chart.js charts ───
function renderCharts(root) {
  const blocks = root.querySelectorAll('code.language-chart');
  if (blocks.length === 0) return;
  // Lazy-load chart.js only for chapters that actually embed a chart.
  ensureChart().then(() => {
  blocks.forEach(block => {
    const pre = block.parentElement;
    const wrapper = pre.parentElement?.classList.contains('code-wrapper') ? pre.parentElement : pre;
    try {
      const config = JSON.parse(block.textContent);
      const container = document.createElement('div');
      container.className = 'chart-container';
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);
      wrapper.replaceWith(container);
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
      const textColor = isDark ? '#e6edf3' : '#1f2328';
      if (!config.options) config.options = {};
      if (!config.options.plugins) config.options.plugins = {};
      if (!config.options.plugins.legend) config.options.plugins.legend = {};
      if (!config.options.plugins.legend.labels) config.options.plugins.legend.labels = {};
      config.options.plugins.legend.labels.color = textColor;
      if (!config.options.plugins.title) config.options.plugins.title = {};
      config.options.plugins.title.color = textColor;
      if (!config.options.scales) config.options.scales = {};
      for (const axis of ['x', 'y']) {
        if (!config.options.scales[axis]) config.options.scales[axis] = {};
        if (!config.options.scales[axis].ticks) config.options.scales[axis].ticks = {};
        config.options.scales[axis].ticks.color = textColor;
        if (!config.options.scales[axis].grid) config.options.scales[axis].grid = {};
        config.options.scales[axis].grid.color = gridColor;
        if (config.options.scales[axis].title) config.options.scales[axis].title.color = textColor;
      }
      config.options.responsive = true;
      config.options.maintainAspectRatio = true;
      new Chart(canvas, config);
    } catch (e) {
      console.warn('Chart.js parse error:', e);
    }
  });
  }).catch(() => {});
}


// ─── Notebook Renderer ───
let nbCellCounter = 0;

async function loadNotebook(file) {
  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view', 'recap-view');
  contentEl.innerHTML = '<div class="loading"><div class="spinner"></div>Loading notebook...</div>';

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const nb = await res.json();
    renderNotebook(nb, contentEl);
  } catch(err) {
    contentEl.innerHTML = `<div class="loading" style="color:red;">Failed to load notebook: ${err.message}</div>`;
  }
}

function renderNotebook(nb, contentEl) {
  nbCellCounter = 0;
  const cells = nb.cells || [];

  let html = '<div class="nb-container">';
  html += `<div class="nb-toolbar">
    <button class="nb-toolbar-btn primary" onclick="runAllCells()">▶ Run All</button>
    <button class="nb-toolbar-btn" onclick="clearAllOutputs()">✕ Clear Outputs</button>
    <button class="nb-toolbar-btn" onclick="resetPyodideEnv()">↻ Reset Kernel</button>
    <span class="nb-info">${cells.filter(c=>c.cell_type==='code').length} code cells &middot; ${cells.filter(c=>c.cell_type==='markdown').length} text cells</span>
  </div>`;

  cells.forEach((cell, i) => {
    const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');
    if (!source.trim()) return;

    if (cell.cell_type === 'markdown') {
      var nbMath = protectMath(source);
      html += `<div class="nb-cell nb-cell-md">${restoreMath(marked.parse(nbMath.md), nbMath.store)}</div>`;
    } else if (cell.cell_type === 'code') {
      nbCellCounter++;
      const escaped = source.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      html += `<div class="nb-cell nb-cell-code" id="nb-cell-${i}">
        <div class="nb-cell-header">
          <span class="nb-cell-num">In [${nbCellCounter}]</span>
          <div>
            <button class="nb-run-btn" onclick="runNbCell(${i})">▶ Run</button>
          </div>
        </div>
        <div class="nb-code-area" contenteditable="true" spellcheck="false" id="nb-code-${i}">${escaped}</div>
        <div class="nb-output" id="nb-out-${i}"></div>
      </div>`;
    }
  });

  html += '</div>';
  contentEl.innerHTML = html;

  // Apply syntax highlighting to code cells
  contentEl.querySelectorAll('.nb-code-area').forEach(el => {
    // Highlight on first render
    if (window.hljs) {
      const temp = document.createElement('code');
      temp.className = 'language-python';
      temp.textContent = el.textContent;
      hljs.highlightElement(temp);
      el.innerHTML = temp.innerHTML;
    }
  });

  // Render KaTeX in markdown cells
  if (window.renderMathInElement) {
    renderMathInElement(contentEl, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  }

  document.getElementById('contentWrapper').scrollTop = 0;
}

async function runNbCell(cellIndex) {
  const codeEl = document.getElementById(`nb-code-${cellIndex}`);
  const outEl = document.getElementById(`nb-out-${cellIndex}`);
  const btn = document.querySelector(`#nb-cell-${cellIndex} .nb-run-btn`);
  if (!codeEl || !outEl) return;

  const code = codeEl.textContent;
  btn.textContent = '⏳';
  btn.classList.add('running');

  await runPythonCode(code, outEl);

  btn.textContent = '▶ Run';
  btn.classList.remove('running');
}

async function runAllCells() {
  const cells = document.querySelectorAll('.nb-cell-code');
  for (const cell of cells) {
    const id = cell.id.replace('nb-cell-', '');
    await runNbCell(parseInt(id));
  }
}

function clearAllOutputs() {
  document.querySelectorAll('.nb-output').forEach(el => { el.innerHTML = ''; });
}

async function resetPyodideEnv() {
  pyodideReady = false;
  pyodideLoading = false;
  pyodide = null;
  clearAllOutputs();
  showToast('↻ Kernel Reset', 'Python environment cleared', '🔄');
}

// ─── Python Runner (Pyodide) ───
let pyodideReady = false;
let pyodideLoading = false;
let pyodide = null;

async function loadPyodideEngine() {
  if (pyodideReady) return;
  if (pyodideLoading) return;
  pyodideLoading = true;

  // Dynamically load Pyodide script
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/'
  });

  // Pre-install common packages
  await pyodide.loadPackage(['numpy', 'micropip']);

  // Setup stdout/stderr capture and matplotlib
  pyodide.runPython(`
import sys, io
class OutputCapture:
    def __init__(self):
        self.output = []
    def write(self, text):
        self.output.append(text)
    def flush(self):
        pass
    def get(self):
        return ''.join(self.output)
    def clear(self):
        self.output = []
_stdout = OutputCapture()
_stderr = OutputCapture()
sys.stdout = _stdout
sys.stderr = _stderr
  `);

  pyodideReady = true;
  pyodideLoading = false;
}

async function runPythonCode(code, outputEl) {
  outputEl.innerHTML = '<div class="py-loading"><div class="spinner"></div>Loading Python environment...</div>';

  try {
    if (!pyodideReady) {
      await loadPyodideEngine();
    }

    outputEl.innerHTML = '<div class="py-loading"><div class="spinner"></div>Installing packages...</div>';

    // ─── Parse import statements (top-level module only) ───
    // Matches "import foo" or "from foo.bar import baz" → captures "foo".
    const importedModules = new Set();
    const importRe = /(?:^|\n)\s*(?:from|import)\s+([a-zA-Z_][\w.]*)/g;
    let _m;
    while ((_m = importRe.exec(code)) !== null) {
      importedModules.add(_m[1].split('.')[0]);
    }

    // ─── Packages that CAN'T run in the browser sandbox ───
    // Heavy native deps, GPU code, server runtimes, paid APIs — show friendly skip message.
    const browserIncompatible = {
      // Deep learning frameworks
      'torch': 'PyTorch',
      'torchvision': 'torchvision',
      'tensorflow': 'TensorFlow',
      'tf': 'TensorFlow',
      'keras': 'Keras',
      'jax': 'JAX',
      'flax': 'Flax',
      // HuggingFace ecosystem
      'datasets': 'HuggingFace datasets',
      'transformers': 'HuggingFace transformers',
      'peft': 'HuggingFace peft',
      'trl': 'HuggingFace trl',
      'accelerate': 'HuggingFace accelerate',
      'bitsandbytes': 'bitsandbytes',
      'huggingface_hub': 'huggingface_hub',
      // Agent / LLM frameworks (need API keys + heavy deps)
      'langchain': 'LangChain',
      'langchain_openai': 'LangChain',
      'langchain_core': 'LangChain',
      'langchain_community': 'LangChain',
      'langgraph': 'LangGraph',
      'llama_index': 'LlamaIndex',
      'dspy': 'DSPy',
      'pydantic_ai': 'Pydantic AI',
      'crewai': 'CrewAI',
      'autogen': 'AutoGen',
      'instructor': 'Instructor',
      // LLM provider SDKs (need API keys + network)
      'openai': 'OpenAI SDK',
      'anthropic': 'Anthropic SDK',
      'cohere': 'Cohere SDK',
      'google': 'Google GenAI SDK',
      // Inference / serving (server-only)
      'vllm': 'vLLM',
      'ollama': 'Ollama',
      // Web / app frameworks
      'gradio': 'Gradio',
      'streamlit': 'Streamlit',
      'fastapi': 'FastAPI',
      'uvicorn': 'Uvicorn',
      // Eval / observability
      'mlflow': 'MLflow',
      'wandb': 'Weights & Biases',
      'ragas': 'Ragas',
      'deepeval': 'DeepEval',
      'requests': null,  // works in pyodide via micropip but blocked by CORS — skip silently
    };
    const blockedHits = [];
    for (const mod of importedModules) {
      if (browserIncompatible.hasOwnProperty(mod) && browserIncompatible[mod]) {
        blockedHits.push(browserIncompatible[mod]);
      }
    }
    if (blockedHits.length > 0) {
      const uniq = [...new Set(blockedHits)];
      outputEl.innerHTML =
        '<div class="py-info" style="line-height:1.5;">' +
          'ℹ️ This example needs <strong>' + uniq.join(', ') + '</strong> ' +
          'which can\'t run in the browser sandbox (heavy native deps, GPU, server runtime, or remote API).<br>' +
          '<span style="opacity:0.8;">Copy the code to a local Python environment to try it.</span>' +
        '</div>';
      return;
    }

    // ─── Pyodide-installable packages ───
    // Maps a top-level module name to the Pyodide / PyPI package name.
    const pkgMap = {
      'pandas': 'pandas',
      'sklearn': 'scikit-learn',
      'scipy': 'scipy',
      'seaborn': 'seaborn',
      'matplotlib': 'matplotlib',
      'joblib': 'joblib',
      'imblearn': 'imbalanced-learn',
      'statsmodels': 'statsmodels',
      'networkx': 'networkx',
      'sympy': 'sympy',
      'PIL': 'pillow',
      'pydantic': 'pydantic',
    };
    const neededPkgs = [];
    for (const mod of importedModules) {
      if (pkgMap[mod]) neededPkgs.push(pkgMap[mod]);
    }
    if (neededPkgs.length > 0) {
      for (const pkg of neededPkgs) {
        try {
          await pyodide.loadPackage(pkg);
        } catch {
          try {
            const micropip = pyodide.pyimport('micropip');
            await micropip.install(pkg);
          } catch(e) { /* skip unavailable */ }
        }
      }
    }

    outputEl.innerHTML = '<div class="py-loading"><div class="spinner"></div>Running code...</div>';

    // Clear previous output
    pyodide.runPython('_stdout.clear(); _stderr.clear()');

    // Handle matplotlib — redirect to base64 image
    let matplotlibSetup = '';
    if (code.includes('matplotlib') || code.includes('plt.')) {
      matplotlibSetup = `
import matplotlib
matplotlib.use('AGG')
import matplotlib.pyplot as plt
plt.close('all')
_plot_outputs = []
_orig_show = plt.show
def _capture_show(*args, **kwargs):
    import base64
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='white')
    buf.seek(0)
    _plot_outputs.append(base64.b64encode(buf.read()).decode('utf-8'))
    plt.close('all')
plt.show = _capture_show
`;
    }

    // Run the code
    pyodide.runPython(matplotlibSetup + code);

    // If matplotlib was used but show() wasn't called, capture anyway
    if (code.includes('plt.') && !code.includes('plt.show')) {
      pyodide.runPython(`
try:
    import matplotlib.pyplot as plt
    if plt.get_fignums():
        _capture_show()
except:
    pass
`);
    }

    // Get outputs
    const stdout = pyodide.runPython('_stdout.get()');
    const stderr = pyodide.runPython('_stderr.get()');
    const plots = pyodide.runPython('_plot_outputs if "_plot_outputs" in dir() else []');
    const plotList = plots.toJs ? plots.toJs() : [];

    // Build output HTML
    let html = '';
    if (stdout.trim()) html += stdout;
    if (plotList.length > 0) {
      for (const b64 of plotList) {
        html += `\n<img src="data:image/png;base64,${b64}" alt="matplotlib plot"/>`;
      }
    }
    if (stderr.trim()) html += `\n<span class="py-err">${stderr}</span>`;
    if (!html.trim()) html = '<span class="py-info">✓ Code executed successfully (no output)</span>';

    outputEl.innerHTML = html;

  } catch (err) {
    outputEl.innerHTML = `<span class="py-err">${err.message || err}</span>`;
  }
}

function addRunButtons(contentEl) {
  contentEl.querySelectorAll('.code-wrapper').forEach(wrapper => {
    const pre = wrapper.querySelector('pre');
    const codeEl = pre?.querySelector('code');
    if (!codeEl) return;

    // Only add to Python code blocks
    const isPython = codeEl.classList.contains('language-python') ||
                     codeEl.classList.contains('language-py') ||
                     codeEl.textContent.match(/^\s*(import |from |def |class |print\(|#)/m);

    if (!isPython) return;
    if (wrapper.querySelector('.run-btn')) return; // already has one

    const btn = document.createElement('button');
    btn.className = 'run-btn';
    btn.textContent = '▶ Run';
    btn.onclick = async () => {
      btn.textContent = '⏳ Running...';
      btn.classList.add('running');

      // Create or reuse output div
      let outputEl = wrapper.nextElementSibling;
      if (!outputEl || !outputEl.classList.contains('py-output')) {
        outputEl = document.createElement('div');
        outputEl.className = 'py-output';
        wrapper.after(outputEl);
      }

      await runPythonCode(codeEl.textContent, outputEl);

      btn.textContent = '▶ Run';
      btn.classList.remove('running');
    };
    wrapper.appendChild(btn);
  });
}


// ─── Comments System ───
// Stored separately: ml4-comments (NOT deleted by reset)
function getComments() { return JSON.parse(localStorage.getItem('ml4-comments') || '{}'); }
function saveComments(c) { localStorage.setItem('ml4-comments', JSON.stringify(c)); }

function renderComments(file) {
  const all = getComments();
  const comments = all[file] || [];
  const container = document.getElementById('commentsContainer');
  if (!container) return;

  const openCount = comments.filter(c => !c.resolved).length;
  const resolvedCount = comments.filter(c => c.resolved).length;
  const total = comments.reduce((s, c) => s + 1 + (c.replies ? c.replies.length : 0), 0);

  const countEl = document.getElementById('commentCount');
  if (countEl) countEl.textContent = total > 0 ? `(${openCount} open${resolvedCount > 0 ? ', ' + resolvedCount + ' resolved' : ''})` : '';

  // Apply filter
  let filtered = comments.map((c, i) => ({ comment: c, origIndex: i }));
  if (commentFilter === 'open') filtered = filtered.filter(x => !x.comment.resolved);
  else if (commentFilter === 'resolved') filtered = filtered.filter(x => x.comment.resolved);

  // Update filter bar active states
  const filterBar = document.getElementById('commentFilterBar');
  if (filterBar) {
    filterBar.style.display = comments.length > 0 ? 'flex' : 'none';
    filterBar.querySelectorAll('.comment-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === commentFilter);
    });
    const openLabel = filterBar.querySelector('[data-filter="open"]');
    const resolvedLabel = filterBar.querySelector('[data-filter="resolved"]');
    if (openLabel) openLabel.textContent = `Open (${openCount})`;
    if (resolvedLabel) resolvedLabel.textContent = `Resolved (${resolvedCount})`;
  }

  if (filtered.length === 0 && comments.length > 0) {
    container.innerHTML = `<p style="color:var(--text-secondary);font-size:13px;text-align:center;padding:20px 0;">No ${commentFilter} comments in this chapter.</p>`;
  } else {
    container.innerHTML = filtered.map(x => renderSingleComment(x.comment, x.origIndex, file)).join('');
  }
  // Keep the floating margin pins in sync whenever the list re-renders
  // (covers resolve / reopen / edit / delete / filter changes).
  if (typeof renderPins === 'function') renderPins(file);
}

function renderSingleComment(c, index, file, isReply = false, parentIndex = null) {
  const id = isReply ? `${parentIndex}-${index}` : `${index}`;
  const date = new Date(c.date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit'});
  const edited = c.edited ? ' <small>(edited)</small>' : '';
  const resolved = c.resolved && !isReply;
  const resolvedBadge = resolved ? '<span class="comment-resolved-badge">&#10003; Resolved</span>' : '';
  const resolveBtn = !isReply ? `<button class="resolve-btn" onclick="resolveComment('${file}', ${index})">${resolved ? '↺ Reopen' : '✓ Resolve'}</button>` : '';
  const pinBadge = (!isReply && c.anchor) ? '<span class="comment-pin-badge" title="This note is pinned in the chapter margin">📍 Pinned</span>' : '';
  const gotoBtn = (!isReply && c.anchor) ? `<button class="goto-source-btn" onclick="goToCommentSource('${file}', ${index})" title="Scroll to where this note was attached">↗ Go to source</button>` : '';
  let html = `<div class="comment-item${resolved ? ' resolved' : ''}${c.anchor ? ' has-pin' : ''}" id="comment-${id}">
    <div class="comment-header">
      <span class="comment-date">${date}${edited}${pinBadge}${resolvedBadge}</span>
      <div class="comment-actions">
        ${gotoBtn}
        ${resolveBtn}
        ${!isReply ? `<button onclick="showReplyForm('${file}', ${index})">↩ Reply</button>` : ''}
        <button onclick="editComment('${file}', ${isReply ? parentIndex : index}, ${isReply ? index : -1})">✎ Edit</button>
        <button class="del" onclick="deleteComment('${file}', ${isReply ? parentIndex : index}, ${isReply ? index : -1})">✕ Delete</button>
      </div>
    </div>
    ${c.quote ? `<div class="comment-quote">"${escapeHtml(c.quote)}"</div>` : ''}
    <div class="comment-body" id="comment-body-${id}">${escapeHtml(c.text)}</div>`;

  if (!isReply && c.replies && c.replies.length > 0) {
    html += `<div class="comment-replies">`;
    html += c.replies.map((r, ri) => renderSingleComment(r, ri, file, true, index)).join('');
    html += `</div>`;
  }

  html += `<div id="reply-form-${index}" style="display:none;margin-top:10px;">
      <div class="comment-form">
        <textarea class="comment-input" id="reply-input-${index}" placeholder="Write a reply..." rows="1"></textarea>
        <button class="comment-submit" onclick="addReply('${file}', ${index})">Reply</button>
      </div>
    </div>`;
  html += `</div>`;
  return html;
}

function escapeHtml(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
}

function addComment(file) {
  const input = document.getElementById('newCommentInput');
  const text = input.value.trim();
  if (!text) return;

  const all = getComments();
  if (!all[file]) all[file] = [];
  all[file].unshift({ text, date: new Date().toISOString(), replies: [] });
  saveComments(all);
  input.value = '';
  renderComments(file);
  updateCommentFab(file);
  addXP(2, 'Added a note');
}

function updateFabAfterChange(file) {
  renderComments(file);
  updateCommentFab(file);
}

function addReply(file, parentIndex) {
  const input = document.getElementById(`reply-input-${parentIndex}`);
  const text = input.value.trim();
  if (!text) return;

  const all = getComments();
  if (!all[file] || !all[file][parentIndex]) return;
  if (!all[file][parentIndex].replies) all[file][parentIndex].replies = [];
  all[file][parentIndex].replies.push({ text, date: new Date().toISOString() });
  saveComments(all);
  renderComments(file);
  updateCommentFab(file);
}

function showReplyForm(file, index) {
  const form = document.getElementById(`reply-form-${index}`);
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') {
      document.getElementById(`reply-input-${index}`).focus();
    }
  }
}

function editComment(file, index, replyIndex) {
  const all = getComments();
  const comment = replyIndex >= 0 ? all[file][index].replies[replyIndex] : all[file][index];
  const id = replyIndex >= 0 ? `${index}-${replyIndex}` : `${index}`;
  const bodyEl = document.getElementById(`comment-body-${id}`);

  bodyEl.innerHTML = `
    <textarea class="comment-edit-input" id="edit-input-${id}">${comment.text}</textarea>
    <div class="comment-edit-actions">
      <button class="save" onclick="saveEdit('${file}', ${index}, ${replyIndex})">Save</button>
      <button onclick="renderComments('${file}')">Cancel</button>
    </div>`;
  document.getElementById(`edit-input-${id}`).focus();
}

function saveEdit(file, index, replyIndex) {
  const id = replyIndex >= 0 ? `${index}-${replyIndex}` : `${index}`;
  const input = document.getElementById(`edit-input-${id}`);
  const text = input.value.trim();
  if (!text) return;

  const all = getComments();
  if (replyIndex >= 0) {
    all[file][index].replies[replyIndex].text = text;
    all[file][index].replies[replyIndex].edited = true;
  } else {
    all[file][index].text = text;
    all[file][index].edited = true;
  }
  saveComments(all);
  renderComments(file);
}

function deleteComment(file, index, replyIndex) {
  const what = replyIndex >= 0 ? 'reply' : 'comment';
  if (!confirm(`Delete this ${what}?`)) return;

  const all = getComments();
  if (replyIndex >= 0) {
    all[file][index].replies.splice(replyIndex, 1);
  } else {
    all[file].splice(index, 1);
  }
  saveComments(all);
  renderComments(file);
  updateCommentFab(file);
}

let commentFilter = 'all'; // 'all', 'open', 'resolved'

function resolveComment(file, index) {
  const all = getComments();
  if (!all[file] || !all[file][index]) return;
  all[file][index].resolved = !all[file][index].resolved;
  saveComments(all);
  renderComments(file);
  updateCommentFab(file);
  const action = all[file][index].resolved ? 'Resolved' : 'Reopened';
  showToast(`${all[file][index].resolved ? '✓' : '↺'} ${action}`, 'Comment ' + action.toLowerCase(), all[file][index].resolved ? '✅' : '💬');
}

function setCommentFilter(filter, file) {
  commentFilter = filter;
  document.querySelectorAll('.comment-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderComments(file);
}

function injectComments(file) {
  // Reset the filter on every chapter open so a stale "resolved/open" filter
  // from a previous chapter doesn't hide newly-added comments here.
  commentFilter = 'all';
  const contentEl = document.getElementById('content');
  // Remove existing comments section if any
  document.getElementById('commentsSection')?.remove();

  const section = document.createElement('div');
  section.id = 'commentsSection';
  section.className = 'comments-section';

  const all = getComments();
  const total = (all[file] || []).reduce((s, c) => s + 1 + (c.replies ? c.replies.length : 0), 0);

  const openCount = (all[file] || []).filter(c => !c.resolved).length;
  const resolvedCount = (all[file] || []).filter(c => c.resolved).length;

  section.innerHTML = `
    <h3>💬 Notes & Comments <span class="comment-count" id="commentCount">${total > 0 ? '(' + openCount + ' open' + (resolvedCount > 0 ? ', ' + resolvedCount + ' resolved' : '') + ')' : ''}</span></h3>
    <p style="color:var(--text-secondary);font-size:13px;margin:-8px 0 14px;">Add personal notes, questions, or highlights for this chapter. Your comments are saved locally and survive progress resets.</p>
    <div class="comment-form">
      <textarea class="comment-input" id="newCommentInput" placeholder="Write a note... (e.g., 'Remember: BFS uses Queue, DFS uses Stack')" rows="2"></textarea>
      <button class="comment-submit" onclick="addComment('${file}')">Post</button>
    </div>
    <div class="comment-filter-bar" id="commentFilterBar" style="display:${total > 0 ? 'flex' : 'none'};">
      <button class="comment-filter-btn${commentFilter==='all'?' active':''}" data-filter="all" onclick="setCommentFilter('all','${file}')">All</button>
      <button class="comment-filter-btn${commentFilter==='open'?' active':''}" data-filter="open" onclick="setCommentFilter('open','${file}')">Open (${openCount})</button>
      <button class="comment-filter-btn${commentFilter==='resolved'?' active':''}" data-filter="resolved" onclick="setCommentFilter('resolved','${file}')">Resolved (${resolvedCount})</button>
    </div>
    <div id="commentsContainer"></div>`;

  // Insert before nav buttons if they exist, otherwise append
  const navBtns = contentEl.querySelector('.nav-buttons');
  if (navBtns) contentEl.insertBefore(section, navBtns);
  else contentEl.appendChild(section);

  renderComments(file);
  updateCommentFab(file);
}

function updateCommentFab(file) {
  const fab = document.getElementById('commentFab');
  const badge = document.getElementById('commentFabBadge');
  if (!fab) return;

  if (currentPage === 'chapter' && file) {
    fab.classList.add('visible');
    const all = getComments();
    const comments = all[file] || [];
    const openCount = comments.filter(c => !c.resolved).length;
    const total = comments.reduce((s, c) => s + 1 + (c.replies ? c.replies.length : 0), 0);
    if (total > 0) {
      badge.style.display = 'flex';
      badge.textContent = openCount > 0 ? openCount : '✓';
      badge.style.background = openCount > 0 ? '#ef4444' : '#16a34a';
    } else {
      badge.style.display = 'none';
    }
  } else {
    fab.classList.remove('visible');
  }
}

function scrollToComments() {
  const wrapper = document.getElementById('contentWrapper');
  const section = document.getElementById('commentsSection');
  if (wrapper && section) {
    wrapper.scrollTo({ top: section.offsetTop - 80, behavior: 'smooth' });
    setTimeout(() => {
      const input = document.getElementById('newCommentInput');
      if (input) input.focus();
    }, 500);
  }
}

function deleteAllComments() {
  if (!confirm('Delete ALL comments and notes from ALL chapters?\n\nThis cannot be undone.')) return;
  if (!confirm('Are you REALLY sure? All your notes will be permanently deleted.')) return;
  localStorage.removeItem('ml4-comments');
  // Reset filter so the user can immediately add new comments without an
  // "open/resolved" filter accidentally hiding them.
  commentFilter = 'all';
  showToast('🗑️ Comments Deleted', 'All notes and comments cleared', '⚠️');
  showDashboard();
}

function deleteAllHighlights() {
  if (!confirm('Delete ALL text highlights from ALL chapters?\n\nThis cannot be undone.')) return;
  localStorage.removeItem('ml4-highlights');
  showToast('🖍 Highlights Deleted', 'All highlights cleared', '⚠️');
  showDashboard();
}

// ─── Text Selection Popup (select text → Note / Highlight / Copy) ───
let selectedText = '';
let selectionRange = null;

document.addEventListener('mouseup', (e) => {
  const popup = document.getElementById('selPopup');
  const content = document.getElementById('content');
  if (!content || !content.contains(e.target)) { popup.classList.remove('visible'); return; }
  if (e.target.closest('.comment-form, .comment-item, textarea, input, .sel-popup')) return;

  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel.toString().trim();
    if (text.length > 2 && currentPage === 'chapter') {
      selectedText = text;
      try { selectionRange = sel.getRangeAt(0).cloneRange(); } catch(e) { selectionRange = null; }
      // Position relative to the viewport (popup is position:absolute in body)
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      popup.style.top = (rect.top + scrollY - 48) + 'px';
      popup.style.left = Math.max(8, Math.min(rect.left + rect.width / 2 - 80, window.innerWidth - 220)) + 'px';
      popup.classList.add('visible');
    } else {
      popup.classList.remove('visible');
    }
  }, 10);
});

document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('.sel-popup')) {
    document.getElementById('selPopup').classList.remove('visible');
  }
});

// Suppress browser context menu on content when text is selected
document.addEventListener('contextmenu', (e) => {
  const content = document.getElementById('content');
  if (!content || !content.contains(e.target)) return;
  if (e.target.closest('textarea, input')) return;
  const sel = window.getSelection();
  if (sel && sel.toString().trim().length > 2 && currentPage === 'chapter') {
    e.preventDefault();
  }
});

function noteFromSelection() {
  document.getElementById('selPopup').classList.remove('visible');
  if (!selectedText || currentIndex < 0) return;
  const file = chapters[currentIndex].file;
  const quote = selectedText.substring(0, 200);

  // Capture an anchor for the selection point so the new note also shows as
  // a floating pin in the chapter margin (pins.js reads the anchor field).
  let anchor = null;
  try {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && typeof pinAnchorFromElement === 'function') {
      const range = sel.getRangeAt(0);
      let startEl = range.startContainer;
      if (startEl && startEl.nodeType === Node.TEXT_NODE) startEl = startEl.parentElement;
      if (startEl) {
        const a = pinAnchorFromElement(startEl);
        if (a) {
          const rect = a._el.getBoundingClientRect();
          const sRect = range.getBoundingClientRect();
          const offsetY = rect.height > 0
            ? Math.max(0, Math.min(1, (sRect.top - rect.top) / rect.height))
            : 0;
          anchor = { tag: a.tag, index: a.index, text: a.text, offsetY };
        }
      }
    }
  } catch (e) { /* fall through; note stays unanchored */ }

  window.getSelection().removeAllRanges();

  // Scroll content-wrapper to comments section
  const wrapper = document.getElementById('contentWrapper');
  const section = document.getElementById('commentsSection');
  if (wrapper && section) {
    wrapper.scrollTo({ top: section.offsetTop - 80, behavior: 'smooth' });
  }

  setTimeout(() => {
    const input = document.getElementById('newCommentInput');
    if (input) {
      input.dataset.quote = quote;
      if (anchor) input.dataset.anchor = JSON.stringify(anchor);
      input.placeholder = `Add note about: "${quote.substring(0, 60)}..."`;
      input.value = '';
      input.focus();
    }
  }, 500);
}

function highlightSelection() {
  document.getElementById('selPopup').classList.remove('visible');
  if (!selectionRange || !selectedText || currentIndex < 0) return;
  const file = chapters[currentIndex].file;

  if (wrapRangeInHighlights(selectionRange, file)) {
    saveHighlights(file);
    showToast('🖍 Highlighted', selectedText.substring(0, 40) + (selectedText.length > 40 ? '…' : ''), '✓');
  } else {
    showToast('⚠️ Highlight failed', 'Could not highlight that selection', '🖍');
  }
  window.getSelection().removeAllRanges();
}

// Wrap every text node that intersects `range` in its own <mark class="user-hl">.
// Range.surroundContents throws when a selection crosses element boundaries
// (e.g. the nested bold/italic spans inside the blue "Simple Explanation" /
// "Official Definition" blockquotes), which is why those boxes couldn't be
// highlighted. Walking the text nodes individually lets multi-element
// selections highlight correctly. All marks from one selection share an hlId so
// they persist as a single highlight and are removed together on click.
function wrapRangeInHighlights(range, file) {
  if (!range || range.collapsed) return false;

  const startC = range.startContainer, startO = range.startOffset;
  const endC = range.endContainer, endO = range.endOffset;
  const fullText = range.toString();

  let rootEl = range.commonAncestorContainer;
  if (rootEl.nodeType === Node.TEXT_NODE) rootEl = rootEl.parentNode;
  if (!rootEl) return false;

  // Collect every intersecting text node up front (before any DOM mutation).
  const nodes = [];
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (p && p.closest('pre, code, script, .sel-popup, .comments-section, mark.user-hl'))
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  if (!nodes.length) return false;

  const hlId = 'hl-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  let wrapped = false;

  nodes.forEach(node => {
    const start = (node === startC) ? startO : 0;
    const end = (node === endC) ? endO : node.nodeValue.length;
    if (start >= end) return; // nothing of this node is inside the selection
    try {
      const sub = document.createRange();
      sub.setStart(node, start);
      sub.setEnd(node, end);
      const mark = document.createElement('mark');
      mark.className = 'user-hl';
      mark.title = 'Click to remove highlight';
      mark.dataset.file = file;
      mark.dataset.hlId = hlId;
      mark.dataset.hlText = fullText;
      // sub stays within a single text node, so surroundContents never throws.
      sub.surroundContents(mark);
      wrapped = true;
    } catch (e) { /* skip this fragment, keep going */ }
  });
  return wrapped;
}

// Event delegation — handle click on ANY highlight mark
document.addEventListener('click', function(e) {
  const mark = e.target.closest('mark.user-hl');
  if (!mark) return;

  // Don't trigger during text selection
  if (window.getSelection().toString().length > 0) return;

  const file = mark.dataset.file || (currentIndex >= 0 ? chapters[currentIndex]?.file : null);
  // A selection that crossed element boundaries is stored as several marks
  // sharing one hlId — remove them all so the whole highlight clears at once.
  const hlId = mark.dataset.hlId;
  const group = hlId
    ? Array.from(document.querySelectorAll('mark.user-hl')).filter(m => m.dataset.hlId === hlId)
    : [mark];

  group.forEach(m => {
    const parent = m.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
  if (file) saveHighlights(file);
});

function copySelection() {
  document.getElementById('selPopup').classList.remove('visible');
  if (selectedText) {
    navigator.clipboard.writeText(selectedText).then(() => {
      showToast('📋 Copied', selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''), '✓');
    });
  }
  window.getSelection().removeAllRanges();
}

// Save/load highlights per chapter
function saveHighlights(file) {
  const content = document.getElementById('content');
  if (!content) return;
  const highlights = [];
  const seen = new Set();
  content.querySelectorAll('mark.user-hl').forEach(m => {
    // Marks sharing an hlId belong to one selection — save the group once,
    // using the full selected text rather than the per-fragment text.
    const hlId = m.dataset.hlId || ('m-' + seen.size);
    if (seen.has(hlId)) return;
    seen.add(hlId);
    const text = m.dataset.hlText || m.textContent;
    const parent = m.parentNode;
    const context = parent ? parent.textContent.substring(0, 200) : '';
    highlights.push({ text, context });
  });
  const all = JSON.parse(localStorage.getItem('ml4-highlights') || '{}');
  all[file] = highlights;
  localStorage.setItem('ml4-highlights', JSON.stringify(all));
}

function loadHighlights(file) {
  const all = JSON.parse(localStorage.getItem('ml4-highlights') || '{}');
  const highlights = all[file] || [];
  if (!highlights.length) return;

  const content = document.getElementById('content');
  if (!content) return;
  // Restore each saved highlight by locating its text and re-wrapping it.
  highlights.forEach(h => {
    const searchText = typeof h === 'string' ? h : h.text;
    if (!searchText || searchText.length < 2) return;
    restoreHighlight(content, searchText, file);
  });
}

// Find `searchText` within `root` — even when it spans several inline elements —
// and re-wrap it using the same multi-node primitive as live highlighting.
function restoreHighlight(root, searchText, file) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (p && p.closest('.comments-section, pre, code, script, .sel-popup, mark.user-hl'))
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  const starts = [];
  let combined = '';
  let node;
  while ((node = walker.nextNode())) {
    starts.push(combined.length);
    nodes.push(node);
    combined += node.nodeValue;
  }
  if (!nodes.length) return false;

  const at = combined.indexOf(searchText);
  if (at < 0) return false;
  const endAt = at + searchText.length;

  const locate = (pos) => {
    for (let k = nodes.length - 1; k >= 0; k--) {
      if (pos >= starts[k]) return { node: nodes[k], offset: pos - starts[k] };
    }
    return { node: nodes[0], offset: 0 };
  };

  try {
    const s = locate(at);
    const e = locate(endAt);
    const range = document.createRange();
    range.setStart(s.node, s.offset);
    range.setEnd(e.node, e.offset);
    return wrapRangeInHighlights(range, file);
  } catch (e) {
    return false;
  }
}

// Update addComment to include quote + optional anchor (for floating pins)
const _origAddComment = addComment;
addComment = function(file) {
  const input = document.getElementById('newCommentInput');
  const text = input.value.trim();
  if (!text) return;

  const all = getComments();
  if (!all[file]) all[file] = [];

  const comment = { text, date: new Date().toISOString(), replies: [] };
  // Attach quote if present
  if (input.dataset.quote) {
    comment.quote = input.dataset.quote;
    delete input.dataset.quote;
    input.placeholder = 'Write a note...';
  }
  // Attach anchor (for floating pin) if present
  if (input.dataset.anchor) {
    try { comment.anchor = JSON.parse(input.dataset.anchor); } catch (e) {}
    delete input.dataset.anchor;
  }
  all[file].unshift(comment);
  saveComments(all);
  input.value = '';
  renderComments(file);
  updateCommentFab(file);
  if (typeof renderPins === 'function') renderPins(file);
  addXP(2, 'Added a note');
};

// ═══════════════════════════════════════════════════════════
// ═══  Text-to-Speech (TTS) — Chapter Reader              ═══
// ═══════════════════════════════════════════════════════════

let _ttsParagraphs = [];
let _ttsIndex = 0;
let _ttsPlaying = false;
let _ttsSpeed = 1;
let _ttsUtterance = null;
let _ttsVoice = null;

// Auto-pick the best English voice on the system (runs once, zero latency)
function _ttsPickBestVoice() {
  var voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  // Score each English voice — higher is better
  var best = null, bestScore = -1;
  for (var i = 0; i < voices.length; i++) {
    var v = voices[i];
    if (!/en/i.test(v.lang)) continue;
    var score = 0;
    var n = v.name.toLowerCase();
    // Premium/natural voices (Windows 11, macOS, Chrome)
    if (/natural|neural|enhanced|premium/.test(n)) score += 100;
    if (/microsoft.*(jenny|guy|aria|ryan|steffan)/.test(n)) score += 90;
    if (/samantha|karen|daniel|fiona|alex/.test(n)) score += 80;
    if (/google\s+us\s+english|google\s+uk\s+english/.test(n)) score += 70;
    // Prefer local voices (no network latency)
    if (!v.localService === false) score += 10;
    if (v.localService) score += 20;
    // Prefer en-US over other English variants
    if (/en.US/i.test(v.lang)) score += 5;
    if (score > bestScore) { best = v; bestScore = score; }
  }
  _ttsVoice = best || voices.find(function(v) { return /en/i.test(v.lang); }) || null;
}
speechSynthesis.onvoiceschanged = _ttsPickBestVoice;
_ttsPickBestVoice();

function _ttsExtractParagraphs() {
  const content = document.getElementById('content');
  if (!content) return [];
  const blocks = [];
  content.querySelectorAll('h1,h2,h3,h4,p,li,blockquote,summary').forEach(el => {
    if (el.closest('pre') || el.closest('code') || el.closest('.code-wrapper')) return;
    if (el.closest('.nav-buttons') || el.closest('.comment-section')) return;
    const text = el.textContent.trim();
    if (!text || text.length < 5) return;
    if (/^[┌┐└┘├┤─│═║╔╗╚╝▼▲►◄●○★☆✓✗→←↑↓\s\-|+]+$/.test(text)) return;
    blocks.push({ el: el, text: text });
  });
  return blocks;
}

function _ttsSplitSentences(text) {
  // Browser speechSynthesis can choke on long text (>200 chars).
  // Split into sentences but keep each under ~200 chars.
  var parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  var result = [];
  var current = '';
  for (var i = 0; i < parts.length; i++) {
    if ((current + parts[i]).length > 200 && current.length > 0) {
      result.push(current.trim());
      current = parts[i];
    } else {
      current += parts[i];
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function toggleTTS() {
  if (_ttsPlaying) {
    ttsStop();
  } else {
    _ttsParagraphs = _ttsExtractParagraphs();
    if (_ttsParagraphs.length === 0) return;
    _ttsIndex = 0;
    _ttsPlaying = true;
    document.getElementById('ttsPlayer').classList.add('visible');
    document.getElementById('ttsBtn').classList.add('active');
    document.getElementById('ttsBtn').innerHTML = '&#9646;&#9646; Pause';
    _ttsUpdateCounter();
    _ttsSpeakCurrent();
  }
}

function ttsPlayPause() {
  if (!_ttsPlaying) {
    if (_ttsParagraphs.length === 0) { toggleTTS(); return; }
    _ttsPlaying = true;
    document.getElementById('ttsBtn').classList.add('active');
    document.getElementById('ttsBtn').innerHTML = '&#9646;&#9646; Pause';
    document.getElementById('ttsPlayBtn').innerHTML = '&#9646;&#9646;';
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    } else {
      _ttsSpeakCurrent();
    }
  } else {
    _ttsPlaying = false;
    document.getElementById('ttsBtn').innerHTML = '&#9655; Listen';
    document.getElementById('ttsPlayBtn').innerHTML = '&#9655;';
    speechSynthesis.pause();
  }
}

function ttsStop() {
  speechSynthesis.cancel();
  _ttsPlaying = false;
  _ttsParagraphs = [];
  _ttsIndex = 0;
  _ttsUtterance = null;
  var player = document.getElementById('ttsPlayer');
  if (player) player.classList.remove('visible');
  var btn = document.getElementById('ttsBtn');
  if (btn) { btn.classList.remove('active'); btn.innerHTML = '&#9655; Listen'; }
  var playBtn = document.getElementById('ttsPlayBtn');
  if (playBtn) playBtn.innerHTML = '&#9655;';
  document.querySelectorAll('.tts-highlight').forEach(function(el) {
    el.classList.remove('tts-highlight');
  });
}

function ttsBack() {
  if (_ttsIndex > 0) {
    speechSynthesis.cancel();
    _ttsIndex--;
    _ttsUpdateCounter();
    if (_ttsPlaying) _ttsSpeakCurrent();
  }
}

function ttsForward() {
  if (_ttsIndex < _ttsParagraphs.length - 1) {
    speechSynthesis.cancel();
    _ttsIndex++;
    _ttsUpdateCounter();
    if (_ttsPlaying) _ttsSpeakCurrent();
  }
}

function ttsSetSpeed(val) {
  _ttsSpeed = parseFloat(val);
  if (_ttsPlaying && _ttsUtterance) {
    var wasIndex = _ttsIndex;
    speechSynthesis.cancel();
    _ttsIndex = wasIndex;
    _ttsSpeakCurrent();
  }
}

function _ttsUpdateCounter() {
  var counter = document.getElementById('ttsCounter');
  var fill = document.getElementById('ttsProgressFill');
  if (counter) counter.textContent = (_ttsIndex + 1) + '/' + _ttsParagraphs.length;
  if (fill) fill.style.width = ((_ttsIndex + 1) / _ttsParagraphs.length * 100) + '%';
}

function _ttsHighlight(el) {
  document.querySelectorAll('.tts-highlight').forEach(function(e) {
    e.classList.remove('tts-highlight');
  });
  if (el) {
    el.classList.add('tts-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function _ttsSpeakCurrent() {
  if (_ttsIndex >= _ttsParagraphs.length) { ttsStop(); return; }
  var para = _ttsParagraphs[_ttsIndex];
  _ttsHighlight(para.el);
  var sentences = _ttsSplitSentences(para.text);
  var sentIdx = 0;
  var advancing = false;

  function speakNext() {
    if (advancing) return;
    advancing = true;
    if (sentIdx >= sentences.length) {
      _ttsIndex++;
      _ttsUpdateCounter();
      if (_ttsIndex < _ttsParagraphs.length && _ttsPlaying) {
        setTimeout(function() { _ttsSpeakCurrent(); }, 50);
      } else if (_ttsIndex >= _ttsParagraphs.length) {
        ttsStop();
      }
      return;
    }
    var utt = new SpeechSynthesisUtterance(sentences[sentIdx]);
    if (_ttsVoice) utt.voice = _ttsVoice;
    utt.rate = _ttsSpeed;
    utt.pitch = 1.02;
    var handled = false;
    utt.onend = function() {
      if (handled) return;
      handled = true;
      sentIdx++;
      advancing = false;
      speakNext();
    };
    utt.onerror = function() {
      if (handled) return;
      handled = true;
      sentIdx++;
      advancing = false;
      speakNext();
    };
    _ttsUtterance = utt;
    advancing = false;
    speechSynthesis.speak(utt);
  }
  speakNext();
}

// Chrome stops speechSynthesis after ~15s of continuous speech.
// Workaround: queue sentences short enough (<200 chars each via _ttsSplitSentences)
// so each utterance finishes well within the limit. No pause/resume hack needed.
