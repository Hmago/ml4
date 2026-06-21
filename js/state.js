// ═══════════════════════════════════════════════════════════
// ═══  state.js — global state, storage helpers, gamification ═══
// ═══════════════════════════════════════════════════════════

// ─── One-time migration: chapter files moved from root → content/ folder ───
// User-saved data (read status, scores, comments, etc.) keys are file paths.
// Rewrite any old-format keys (e.g., "03_introduction.md") to new-format
// ("content/06_introduction.md") so existing progress survives the move.
(function migrateChapterPathsToContentFolder() {
  if (localStorage.getItem('ml4-migration-content-v1') === 'done') return;
  const moved = [
    '01_google_ai_engineer_strategy.md', '04_brain_training.md', '05_math_fundamentals.md',
    '06_introduction.md', '07_core_concepts.md', '08_data_preprocessing.md',
    '09_supervised_learning.md', '10_unsupervised_learning.md', '11_reinforcement_learning.md',
    '12_key_algorithms.md', '13_neural_networks.md', '14_model_evaluation.md',
    '15_deep_learning.md', '16_llm.md', '20_design_fundamentals.md',
    '29_interview_questions.md', '30_llm_interview_questions.md', '21_ml_system_design.md',
    '27_dsa_coding.md', '26_google_ml_ecosystem.md',
    '31_google_top10_ml_interview.md', '22_modern_system_design.md',
    '32_quick_reference_cheat_sheet.md',
    '28_behavioral_interview.md', '23_practical_ml.md', '23_practical_ml.ipynb',
    '02_staying_relevant_ai_era.md',
  ];
  const movedSet = new Set(moved);
  // These localStorage keys hold {fileName: ...} maps — need their keys rewritten
  const fileKeyedStores = [
    'ml4-read', 'ml4-quiz-scores', 'ml4-quiz-history',
    'ml4-chapter-track', 'ml4-comments', 'ml4-highlights',
  ];
  let touched = 0;
  for (const storeKey of fileKeyedStores) {
    const raw = localStorage.getItem(storeKey);
    if (!raw) continue;
    let obj;
    try { obj = JSON.parse(raw); } catch (e) { continue; }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue;
    let changed = false;
    const out = {};
    for (const k of Object.keys(obj)) {
      // If key is an old-format moved-file name and the new-format key isn't already taken, migrate
      if (movedSet.has(k) && !obj['content/' + k]) {
        out['content/' + k] = obj[k];
        changed = true;
      } else {
        out[k] = obj[k];
      }
    }
    if (changed) {
      localStorage.setItem(storeKey, JSON.stringify(out));
      touched++;
    }
  }
  localStorage.setItem('ml4-migration-content-v1', 'done');
  if (touched > 0) {
    console.log('[ml4] Migrated chapter-path keys in', touched, 'localStorage stores → content/ prefix');
  }
})();


// ─── Migration v2: chapter files renamed to sequential numbering ───
(function migrateChapterPathsV2() {
  if (localStorage.getItem('ml4-migration-rename-v2') === 'done') return;
  var remap = {
    'content/00_google_ai_engineer_strategy.md': 'content/01_google_ai_engineer_strategy.md',
    'content/staying_relevant_ai_era.md': 'content/02_staying_relevant_ai_era.md',
    'content/25_aptitude_mental_math.md': 'content/03_aptitude_mental_math.md',
    'content/01_brain_training.md': 'content/04_brain_training.md',
    'content/02_math_fundamentals.md': 'content/05_math_fundamentals.md',
    'content/03_introduction.md': 'content/06_introduction.md',
    'content/04_core_concepts.md': 'content/07_core_concepts.md',
    'content/05_data_preprocessing.md': 'content/08_data_preprocessing.md',
    'content/06_supervised_learning.md': 'content/09_supervised_learning.md',
    'content/07_unsupervised_learning.md': 'content/10_unsupervised_learning.md',
    'content/08_reinforcement_learning.md': 'content/11_reinforcement_learning.md',
    'content/09_key_algorithms.md': 'content/12_key_algorithms.md',
    'content/10_neural_networks.md': 'content/13_neural_networks.md',
    'content/11_model_evaluation.md': 'content/14_model_evaluation.md',
    'content/12_deep_learning.md': 'content/15_deep_learning.md',
    'content/13_llm.md': 'content/16_llm.md',
    'content/22_modern_ai_stack.md': 'content/17_ai_agents.md',
    'content/14_design_fundamentals.md': 'content/20_design_fundamentals.md',
    'content/17_ml_system_design.md': 'content/21_ml_system_design.md',
    'content/20_Modern System Design.md': 'content/22_modern_system_design.md',
    'content/practical_ml.md': 'content/23_practical_ml.md',
    'content/practical_ml.ipynb': 'content/23_practical_ml.ipynb',
    'content/23_semantic_search.md': 'content/24_semantic_search.md',
    'content/24_misc_topics.md': 'content/25_gpus_tpus_infrastructure.md',
    'content/19_google_ml_ecosystem.md': 'content/26_google_ml_ecosystem.md',
    'content/18_dsa_trees_graphs.md': 'content/27_dsa_coding.md',
    'content/behavioral_interview.md': 'content/28_behavioral_interview.md',
    'content/15_interview_questions.md': 'content/29_interview_questions.md',
    'content/16_llm_interview_questions.md': 'content/30_llm_interview_questions.md',
    'content/20_google_top10_ml_interview.md': 'content/31_google_top10_ml_interview.md',
    'content/21_quick_reference_cheat_sheet.md': 'content/32_quick_reference_cheat_sheet.md',
  };
  var storeKeys = ['ml4-read','ml4-quiz-scores','ml4-quiz-history','ml4-chapter-track','ml4-comments','ml4-highlights'];
  storeKeys.forEach(function(key) {
    var raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      var obj = JSON.parse(raw);
      var changed = false;
      var out = {};
      Object.keys(obj).forEach(function(k) {
        if (remap[k] && !obj[remap[k]]) { out[remap[k]] = obj[k]; changed = true; }
        else { out[k] = obj[k]; }
      });
      if (changed) localStorage.setItem(key, JSON.stringify(out));
    } catch(e) {}
  });
  localStorage.setItem('ml4-migration-rename-v2', 'done');
})();

// ─── Migration v3: chapter resequencing (Quick Ref promoted, SD grouped, RL last) ───
// Files were renamed wholesale to give cleaner monotonic numbering and to
// group related sections. Walks the same fileKeyedStores and rewrites
// affected keys so per-user progress survives the renumbering.
(function migrateChapterPathsV3() {
  if (localStorage.getItem('ml4-migration-resequence-v3') === 'done') return;
  var remap = {
    'content/15p_dl_llm_playbook.md': 'content/00p_dl_llm_playbook.md',
    'content/32_quick_reference_cheat_sheet.md': 'content/00_quick_reference_cheat_sheet.md',
    'content/28_behavioral_interview.md': 'content/02_behavioral_interview.md',
    'content/02_staying_relevant_ai_era.md': 'content/03_staying_relevant_ai_era.md',
    'content/03_aptitude_mental_math.md': 'content/04_aptitude_mental_math.md',
    'content/04_brain_training.md': 'content/05_brain_training.md',
    'content/05_math_fundamentals.md': 'content/06_math_fundamentals.md',
    'content/06_introduction.md': 'content/07_introduction.md',
    'content/07_core_concepts.md': 'content/08_core_concepts.md',
    'content/08_data_preprocessing.md': 'content/09_data_preprocessing.md',
    'content/09_supervised_learning.md': 'content/10_supervised_learning.md',
    'content/10_unsupervised_learning.md': 'content/11_unsupervised_learning.md',
    'content/14_model_evaluation.md': 'content/13_model_evaluation.md',
    'content/13_neural_networks.md': 'content/14_neural_networks.md',
    'content/11_reinforcement_learning.md': 'content/15_reinforcement_learning.md',
    'content/15_deep_learning.md': 'content/16_deep_learning.md',
    'content/16_llm.md': 'content/17_llm.md',
    'content/17_ai_agents.md': 'content/18_ai_agents.md',
    'content/18_ai_frameworks.md': 'content/19_ai_frameworks.md',
    'content/19_2026_landscape.md': 'content/20_2026_landscape.md',
    'content/20_design_fundamentals.md': 'content/21_design_fundamentals.md',
    'content/33_engineering_tools.md': 'content/22_engineering_tools.md',
    'content/34_system_design_fundamentals_deep_dive.md': 'content/23_system_design_fundamentals_deep_dive.md',
    'content/35_system_design_data_distributed.md': 'content/24_system_design_data_distributed.md',
    'content/36_system_design_operations_case_studies.md': 'content/25_system_design_operations_case_studies.md',
    'content/21_ml_system_design.md': 'content/26_ml_system_design.md',
    'content/23_practical_ml.md': 'content/27_practical_ml.md',
    'content/23_practical_ml.ipynb': 'content/27_practical_ml.ipynb',
    'content/24_semantic_search.md': 'content/28_semantic_search.md',
    'content/25_gpus_tpus_infrastructure.md': 'content/29_gpus_tpus_infrastructure.md',
    'content/26_google_ml_ecosystem.md': 'content/30_google_ml_ecosystem.md',
    'content/27_dsa_coding.md': 'content/31_dsa_coding.md',
    'content/29_interview_questions.md': 'content/32_interview_questions.md',
    'content/30_llm_interview_questions.md': 'content/33_llm_interview_questions.md',
    'content/31_google_top10_ml_interview.md': 'content/34_google_top10_ml_interview.md',
  };
  var storeKeys = ['ml4-read','ml4-quiz-scores','ml4-quiz-history','ml4-chapter-track','ml4-comments','ml4-highlights'];
  storeKeys.forEach(function(key) {
    var raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      var obj = JSON.parse(raw);
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
      var changed = false;
      var out = {};
      Object.keys(obj).forEach(function(k) {
        if (remap[k] && !obj[remap[k]]) { out[remap[k]] = obj[k]; changed = true; }
        else { out[k] = obj[k]; }
      });
      if (changed) localStorage.setItem(key, JSON.stringify(out));
    } catch(e) {}
  });
  localStorage.setItem('ml4-migration-resequence-v3', 'done');
})();

// ─── State ───
let currentIndex = -1;
let readChapters = JSON.parse(localStorage.getItem('ml4-read') || '{}');
let cachedContent = {};
let fontSize = parseInt(localStorage.getItem('ml4-fontsize') || '0');

// ─── Marked Config ───
// Java/Python standard library types not recognized by hljs — post-process to colorize them
var _javaTypes = 'String|Integer|Long|Double|Float|Boolean|Character|Byte|Short|Object|Number|Math|System|Arrays|Collections|Map|HashMap|TreeMap|LinkedHashMap|Set|HashSet|TreeSet|LinkedHashSet|List|ArrayList|LinkedList|Queue|Deque|ArrayDeque|PriorityQueue|Stack|Vector|StringBuilder|StringBuffer|Optional|Stream|Collectors|Iterator|Comparator|Comparable|Iterable|Map\\.Entry|Random|Scanner|BufferedReader|InputStreamReader|PrintWriter|File|Path|Paths|Files|Pattern|Matcher|Thread|Runnable|Future|CompletableFuture|ExecutorService|Executors|AtomicInteger|ConcurrentHashMap|CountDownLatch|Exception|RuntimeException|IOException|NullPointerException|IllegalArgumentException|IndexOutOfBoundsException|TreeNode|ListNode|Node';
var _javaTypeRe = new RegExp('(^|[^\\w.])(' + _javaTypes + ')(?=[^\\w]|$)', 'g');

// Inline `highlight` callback only does the FAST path (explicit lang that
// hljs has registered). The expensive `highlightAuto` (O(n × languages))
// used to run synchronously here for every untagged code block during
// `marked.parse()`, which blocked the main thread for many seconds on big
// chapters — on iOS PWAs the OS watchdog would then kill the renderer and
// leave the chapter stuck on "Loading…". Auto-detection now happens after
// first paint in chunked `requestIdleCallback` passes via
// `lazyHighlightCodeBlocks` (see chapter.js loadChapter).
function _applyJavaTypeColor(html) {
  html = html.replace(/>([^<]+)</g, function(match, text) {
    return '>' + text.replace(_javaTypeRe, '$1<span class="hljs-type">$2</span>') + '<';
  });
  if (html.charAt(0) !== '<') {
    var firstTag = html.indexOf('<');
    if (firstTag === -1) firstTag = html.length;
    var prefix = html.substring(0, firstTag);
    html = prefix.replace(_javaTypeRe, '$1<span class="hljs-type">$2</span>') + html.substring(firstTag);
  }
  return html;
}

marked.setOptions({
  highlight: function(code, lang) {
    if (lang === 'chart' || lang === 'mermaid') return code;
    if (lang && typeof hljs !== 'undefined' && hljs.getLanguage(lang)) {
      var html = hljs.highlight(code, { language: lang }).value;
      if (lang === 'java') html = _applyJavaTypeColor(html);
      return html;
    }
    // Unknown / unlabeled language: return null so marked uses its default
    // escape (safe HTML), and let `lazyHighlightCodeBlocks` colorize it
    // asynchronously after first paint.
    return null;
  },
  breaks: false,
  gfm: true,
});

// ─── Post-render syntax highlighting (chunked, async) ───
// Walks `pre code` blocks that marked left un-highlighted (unknown/unlabeled
// language) and applies `hljs.highlightAuto` in small time-budgeted batches
// so the main thread can stay responsive. This is the iOS-PWA-friendly
// replacement for doing all the work inside `marked.parse()`.
var _asciiIndicators = /[┌┐└┘├┤─│═║╔╗╚╝╠╣╦╩┬┴▼▲►◄●○★☆✓✗→←↑↓]/;
function _highlightOneBlock(codeEl) {
  if (codeEl.dataset.hl === '1' || codeEl.classList.contains('hljs')) return;
  codeEl.dataset.hl = '1';
  if (typeof hljs === 'undefined') return;
  var cls = codeEl.className.match(/language-(\w+)/);
  var lang = cls ? cls[1] : null;
  if (lang === 'chart' || lang === 'mermaid') return;
  // If the marked inline `highlight` already produced colored output we'd
  // hit the `hljs` class check above; reaching here means it returned null
  // (unknown lang) — so this is the auto-detect branch.
  var code = codeEl.textContent;
  // Skip ASCII-art / box-drawing diagrams — hljs would mangle them.
  var dashHeavy = (code.match(/[-─═|│┌┐└┘├┤]/g) || []).length > code.length * 0.08;
  if (_asciiIndicators.test(code) || dashHeavy) return;
  // Very long blocks are rare in practice but extremely expensive to
  // highlightAuto; cap to protect against the worst cases.
  if (code.length > 20000) return;
  var html;
  try {
    if (lang && hljs.getLanguage(lang)) {
      html = hljs.highlight(code, { language: lang }).value;
    } else {
      var result = hljs.highlightAuto(code);
      if (result.relevance < 5) return;
      html = result.value;
    }
  } catch (e) { return; }
  if (lang === 'java' || (!lang && html.indexOf('hljs-keyword') !== -1)) {
    html = _applyJavaTypeColor(html);
  }
  codeEl.innerHTML = html;
  codeEl.classList.add('hljs');
}

function lazyHighlightCodeBlocks(rootEl) {
  if (!rootEl) return;
  var blocks = rootEl.querySelectorAll('pre code');
  if (!blocks.length) return;
  var i = 0;
  function tick(deadline) {
    var hasTime = function() {
      return deadline && typeof deadline.timeRemaining === 'function'
        ? deadline.timeRemaining() > 4
        : true;
    };
    var endBy = performance.now() + 20;
    while (i < blocks.length && (hasTime() || performance.now() < endBy)) {
      _highlightOneBlock(blocks[i]);
      i++;
      if (!deadline && performance.now() >= endBy) break;
    }
    if (i < blocks.length) {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(tick, { timeout: 500 });
      } else {
        setTimeout(function() { tick(null); }, 0);
      }
    }
  }
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(tick, { timeout: 500 });
  } else {
    setTimeout(function() { tick(null); }, 0);
  }
}

// ─── Math Protection: extract LaTeX before marked.js can corrupt it ───
function protectMath(md) {
  var store = [];
  // Protect display math $$...$$ first (may span multiple lines)
  md = md.replace(/\$\$([\s\S]*?)\$\$/g, function(m) {
    store.push(m);
    return '\n\nXMATHBLOCKX' + (store.length - 1) + 'XENDMATHX\n\n';
  });
  // Protect inline math $...$ (single line only)
  md = md.replace(/\$([^\$\n]+?)\$/g, function(m) {
    store.push(m);
    return 'XMATHINLINEX' + (store.length - 1) + 'XENDMATHX';
  });
  return { md: md, store: store };
}
function restoreMath(html, store) {
  return html.replace(/XMATH(?:BLOCK|INLINE)X(\d+)XENDMATHX/g, function(_, id) {
    return store[parseInt(id)];
  });
}

// ─── Lazy external-script loader ───
// Injects a CDN <script> on demand (deduped by URL) so heavy libraries that
// only a few pages need — mermaid (~2.7MB), chart.js — stay off the initial
// load path and are fetched the first time a page actually uses them.
const _extScriptPromises = {};
function loadExternalScript(url, integrity) {
  if (_extScriptPromises[url]) return _extScriptPromises[url];
  _extScriptPromises[url] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    if (integrity) s.integrity = integrity;
    s.crossOrigin = 'anonymous';
    s.referrerPolicy = 'no-referrer';
    s.onload = () => resolve();
    s.onerror = () => { delete _extScriptPromises[url]; reject(new Error('Failed to load ' + url)); };
    document.head.appendChild(s);
  });
  return _extScriptPromises[url];
}

// ─── Theme ───
function initTheme() {
  const saved = localStorage.getItem('ml4-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('hljs-theme').href =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css';
  } else {
    document.getElementById('hljs-theme').href =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs.min.css';
  }
}

function toggleTheme() {
  const root = document.documentElement;
  // Suppress the transition storm: flipping CSS variables would otherwise make
  // every element with a transition animate its color at once. Disable
  // transitions for the swap, then re-enable on the next frame.
  root.classList.add('theme-switching');
  const isDark = root.getAttribute('data-theme') === 'dark';
  root.setAttribute('data-theme', isDark ? '' : 'dark');
  document.getElementById('hljs-theme').href = isDark
    ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs.min.css'
    : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css';
  localStorage.setItem('ml4-theme', isDark ? 'light' : 'dark');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
}

// ─── Font Size ───
function changeFontSize(delta) {
  fontSize = Math.max(-1, Math.min(1, fontSize + delta));
  const el = document.getElementById('content');
  el.classList.remove('font-sm', 'font-lg');
  if (fontSize === -1) el.classList.add('font-sm');
  if (fontSize === 1) el.classList.add('font-lg');
  localStorage.setItem('ml4-fontsize', fontSize);
}


// ─── Interactive Mode ───
let interactiveMode = localStorage.getItem('ml4-interactive') !== 'false';

let currentPage = 'welcome'; // 'welcome', 'dashboard', 'motivation', 'goals', 'chapter', 'dsa', 'dsa-problem'

function toggleInteractiveMode() {
  interactiveMode = !interactiveMode;
  localStorage.setItem('ml4-interactive', interactiveMode);
  applyInteractiveMode();
  // Re-render current page without breaking it
  if (currentPage === 'dashboard') showDashboard();
  else if (currentPage === 'motivation') showMotivation();
  else if (currentPage === 'goals') showGoals();
  else if (currentPage === 'dsa') showDSAPractice();
  else if (currentIndex >= 0 && !chapters[currentIndex].section) enhanceContent();
  else renderWelcome();
}

function applyInteractiveMode() {
  document.body.classList.toggle('interactive', interactiveMode);
  updateXPDisplay();
}

// ─── Gamification: XP + Levels + Streaks ───
function getXP() { return JSON.parse(localStorage.getItem('ml4-xp') || '{"xp":0,"streak":0,"lastDate":"","achievements":[]}'); }
function saveXP(data) { localStorage.setItem('ml4-xp', JSON.stringify(data)); updateXPDisplay(); }

// ─── Study Time Tracker ───
// Time is ONLY recorded when the user explicitly starts the timer.
function getStudyData() {
  return JSON.parse(localStorage.getItem('ml4-study') || '{"totalMinutes":0,"sessions":0,"startDate":"","completionDate":""}');
}
function saveStudyData(d) { localStorage.setItem('ml4-study', JSON.stringify(d)); }

// Record first visit date
(function() {
  const d = getStudyData();
  if (!d.startDate) { d.startDate = new Date().toISOString(); saveStudyData(d); }
})();

// ─── Reading-time estimates ───
// Study pace ≈ 55 words/min (reading + working through code, math, and diagrams).
// CHAPTER_MINUTES is the baseline derived from each file's word count, rounded to
// the nearest 5 min. It is GENERATED — run `node tools/update-reading-times.js`
// after substantial content edits to refresh it (keys between the @generated
// markers are rewritten in place).
const READING_WPM = 55;
function wordsToMinutes(words) {
  return Math.max(5, Math.round(words / READING_WPM / 5) * 5);
}
const CHAPTER_MINUTES = { /* @generated-reading-times:start */
  'content/00_quick_reference_cheat_sheet.md': 185,
  'content/00p_dl_llm_playbook.md': 75,
  'content/01_google_ai_engineer_strategy.md': 140,
  'content/02_behavioral_interview.md': 150,
  'content/03_staying_relevant_ai_era.md': 95,
  'content/04_aptitude_mental_math.md': 365,
  'content/05_brain_training.md': 150,
  'content/06_math_fundamentals.md': 310,
  'content/07_introduction.md': 90,
  'content/08_core_concepts.md': 230,
  'content/09_data_preprocessing.md': 50,
  'content/10_supervised_learning.md': 215,
  'content/11_unsupervised_learning.md': 175,
  'content/12_key_algorithms.md': 170,
  'content/13_model_evaluation.md': 115,
  'content/14_neural_networks.md': 185,
  'content/15_reinforcement_learning.md': 155,
  'content/16_deep_learning.md': 240,
  'content/17_llm.md': 545,
  'content/18_ai_agents.md': 205,
  'content/19_ai_frameworks.md': 110,
  'content/20_2026_landscape.md': 110,
  'content/21_design_fundamentals.md': 125,
  'content/22_engineering_tools.md': 375,
  'content/23_system_design_fundamentals_deep_dive.md': 250,
  'content/24_system_design_data_distributed.md': 320,
  'content/25_system_design_operations_case_studies.md': 185,
  'content/26_ml_system_design.md': 85,
  'content/35_system_design_cases_realtime.md': 255,
  'content/36_system_design_cases_search_media.md': 355,
  'content/37_system_design_cases_scale_infra.md': 320,
  'content/27_practical_ml.md': 240,
  'content/27_practical_ml.ipynb': 240,
  'content/28_semantic_search.md': 140,
  'content/29_gpus_tpus_infrastructure.md': 180,
  'content/30_google_ml_ecosystem.md': 165,
  'content/31_dsa_coding.md': 525,
  'content/32_interview_questions.md': 235,
  'content/33_llm_interview_questions.md': 240,
  'content/33b_llm_interview_questions_part2.md': 260,
  'content/34_google_top10_ml_interview.md': 495,
  'README.md': 55,
/* @generated-reading-times:end */ };

// Per-user self-correction: when a chapter is opened we measure its real word
// count (see trackChapterOpen → recordChapterWords) and cache it here, so
// estimates track the live content even if the generated baseline above drifts.
// Keyed by file path → word count. Notebooks (.ipynb) are JSON, not prose, so
// they are never measured and always fall back to the baseline.
function getMeasuredWords() {
  try { return JSON.parse(localStorage.getItem('ml4-chapter-words') || '{}'); }
  catch (e) { return {}; }
}
function recordChapterWords(file, words) {
  if (!file || !words || /\.ipynb$/.test(file)) return;
  const m = getMeasuredWords();
  if (m[file] === words) return; // unchanged — skip the write
  m[file] = words;
  safeSetItem('ml4-chapter-words', JSON.stringify(m));
}
// Best estimate of study minutes for a chapter: prefer the live measured word
// count, then the generated baseline, then a 30-min default for unknown files.
function chapterEstMinutes(file) {
  const measured = getMeasuredWords()[file];
  if (measured) return wordsToMinutes(measured);
  return CHAPTER_MINUTES[file] || 30;
}

// ─── Personalized pace & ETA ───
// Derives the reader's real speed from time actually spent (auto-tracked per
// chapter) vs the estimates, then projects remaining time and a finish date
// from their study throughput so far. Pure function over localStorage — safe to
// call repeatedly during a dashboard render.
function computePaceStats() {
  const track = getChapterTrack();
  const study = getStudyData();
  const realCh = (typeof chapters !== 'undefined' ? chapters : [])
    .filter(c => !c.section && !c.ref && !c.notebook);

  // 1. Reading-speed calibration. Only count chapters the reader marked read AND
  //    spent a meaningful in-app stretch on. Each chapter's actual/estimated
  //    ratio is clamped to 0.25×–4× so a glance-and-mark or a left-open tab
  //    can't dominate; the factor is estimate-weighted (long chapters matter
  //    more). Needs ≥3 calibration chapters before we trust it.
  let weightedActual = 0, estTotal = 0, calib = 0;
  realCh.forEach(c => {
    const t = track[c.file];
    if (!t || !readChapters[c.file]) return;
    const spent = t.seconds || 0;
    const estSec = chapterEstMinutes(c.file) * 60;
    if (spent < 120 || estSec <= 0) return;
    const ratio = Math.min(4, Math.max(0.25, spent / estSec));
    weightedActual += ratio * estSec;
    estTotal += estSec;
    calib++;
  });
  const paceFactor = (calib >= 3 && estTotal > 0) ? weightedActual / estTotal : null;

  // 2. Remaining work — raw estimate and adjusted to the reader's pace.
  let remEstMin = 0;
  realCh.forEach(c => { if (!readChapters[c.file]) remEstMin += chapterEstMinutes(c.file); });
  const remAtPaceMin = Math.round(remEstMin * (paceFactor || 1));

  // 3. Throughput (study minutes per calendar day since starting) and ETA.
  const trackedMin = Object.values(track).reduce((s, t) => s + ((t && t.seconds) || 0), 0) / 60;
  const totalStudyMin = (study.totalMinutes || 0) + trackedMin;
  let daysSinceStart = 0, throughputPerDay = 0;
  if (study.startDate) {
    daysSinceStart = Math.max(1, Math.round((Date.now() - new Date(study.startDate).getTime()) / 86400000));
    throughputPerDay = totalStudyMin / daysSinceStart;
  }
  const allRead = realCh.length > 0 && realCh.every(c => readChapters[c.file]);
  let projectedFinish = null, daysLeft = null;
  if (!allRead && throughputPerDay > 1 && remAtPaceMin > 0) {
    daysLeft = remAtPaceMin / throughputPerDay;
    projectedFinish = new Date(Date.now() + daysLeft * 86400000);
  }
  return {
    paceFactor, calib, remEstMin, remAtPaceMin,
    throughputPerDay, daysSinceStart, totalStudyMin,
    projectedFinish, daysLeft, allRead,
  };
}

// ─── Daily activity log (for the contribution heatmap) ───
// Seconds of study credited to each LOCAL calendar day, keyed 'YYYY-MM-DD'.
// Written as study time accrues (chapter reading + the manual timer). Stored as
// seconds so sub-minute reads aren't lost to rounding.
function localDayKey(d) {
  d = d || new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}
function getActivityLog() {
  try { return JSON.parse(localStorage.getItem('ml4-activity') || '{}'); }
  catch (e) { return {}; }
}
function logActivitySeconds(secs) {
  if (!secs || secs <= 0) return;
  const log = getActivityLog();
  const k = localDayKey();
  log[k] = (log[k] || 0) + Math.round(secs);
  safeSetItem('ml4-activity', JSON.stringify(log));
}

// Merge logged study minutes with derived events (quiz attempts, chapters
// started/completed) so the heatmap shows historical active days from before
// per-day logging existed. Returns { 'YYYY-MM-DD': { minutes, events } }.
function getActivityMap() {
  const out = {};
  const add = (key, minutes, events) => {
    if (!key) return;
    if (!out[key]) out[key] = { minutes: 0, events: 0 };
    out[key].minutes += minutes || 0;
    out[key].events += events || 0;
  };
  const log = getActivityLog();
  Object.keys(log).forEach(k => add(k, (log[k] || 0) / 60, 0));
  const qh = getQuizHistory();
  Object.values(qh).forEach(h => {
    (h && h.scores || []).forEach(s => { if (s && s.date) add(localDayKey(new Date(s.date)), 0, 1); });
  });
  const track = getChapterTrack();
  Object.values(track).forEach(t => {
    if (t && t.startDate) add(localDayKey(new Date(t.startDate)), 0, 1);
    if (t && t.completedDate) add(localDayKey(new Date(t.completedDate)), 0, 1);
  });
  return out;
}

// ─── Spaced-repetition review queue ───
// Derives a "due date" for each read/quizzed chapter from its last quiz (date +
// score) using an SM-2-lite interval: strong recall pushes the next review
// further out along a ladder, a fail (<70%) brings it back to tomorrow, and a
// read-but-never-quizzed chapter is due for a first self-test. Pure function
// over existing data — no extra storage or migration needed.
function getReviewQueue() {
  const qh = getQuizHistory();
  const track = getChapterTrack();
  const now = Date.now();
  const DAY = 86400000;
  // Good-recall interval ladder (days), indexed by trailing-pass streak.
  const LADDER = [3, 7, 16, 35, 70, 120];
  const realCh = (typeof chapters !== 'undefined' ? chapters : [])
    .filter(c => !c.section && !c.ref && !c.notebook);
  const items = [];
  realCh.forEach(c => {
    const read = !!readChapters[c.file];
    const h = qh[c.file];
    const hasScores = h && h.scores && h.scores.length;
    if (!read && !hasScores) return; // not started — not in the review system yet
    let lastDate, lastScore, intervalDays, tested;
    if (hasScores) {
      const sc = h.scores;
      const last = sc[sc.length - 1];
      lastDate = new Date(last.date).getTime();
      lastScore = (typeof h.lastScore === 'number') ? h.lastScore : last.pct;
      tested = true;
      // Count trailing passes (≥70%) for a true consecutive-success streak,
      // so a string of fails can't inflate the interval.
      let streak = 0;
      for (let i = sc.length - 1; i >= 0 && sc[i].pct >= 70; i--) streak++;
      if (streak === 0) {
        intervalDays = 1; // last recall failed → review tomorrow
      } else {
        const base = LADDER[Math.min(streak, LADDER.length) - 1];
        const q = lastScore >= 90 ? 1 : lastScore >= 80 ? 0.85 : 0.7;
        intervalDays = Math.max(1, Math.round(base * q));
      }
    } else {
      // read but never quizzed → nudge a first self-test ~3 days after reading
      const ct = track[c.file] || {};
      lastDate = ct.completedDate ? new Date(ct.completedDate).getTime()
        : ct.startDate ? new Date(ct.startDate).getTime() : now;
      lastScore = -1;
      tested = false;
      intervalDays = 3;
    }
    const dueDate = lastDate + intervalDays * DAY;
    const daysUntil = Math.round((dueDate - now) / DAY);
    items.push({ file: c.file, title: c.title, id: c.id, lastScore, tested, dueDate, daysUntil, intervalDays });
  });
  items.sort((a, b) => a.dueDate - b.dueDate);
  return {
    items,
    due: items.filter(i => i.dueDate <= now),
    upcoming: items.filter(i => i.dueDate > now),
  };
}

// ─── Storage usage ───
// Sizes localStorage by category. Bytes ≈ (key + value) length × 2 (strings are
// UTF-16, which is how browsers meter the localStorage quota). The trailing
// catch-all group must stay last so every key lands somewhere.
function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(b < 10240 ? 1 : 0) + ' KB';
  return (b / (1024 * 1024)).toFixed(2) + ' MB';
}
function getStorageStats() {
  const groups = [
    { name: 'Notes & highlights', match: k => k === 'ml4-comments' || k === 'ml4-highlights' },
    { name: 'DSA solutions', match: k => k === 'ml4-dsa' || k === 'ml4-dsa-custom' },
    { name: 'Quiz history', match: k => k === 'ml4-quiz-scores' || k === 'ml4-quiz-history' },
    { name: 'Reading & activity', match: k => ['ml4-read', 'ml4-chapter-track', 'ml4-chapter-words', 'ml4-activity'].indexOf(k) !== -1 },
    { name: 'Progress & goals', match: k => ['ml4-xp', 'ml4-study', 'ml4-goals'].indexOf(k) !== -1 },
    { name: 'Preferences & other', match: () => true }, // catch-all — keep last
  ];
  const result = groups.map(g => ({ name: g.name, bytes: 0 }));
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      const bytes = (k.length + v.length) * 2;
      total += bytes;
      for (let gi = 0; gi < groups.length; gi++) {
        if (groups[gi].match(k)) { result[gi].bytes += bytes; break; }
      }
    }
  } catch (e) { /* private mode / disabled storage */ }
  // Nominal per-origin localStorage budget (most browsers allow ~5 MB).
  const quota = 5 * 1024 * 1024;
  return {
    total,
    quota,
    pct: Math.min(100, Math.round(total / quota * 1000) / 10),
    groups: result.filter(g => g.bytes > 0).sort((a, b) => b.bytes - a.bytes),
  };
}

// ─── Quiz Tracking (per chapter) ───
function getQuizHistory() { return JSON.parse(localStorage.getItem('ml4-quiz-history') || '{}'); }
function saveQuizHistory(h) { localStorage.setItem('ml4-quiz-history', JSON.stringify(h)); }

// ─── Per-Chapter Tracking (start date, completed date, time spent) ───
function getChapterTrack() { return JSON.parse(localStorage.getItem('ml4-chapter-track') || '{}'); }
function saveChapterTrack(t) { localStorage.setItem('ml4-chapter-track', JSON.stringify(t)); }
let activeChapterFile = null;
let activeChapterOpenedAt = null;

function trackChapterOpen(file) {
  // Save time on previous chapter
  trackChapterClose();
  // Record start date (first time only) and mark as active
  const t = getChapterTrack();
  if (!t[file]) t[file] = { startDate: null, completedDate: null, seconds: 0 };
  if (!t[file].startDate) t[file].startDate = new Date().toISOString();
  saveChapterTrack(t);
  activeChapterFile = file;
  activeChapterOpenedAt = Date.now();
}

function trackChapterClose() {
  if (activeChapterFile && activeChapterOpenedAt) {
    const elapsed = Math.floor((Date.now() - activeChapterOpenedAt) / 1000);
    if (elapsed > 0 && elapsed < 7200) { // cap at 2h to avoid stale tabs
      const t = getChapterTrack();
      if (!t[activeChapterFile]) t[activeChapterFile] = { startDate: null, completedDate: null, seconds: 0 };
      t[activeChapterFile].seconds += elapsed;
      saveChapterTrack(t);
      logActivitySeconds(elapsed); // credit today's heatmap cell
    }
  }
  activeChapterFile = null;
  activeChapterOpenedAt = null;
}

function trackChapterComplete(file) {
  const t = getChapterTrack();
  if (!t[file]) t[file] = { startDate: new Date().toISOString(), completedDate: null, seconds: 0 };
  if (!t[file].completedDate) t[file].completedDate = new Date().toISOString();
  saveChapterTrack(t);
}

function resetChapter(file, title) {
  if (!confirm(`Reset "${title}"?\n\nThis clears: read status, quiz scores, time tracking.\nComments & highlights are kept.`)) return;

  // Read status
  delete readChapters[file];
  localStorage.setItem('ml4-read', JSON.stringify(readChapters));

  // Chapter tracking (start/complete dates, time spent)
  const ct = getChapterTrack();
  delete ct[file];
  saveChapterTrack(ct);

  // Quiz history
  const qh = getQuizHistory();
  delete qh[file];
  saveQuizHistory(qh);

  // Quiz scores
  const qs = JSON.parse(localStorage.getItem('ml4-quiz-scores') || '{}');
  delete qs[file];
  localStorage.setItem('ml4-quiz-scores', JSON.stringify(qs));

  const scrollPos = document.getElementById('contentWrapper').scrollTop;
  showToast('Reset', title + ' progress cleared', '↺');
  showDashboard();
  document.getElementById('contentWrapper').scrollTop = scrollPos;
}

// Save on page unload
window.addEventListener('beforeunload', trackChapterClose);

function addXP(amount, reason) {
  if (!interactiveMode) return;
  if (!amount) return;
  const data = getXP();
  const oldXp = data.xp;
  data.xp = Math.max(0, data.xp + amount);
  // Streak tracking — only on positive earns. Also detect "streak break":
  // returning after skipping at least one day when the previous streak was ≥7
  // triggers a silent −5 XP penalty fired right after the earn-toast.
  let streakBreakPenalty = null;
  if (amount > 0) {
    const today = new Date().toDateString();
    if (data.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const skipped = data.lastDate && data.lastDate !== yesterday;
      if (skipped && data.streak >= 7) streakBreakPenalty = data.streak;
      data.streak = (data.lastDate === yesterday) ? data.streak + 1 : 1;
      data.lastDate = today;
    }
  }
  // Refresh idle-decay baseline on every earn/deduction
  data.lastActive = new Date().toISOString();
  saveXP(data);
  const icon = amount < 0 ? '🔻' : (amount >= 50 ? '🏆' : '⚡');
  const label = (amount > 0 ? '+' : '') + amount + ' XP';
  showToast(label, reason, icon);
  // Check level up (only meaningful when amount > 0)
  const oldLevel = getLevel(oldXp);
  const newLevel = getLevel(data.xp);
  if (newLevel > oldLevel) {
    setTimeout(() => {
      showToast('🎉 LEVEL UP!', `You reached Level ${newLevel}!`, '🚀');
      fireConfetti();
    }, 600);
  }
  // Check achievements
  checkAchievements(data);
  // Fire streak-break penalty after this toast settles so both are visible
  if (streakBreakPenalty != null) {
    setTimeout(() => addXP(-5, `Streak broken (${streakBreakPenalty}-day streak ended)`), 1200);
  }
}

function getLevel(xp) { return Math.floor(xp / 100) + 1; }
function getLevelXP(xp) { return xp % 100; }

function updateXPDisplay() {
  // XP display is now on the Dashboard page — nothing to update in sidebar
}

function checkAchievements(data) {
  const a = data.achievements || [];
  const realCh = chapters.filter(c => !c.section && !c.ref);
  const rch = realCh.filter(c => readChapters[c.file]).length;
  const totalCh = realCh.length;
  const scores = JSON.parse(localStorage.getItem('ml4-quiz-scores') || '{}');
  const quizCount = Object.keys(scores).length;
  const perfectQuizzes = Object.values(scores).filter(s => s >= 90).length;
  const passedQuizzes = Object.values(scores).filter(s => s >= 70).length;
  const perfectScore = Object.values(scores).some(s => s === 100);
  const quizHist = getQuizHistory();
  const totalAttempts = Object.values(quizHist).reduce((s,h) => s + (h.attempts||0), 0);
  const study = getStudyData();
  const studyMins = study.totalMinutes || 0;
  const sessions = study.sessions || 0;
  const allComments = typeof getComments === 'function' ? getComments() : {};
  const totalComments = Object.values(allComments).reduce((s, arr) => s + arr.reduce((s2, c) => s2 + 1 + (c.replies ? c.replies.length : 0), 0), 0);
  const chaptersWithComments = Object.keys(allComments).filter(k => allComments[k].length > 0).length;
  const level = getLevel(data.xp);
  const checks = [
    // ── Reading (4) ──
    { id: 'first_read', cond: rch >= 1, text: 'First Steps', desc: 'Read your first chapter', icon: '📖', tier: 'common' },
    { id: 'five_read', cond: rch >= 5, text: 'Getting Serious', desc: 'Read 5 chapters', icon: '📚', tier: 'common' },
    { id: 'ten_read', cond: rch >= 10, text: 'Bookworm', desc: 'Read 10 chapters', icon: '🐛', tier: 'rare' },
    { id: 'all_read', cond: rch >= totalCh, text: 'Scholar', desc: 'Read every chapter', icon: '🏛️', tier: 'epic' },
    // ── Streaks (3) ──
    { id: 'streak7', cond: data.streak >= 7, text: 'Dedicated', desc: '7-day streak', icon: '💪', tier: 'common' },
    { id: 'streak14', cond: data.streak >= 14, text: 'Unstoppable', desc: '14-day streak', icon: '⚡', tier: 'rare' },
    { id: 'streak30', cond: data.streak >= 30, text: 'Iron Will', desc: '30-day streak', icon: '🛡️', tier: 'epic' },
    // ── XP & Levels (4) ──
    { id: 'xp100', cond: data.xp >= 100, text: 'Centurion', desc: 'Earn 100 XP', icon: '💎', tier: 'common' },
    { id: 'xp500', cond: data.xp >= 500, text: 'XP Hunter', desc: 'Earn 500 XP', icon: '🏆', tier: 'rare' },
    { id: 'xp1000', cond: data.xp >= 1000, text: 'XP Legend', desc: 'Earn 1000 XP', icon: '👑', tier: 'epic' },
    { id: 'level10', cond: level >= 10, text: 'Double Digits', desc: 'Reach Level 10', icon: '🌟', tier: 'rare' },
    // ── Quizzes (4) ──
    { id: 'first_quiz', cond: quizCount >= 1, text: 'Quiz Taker', desc: 'Complete a quiz', icon: '📝', tier: 'common' },
    { id: 'quiz10', cond: quizCount >= 10, text: 'Quiz Warrior', desc: 'Complete 10 quizzes', icon: '⚔️', tier: 'rare' },
    { id: 'quiz_perfect', cond: perfectScore, text: 'Flawless', desc: 'Score 100% on a quiz', icon: '💯', tier: 'epic' },
    { id: 'quiz_master', cond: perfectQuizzes >= 5, text: 'Quiz Master', desc: '90%+ on 5 quizzes', icon: '🧠', tier: 'epic' },
    // ── Study Time (3) ──
    { id: 'study5h', cond: studyMins >= 300, text: 'Deep Focus', desc: '5 hours of study', icon: '🧘', tier: 'common' },
    { id: 'study10h', cond: studyMins >= 600, text: 'Marathon Learner', desc: '10 hours of study', icon: '🏅', tier: 'rare' },
    { id: 'study25h', cond: studyMins >= 1500, text: 'Grinder', desc: '25 hours of study', icon: '⛏️', tier: 'epic' },
    // ── Notes (1) ──
    { id: 'first_note', cond: totalComments >= 1, text: 'Note Taker', desc: 'Write your first note', icon: '🗒️', tier: 'common' },
    // ── DSA (1) ──
    { id: 'dsa10', cond: Object.values(getDSAProgress()).filter(p => p.solved).length >= 10, text: 'Algorithm Pro', desc: 'Solve 10 DSA problems', icon: '💻', tier: 'rare' },
    // ── New additions (v2) ──
    { id: 'ch20_read', cond: rch >= 20, text: 'Devoted Reader', desc: 'Read 20 chapters', icon: '📚', tier: 'rare' },
    { id: 'ch30_read', cond: rch >= 30, text: 'True Scholar', desc: 'Read 30 chapters', icon: '🎓', tier: 'epic' },
    { id: 'dsa1',
      cond: Object.values(getDSAProgress()).filter(p => p.solved).length >= 1,
      text: 'First Solve', desc: 'Solve your first DSA problem', icon: '✨', tier: 'common' },
    { id: 'dsa50',
      cond: Object.values(getDSAProgress()).filter(p => p.solved).length >= 50,
      text: 'Algorithm Maestro', desc: 'Solve 50 DSA problems', icon: '🦾', tier: 'epic' },
    { id: 'dsa_hard',
      cond: (() => {
        const pr = getDSAProgress();
        const all = typeof DSA_PROBLEMS !== 'undefined' ? DSA_PROBLEMS : [];
        const diffMap = Object.fromEntries(all.map(p => [p.id, p.difficulty]));
        return Object.entries(pr).filter(([id, p]) => p.solved && diffMap[id] === 'Hard').length >= 5;
      })(),
      text: 'Hard Mode', desc: 'Solve 5 Hard DSA problems', icon: '🔥', tier: 'rare' },
    { id: 'notes10', cond: totalComments >= 10, text: 'Prolific Annotator', desc: 'Write 10 notes', icon: '🗂️', tier: 'rare' },
    { id: 'notes_pin',
      cond: Object.values(allComments).some(arr => arr.some(c => c && c.anchor)),
      text: 'Pin Master', desc: 'Pin a note to a chapter spot', icon: '📍', tier: 'common' },
    { id: 'quiz20', cond: quizCount >= 20, text: 'Quiz Champion', desc: 'Complete 20 quizzes', icon: '🎯', tier: 'epic' },
    { id: 'session20', cond: sessions >= 20, text: 'Consistent Studier', desc: '20 study sessions', icon: '🗓️', tier: 'rare' },
    { id: 'streak90', cond: data.streak >= 90, text: 'Relentless', desc: '90-day streak', icon: '🔱', tier: 'epic' },
  ];
  let unlockDelay = 1200;
  checks.forEach(ch => {
    if (ch.cond && !a.includes(ch.id)) {
      a.push(ch.id);
      const isEpic = ch.tier === 'epic';
      const tierTag = ch.tier !== 'common' ? ` [${ch.tier.toUpperCase()}]` : '';
      setTimeout(() => {
        showAchievementToast(ch.icon, ch.text, ch.desc, ch.tier);
        if (isEpic) setTimeout(fireConfetti, 200);
      }, unlockDelay);
      unlockDelay += 1800; // stagger multiple unlocks
    }
  });
  data.achievements = a;
  saveXP(data);
}

// ─── Toast Notifications ───
function showToast(title, subtitle, icon = '⚡') {
  if (!interactiveMode) return;
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><div><strong>${title}</strong><br><small style="color:var(--text-secondary)">${subtitle}</small></div>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('out'); }, 2800);
  setTimeout(() => { toast.remove(); }, 3200);
}

// Quota-safe localStorage write. Surfaces a toast once per session on quota error
// so the user knows they need to export-and-reset instead of silently losing data.
let _quotaWarned = false;
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {
      if (!_quotaWarned) {
        _quotaWarned = true;
        showToast('💾 Storage full', 'Export your data from Dashboard, then reset old progress.', '⚠️');
      }
    } else {
      console.error('localStorage write failed:', e);
    }
    return false;
  }
}

function showAchievementToast(icon, name, desc, tier) {
  if (!interactiveMode) return;
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const tierColors = { common: '#059669', rare: '#2563eb', epic: '#7c3aed' };
  const tierBg = { common: 'rgba(5,150,105,0.1)', rare: 'rgba(37,99,235,0.1)', epic: 'rgba(124,58,237,0.1)' };
  const color = tierColors[tier] || tierColors.common;
  const bg = tierBg[tier] || tierBg.common;
  const tierTag = tier !== 'common' ? `<span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${color};background:${bg};padding:2px 6px;border-radius:4px;margin-left:6px;">${tier}</span>` : '';
  toast.className = 'toast toast-achievement';
  toast.innerHTML = `
    <div style="font-size:36px;line-height:1;">${icon}</div>
    <div style="flex:1;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${color};margin-bottom:2px;">Achievement Unlocked!</div>
      <div style="font-size:15px;font-weight:800;">${name}${tierTag}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:1px;">${desc}</div>
    </div>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('out'); }, 4500);
  setTimeout(() => { toast.remove(); }, 5000);
}


// ─── Confetti Effect ───
function fireConfetti() {
  if (!interactiveMode) return;
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = [];
  const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c084fc', '#f472b6', '#fb923c', '#34d399'];
  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.4,
      w: 5 + Math.random() * 7, h: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 15, vy: -8 - Math.random() * 12,
      rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 15, opacity: 1,
    });
  }
  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); frame++;
    let alive = false;
    pieces.forEach(p => {
      if (p.opacity <= 0) return; alive = true;
      p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      if (frame > 40) p.opacity -= 0.02;
      ctx.save(); ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    if (alive) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

// ─── Study Timer (counts UP) ───
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;

function toggleStudyTimer() {
  if (timerRunning) {
    // Stop
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('studyTimer').classList.remove('running');
    // Save time to study data
    if (timerSeconds > 0) {
      const d = getStudyData();
      d.totalMinutes += Math.floor(timerSeconds / 60);
      d.sessions += 1;
      saveStudyData(d);
      logActivitySeconds(timerSeconds); // credit today's heatmap cell
      const mins = Math.floor(timerSeconds / 60);
      if (mins >= 1) {
        addXP(Math.min(mins, 30), `Studied for ${mins} min`);
        showToast('⏱️ Timer stopped', `${formatTimer(timerSeconds)} recorded`, '📚');
      }
    }
    timerSeconds = 0;
    document.getElementById('timerDisplay').textContent = '▶ Start';
    document.getElementById('studyTimer').title = 'Click to start study timer';
  } else {
    // Start
    timerRunning = true;
    timerSeconds = 0;
    document.getElementById('studyTimer').classList.add('running');
    document.getElementById('studyTimer').title = 'Timer running — click to stop';
    timerInterval = setInterval(() => {
      timerSeconds++;
      document.getElementById('timerDisplay').textContent = formatTimer(timerSeconds);
    }, 1000);
  }
}

function formatTimer(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// Save running timer on page unload
window.addEventListener('beforeunload', () => {
  if (timerRunning && timerSeconds > 0) {
    const d = getStudyData();
    d.totalMinutes += Math.floor(timerSeconds / 60);
    d.sessions += 1;
    saveStudyData(d);
    logActivitySeconds(timerSeconds);
  }
});
