// ═══════════════════════════════════════════════════════════
// ═══  mock.js — Mock Test (exam mode): pull N random       ═══
// ═══  questions from a fresh bank across COMPLETED chapters ═══
// ═══════════════════════════════════════════════════════════

// Mock questions are a SEPARATE bank from the per-chapter quizzes (QUIZ_DATA).
// The file (js/data/mock_questions.js, ~large) is lazy-loaded the first time the
// Mock Test page is opened, mirroring the quizzes.js / DSA-index lazy-load pattern.
let _mockDataPromise = null;
function ensureMockData() {
  if (typeof MOCK_DATA !== 'undefined') return Promise.resolve();
  if (_mockDataPromise) return _mockDataPromise;
  _mockDataPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'js/data/mock_questions.js';
    s.onload = () => resolve();
    s.onerror = () => { _mockDataPromise = null; reject(new Error('Mock question bank failed to load')); };
    document.head.appendChild(s);
  });
  return _mockDataPromise;
}

// Minimum questions in the pool before a full mock test is "unlocked".
const MOCK_MIN_POOL = 10;
const MOCK_DEFAULT_COUNT = 20;

let mockState = null;

// ─── Sourcing helpers ───
function mockChaptersWithBank() {
  // All non-divider chapters that have a mock-question bank entry.
  if (typeof MOCK_DATA === 'undefined') return [];
  return chapters.filter(ch => ch.file && !ch.section).map(ch => {
    const key = ch.file.replace(/^content\//, '');
    const qs = MOCK_DATA[key] || MOCK_DATA[ch.file] || [];
    return { file: ch.file, title: ch.title, id: ch.id, ref: !!ch.ref, total: qs.length };
  }).filter(c => c.total > 0);
}

function mockEligibleChapters() {
  // Chapters the user has marked as read AND that have a mock-question bank.
  return mockChaptersWithBank().filter(c => readChapters[c.file]);
}

function mockPoolSize() {
  return mockEligibleChapters().reduce((s, c) => s + c.total, 0);
}

// Shuffle a question's options and remap the correct-answer index so the
// displayed order is randomized even if the source data has a positional bias.
function mockPrepareQuestion(q, source, sourceFile) {
  const idx = q.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return {
    q: q.q,
    options: idx.map(i => q.options[i]),
    answer: idx.indexOf(q.answer),
    explanation: q.explanation || '',
    source: source,
    sourceFile: sourceFile,
  };
}

function mockBuildPool(count) {
  const all = [];
  mockEligibleChapters().forEach(ch => {
    const key = ch.file.replace(/^content\//, '');
    const qs = MOCK_DATA[key] || MOCK_DATA[ch.file] || [];
    qs.forEach(q => {
      if (q && Array.isArray(q.options) && q.options.length >= 2 && typeof q.answer === 'number') {
        all.push(mockPrepareQuestion(q, ch.title, ch.file));
      }
    });
  });
  // Fisher–Yates shuffle the combined pool, then take the first `count`.
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count);
}

// ─── History ───
function getMockHistory() { return JSON.parse(localStorage.getItem('ml4-mock-history') || '[]'); }
function saveMockHistory(h) { safeSetItem('ml4-mock-history', JSON.stringify(h)); }

// ─── Page entry ───
async function showMockTest() {
  exitFocusMode();
  trackChapterClose();
  if (mockState && mockState.timerId) { clearInterval(mockState.timerId); mockState.timerId = null; }
  currentIndex = -1;
  currentPage = 'mock';
  renderSidebar();
  closeSidebar();
  document.getElementById('tocPanel').classList.remove('visible');
  document.getElementById('breadcrumb').textContent = '📝 Mock Test';
  document.getElementById('readBtn').style.display = 'none';
  document.getElementById('findBtn').style.display = 'none'; closeFind();
  document.getElementById('focusBtn').style.display = 'none';
  document.getElementById('ttsBtn').style.display = 'none'; ttsStop();
  pushHash('mock-test');
  const rt = document.getElementById('readingTime'); if (rt) rt.remove();
  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view');

  if (typeof MOCK_DATA === 'undefined') {
    contentEl.innerHTML = '<div class="loading"><div class="spinner"></div>Loading question bank…</div>';
    try { await ensureMockData(); }
    catch (e) {
      contentEl.innerHTML = '<div class="loading" style="color:var(--danger,#cf222e);">Failed to load the mock question bank. Check your connection and try again.</div>';
      return;
    }
  }
  mockState = null;
  renderMockLanding();
}

function renderMockLanding() {
  const contentEl = document.getElementById('content');
  const eligible = mockEligibleChapters();
  const withBank = mockChaptersWithBank();
  const pool = mockPoolSize();
  const hist = getMockHistory();
  const best = hist.length ? Math.max(...hist.map(h => h.pct)) : 0;
  const lastFive = hist.slice(-5).reverse();

  // Locked state: not enough completed-chapter questions yet.
  if (pool < MOCK_MIN_POOL) {
    const readCount = eligible.length;
    contentEl.innerHTML = `
      <div class="mock-wrap">
        <div class="mock-hero">
          <div class="mock-hero-icon">📝</div>
          <h1>Mock Test</h1>
          <p class="mock-hero-sub">Exam mode — random questions drawn from every chapter you've completed.</p>
        </div>
        <div class="mock-locked">
          <div style="font-size:34px;margin-bottom:8px;">🔒</div>
          <h2>Not enough completed chapters yet</h2>
          <p>The mock test pulls fresh questions from chapters you've <strong>marked as read</strong>.
          You currently have <strong>${pool}</strong> question${pool === 1 ? '' : 's'} available
          from <strong>${readCount}</strong> completed chapter${readCount === 1 ? '' : 's'}.</p>
          <p>Read and mark at least a couple of chapters (need ${MOCK_MIN_POOL}+ questions) to unlock a full mock test.</p>
          <button class="mock-btn-primary" onclick="renderWelcome()">Browse chapters</button>
        </div>
      </div>`;
    return;
  }

  const counts = [10, 20, 30, 50].filter(c => c <= pool);
  if (!counts.length) counts.push(pool);
  const defaultCount = counts.includes(MOCK_DEFAULT_COUNT) ? MOCK_DEFAULT_COUNT : counts[counts.length - 1];

  contentEl.innerHTML = `
    <div class="mock-wrap">
      <div class="mock-hero">
        <div class="mock-hero-icon">📝</div>
        <h1>Mock Test</h1>
        <p class="mock-hero-sub">Exam mode — random questions drawn from every chapter you've completed. No hints until you submit.</p>
      </div>

      <div class="mock-stats">
        <div class="mock-stat"><div class="mock-stat-num">${pool}</div><div class="mock-stat-label">Questions available</div></div>
        <div class="mock-stat"><div class="mock-stat-num">${eligible.length}</div><div class="mock-stat-label">Completed chapters</div></div>
        <div class="mock-stat"><div class="mock-stat-num">${hist.length}</div><div class="mock-stat-label">Tests taken</div></div>
        <div class="mock-stat"><div class="mock-stat-num">${best ? best + '%' : '—'}</div><div class="mock-stat-label">Best score</div></div>
      </div>

      <div class="mock-config">
        <div class="mock-config-row">
          <label>Number of questions</label>
          <div class="mock-seg" id="mockCountSeg">
            ${counts.map(c => `<button class="mock-seg-btn ${c === defaultCount ? 'active' : ''}" data-count="${c}" onclick="mockSelectCount(${c}, this)">${c}</button>`).join('')}
          </div>
        </div>
        <div class="mock-config-row">
          <label>Timed exam</label>
          <label class="mock-switch">
            <input type="checkbox" id="mockTimerToggle">
            <span class="mock-switch-slider"></span>
          </label>
          <span class="mock-config-hint" id="mockTimerHint">Off · ~1 min/question when on</span>
        </div>
        <button class="mock-btn-primary mock-start" onclick="mockStartFromUI()">Start mock test →</button>
        <p class="mock-config-note">Questions and answer order are randomized. Each question is tagged to its chapter so your results show which topics need work.</p>
      </div>

      ${lastFive.length ? `
      <div class="mock-history">
        <div class="mock-history-head">
          <h3>Recent attempts</h3>
          <button class="mock-history-viewall" onclick="renderMockHistory()">View full history (${hist.length}) →</button>
        </div>
        <div class="mock-history-list">
          ${lastFive.map(h => {
            const d = new Date(h.date);
            const when = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const grade = h.pct >= 80 ? 'great' : h.pct >= 60 ? 'good' : 'needs-work';
            return `<div class="mock-history-item">
              <span class="mock-history-pct ${grade}">${h.pct}%</span>
              <span class="mock-history-meta">${h.score}/${h.total} correct · ${when}${h.timed ? ' · ⏱ timed' : ''}</span>
              <span class="mock-history-time">${h.durationSec ? mockFmtDuration(h.durationSec) : ''}</span>
            </div>`;
          }).join('')}
        </div>
      </div>` : ''}

      <div class="mock-coverage">
        <h3>Coverage</h3>
        <p class="mock-coverage-sub">${eligible.length} of ${withBank.length} chapters with a question bank are unlocked (completed).</p>
        <div class="mock-coverage-grid">
          ${withBank.map(c => {
            const done = !!readChapters[c.file];
            return `<div class="mock-cov-item ${done ? 'done' : 'locked'}" title="${done ? 'Completed' : 'Not completed yet'}">
              <span class="mock-cov-icon">${done ? '✓' : '🔒'}</span>
              <span class="mock-cov-title">${c.title}</span>
              <span class="mock-cov-count">${c.total}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;

  mockState = { selectedCount: defaultCount };
  const toggle = document.getElementById('mockTimerToggle');
  if (toggle) toggle.addEventListener('change', () => {
    const hint = document.getElementById('mockTimerHint');
    if (hint) hint.textContent = toggle.checked
      ? `On · ${mockState.selectedCount} min (~1 min/question)`
      : 'Off · ~1 min/question when on';
  });
}

// ─── History page ───
function mockHistoryStats(hist) {
  const n = hist.length;
  const best = n ? Math.max(...hist.map(h => h.pct)) : 0;
  const avg = n ? Math.round(hist.reduce((s, h) => s + h.pct, 0) / n) : 0;
  const totalQ = hist.reduce((s, h) => s + (h.total || 0), 0);
  const totalCorrect = hist.reduce((s, h) => s + (h.score || 0), 0);
  const totalSec = hist.reduce((s, h) => s + (h.durationSec || 0), 0);
  const passes = hist.filter(h => h.pct >= 70).length;
  return { n, best, avg, totalQ, totalCorrect, totalSec, passes };
}

// Aggregate per-chapter accuracy across every attempt — surfaces the topics
// that are consistently weak (or strong) over time, not just in one test.
function mockHistoryByChapter(hist) {
  const agg = {};
  hist.forEach(h => {
    const bc = h.byChapter || {};
    Object.keys(bc).forEach(k => {
      const c = bc[k] || {};
      if (!agg[k]) agg[k] = { title: c.title || 'Unknown', correct: 0, total: 0 };
      agg[k].correct += c.correct || 0;
      agg[k].total += c.total || 0;
    });
  });
  return Object.keys(agg).map(k => {
    const c = agg[k];
    const pct = c.total ? Math.round((c.correct / c.total) * 100) : 0;
    return { file: k, title: c.title, correct: c.correct, total: c.total, pct };
  }).sort((a, b) => a.pct - b.pct);
}

function mockFmtTotalTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return m ? `${h}h ${m}m` : `${h}h`;
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function mockGradeOf(pct) { return pct >= 80 ? 'great' : pct >= 60 ? 'good' : 'needs-work'; }

function renderMockHistory() {
  currentPage = 'mock';
  const contentEl = document.getElementById('content');
  const hist = getMockHistory();

  if (!hist.length) {
    contentEl.innerHTML = `
      <div class="mock-wrap">
        <div class="mock-hist-top">
          <button class="mock-btn-ghost" onclick="renderMockLanding()">← Back</button>
          <h1 class="mock-hist-title">Mock Test History</h1>
        </div>
        <div class="mock-locked">
          <div style="font-size:34px;margin-bottom:8px;">📊</div>
          <h2>No mock tests yet</h2>
          <p>Take your first mock test and your scores, timing and per-chapter performance will be tracked here.</p>
          <button class="mock-btn-primary" onclick="renderMockLanding()">Go to mock test</button>
        </div>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const s = mockHistoryStats(hist);
  const overallAccuracy = s.totalQ ? Math.round((s.totalCorrect / s.totalQ) * 100) : 0;
  const passRate = s.n ? Math.round((s.passes / s.n) * 100) : 0;
  // Trend direction: average of the most recent third vs the earliest third.
  const third = Math.max(1, Math.floor(s.n / 3));
  const firstAvg = Math.round(hist.slice(0, third).reduce((a, h) => a + h.pct, 0) / third);
  const lastAvg = Math.round(hist.slice(-third).reduce((a, h) => a + h.pct, 0) / third);
  const delta = lastAvg - firstAvg;
  const trendStr = s.n < 2 ? '' : (delta > 2 ? `▲ +${delta}%` : delta < -2 ? `▼ ${delta}%` : '◆ steady');
  const trendCls = s.n < 2 ? '' : (delta > 2 ? 'up' : delta < -2 ? 'down' : 'flat');

  // Score trend — one bar per attempt, oldest→newest.
  const maxBars = hist.length;
  const trendBars = hist.map((h, i) => {
    const d = new Date(h.date);
    const lbl = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `<div class="mock-trend-col" title="${lbl} — ${h.pct}% (${h.score}/${h.total})">
        <div class="mock-trend-bar-wrap"><div class="mock-trend-bar ${mockGradeOf(h.pct)}" style="height:${Math.max(3, h.pct)}%"></div></div>
        <div class="mock-trend-pct">${h.pct}</div>
      </div>`;
  }).join('');

  // Per-chapter accuracy across all attempts.
  const byChapter = mockHistoryByChapter(hist);
  const chapterRows = byChapter.map(c => `
      <div class="mock-bd-row">
        <span class="mock-bd-title" title="${c.title}">${c.title}</span>
        <div class="mock-bd-bar"><div class="mock-bd-fill ${mockGradeOf(c.pct)}" style="width:${c.pct}%"></div></div>
        <span class="mock-bd-val">${c.pct}%</span>
        <span class="mock-bd-sub">${c.correct}/${c.total}</span>
      </div>`).join('');

  // Every attempt, newest first, expandable to its own chapter breakdown.
  const attempts = hist.map((h, i) => ({ h, num: i + 1 })).reverse().map(({ h, num }) => {
    const d = new Date(h.date);
    const when = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const grade = mockGradeOf(h.pct);
    const bc = h.byChapter || {};
    const bcKeys = Object.keys(bc);
    const breakdown = bcKeys.length
      ? bcKeys.map(k => {
          const c = bc[k] || {};
          const cp = c.total ? Math.round((c.correct / c.total) * 100) : 0;
          return `<div class="mock-bd-row">
              <span class="mock-bd-title" title="${c.title || 'Unknown'}">${c.title || 'Unknown'}</span>
              <div class="mock-bd-bar"><div class="mock-bd-fill ${mockGradeOf(cp)}" style="width:${cp}%"></div></div>
              <span class="mock-bd-val">${c.correct || 0}/${c.total || 0}</span>
            </div>`;
        }).join('')
      : '<p class="mock-attempt-empty">No per-chapter breakdown saved for this attempt.</p>';
    return `
      <details class="mock-attempt">
        <summary>
          <span class="mock-attempt-pct ${grade}">${h.pct}%</span>
          <span class="mock-attempt-main">
            <span class="mock-attempt-when">Attempt #${num} · ${when}</span>
            <span class="mock-attempt-meta">${h.score}/${h.total} correct · ${mockFmtDuration(h.durationSec || 0)}${h.timed ? ' · ⏱ timed' : ''}</span>
          </span>
          <span class="mock-attempt-chev">▾</span>
        </summary>
        <div class="mock-attempt-body">
          <div class="mock-breakdown-list">${breakdown}</div>
        </div>
      </details>`;
  }).join('');

  contentEl.innerHTML = `
    <div class="mock-wrap">
      <div class="mock-hist-top">
        <button class="mock-btn-ghost" onclick="renderMockLanding()">← Back</button>
        <h1 class="mock-hist-title">Mock Test History</h1>
        <button class="mock-btn-ghost mock-hist-clear" onclick="mockClearHistory()">🗑 Clear</button>
      </div>

      <div class="mock-stats">
        <div class="mock-stat"><div class="mock-stat-num">${s.n}</div><div class="mock-stat-label">Tests taken</div></div>
        <div class="mock-stat"><div class="mock-stat-num">${s.best}%</div><div class="mock-stat-label">Best score</div></div>
        <div class="mock-stat"><div class="mock-stat-num">${s.avg}%</div><div class="mock-stat-label">Average score</div></div>
        <div class="mock-stat"><div class="mock-stat-num">${passRate}%</div><div class="mock-stat-label">Pass rate (≥70%)</div></div>
        <div class="mock-stat"><div class="mock-stat-num">${s.totalCorrect}<small>/${s.totalQ}</small></div><div class="mock-stat-label">Questions correct</div></div>
        <div class="mock-stat"><div class="mock-stat-num">${overallAccuracy}%</div><div class="mock-stat-label">Overall accuracy</div></div>
        <div class="mock-stat"><div class="mock-stat-num">${mockFmtTotalTime(s.totalSec)}</div><div class="mock-stat-label">Total time</div></div>
        <div class="mock-stat"><div class="mock-stat-num ${trendCls === 'up' ? 'trend-up' : trendCls === 'down' ? 'trend-down' : ''}">${trendStr || '—'}</div><div class="mock-stat-label">Recent trend</div></div>
      </div>

      <div class="mock-trend-card">
        <h3>Score over time</h3>
        <p class="mock-coverage-sub">Each bar is one attempt, oldest on the left. Hover for details.</p>
        <div class="mock-trend ${maxBars > 16 ? 'scroll' : ''}">
          <div class="mock-trend-axis"><span>100</span><span>50</span><span>0</span></div>
          <div class="mock-trend-bars">${trendBars}</div>
        </div>
      </div>

      <div class="mock-breakdown">
        <h3>Accuracy by chapter <span class="mock-bd-allnote">across all ${s.n} attempt${s.n === 1 ? '' : 's'}</span></h3>
        <p class="mock-coverage-sub">Weakest topics first — focus your revision here.</p>
        <div class="mock-breakdown-list">${chapterRows}</div>
      </div>

      <div class="mock-attempts">
        <h3>All attempts</h3>
        <p class="mock-coverage-sub">Newest first. Click an attempt to see its per-chapter breakdown.</p>
        ${attempts}
      </div>

      <div class="mock-results-actions" style="margin-top:24px;">
        <button class="mock-btn-primary" onclick="renderMockLanding()">Take a new mock test</button>
        <button class="mock-btn-ghost" onclick="showDashboard()">Dashboard</button>
      </div>
    </div>`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mockClearHistory() {
  const hist = getMockHistory();
  if (!hist.length) return;
  if (!confirm(`Delete all ${hist.length} mock test result${hist.length === 1 ? '' : 's'}?\n\nThis clears your score history, trend and per-chapter stats. It cannot be undone.`)) return;
  try { localStorage.removeItem('ml4-mock-history'); } catch (e) {}
  if (typeof showToast === 'function') showToast('🗑 History cleared', 'Mock test history removed', '📝');
  renderMockLanding();
}

function mockSelectCount(c, btn) {
  if (mockState) mockState.selectedCount = c;
  document.querySelectorAll('#mockCountSeg .mock-seg-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const toggle = document.getElementById('mockTimerToggle');
  const hint = document.getElementById('mockTimerHint');
  if (toggle && toggle.checked && hint) hint.textContent = `On · ${c} min (~1 min/question)`;
}

function mockStartFromUI() {
  const count = (mockState && mockState.selectedCount) || MOCK_DEFAULT_COUNT;
  const timed = !!(document.getElementById('mockTimerToggle') && document.getElementById('mockTimerToggle').checked);
  startMockTest(count, timed);
}

// ─── Exam ───
function startMockTest(count, timed) {
  const questions = mockBuildPool(count);
  if (!questions.length) {
    showToast('📝 No questions', 'Complete a few chapters first', '📚');
    return;
  }
  mockState = {
    questions: questions,
    answers: new Array(questions.length).fill(-1),
    flags: {},
    current: 0,
    startTime: Date.now(),
    timed: !!timed,
    timerTotal: timed ? questions.length * 60 : 0,
    timerLeft: timed ? questions.length * 60 : 0,
    timerId: null,
    submitted: false,
  };
  if (timed) {
    mockState.timerId = setInterval(mockTick, 1000);
  }
  renderMockQuestion();
}

function mockTick() {
  if (!mockState || mockState.submitted) return;
  // If the user navigated away from the Mock Test page, stop the timer so it
  // can't auto-submit over another page's content.
  if (typeof currentPage !== 'undefined' && currentPage !== 'mock') {
    clearInterval(mockState.timerId); mockState.timerId = null; return;
  }
  mockState.timerLeft--;
  const el = document.getElementById('mockTimer');
  if (el) {
    el.textContent = '⏱ ' + mockFmtDuration(mockState.timerLeft);
    el.classList.toggle('mock-timer-low', mockState.timerLeft <= 30);
  }
  if (mockState.timerLeft <= 0) {
    clearInterval(mockState.timerId);
    mockState.timerId = null;
    showToast('⏱ Time up', 'Submitting your mock test', '📝');
    submitMockTest(true);
  }
}

function renderMockQuestion() {
  const st = mockState;
  const contentEl = document.getElementById('content');
  const q = st.questions[st.current];
  const answered = st.answers.filter(a => a >= 0).length;

  contentEl.innerHTML = `
    <div class="mock-wrap mock-exam">
      <div class="mock-exam-top">
        <div class="mock-exam-meta">
          <span class="mock-q-counter">Question ${st.current + 1} <span style="opacity:.6">/ ${st.questions.length}</span></span>
          <span class="mock-q-source">${q.source ? '📖 ' + q.source : ''}</span>
        </div>
        ${st.timed ? `<span class="mock-timer ${st.timerLeft <= 30 ? 'mock-timer-low' : ''}" id="mockTimer">⏱ ${mockFmtDuration(st.timerLeft)}</span>` : ''}
      </div>
      <div class="quiz-progress-bar" style="margin-bottom:18px;"><div class="quiz-progress-fill" style="width:${(answered / st.questions.length) * 100}%"></div></div>

      <div class="mock-question">${st.current + 1}. ${marked.parseInline(q.q)}</div>
      <div class="mock-options">
        ${q.options.map((opt, i) => `
          <button class="quiz-option ${st.answers[st.current] === i ? 'selected' : ''}" onclick="mockSelectOption(${i})">
            <span class="mock-opt-letter">${String.fromCharCode(65 + i)}</span>${marked.parseInline(opt)}
          </button>`).join('')}
      </div>

      <div class="mock-controls">
        <button class="mock-btn-ghost" onclick="mockPrev()" ${st.current === 0 ? 'disabled' : ''}>← Prev</button>
        <button class="mock-btn-ghost ${st.flags[st.current] ? 'mock-flagged' : ''}" onclick="mockToggleFlag()">${st.flags[st.current] ? '🚩 Flagged' : '⚑ Flag'}</button>
        ${st.current < st.questions.length - 1
          ? `<button class="mock-btn-primary mock-btn-next" onclick="mockNext()">Next →</button>`
          : `<button class="mock-btn-primary mock-btn-next" onclick="submitMockTest(false)">Submit ✓</button>`}
      </div>

      <div class="mock-nav">
        <div class="mock-nav-head">
          <span>Question navigator</span>
          <span class="mock-nav-legend"><i class="dot answered"></i> answered &nbsp; <i class="dot flagged"></i> flagged &nbsp; <i class="dot"></i> unanswered</span>
        </div>
        <div class="mock-nav-grid">
          ${st.questions.map((_, i) => {
            const cls = [
              i === st.current ? 'current' : '',
              st.answers[i] >= 0 ? 'answered' : '',
              st.flags[i] ? 'flagged' : '',
            ].filter(Boolean).join(' ');
            return `<button class="mock-nav-cell ${cls}" onclick="mockGoto(${i})">${i + 1}</button>`;
          }).join('')}
        </div>
        <div class="mock-nav-footer">
          <span>${answered} of ${st.questions.length} answered</span>
          <button class="mock-btn-submit" onclick="submitMockTest(false)">Submit test</button>
        </div>
      </div>
    </div>`;

  if (window.renderMathInElement) {
    renderMathInElement(contentEl, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mockSelectOption(i) {
  if (!mockState || mockState.submitted) return;
  mockState.answers[mockState.current] = i;
  // Light update: just toggle option highlight + navigator + progress.
  document.querySelectorAll('.mock-options .quiz-option').forEach((btn, idx) => {
    btn.classList.toggle('selected', idx === i);
  });
  const cell = document.querySelectorAll('.mock-nav-cell')[mockState.current];
  if (cell) cell.classList.add('answered');
  const answered = mockState.answers.filter(a => a >= 0).length;
  const fill = document.querySelector('.quiz-progress-fill');
  if (fill) fill.style.width = (answered / mockState.questions.length) * 100 + '%';
  const footer = document.querySelector('.mock-nav-footer span');
  if (footer) footer.textContent = `${answered} of ${mockState.questions.length} answered`;
}

function mockToggleFlag() {
  if (!mockState) return;
  mockState.flags[mockState.current] = !mockState.flags[mockState.current];
  renderMockQuestion();
}

function mockNext() { if (mockState && mockState.current < mockState.questions.length - 1) { mockState.current++; renderMockQuestion(); } }
function mockPrev() { if (mockState && mockState.current > 0) { mockState.current--; renderMockQuestion(); } }
function mockGoto(i) { if (mockState && i >= 0 && i < mockState.questions.length) { mockState.current = i; renderMockQuestion(); } }

function submitMockTest(auto) {
  const st = mockState;
  if (!st || st.submitted) return;
  const unanswered = st.answers.filter(a => a < 0).length;
  if (!auto && unanswered > 0) {
    if (!confirm(`You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}.\nUnanswered questions are marked wrong.\n\nSubmit anyway?`)) return;
  }
  st.submitted = true;
  if (st.timerId) { clearInterval(st.timerId); st.timerId = null; }

  let score = 0;
  const byChapter = {};
  st.questions.forEach((q, i) => {
    const correct = st.answers[i] === q.answer;
    if (correct) score++;
    const key = q.sourceFile || q.source || 'Unknown';
    if (!byChapter[key]) byChapter[key] = { title: q.source || 'Unknown', correct: 0, total: 0 };
    byChapter[key].total++;
    if (correct) byChapter[key].correct++;
  });
  const total = st.questions.length;
  const pct = Math.round((score / total) * 100);
  const durationSec = Math.round((Date.now() - st.startTime) / 1000);

  // XP: 8 per correct, +100 for >=90%, +50 for >=70%. Anti-rush: <2s/question → 0.
  const rushed = (durationSec / total) < 2;
  const bonus = pct >= 90 ? 100 : pct >= 70 ? 50 : 0;
  const netXp = rushed ? 0 : (score * 8 + bonus);
  const reason = rushed
    ? `Mock test ${pct}% (rushed — no XP)`
    : `Mock test ${pct}% (${score}/${total})` + (bonus ? ` · +${bonus} bonus` : '');
  if (netXp > 0) addXP(netXp, reason);

  // Persist history (cap at last 30).
  const hist = getMockHistory();
  hist.push({ date: new Date().toISOString(), score, total, pct, durationSec, timed: !!st.timed, byChapter });
  if (hist.length > 30) hist.splice(0, hist.length - 30);
  saveMockHistory(hist);

  renderMockResults(score, total, pct, durationSec, byChapter, netXp, rushed);
  if (pct >= 80) fireConfetti();
}

function renderMockResults(score, total, pct, durationSec, byChapter, netXp, rushed) {
  const contentEl = document.getElementById('content');
  const st = mockState;
  const pass = pct >= 70;
  const grade = pct >= 80 ? 'great' : pct >= 60 ? 'good' : 'needs-work';
  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📖';
  const msg = pct >= 80 ? 'Excellent — you know this material well.' : pct >= 60 ? 'Solid. Review the topics you missed below.' : 'Keep going — focus on the weak chapters below.';

  const chapterRows = Object.keys(byChapter).map(k => {
    const c = byChapter[k];
    const cp = Math.round((c.correct / c.total) * 100);
    const g = cp >= 80 ? 'great' : cp >= 60 ? 'good' : 'needs-work';
    return { ...c, file: k, pct: cp, grade: g };
  }).sort((a, b) => a.pct - b.pct);

  const review = st.questions.map((q, i) => {
    const sel = st.answers[i];
    const correct = sel === q.answer;
    return `
      <div class="mock-review-item ${correct ? 'correct' : 'wrong'}">
        <div class="mock-review-q">
          <span class="mock-review-badge">${correct ? '✓' : '✗'}</span>
          <span>${i + 1}. ${marked.parseInline(q.q)}</span>
        </div>
        <div class="mock-review-src">${q.source ? '📖 ' + q.source : ''}</div>
        <div class="mock-review-options">
          ${q.options.map((opt, oi) => {
            let cls = '';
            if (oi === q.answer) cls = 'correct';
            else if (oi === sel) cls = 'wrong';
            const tag = oi === q.answer ? '<span class="mock-tag tag-correct">correct</span>'
              : (oi === sel ? '<span class="mock-tag tag-yours">your answer</span>' : '');
            return `<div class="mock-review-opt ${cls}"><span class="mock-opt-letter">${String.fromCharCode(65 + oi)}</span>${marked.parseInline(opt)}${tag}</div>`;
          }).join('')}
          ${sel < 0 ? '<div class="mock-review-skipped">You skipped this question.</div>' : ''}
        </div>
        ${q.explanation ? `<div class="quiz-explanation">${marked.parseInline(q.explanation)}</div>` : ''}
      </div>`;
  }).join('');

  contentEl.innerHTML = `
    <div class="mock-wrap">
      <div class="mock-results-head">
        <div class="mock-results-emoji">${emoji}</div>
        <div class="mock-results-score ${grade}">${pct}%</div>
        <div class="mock-results-badge ${pass ? 'pass' : 'fail'}">${pass ? 'PASS' : 'KEEP STUDYING'}</div>
        <div class="mock-results-sub">${score} of ${total} correct · ${mockFmtDuration(durationSec)}${st.timed ? ' · timed' : ''}</div>
        <p class="mock-results-msg">${msg}</p>
        <p class="mock-results-xp">${rushed ? 'No XP (rushed — under 2s/question)' : (netXp > 0 ? `+${netXp} XP earned` : '')}</p>
        <div class="mock-results-actions">
          <button class="mock-btn-primary" onclick="renderMockLanding()">New mock test</button>
          <button class="mock-btn-ghost" onclick="showDashboard()">Dashboard</button>
        </div>
      </div>

      <div class="mock-breakdown">
        <h3>By chapter</h3>
        <div class="mock-breakdown-list">
          ${chapterRows.map(c => `
            <div class="mock-bd-row">
              <span class="mock-bd-title">${c.title}</span>
              <div class="mock-bd-bar"><div class="mock-bd-fill ${c.grade}" style="width:${c.pct}%"></div></div>
              <span class="mock-bd-val">${c.correct}/${c.total}</span>
            </div>`).join('')}
        </div>
      </div>

      <div class="mock-review">
        <h3>Review all ${total} question${total === 1 ? '' : 's'}</h3>
        ${review}
      </div>

      <div class="mock-results-actions" style="margin-top:24px;">
        <button class="mock-btn-primary" onclick="renderMockLanding()">New mock test</button>
        <button class="mock-btn-ghost" onclick="showDashboard()">Back to Dashboard</button>
      </div>
    </div>`;

  if (window.renderMathInElement) {
    renderMathInElement(contentEl, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mockFmtDuration(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}
