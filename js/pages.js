// ═══════════════════════════════════════════════════════════
// ═══  pages.js — welcome, dashboard, motivation, goals     ═══
// ═══════════════════════════════════════════════════════════

// ─── Animated Welcome Dashboard ───
function renderWelcome() {
  exitFocusMode();
  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view');
  currentPage = 'welcome';
  currentIndex = -1;
  pushHash('home');
  document.getElementById('breadcrumb').textContent = '';
  document.getElementById('readBtn').style.display = 'none';

  document.getElementById('focusBtn').style.display = 'none';

  const realCh = chapters.filter(c => !c.section && !c.ref);
  const readCount = realCh.filter(c => readChapters[c.file]).length;
  const chReadPct = realCh.length > 0 ? Math.round((readCount / realCh.length) * 100) : 0;
  const data = getXP();
  const quizScores = JSON.parse(localStorage.getItem('ml4-quiz-scores') || '{}');
  const quizzesDone = Object.keys(quizScores).length;
  const dsaProgress = (typeof getDSAProgress === 'function') ? getDSAProgress() : JSON.parse(localStorage.getItem('ml4-dsa') || '{}');
  const dsaSolved = Object.values(dsaProgress).filter(p => p.solved).length;
  const dsaAll = typeof DSA_PROBLEMS !== 'undefined' ? DSA_PROBLEMS : [];
  const dsaByDiff = (diff) => dsaAll.filter(p => p.difficulty === diff).length;
  const dsaSolvedByDiff = (diff) => dsaAll.filter(p => p.difficulty === diff && dsaProgress[p.id] && dsaProgress[p.id].solved).length;
  const dsaTotals = { Easy: dsaByDiff('Easy'), Medium: dsaByDiff('Medium'), Hard: dsaByDiff('Hard') };
  const dsaSolves = { Easy: dsaSolvedByDiff('Easy'), Medium: dsaSolvedByDiff('Medium'), Hard: dsaSolvedByDiff('Hard') };
  const dsaTotalProblems = dsaAll.length;
  const dsaPct = dsaTotalProblems > 0 ? Math.round((dsaSolved / dsaTotalProblems) * 100) : 0;
  const level = getLevel(data.xp);
  const levelXp = getLevelXP(data.xp);
  const study = (typeof getStudyData === 'function') ? getStudyData() : { totalMinutes: 0, sessions: 0 };
  const studyHrs = Math.round((study.totalMinutes || 0) / 60 * 10) / 10;
  // Next chapter to read: lowest-indexed unread. Falls back to null if all done.
  const nextUnreadIdx = chapters.findIndex(c => !c.section && !c.ref && !readChapters[c.file]);
  const nextUnread = nextUnreadIdx >= 0 ? chapters[nextUnreadIdx] : null;
  // Pick a random quote of the day for the home page
  const welcomeQuote = (typeof MOTIVATION_QUOTES !== 'undefined' && MOTIVATION_QUOTES.length > 0)
    ? MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]
    : { q: 'The expert in anything was once a beginner.', a: 'Helen Hayes' };

  const allAch = [
    // Reading
    {id:'first_read',icon:'📖',name:'First Steps',desc:'Read 1 chapter',tier:'common'},
    {id:'five_read',icon:'📚',name:'Getting Serious',desc:'Read 5 chapters',tier:'common'},
    {id:'ten_read',icon:'🐛',name:'Bookworm',desc:'Read 10 chapters',tier:'rare'},
    {id:'ch20_read',icon:'📚',name:'Devoted Reader',desc:'Read 20 chapters',tier:'rare'},
    {id:'ch30_read',icon:'🎓',name:'True Scholar',desc:'Read 30 chapters',tier:'epic'},
    {id:'all_read',icon:'🏛️',name:'Scholar',desc:'Read every chapter',tier:'epic'},
    // Streaks
    {id:'streak7',icon:'💪',name:'Dedicated',desc:'7-day streak',tier:'common'},
    {id:'streak14',icon:'⚡',name:'Unstoppable',desc:'14-day streak',tier:'rare'},
    {id:'streak30',icon:'🛡️',name:'Iron Will',desc:'30-day streak',tier:'epic'},
    {id:'streak90',icon:'🔱',name:'Relentless',desc:'90-day streak',tier:'epic'},
    // XP / Levels
    {id:'xp100',icon:'💎',name:'Centurion',desc:'100 XP',tier:'common'},
    {id:'xp500',icon:'🏆',name:'XP Hunter',desc:'500 XP',tier:'rare'},
    {id:'xp1000',icon:'👑',name:'XP Legend',desc:'1000 XP',tier:'epic'},
    {id:'level10',icon:'🌟',name:'Double Digits',desc:'Level 10',tier:'rare'},
    // Quizzes
    {id:'first_quiz',icon:'📝',name:'Quiz Taker',desc:'Complete a quiz',tier:'common'},
    {id:'quiz10',icon:'⚔️',name:'Quiz Warrior',desc:'10 quizzes done',tier:'rare'},
    {id:'quiz20',icon:'🎯',name:'Quiz Champion',desc:'Complete 20 quizzes',tier:'epic'},
    {id:'quiz_perfect',icon:'💯',name:'Flawless',desc:'100% on a quiz',tier:'epic'},
    {id:'quiz_master',icon:'🧠',name:'Quiz Master',desc:'90%+ on 5 quizzes',tier:'epic'},
    // Study
    {id:'study5h',icon:'🧘',name:'Deep Focus',desc:'5 hours study',tier:'common'},
    {id:'study10h',icon:'🏅',name:'Marathon Learner',desc:'10 hours study',tier:'rare'},
    {id:'study25h',icon:'⛏️',name:'Grinder',desc:'25 hours study',tier:'epic'},
    {id:'session20',icon:'🗓️',name:'Consistent Studier',desc:'20 study sessions',tier:'rare'},
    // Notes
    {id:'first_note',icon:'🗒️',name:'Note Taker',desc:'Write first note',tier:'common'},
    {id:'notes_pin',icon:'📍',name:'Pin Master',desc:'Pin a note to a chapter spot',tier:'common'},
    {id:'notes10',icon:'🗂️',name:'Prolific Annotator',desc:'Write 10 notes',tier:'rare'},
    // DSA
    {id:'dsa1',icon:'✨',name:'First Solve',desc:'Solve 1 DSA problem',tier:'common'},
    {id:'dsa10',icon:'💻',name:'Algorithm Pro',desc:'Solve 10 DSA problems',tier:'rare'},
    {id:'dsa_hard',icon:'🔥',name:'Hard Mode',desc:'Solve 5 Hard DSA problems',tier:'rare'},
    {id:'dsa50',icon:'🦾',name:'Algorithm Maestro',desc:'Solve 50 DSA problems',tier:'epic'},
  ];
  const unlockedIds = data.achievements || [];
  const unlockedCount = allAch.filter(a => unlockedIds.includes(a.id)).length;

  const tierColor = {common:'#6366f1',rare:'#f59e0b',epic:'#ef4444'};
  const achHtml = allAch.sort((a,b) => {
    const aU = unlockedIds.includes(a.id) ? 0 : 1;
    const bU = unlockedIds.includes(b.id) ? 0 : 1;
    return aU - bU;
  }).map(a => {
    const unlocked = unlockedIds.includes(a.id);
    return `<span title="${a.desc}" style="padding:4px 12px;border-radius:20px;font-size:12px;cursor:default;
      ${unlocked ? 'background:linear-gradient(135deg,'+tierColor[a.tier]+','+tierColor[a.tier]+'88);color:white;' : 'background:var(--border);color:var(--text-secondary);opacity:0.45;'}"
    >${unlocked ? a.icon+' ' : '🔒 '}${a.name}</span>`;
  }).join('');

  const continueLabel = readCount === 0 ? 'Start here' : (readCount === realCh.length ? 'All done' : 'Continue');
  const continueCard = nextUnread
    ? `<button class="welcome-continue" onclick="loadChapter(${nextUnreadIdx})">
         <div class="welcome-continue-left">
           <span class="welcome-continue-label">📖 ${continueLabel}</span>
           <span class="welcome-continue-title">${escapeHTML(nextUnread.title)}</span>
           <span class="welcome-continue-meta">Chapter ${nextUnread.id} &middot; ${readCount}/${realCh.length} chapters read</span>
         </div>
         <span class="welcome-continue-arrow">→</span>
       </button>`
    : `<div class="welcome-continue welcome-continue-done">
         <div class="welcome-continue-left">
           <span class="welcome-continue-label">🎉 All chapters read</span>
           <span class="welcome-continue-title">You've completed the curriculum</span>
           <span class="welcome-continue-meta">Next: try DSA Practice or retake your weakest quizzes</span>
         </div>
       </div>`;

  contentEl.innerHTML = `
    <div class="welcome-wrap">
      <h1 class="welcome-title">ML Study Notes</h1>
      <p class="welcome-subtitle">Your learning dashboard</p>

      <!-- ─── Quote of the moment ─── -->
      <div class="welcome-quote" id="welcomeQuoteCard">
        <div class="welcome-quote-text" id="welcomeQuoteText">&ldquo;${escapeHTML(welcomeQuote.q)}&rdquo;</div>
        <div class="welcome-quote-author" id="welcomeQuoteAuthor">&mdash; ${escapeHTML(welcomeQuote.a)}</div>
        <button class="welcome-quote-refresh" onclick="dashRefreshQuote()" title="New quote" aria-label="Show another quote">&#x21bb;</button>
      </div>

      <!-- ─── Continue card + quick actions ─── -->
      ${continueCard}
      <div class="welcome-quick-actions">
        <button onclick="showDashboard()" title="See everything in one place">📊 Dashboard</button>
        <button onclick="showDSAPractice()" title="${dsaSolved} of ${dsaTotalProblems} DSA problems solved">💻 DSA Practice</button>
        <button onclick="showGoals()" title="Set a study target">🎯 Goals</button>
        <button onclick="exportAllChaptersPDF()" title="Export all chapters to one PDF">📄 Export All PDF</button>
      </div>

      ${interactiveMode ? `
      <!-- ─── Level progress bar ─── -->
      <div class="welcome-level-card">
        <div class="welcome-level-row">
          <span class="welcome-level-num">Level ${level}</span>
          <span class="welcome-level-xp">${levelXp} / 100 XP to Level ${level + 1}</span>
        </div>
        <div class="welcome-level-track"><div class="welcome-level-fill" style="width:${levelXp}%"></div></div>
      </div>` : ''}

      <!-- ─── Stat cards with icons ─── -->
      <div class="welcome-stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-number" id="statChapters">${readCount}<small>/${realCh.length}</small></div>
          <div class="stat-label">Chapters &middot; ${chReadPct}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-number">${quizzesDone}</div>
          <div class="stat-label">Quizzes taken</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💻</div>
          <div class="stat-number">${dsaSolved}<small>/${dsaTotalProblems}</small></div>
          <div class="stat-label">DSA &middot; ${dsaPct}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-number">${data.streak > 0 ? data.streak : '0'}</div>
          <div class="stat-label">Day streak</div>
        </div>
        ${interactiveMode ? `
        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-number">${data.xp}</div>
          <div class="stat-label">Total XP</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-number">${studyHrs}<small>h</small></div>
          <div class="stat-label">Study time</div>
        </div>` : ''}
      </div>

      <!-- ─── DSA difficulty breakdown ─── -->
      ${dsaTotalProblems > 0 ? `
      <div class="welcome-dsa-breakdown">
        <div class="welcome-dsa-head"><span>💻 DSA Progress</span><a href="javascript:showDSAPractice()">Open &rarr;</a></div>
        ${['Easy','Medium','Hard'].map(d => {
          const solved = dsaSolves[d];
          const total = dsaTotals[d];
          const pct = total > 0 ? (solved / total) * 100 : 0;
          return `<div class="welcome-dsa-row">
            <span class="welcome-dsa-label dsa-${d.toLowerCase()}">${d}</span>
            <div class="welcome-dsa-track"><div class="welcome-dsa-fill dsa-${d.toLowerCase()}" style="width:${pct}%"></div></div>
            <span class="welcome-dsa-count">${solved}<small>/${total}</small></span>
          </div>`;
        }).join('')}
      </div>` : ''}

      <div style="margin-top:20px;">
        <div class="stat-card" style="text-align:left;padding:20px 24px;">
          <strong style="font-size:14px;">Achievements (${unlockedCount}/${allAch.length} unlocked)</strong>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
            ${achHtml}
          </div>
        </div>
      </div>
      <p class="welcome-shortcuts">
        <strong>Shortcuts:</strong>
        <code>Ctrl+K</code> Search &nbsp; <code>&larr;</code><code>&rarr;</code> Navigate &nbsp;
        <code>Ctrl+D</code> Theme &nbsp; <code>M</code> Mark read
      </p>
    </div>`;
}


// ─── Export All Chapters to PDF ───
async function exportAllChaptersPDF() {
  const exportable = chapters.filter(c => !c.section && !c.notebook);

  const overlay = document.createElement('div');
  overlay.id = 'pdf-all-overlay';
  overlay.innerHTML = `
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:16px;padding:36px 44px;
      max-width:420px;width:90%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.3);">
      <div style="font-size:28px;margin-bottom:12px;">📄</div>
      <h3 style="margin:0 0 8px;font-size:18px;color:var(--heading);">Generating PDF</h3>
      <p style="color:var(--text-secondary);font-size:14px;margin:0 0 20px;" id="pdfAllStatus">
        Loading chapters... 0 / ${exportable.length}
      </p>
      <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
        <div id="pdfAllBar" style="height:100%;width:0%;background:linear-gradient(90deg,#6366f1,#a78bfa);
          border-radius:3px;transition:width 0.3s;"></div>
      </div>
    </div>`;
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10002;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);';
  document.body.appendChild(overlay);

  const statusEl = document.getElementById('pdfAllStatus');
  const barEl = document.getElementById('pdfAllBar');

  // Use the same marked config that the main app uses — this keeps syntax
  // highlighting identical to single-chapter rendering because marked's
  // `highlight` callback runs hljs on every fenced code block.
  const renderedChapters = [];
  let loaded = 0;

  for (const ch of exportable) {
    try {
      let md = cachedContent[ch.file];
      if (!md) {
        const res = await fetch(ch.file);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        md = await res.text();
        cachedContent[ch.file] = md;
      }
      const mathProtected = protectMath(md);
      const html = restoreMath(marked.parse(mathProtected.md), mathProtected.store);
      renderedChapters.push({ ch, html });
    } catch (e) {
      renderedChapters.push({ ch, html: `<p style="color:red;">Failed to load ${ch.file}: ${e.message}</p>` });
    }
    loaded++;
    statusEl.textContent = `Loading chapters... ${loaded} / ${exportable.length}`;
    barEl.style.width = (loaded / exportable.length * 100) + '%';
  }

  statusEl.textContent = 'Rendering...';

  // Build section→chapters map for TOC
  const tocSections = [];
  let curSec = null;
  let chNum = 0;
  for (const item of chapters) {
    if (item.section) {
      curSec = { name: item.section, chapters: [] };
      tocSections.push(curSec);
    } else if (!item.notebook && curSec) {
      chNum++;
      curSec.chapters.push({ num: chNum, title: item.title, id: item.id });
    }
  }

  // TOC placeholder — page numbers filled by script after layout
  const tocHtml = tocSections.map(sec => `
    <div class="toc-section">
      <div class="toc-section-title">${sec.name}</div>
      ${sec.chapters.map(c =>
        `<div class="toc-entry">
          <span class="toc-num">${c.num}.</span>
          <span class="toc-chap-title">${c.title}</span>
          <span class="toc-dots"></span>
          <span class="toc-page" data-chapter="${c.num}"></span>
        </div>`
      ).join('')}
    </div>`).join('');

  // Chapter blocks
  let ci = 0;
  const chaptersHtml = renderedChapters.map(({ ch, html }) => {
    ci++;
    return `<div class="pdf-chapter" data-ch-num="${ci}">${html}</div>`;
  }).join('');

  // ─── Build the self-contained print document ───
  const printDoc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ML Study Notes — Complete</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
<style>
/* ── Page & page-number footer ── */
@page {
  size: A4;
  margin: 16mm 14mm 20mm 14mm;
}
@media print {
  .page-footer { display: none; }
}

/* ── Reset ── */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  color: #1f2328; background: #fff;
  font-size: 11pt; line-height: 1.6;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Cover ── */
.cover {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 96vh; text-align: center;
  page-break-after: always; break-after: page;
  border-bottom: 3px solid #0969da;
  padding-bottom: 40px;
}
.cover h1 {
  font-size: 38pt; font-weight: 800; color: #1f2328;
  margin-bottom: 6px; border: none; padding: 0;
}
.cover .sub { font-size: 13pt; color: #656d76; margin-bottom: 36px; font-weight: 400; }
.cover .meta { font-size: 10pt; color: #8b949e; }
.cover .meta span { display: block; margin: 2px 0; }

/* ── TOC ── */
.toc { page-break-after: always; break-after: page; padding: 0; }
.toc h2 {
  font-size: 20pt; font-weight: 700; text-align: center; color: #1f2328;
  margin: 0 0 28px; padding-bottom: 10px;
  border-bottom: 2px solid #d0d7de;
}
.toc-section { margin-bottom: 16px; }
.toc-section-title {
  font-size: 9.5pt; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1.2px; color: #0969da; padding-bottom: 3px;
  border-bottom: 1px solid #d0d7de; margin-bottom: 5px;
}
.toc-entry {
  display: flex; align-items: baseline; gap: 5px;
  padding: 2.5px 0; font-size: 10.5pt; line-height: 1.5;
}
.toc-num { font-weight: 700; min-width: 24px; color: #1f2328; }
.toc-chap-title { color: #1f2328; }
.toc-dots {
  flex: 1; border-bottom: 1px dotted #b0b8c1;
  margin: 0 3px; min-width: 16px;
  position: relative; top: -3px;
}
.toc-page {
  font-size: 10pt; font-weight: 600; color: #656d76;
  min-width: 24px; text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ── Chapter blocks ── */
.pdf-chapter { page-break-before: always; break-before: page; }

/* ── Typography — matches single-chapter print ── */
h1 {
  font-size: 20pt; font-weight: 700; color: #1f2328;
  padding-bottom: 8pt; border-bottom: 2px solid #d0d7de;
  margin: 0 0 12pt; page-break-after: avoid;
}
h2 {
  font-size: 15pt; font-weight: 600; color: #1f2328;
  margin: 18pt 0 8pt; padding-bottom: 4pt;
  border-bottom: 1px solid #d0d7de; page-break-after: avoid;
}
h3 { font-size: 12.5pt; font-weight: 600; color: #1f2328; margin: 14pt 0 6pt; page-break-after: avoid; }
h4 { font-size: 11pt; font-weight: 600; color: #1f2328; margin: 10pt 0 4pt; page-break-after: avoid; }

p  { margin: 6pt 0; font-size: 11pt; line-height: 1.65; }
a  { color: #0969da; text-decoration: underline; }
strong { color: #1f2328; }

ul, ol { margin: 6pt 0; padding-left: 22pt; }
li { margin: 3pt 0; font-size: 11pt; line-height: 1.6; }

blockquote {
  border-left: 3pt solid #0969da; padding: 8pt 14pt; margin: 8pt 0;
  background: #f6f8fa; color: #656d76; font-style: italic;
  border-radius: 0 6pt 6pt 0;
  page-break-inside: avoid;
}

/* ── Code ── */
code {
  background: #f6f8fa; padding: 1px 5px; border-radius: 4px;
  font-size: 9.5pt;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  border: 1px solid #d0d7de;
}
pre {
  background: #f6f8fa; border: 1px solid #d0d7de; border-radius: 8px;
  padding: 10pt 14pt; margin: 8pt 0;
  font-size: 8.5pt; line-height: 1.5;
  white-space: pre; overflow-x: visible; overflow-wrap: break-word;
  page-break-inside: avoid;
}
pre code {
  background: none; padding: 0; border: none; font-size: inherit;
  white-space: pre;
}

/* highlight.js token colours — light print-friendly palette */
.hljs { background: #f6f8fa; color: #1f2328; }
.hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #8250df; }
.hljs-string, .hljs-attr { color: #0a3069; }
.hljs-comment { color: #6e7781; font-style: italic; }
.hljs-number, .hljs-literal { color: #0550ae; }
.hljs-title, .hljs-function, .hljs-name { color: #953800; }
.hljs-type, .hljs-class { color: #116329; }
.hljs-meta, .hljs-params { color: #1f2328; }

/* ── Tables ── */
table {
  display: table; width: 100%; border-collapse: collapse;
  margin: 8pt 0; font-size: 9.5pt;
  page-break-inside: avoid;
}
thead { display: table-header-group; }
tbody { display: table-row-group; }
tr { display: table-row; page-break-inside: avoid; }
thead th {
  background: #f6f8fa; padding: 6pt 8pt; text-align: left;
  font-weight: 600; border: 1px solid #d0d7de; white-space: nowrap;
}
tbody td { padding: 5pt 8pt; border: 1px solid #d0d7de; }
tbody tr:nth-child(even) { background: #f6f8fa; }

hr { border: none; border-top: 1px solid #d0d7de; margin: 16pt 0; }
img, svg { max-width: 100%; page-break-inside: avoid; }

details { margin: 8pt 0; border: 1px solid #d0d7de; border-radius: 8px; padding: 8pt 12pt; page-break-inside: avoid; }
details summary { font-weight: 600; color: #0969da; cursor: default; }

/* ── KaTeX ── */
.katex-display {
  margin: 10pt 0; padding: 10pt 14pt; background: #f6f8fa;
  border-radius: 8px; border-left: 3pt solid #0969da;
  page-break-inside: avoid; overflow: visible;
}
.katex { font-size: 0.95em; }
.katex-display .katex { font-size: 1.02em; }

/* ── Mermaid / Charts ── */
.mermaid, .mermaid svg { max-width: 100%; page-break-inside: avoid; }
.chart-container { page-break-inside: avoid; }

/* ── Highlights ── */
mark { background: #fff3a0; color: #1f2328; }
</style>
</head>
<body>

<div class="cover">
  <h1>ML Study Notes</h1>
  <p class="sub">Complete Reference &mdash; All Chapters</p>
  <div class="meta">
    <span>Generated ${new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</span>
    <span>${exportable.length} chapters</span>
  </div>
</div>

<div class="toc">
  <h2>Table of Contents</h2>
  ${tocHtml}
</div>

${chaptersHtml}

<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/java.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/python.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/sql.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/json.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"><\/script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  // 1. Run highlight.js on all code blocks that marked didn't already highlight
  if (window.hljs) {
    document.querySelectorAll('pre code').forEach(function(block) {
      if (!block.classList.contains('hljs')) hljs.highlightElement(block);
    });
  }

  // 2. Render KaTeX math
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false, trust: true
    });
  }

  // 3. Estimate page numbers for TOC
  //    A4 content area ≈ 297mm - 16mm - 20mm = 261mm.
  //    At 96 CSS-px/inch ≈ 3.78 px/mm → ~987px per page.
  //    We use a measured ratio: the cover (100vh ≈ one page) sets baseline.
  setTimeout(function() {
    var pageH = 987;
    // The cover is page 1, TOC starts on page 2.
    // Count how many pages the TOC itself takes:
    var tocEl = document.querySelector('.toc');
    var tocBottom = tocEl.offsetTop + tocEl.offsetHeight;
    var tocPages = Math.ceil(tocBottom / pageH);

    document.querySelectorAll('.pdf-chapter').forEach(function(ch) {
      var num = ch.getAttribute('data-ch-num');
      var pageNum = Math.floor(ch.offsetTop / pageH) + 1;
      var span = document.querySelector('.toc-page[data-chapter="' + num + '"]');
      if (span) span.textContent = pageNum;
    });

    // 4. Print after a short delay for layout to settle
    setTimeout(function() { window.print(); }, 400);
  }, 300);
});
<\/script>
</body>
</html>`;

  const blob = new Blob([printDoc], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');

  if (!win) {
    overlay.remove();
    URL.revokeObjectURL(url);
    alert('Popup blocked — please allow popups for this site and try again.');
    return;
  }

  // Show dismiss button immediately
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    overlay.remove();
    URL.revokeObjectURL(url);
  };

  statusEl.textContent = 'PDF ready in new tab — Save as PDF from print dialog';
  barEl.style.width = '100%';
  overlay.querySelector('div').insertAdjacentHTML('beforeend',
    `<button onclick="document.getElementById('pdf-all-overlay').remove()" style="
      margin-top:18px;padding:8px 24px;border:1px solid var(--border);border-radius:8px;
      background:var(--bg);color:var(--text);cursor:pointer;font-size:14px;font-weight:600;
    ">Dismiss</button>`
  );

  const poll = setInterval(() => {
    if (win.closed) { clearInterval(poll); cleanup(); }
  }, 1000);
}


// ─── Dashboard Page ───
function showDashboard() {
  exitFocusMode();
  trackChapterClose();
  currentIndex = -1;
  currentPage = 'dashboard';
  pushHash('dashboard');
  renderSidebar();
  closeSidebar();
  document.getElementById('tocPanel').classList.remove('visible');
  document.getElementById('breadcrumb').textContent = 'Dashboard';
  document.getElementById('readBtn').style.display = 'none';

  document.getElementById('focusBtn').style.display = 'none';
  const el = document.getElementById('readingTime'); if (el) el.remove();
  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view');
  const realCh = chapters.filter(c => !c.section && !c.ref);
  const readCount = realCh.filter(c => readChapters[c.file]).length;
  const data = getXP();
  const scores = JSON.parse(localStorage.getItem('ml4-quiz-scores') || '{}');
  const totalQuizzes = Object.keys(scores).length;
  const avgScore = totalQuizzes > 0 ? Math.round(Object.values(scores).reduce((a,b)=>a+b,0) / totalQuizzes) : 0;

  // Estimate reading time: study-pace ~55 words/min (reading + thinking + diagrams)
  // Values below are derived from actual word counts in each chapter, rounded to the nearest 5 min.
  const chapterMinutes = {
    'content/00_google_ai_engineer_strategy.md': 150,
    'content/01_brain_training.md': 100,
    'content/02_math_fundamentals.md': 280,
    'content/03_introduction.md': 90,
    'content/04_core_concepts.md': 210,
    'content/05_data_preprocessing.md': 55,
    'content/06_supervised_learning.md': 220,
    'content/07_unsupervised_learning.md': 140,
    'content/08_reinforcement_learning.md': 105,
    'content/09_key_algorithms.md': 145,
    'content/10_neural_networks.md': 120,
    'content/11_model_evaluation.md': 120,
    'content/12_deep_learning.md': 200,
    'content/13_llm.md': 540,
    'content/22_modern_ai_stack.md': 160,
    'content/14_design_fundamentals.md': 285,
    'content/15_interview_questions.md': 220,
    'content/16_llm_interview_questions.md': 445,
    'content/17_ml_system_design.md': 225,
    'content/behavioral_interview.md': 145,
    'content/practical_ml.md': 195,
    'content/practical_ml.ipynb': 195,
    'content/staying_relevant_ai_era.md': 75,
    'README.md': 40,
    'content/18_dsa_trees_graphs.md': 340,
    'content/19_google_ml_ecosystem.md': 160,
    'content/20_Modern System Design.md': 160,
    'content/20_google_top10_ml_interview.md': 495,
    'content/21_quick_reference_cheat_sheet.md': 180,
  };
  let totalMinutesAll = 0; let completedMinutes = 0; let remainingHours = 0;
  realCh.forEach(c => { const m = chapterMinutes[c.file] || 30; totalMinutesAll += m; if (readChapters[c.file]) completedMinutes += m; else remainingHours += m; });
  const totalH = Math.round(totalMinutesAll / 60); const remainH = (remainingHours / 60).toFixed(1);
  const doneH = (completedMinutes / 60).toFixed(1);

  // Completion % is weighted by each chapter's estimated study time
  // (not a raw "chapters read / total chapters" count) — so a 9-hour
  // chapter contributes much more than a 1-hour one.
  const pct = totalMinutesAll > 0 ? Math.round(completedMinutes / totalMinutesAll * 100) : 0;
  const ringR = 62;
  const circumference = 2 * Math.PI * ringR;
  const offset = circumference - (pct / 100) * circumference;
  const xpProgress = getLevelXP(data.xp);
  const quizHist = getQuizHistory();
  const chTrack = getChapterTrack();
  const totalAttempts = Object.values(quizHist).reduce((s,h) => s + (h.attempts||0), 0);
  const study = getStudyData();
  const studyHrs = (study.totalMinutes / 60).toFixed(1);
  const startDate = study.startDate ? new Date(study.startDate).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'Not started';
  const completionDate = study.completionDate ? new Date(study.completionDate).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : (pct === 100 ? 'Today' : 'In progress');
  const bestQuiz = Object.values(scores).length > 0 ? Math.max(...Object.values(scores)) : 0;
  const worstQuiz = Object.values(scores).length > 0 ? Math.min(...Object.values(scores)) : 0;
  const passedQuizzes = Object.values(scores).filter(s => s >= 70).length;
  const allComments = getComments();
  const totalComments = Object.values(allComments).reduce((s, arr) => s + arr.reduce((s2, c) => s2 + 1 + (c.replies ? c.replies.length : 0), 0), 0);
  const resolvedComments = Object.values(allComments).reduce((s, arr) => s + arr.filter(c => c.resolved).length, 0);
  const openComments = Object.values(allComments).reduce((s, arr) => s + arr.filter(c => !c.resolved).length, 0);
  const chaptersWithComments = Object.keys(allComments).filter(k => allComments[k].length > 0).length;

  // SVG icon helper — inline Lucide-style icons for a modern look
  const ico = {
    book:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    clock:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    timer:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>',
    target:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    check:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    zap:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    award:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
    flame:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    pen:      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    palette:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
    calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    flag:     '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
    layers:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
    upload:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    trash:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  };

  contentEl.innerHTML = `
    <div class="db">

      <!-- ─── Header ─── -->
      <div class="db-header">
        <div>
          <h1 class="db-title">Dashboard</h1>
          <p class="db-subtitle">${readCount === realCh.length ? 'Curriculum complete — review and keep sharp' : readCount === 0 ? 'Your learning journey starts here' : Math.round(pct) + '% through the curriculum — keep going'}</p>
        </div>
        <div class="db-header-actions">
          <button class="db-btn" onclick="exportAllChaptersPDF()" title="Export all chapters">${ico.download} Export All PDF</button>
          <div class="mode-toggle ${interactiveMode ? 'active' : ''}" onclick="toggleInteractiveMode();" style="cursor:pointer;">
            <span>Gamify</span>
            <div class="mode-switch"></div>
          </div>
        </div>
      </div>

      <!-- ─── Hero Banner ─── -->
      <div class="db-hero">
        <!-- Row 1: Ring + Progress bar + Level -->
        <div class="db-hero-top">
          <div class="db-hero-ring" title="Weighted by estimated study time per chapter">
            <svg width="160" height="160">
              <defs><linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="rgba(255,255,255,0.7)"/></linearGradient></defs>
              <circle class="progress-ring-bg" cx="80" cy="80" r="62"/>
              <circle class="progress-ring-fill" cx="80" cy="80" r="62" stroke-dasharray="${2*Math.PI*62}" stroke-dashoffset="${2*Math.PI*62}" id="progressRing"/>
              <g class="progress-ring-text" style="transform-origin:80px 80px;">
                <text x="80" y="72" text-anchor="middle" fill="#fff" font-size="36" font-weight="800">${pct}%</text>
                <text x="80" y="96" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="10" text-transform="uppercase" letter-spacing="1.5">complete</text>
              </g>
            </svg>
            <div class="db-hero-ring-sub">${doneH}h of ${totalH}h studied</div>
          </div>
          <div class="db-hero-main">
            <div class="db-hero-progress">
              <div class="db-hero-progress-label">
                <span>Chapter progress</span>
                <span>${readCount} of ${realCh.length}</span>
              </div>
              <div class="db-hero-progress-bar"><div class="db-hero-progress-fill" style="width:${pct}%"></div></div>
            </div>
            <div class="db-hero-level">
              <div class="db-hero-level-top">
                <span class="db-hero-level-badge">Lvl ${getLevel(data.xp)}</span>
                <span class="db-hero-level-xp">${data.xp} XP &middot; ${xpProgress}/100 to next</span>
              </div>
              <div class="db-xp-track"><div class="db-xp-fill" id="dashXpFill" style="width:0%"></div></div>
            </div>
            <div class="db-hero-meta">
              ${ico.calendar} Started ${startDate} &nbsp;&middot;&nbsp; ${ico.flag} ${completionDate}
            </div>
          </div>
        </div>
        <!-- Row 2: Big stat tiles -->
        <div class="db-hero-grid">
          <div class="db-hero-tile">
            <div class="db-hero-tile-num">${readCount}<small>/${realCh.length}</small></div>
            <div class="db-hero-tile-lbl">${ico.book} Chapters Read</div>
          </div>
          <div class="db-hero-tile">
            <div class="db-hero-tile-num">${studyHrs}<small>h</small></div>
            <div class="db-hero-tile-lbl">${ico.timer} Time Studied</div>
          </div>
          <div class="db-hero-tile">
            <div class="db-hero-tile-num">${remainH}<small>h</small></div>
            <div class="db-hero-tile-lbl">${ico.clock} Remaining</div>
          </div>
          <div class="db-hero-tile">
            <div class="db-hero-tile-num">${data.streak}</div>
            <div class="db-hero-tile-lbl">${ico.flame} Day Streak</div>
          </div>
          <div class="db-hero-tile">
            <div class="db-hero-tile-num">${avgScore}<small>%</small></div>
            <div class="db-hero-tile-lbl">${ico.target} Quiz Average</div>
          </div>
          <div class="db-hero-tile">
            <div class="db-hero-tile-num">${passedQuizzes}<small>/${totalQuizzes}</small></div>
            <div class="db-hero-tile-lbl">${ico.award} Quizzes Passed</div>
          </div>
          <div class="db-hero-tile">
            <div class="db-hero-tile-num">${study.sessions||0}</div>
            <div class="db-hero-tile-lbl">${ico.layers} Sessions</div>
          </div>
          <div class="db-hero-tile">
            <div class="db-hero-tile-num">${totalComments}</div>
            <div class="db-hero-tile-lbl">${ico.pen} Notes</div>
          </div>
        </div>
      </div>

      <!-- ─── Two-column stat panels ─── -->
      <div class="db-panels">
        <div class="db-panel">
          <h3 class="db-panel-title">${ico.book} Study Progress</h3>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.book}</span>
            <span class="db-stat-label">Chapters read</span>
            <span class="db-stat-value">${readCount} / ${realCh.length}</span>
          </div>
          <div class="db-bar-wrap"><div class="db-bar"><div class="db-bar-fill" style="width:${pct}%"></div></div></div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.timer}</span>
            <span class="db-stat-label">Study time</span>
            <span class="db-stat-value">${studyHrs}h</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.layers}</span>
            <span class="db-stat-label">Sessions</span>
            <span class="db-stat-value">${study.sessions||0}</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.clock}</span>
            <span class="db-stat-label">Remaining</span>
            <span class="db-stat-value">${remainH}h</span>
          </div>
        </div>
        <div class="db-panel">
          <h3 class="db-panel-title">${ico.target} Quiz Performance</h3>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.target}</span>
            <span class="db-stat-label">Attempts</span>
            <span class="db-stat-value">${totalAttempts}</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.check}</span>
            <span class="db-stat-label">Average score</span>
            <span class="db-stat-value">${avgScore}%</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.award}</span>
            <span class="db-stat-label">Best score</span>
            <span class="db-stat-value">${bestQuiz}%</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.zap}</span>
            <span class="db-stat-label">Passed</span>
            <span class="db-stat-value">${passedQuizzes} / ${totalQuizzes}</span>
          </div>
          <div class="db-bar-wrap"><div class="db-bar"><div class="db-bar-fill db-bar-fill--quiz" style="width:${totalQuizzes > 0 ? Math.round(passedQuizzes/totalQuizzes*100) : 0}%"></div></div></div>
        </div>
      </div>

      <!-- ─── Progress Breakdown by Section ─── -->
      <div class="db-section">
        <h3 class="db-section-title">${ico.layers} Progress by Section</h3>
        <div class="db-progress-grid">
        ${(() => {
          const sections = [];
          let cur = null;
          for (const item of chapters) {
            if (item.section) {
              cur = { name: item.section, total: 0, done: 0, estMin: 0, doneMin: 0, quizzes: 0, bestScore: -1 };
              sections.push(cur);
            } else if (cur && !item.ref && !item.notebook) {
              cur.total++;
              const mins = chapterMinutes[item.file] || 30;
              cur.estMin += mins;
              if (readChapters[item.file]) { cur.done++; cur.doneMin += mins; }
              const qh = quizHist[item.file];
              if (qh) { cur.quizzes++; if (qh.bestScore > cur.bestScore) cur.bestScore = qh.bestScore; }
            }
          }
          return sections.map(s => {
            const sPct = s.total > 0 ? Math.round(s.done / s.total * 100) : 0;
            const estH = s.estMin >= 60 ? Math.floor(s.estMin/60) + 'h ' + s.estMin%60 + 'm' : s.estMin + 'm';
            const barColor = sPct === 100 ? 'var(--success)' : 'var(--accent)';
            return '<div class="db-prog-card">' +
              '<div class="db-prog-head">' +
                '<span class="db-prog-name">' + s.name + '</span>' +
                '<span class="db-prog-pct" style="color:' + (sPct === 100 ? 'var(--success)' : 'var(--heading)') + '">' + sPct + '%</span>' +
              '</div>' +
              '<div class="db-prog-bar"><div class="db-prog-bar-fill" style="width:' + sPct + '%;background:' + barColor + '"></div></div>' +
              '<div class="db-prog-meta">' +
                '<span>' + s.done + '/' + s.total + ' chapters</span>' +
                '<span>' + estH + ' est.</span>' +
                (s.bestScore >= 0 ? '<span>Best quiz: ' + s.bestScore + '%</span>' : '') +
              '</div>' +
            '</div>';
          }).join('');
        })()}
        </div>
      </div>

      <!-- ─── Notes & Highlights Overview ─── -->
      <div class="db-panels" style="margin-bottom:0;">
        <div class="db-panel">
          <h3 class="db-panel-title">${ico.pen} Notes</h3>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.pen}</span>
            <span class="db-stat-label">Total notes</span>
            <span class="db-stat-value">${totalComments}</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.check}</span>
            <span class="db-stat-label">Resolved</span>
            <span class="db-stat-value">${resolvedComments}</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.flag}</span>
            <span class="db-stat-label">Open</span>
            <span class="db-stat-value">${openComments}</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.book}</span>
            <span class="db-stat-label">Chapters with notes</span>
            <span class="db-stat-value">${chaptersWithComments}</span>
          </div>
        </div>
        <div class="db-panel">
          <h3 class="db-panel-title">${ico.palette} Highlights & Study</h3>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.palette}</span>
            <span class="db-stat-label">Total highlights</span>
            <span class="db-stat-value">${Object.values(JSON.parse(localStorage.getItem('ml4-highlights')||'{}')).reduce((s,a)=>s+a.length,0)}</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.timer}</span>
            <span class="db-stat-label">Estimated total</span>
            <span class="db-stat-value">${totalH}h</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.clock}</span>
            <span class="db-stat-label">Time completed</span>
            <span class="db-stat-value">${doneH}h</span>
          </div>
          <div class="db-stat-row">
            <span class="db-stat-icon">${ico.calendar}</span>
            <span class="db-stat-label">Started</span>
            <span class="db-stat-value">${startDate}</span>
          </div>
        </div>
      </div>

      <!-- ─── Chapter List (main focus) ─── -->
      <div class="db-section">
        <h3 class="db-section-title">${ico.book} Chapter Details</h3>
        <div class="ch-detail-list">
        ${(() => {
          const icoSm = {
            clock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            cal:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
            check: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
            book:  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
          };
          let html = '';
          let curSection = '';
          let chIdx = 0;
          for (const item of chapters) {
            if (item.section) {
              curSection = item.section;
              html += '<div class="ch-section-row">' + curSection + '</div>';
              continue;
            }
            if (item.ref) continue;
            chIdx++;
            const c = item;
            const idx = chapters.indexOf(c);
            const isRead = !!readChapters[c.file];
            const qh = quizHist[c.file];
            const ct = chTrack[c.file] || {};
            const estMin = chapterMinutes[c.file] || 30;
            const estStr = estMin >= 60 ? Math.floor(estMin/60)+'h '+estMin%60+'m' : estMin+'m';
            const spentSec = ct.seconds || 0;
            const spentMin = Math.floor(spentSec / 60);
            const spentStr = spentSec >= 3600 ? Math.floor(spentSec/3600)+'h '+Math.floor((spentSec%3600)/60)+'m' : (spentMin > 0 ? spentMin+'m' : '');
            const timePct = Math.min(100, Math.round(spentMin / estMin * 100));
            const startD = ct.startDate ? new Date(ct.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';
            const compD = ct.completedDate ? new Date(ct.completedDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '';
            const quizScore = qh ? qh.bestScore : -1;
            const quizScoreColor = quizScore >= 90 ? 'var(--success)' : quizScore >= 70 ? 'var(--accent)' : quizScore >= 0 ? '#f59e0b' : '';

            html += '<div class="ch-row' + (isRead ? ' ch-row-done' : '') + '">' +
              '<div class="ch-row-left">' +
                '<div class="ch-row-status">' + (isRead ? '<span class="ch-check done"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' : '<span class="ch-check">' + chIdx + '</span>') + '</div>' +
                '<div class="ch-row-info">' +
                  '<div class="ch-row-title"><a href="javascript:void(0)" onclick="loadChapter(' + idx + ')">' + c.title + '</a></div>' +
                  '<div class="ch-row-meta">' +
                    '<span class="ch-meta-tag" title="Estimated study time">' + icoSm.clock + ' ' + estStr + '</span>' +
                    (startD ? '<span class="ch-meta-tag" title="Started">' + icoSm.cal + ' ' + startD + '</span>' : '') +
                    (compD ? '<span class="ch-meta-tag ch-meta-done" title="Completed">' + icoSm.check + ' ' + compD + '</span>' : '') +
                    (spentStr ? '<span class="ch-meta-tag" title="Time spent">' + icoSm.book + ' ' + spentStr + '</span>' : '') +
                  '</div>' +
                  (spentMin > 0 || isRead ? '<div class="ch-row-progress"><div class="ch-row-progress-fill' + (isRead ? ' complete' : '') + '" style="width:' + (isRead ? 100 : timePct) + '%"></div></div>' : '') +
                '</div>' +
              '</div>' +
              '<div class="ch-row-right">' +
                (quizScore >= 0
                  ? '<div class="ch-quiz-score" style="color:' + quizScoreColor + ';" title="Best quiz score: ' + quizScore + '% (' + qh.attempts + ' attempt' + (qh.attempts > 1 ? 's' : '') + ')">' + quizScore + '%</div>'
                  : '') +
                '<div class="ch-row-actions">' +
                  (qh ? '<button class="ch-btn ch-btn-accent" onclick="retakeQuiz(\'' + c.file.replace(/'/g,"\\'") + '\')" title="Retake quiz">↺ Quiz</button>' : '') +
                  '<button class="ch-btn" onclick="exportChapterPDFByIndex(' + idx + ')" title="Export as PDF">' + ico.download + '</button>' +
                  ((isRead || qh || ct.seconds) ? '<button class="ch-btn ch-btn-danger" onclick="resetChapter(\'' + c.file.replace(/'/g,"\\'") + '\', \'' + c.title.replace(/'/g,"\\'") + '\')" title="Reset progress">↺</button>' : '') +
                '</div>' +
              '</div>' +
            '</div>';
          }
          return html;
        })()}
        </div>
      </div>

      <!-- ─── Achievements (collapsed) ─── -->
      <details class="db-collapse">
        <summary class="db-collapse-summary">${ico.award} Achievements <span class="db-collapse-badge">${(data.achievements||[]).length}/30</span></summary>
        <div class="db-collapse-body">
          <div class="ach-grid">
            ${[
              {id:'first_read',icon:'📖',name:'First Steps',desc:'Read 1 chapter',cat:'read',tier:'common'},
              {id:'five_read',icon:'📚',name:'Getting Serious',desc:'Read 5 chapters',cat:'read',tier:'common'},
              {id:'ten_read',icon:'🐛',name:'Bookworm',desc:'Read 10 chapters',cat:'read',tier:'rare'},
              {id:'all_read',icon:'🏛️',name:'Scholar',desc:'Read every chapter',cat:'read',tier:'epic'},
              {id:'streak7',icon:'💪',name:'Dedicated',desc:'7-day streak',cat:'streak',tier:'common'},
              {id:'streak14',icon:'⚡',name:'Unstoppable',desc:'14-day streak',cat:'streak',tier:'rare'},
              {id:'streak30',icon:'🛡️',name:'Iron Will',desc:'30-day streak',cat:'streak',tier:'epic'},
              {id:'xp100',icon:'💎',name:'Centurion',desc:'100 XP',cat:'xp',tier:'common'},
              {id:'xp500',icon:'🏆',name:'XP Hunter',desc:'500 XP',cat:'xp',tier:'rare'},
              {id:'xp1000',icon:'👑',name:'XP Legend',desc:'1000 XP',cat:'xp',tier:'epic'},
              {id:'level10',icon:'🌟',name:'Double Digits',desc:'Level 10',cat:'xp',tier:'rare'},
              {id:'first_quiz',icon:'📝',name:'Quiz Taker',desc:'Complete a quiz',cat:'quiz',tier:'common'},
              {id:'quiz10',icon:'⚔️',name:'Quiz Warrior',desc:'10 quizzes done',cat:'quiz',tier:'rare'},
              {id:'quiz_perfect',icon:'💯',name:'Flawless',desc:'100% on a quiz',cat:'quiz',tier:'epic'},
              {id:'quiz_master',icon:'🧠',name:'Quiz Master',desc:'90%+ on 5 quizzes',cat:'quiz',tier:'epic'},
              {id:'study5h',icon:'🧘',name:'Deep Focus',desc:'5 hours study',cat:'study',tier:'common'},
              {id:'study10h',icon:'🏅',name:'Marathon Learner',desc:'10 hours study',cat:'study',tier:'rare'},
              {id:'study25h',icon:'⛏️',name:'Grinder',desc:'25 hours study',cat:'study',tier:'epic'},
              {id:'first_note',icon:'🗒️',name:'Note Taker',desc:'Write first note',cat:'note',tier:'common'},
              {id:'dsa10',icon:'💻',name:'Algorithm Pro',desc:'Solve 10 DSA problems',cat:'dsa',tier:'rare'},
              {id:'ch20_read',icon:'📚',name:'Devoted Reader',desc:'Read 20 chapters',cat:'read',tier:'rare'},
              {id:'ch30_read',icon:'🎓',name:'True Scholar',desc:'Read 30 chapters',cat:'read',tier:'epic'},
              {id:'dsa1',icon:'✨',name:'First Solve',desc:'Solve 1 DSA problem',cat:'dsa',tier:'common'},
              {id:'dsa50',icon:'🦾',name:'Algorithm Maestro',desc:'Solve 50 DSA problems',cat:'dsa',tier:'epic'},
              {id:'dsa_hard',icon:'🔥',name:'Hard Mode',desc:'Solve 5 Hard DSA problems',cat:'dsa',tier:'rare'},
              {id:'notes10',icon:'🗂️',name:'Prolific Annotator',desc:'Write 10 notes',cat:'note',tier:'rare'},
              {id:'notes_pin',icon:'📍',name:'Pin Master',desc:'Pin a note to a chapter spot',cat:'note',tier:'common'},
              {id:'quiz20',icon:'🎯',name:'Quiz Champion',desc:'Complete 20 quizzes',cat:'quiz',tier:'epic'},
              {id:'session20',icon:'🗓️',name:'Consistent Studier',desc:'20 study sessions',cat:'study',tier:'rare'},
              {id:'streak90',icon:'🔱',name:'Relentless',desc:'90-day streak',cat:'streak',tier:'epic'},
            ].sort((a, b) => {
                const aU = (data.achievements||[]).includes(a.id) ? 0 : 1;
                const bU = (data.achievements||[]).includes(b.id) ? 0 : 1;
                return aU - bU;
            }).map(a => {
                const unlocked = (data.achievements||[]).includes(a.id);
                const tierLabel = unlocked && a.tier !== 'common' ? `<span class="ach-tier-label">${a.tier}</span>` : '';
                return `<div class="ach-item ${unlocked?'unlocked':''}" data-cat="${a.cat}" data-tier="${a.tier}">
                  <span class="ach-icon">${unlocked ? a.icon : '🔒'}</span>
                  <span class="ach-name">${a.name}</span>
                  <span class="ach-desc">${a.desc}</span>${tierLabel}</div>`;
              }).join('')}
          </div>
        </div>
      </details>

      <!-- ─── DSA Progress (collapsed) ─── -->
      <details class="db-collapse">
        <summary class="db-collapse-summary">${ico.zap} DSA Practice Progress</summary>
        <div class="db-collapse-body">
        ${(() => {
          const dsaProg = JSON.parse(localStorage.getItem('ml4-dsa') || '{}');
          const dsaAll = typeof getAllDSAProblems === 'function' ? getAllDSAProblems() : (typeof DSA_PROBLEMS !== 'undefined' ? DSA_PROBLEMS : []);
          const dsaTotal = dsaAll.length;
          const dsaSolved = Object.values(dsaProg).filter(p => p.solved).length;
          const dsaAttempted = Object.keys(dsaProg).filter(k => dsaProg[k].code).length;
          const dsaPct = dsaTotal > 0 ? Math.round(dsaSolved / dsaTotal * 100) : 0;
          const cats = {};
          dsaAll.forEach(p => {
            if (!cats[p.category]) cats[p.category] = { total: 0, solved: 0 };
            cats[p.category].total++;
            if (dsaProg[p.id]?.solved) cats[p.category].solved++;
          });
          return '<div class="db-dsa-stats">' +
            '<div class="db-stat-row"><span class="db-stat-icon">' + ico.check + '</span><span class="db-stat-label">Solved</span><span class="db-stat-value">' + dsaSolved + ' / ' + dsaTotal + '</span></div>' +
            '<div class="db-stat-row"><span class="db-stat-icon">' + ico.target + '</span><span class="db-stat-label">Complete</span><span class="db-stat-value">' + dsaPct + '%</span></div>' +
            '<div class="db-stat-row"><span class="db-stat-icon">' + ico.pen + '</span><span class="db-stat-label">Attempted</span><span class="db-stat-value">' + dsaAttempted + '</span></div>' +
            '<div class="db-stat-row"><span class="db-stat-icon">' + ico.clock + '</span><span class="db-stat-label">Remaining</span><span class="db-stat-value">' + (dsaTotal - dsaSolved) + '</span></div>' +
          '</div>' +
          '<div class="dsa-cat-grid" style="margin-top:16px;">' +
            Object.entries(cats).map(([cat, d]) => {
              const pctCat = d.total > 0 ? Math.round(d.solved/d.total*100) : 0;
              return '<div class="dsa-cat-card">' +
                '<div class="dsa-cat-card-head"><span class="dsa-cat-card-name">' + cat + '</span><span class="dsa-cat-card-count">' + d.solved + '/' + d.total + '</span></div>' +
                '<div class="dsa-cat-card-bar"><div class="dsa-cat-card-fill" style="width:' + pctCat + '%"></div></div>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<button class="db-btn db-btn--accent" onclick="showDSAPractice()" style="margin-top:14px;">' + ico.zap + ' Open DSA Practice</button>';
        })()}
        </div>
      </details>

      <!-- ─── Backup & Restore (collapsed) ─── -->
      <details class="db-collapse">
        <summary class="db-collapse-summary">${ico.download} Backup & Restore</summary>
        <div class="db-collapse-body">
          <p class="db-collapse-desc">Export your full progress as JSON. Useful for backups or syncing to another device.</p>
          <div class="db-action-row">
            <button class="db-btn db-btn--accent" onclick="exportUserData()">${ico.download} Export Data</button>
            <button class="db-btn" onclick="triggerImportData()">${ico.upload} Import</button>
            <input type="file" id="dashImportFile" accept=".json,application/json" style="display:none;" onchange="handleImportData(event)">
            <span class="db-action-hint">Import replaces all current data.</span>
          </div>
        </div>
      </details>

      <!-- ─── Danger Zone (collapsed) ─── -->
      <details class="db-collapse db-collapse--danger">
        <summary class="db-collapse-summary db-collapse-summary--danger">${ico.trash} Danger Zone</summary>
        <div class="db-collapse-body">
          <p class="db-collapse-desc">Reset parts of your data independently.</p>
          <div class="db-action-row">
            <button class="db-danger-btn" onclick="resetAppData()">${ico.trash} Reset Progress</button>
            <button class="db-danger-btn" style="background:#06b6d4;" onclick="resetQuizData()">${ico.target} Reset Quizzes</button>
            <button class="db-danger-btn" style="background:#8b5cf6;" onclick="deleteAllComments()">${ico.pen} Delete Notes</button>
            <button class="db-danger-btn" style="background:#f59e0b;color:#1a1a2e;" onclick="deleteAllHighlights()">${ico.palette} Delete Highlights</button>
          </div>
        </div>
      </details>

    </div>`;
  document.getElementById('contentWrapper').scrollTop = 0;
  // Animate ring and XP bar
  const _offset = offset, _xpProg = xpProgress;
  setTimeout(() => {
    const ring = document.getElementById('progressRing');
    if (ring) ring.style.strokeDashoffset = _offset;
    const xpFill = document.getElementById('dashXpFill');
    if (xpFill) xpFill.style.width = _xpProg + '%';
  }, 100);
}

// ─── Backup & Restore: export / import all user data as JSON ───
// Covers: progress, scores, XP, study time, DSA code, notes, highlights, custom problems, preferences
const ML4_STORAGE_KEYS = [
  'ml4-read', 'ml4-quiz-scores', 'ml4-quiz-history', 'ml4-chapter-track',
  'ml4-xp', 'ml4-study', 'ml4-goals', 'ml4-comments', 'ml4-highlights',
  'ml4-dsa', 'ml4-dsa-custom',
  'ml4-theme', 'ml4-fontsize', 'ml4-interactive', 'ml4-sidebar'
];

function exportUserData() {
  const data = {};
  ML4_STORAGE_KEYS.forEach(key => {
    const v = localStorage.getItem(key);
    if (v !== null) data[key] = v; // raw stringified JSON; restoring is byte-identical
  });
  const exportObj = {
    app: 'ML Study Notes',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: data,
  };
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `ml-study-notes-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (typeof showToast === 'function') {
    showToast('Exported!', Object.keys(data).length + ' data sets saved', '\u2913');
  }
}

function triggerImportData() {
  const input = document.getElementById('dashImportFile');
  if (input) input.click();
}

function handleImportData(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const obj = JSON.parse(e.target.result);
      if (!obj || !obj.data || obj.app !== 'ML Study Notes') {
        alert('That file does not look like an ML Study Notes backup. Please pick a valid backup JSON.');
        return;
      }
      const importedKeys = Object.keys(obj.data).filter(k => k.startsWith('ml4-'));
      if (importedKeys.length === 0) {
        alert('Backup file contained no recognizable data.');
        return;
      }
      const exportedAt = obj.exportedAt
        ? new Date(obj.exportedAt).toLocaleString()
        : 'unknown date';
      const confirmed = confirm(
        '⚠️ IMPORT BACKUP?\n\n' +
        'This will REPLACE all your current progress with ' + importedKeys.length + ' data sets from the backup file.\n\n' +
        'Backup exported: ' + exportedAt + '\n\n' +
        'Your current progress will be permanently overwritten.\n\nContinue?'
      );
      if (!confirmed) return;

      // Clear existing ml4-* keys, then restore from backup
      Object.keys(localStorage).filter(k => k.startsWith('ml4-')).forEach(k => localStorage.removeItem(k));
      importedKeys.forEach(k => {
        localStorage.setItem(k, obj.data[k]);
      });
      alert('Successfully imported ' + importedKeys.length + ' data sets. Reloading the app to apply…');
      window.location.reload();
    } catch (err) {
      alert('Failed to import backup: ' + err.message);
    } finally {
      // Reset so the same file can be re-selected later
      event.target.value = '';
    }
  };
  reader.onerror = () => alert('Failed to read the file.');
  reader.readAsText(file);
}

function resetAppData() {
  const confirmed = confirm('⚠️ RESET ALL DATA?\n\nThis will permanently delete:\n• All reading progress\n• All quiz scores\n• XP, level, and streak\n• All achievements\n• Study time and chapter tracking\n\n(Your comments, highlights, and preferences like theme/font/sidebar will NOT be deleted)\n\nThis action CANNOT be undone.\n\nAre you sure?');
  if (!confirmed) return;
  const doubleConfirm = confirm('Are you REALLY sure?\nAll progress will be lost forever.');
  if (!doubleConfirm) return;
  // Preserve user preferences and user-authored content; wipe only progress/gamification data
  const preserve = new Set([
    'ml4-comments', 'ml4-highlights',
    'ml4-sidebar', 'ml4-fontsize', 'ml4-theme', 'ml4-interactive',
    'ml4-dsa-view', 'ml4-dsa-collapsed', 'ml4-dsa-custom',
    'ml4-migration-content-v1',
  ]);
  Object.keys(localStorage).filter(k => k.startsWith('ml4') && !preserve.has(k)).forEach(k => localStorage.removeItem(k));
  readChapters = {};
  // Stop timer if running
  if (timerRunning) { clearInterval(timerInterval); timerRunning = false; timerSeconds = 0;
    document.getElementById('timerDisplay').textContent = '▶ Start';
    document.getElementById('studyTimer').classList.remove('running');
  }
  showToast('🗑️ Data Reset', 'All progress has been cleared', '⚠️');
  renderSidebar();
  showDashboard();
}

// Load a chapter from the dashboard, then pop its quiz. Used by the Retake
// button in the Chapter Details table so users can retest a single chapter
// without losing the surrounding read/DSA/XP state.
async function retakeQuiz(file) {
  const idx = chapters.findIndex(c => c.file === file);
  if (idx < 0) return;
  if (typeof loadChapter === 'function') {
    await loadChapter(idx);
  }
  // Small delay so marked/KaTeX/hljs finish painting before the modal overlays
  setTimeout(() => {
    if (typeof startQuiz === 'function') startQuiz(file);
  }, 300);
}

// Clear only the quiz-related stores. Leaves read status, DSA progress,
// highlights, comments, XP, and everything else untouched.
function resetQuizData() {
  const scores = JSON.parse(localStorage.getItem('ml4-quiz-scores') || '{}');
  const history = JSON.parse(localStorage.getItem('ml4-quiz-history') || '{}');
  const chaptersTaken = Object.keys(scores).length;
  const totalAttempts = Object.values(history).reduce((s, h) => s + (h && h.attempts ? h.attempts : 0), 0);
  const summary = chaptersTaken > 0
    ? `\n\n${chaptersTaken} chapter${chaptersTaken === 1 ? '' : 's'} with quiz scores, ${totalAttempts} total attempt${totalAttempts === 1 ? '' : 's'}.`
    : '\n\nNo quiz data found.';
  const confirmed = confirm('Reset all quiz scores and attempt history?' + summary + '\n\nReading progress, DSA solutions, XP, comments, and highlights are NOT affected.\n\nThis cannot be undone.');
  if (!confirmed) return;
  localStorage.removeItem('ml4-quiz-scores');
  localStorage.removeItem('ml4-quiz-history');
  showToast('📝 Quizzes Reset', 'Scores and attempt history cleared', '⚠️');
  showDashboard();
}

const MOTIVATION_QUOTES = [
  // ── Chinese Proverbs ──
  { q: "A journey of a thousand miles begins with a single step.", a: "Lao Tzu (Chinese Proverb)" },
  { q: "The best time to plant a tree was 20 years ago. The second best time is now.", a: "Chinese Proverb" },
  { q: "Be not afraid of going slowly, be afraid only of standing still.", a: "Chinese Proverb" },
  { q: "Learning is a treasure that will follow its owner everywhere.", a: "Chinese Proverb" },
  { q: "Fall down seven times, stand up eight.", a: "Chinese Proverb" },
  { q: "A gem cannot be polished without friction, nor a person perfected without trials.", a: "Chinese Proverb" },
  { q: "He who asks a question is a fool for five minutes; he who does not ask remains a fool forever.", a: "Chinese Proverb" },
  { q: "Teachers open the door, but you must enter by yourself.", a: "Chinese Proverb" },
  { q: "The person who moves a mountain begins by carrying away small stones.", a: "Chinese Proverb" },
  { q: "A book holds a house of gold.", a: "Chinese Proverb" },
  { q: "To know that you do not know is the best. To think you know when you do not is a disease.", a: "Lao Tzu" },
  { q: "When the winds of change blow, some build walls while others build windmills.", a: "Chinese Proverb" },
  // ── Timeless Wisdom ──
  { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
  { q: "It does not matter how slowly you go as long as you do not stop.", a: "Confucius" },
  { q: "In the middle of difficulty lies opportunity.", a: "Albert Einstein" },
  { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
  { q: "I have not failed. I've just found 10,000 ways that won't work.", a: "Thomas Edison" },
  { q: "Whether you think you can or you think you can't, you're right.", a: "Henry Ford" },
  { q: "The mind is everything. What you think you become.", a: "Buddha" },
  { q: "It always seems impossible until it's done.", a: "Nelson Mandela" },
  { q: "Stay hungry, stay foolish.", a: "Steve Jobs" },
  { q: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", a: "Aristotle" },
  // ── Learning & Education ──
  { q: "An investment in knowledge pays the best interest.", a: "Benjamin Franklin" },
  { q: "What I cannot create, I do not understand.", a: "Richard Feynman" },
  { q: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", a: "Benjamin Franklin" },
  { q: "Education is the most powerful weapon which you can use to change the world.", a: "Nelson Mandela" },
  { q: "I have no special talent. I am only passionately curious.", a: "Albert Einstein" },
  { q: "The mind is not a vessel to be filled, but a fire to be kindled.", a: "Plutarch" },
  { q: "Anyone who stops learning is old, whether at twenty or eighty.", a: "Henry Ford" },
  { q: "The beautiful thing about learning is that nobody can take it away from you.", a: "B.B. King" },
  { q: "Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", a: "Richard Feynman" },
  { q: "I'm still learning.", a: "Michelangelo (at 87)" },
  { q: "The illiterate of the 21st century will not be those who cannot read and write, but those who cannot learn, unlearn, and relearn.", a: "Alvin Toffler" },
  // ── Perseverance & Hard Work ──
  { q: "Genius is one percent inspiration and ninety-nine percent perspiration.", a: "Thomas Edison" },
  { q: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { q: "The way to get started is to quit talking and begin doing.", a: "Walt Disney" },
  { q: "Don't count the days, make the days count.", a: "Muhammad Ali" },
  { q: "You miss 100% of the shots you don't take.", a: "Wayne Gretzky" },
  { q: "If you're going through hell, keep going.", a: "Winston Churchill" },
  { q: "I fear not the man who has practiced 10,000 kicks once, but the man who has practiced one kick 10,000 times.", a: "Bruce Lee" },
  { q: "Discipline is the bridge between goals and accomplishment.", a: "Jim Rohn" },
  { q: "Hard work beats talent when talent doesn't work hard.", a: "Tim Notke" },
  { q: "There is no substitute for hard work.", a: "Thomas Edison" },
  { q: "Luck is what happens when preparation meets opportunity.", a: "Seneca" },
  { q: "Continuous improvement is better than delayed perfection.", a: "Mark Twain" },
  { q: "You don't have to be great to start, but you have to start to be great.", a: "Zig Ziglar" },
  // ── Tech & Programming ──
  { q: "Talk is cheap. Show me the code.", a: "Linus Torvalds" },
  { q: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", a: "Martin Fowler" },
  { q: "Simplicity is the ultimate sophistication.", a: "Leonardo da Vinci" },
  { q: "Make it work, make it right, make it fast.", a: "Kent Beck" },
  { q: "Premature optimization is the root of all evil.", a: "Donald Knuth" },
  { q: "Clean code always looks like it was written by someone who cares.", a: "Robert C. Martin" },
  { q: "First, solve the problem. Then, write the code.", a: "John Johnson" },
  { q: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.", a: "Antoine de Saint-Exupéry" },
  { q: "Done is better than perfect.", a: "Sheryl Sandberg" },
  { q: "Everything should be made as simple as possible, but no simpler.", a: "Albert Einstein" },
  // ── AI & Data ──
  { q: "AI is the new electricity.", a: "Andrew Ng" },
  { q: "All models are wrong, but some are useful.", a: "George Box" },
  { q: "The goal is to turn data into information, and information into insight.", a: "Carly Fiorina" },
  { q: "A breakthrough in machine learning would be worth ten Microsofts.", a: "Bill Gates" },
  { q: "The goal of machine learning is to generalize beyond the training data.", a: "Pedro Domingos" },
  // ── Mindset & Courage ──
  { q: "Your time is limited, don't waste it living someone else's life.", a: "Steve Jobs" },
  { q: "Imagination is more important than knowledge.", a: "Albert Einstein" },
  { q: "The measure of intelligence is the ability to change.", a: "Albert Einstein" },
  { q: "Life is 10% what happens to you and 90% how you react to it.", a: "Charles R. Swindoll" },
  { q: "Do what you can, with what you have, where you are.", a: "Theodore Roosevelt" },
  { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt" },
  { q: "Innovation distinguishes between a leader and a follower.", a: "Steve Jobs" },
  { q: "Knowing is not enough; we must apply. Willing is not enough; we must do.", a: "Goethe" },
  { q: "The only impossible journey is the one you never begin.", a: "Tony Robbins" },
  { q: "Great things never came from comfort zones.", a: "Unknown" },
  { q: "Don't let what you cannot do interfere with what you can do.", a: "John Wooden" },
  { q: "Creativity is intelligence having fun.", a: "Albert Einstein" },
  { q: "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.", a: "Winston Churchill" },
  { q: "What gets measured gets managed.", a: "Peter Drucker" },
  { q: "Every master was once a disaster.", a: "T. Harv Eker" },
  { q: "It is not the strongest that survive, nor the most intelligent, but the one most responsive to change.", a: "Charles Darwin" },
  // ── Short & Powerful ──
  { q: "If I have seen further, it is by standing on the shoulders of giants.", a: "Isaac Newton" },
  { q: "Small daily improvements over time lead to stunning results.", a: "Robin Sharma" },
  { q: "Strive for progress, not perfection.", a: "Unknown" },
  { q: "One day or day one. You decide.", a: "Unknown" },
  { q: "Do something today that your future self will thank you for.", a: "Unknown" },
  { q: "To teach is to learn twice.", a: "Joseph Joubert" },
  { q: "Quality is not an act, it is a habit.", a: "Aristotle" },
  { q: "The best way to predict the future is to invent it.", a: "Alan Kay" },
  { q: "Action is the foundational key to all success.", a: "Pablo Picasso" },
  { q: "Doubt kills more dreams than failure ever will.", a: "Suzy Kassem" },
  { q: "A goal without a plan is just a wish.", a: "Antoine de Saint-Exupéry" },
  { q: "Any sufficiently advanced technology is indistinguishable from magic.", a: "Arthur C. Clarke" },
  { q: "Learn from the mistakes of others. You can't live long enough to make them all yourself.", a: "Eleanor Roosevelt" },
  { q: "The expert in anything was once a beginner.", a: "Helen Hayes" },
  { q: "When something is important enough, you do it even if the odds are not in your favor.", a: "Elon Musk" },
  { q: "With time and patience, the mulberry leaf becomes a silk gown.", a: "Chinese Proverb" },
  { q: "A wise man makes his own decisions; an ignorant man follows public opinion.", a: "Chinese Proverb" },
  { q: "Give a man a fish and you feed him for a day. Teach him to fish and you feed him for a lifetime.", a: "Chinese Proverb" },
  { q: "I can accept failure, everyone fails at something. But I can't accept not trying.", a: "Michael Jordan" },
  { q: "Great minds discuss ideas; average minds discuss events; small minds discuss people.", a: "Eleanor Roosevelt" },
  { q: "What we know is a drop, what we don't know is an ocean.", a: "Isaac Newton" },
  { q: "The only true wisdom is in knowing you know nothing.", a: "Socrates" },
  { q: "I find that the harder I work, the more luck I seem to have.", a: "Thomas Jefferson" },
];

let motiIndex = 0;

function showMotivation() {
  exitFocusMode();
  trackChapterClose();
  currentIndex = -1;
  currentPage = 'motivation';
  renderSidebar();
  closeSidebar();
  document.getElementById('tocPanel').classList.remove('visible');
  document.getElementById('breadcrumb').textContent = '💪 Daily Motivation';
  document.getElementById('readBtn').style.display = 'none';

  document.getElementById('focusBtn').style.display = 'none';
  const el = document.getElementById('readingTime'); if (el) el.remove();
  motiIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
  renderMotivation();
}

function renderMotivation() {
  const quote = MOTIVATION_QUOTES[motiIndex];
  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view');
  contentEl.innerHTML = `
    <div class="moti-container">
      <div class="moti-card">
        <div style="font-size:48px;margin-bottom:20px;">✨</div>
        <div class="moti-quote" id="motiQuote">"${quote.q}"</div>
        <div class="moti-author" id="motiAuthor">— ${quote.a}</div>
      </div>
      <div class="moti-progress"><div class="moti-progress-fill" style="width:${((motiIndex+1)/MOTIVATION_QUOTES.length)*100}%"></div></div>
      <div class="moti-num">${motiIndex + 1} of ${MOTIVATION_QUOTES.length}</div>
      <div class="moti-nav">
        <button class="moti-btn" onclick="motiPrev()" title="Previous">◀</button>
        <button class="moti-shuffle" onclick="motiRandom()">🔀 Random</button>
        <button class="moti-btn" onclick="motiNext()" title="Next">▶</button>
      </div>
      <div style="margin-top:32px;">
        <button onclick="showGoals()" style="padding:10px 28px;border:1px solid var(--border);border-radius:12px;background:linear-gradient(135deg,color-mix(in srgb,#6366f1 8%,var(--bg)),color-mix(in srgb,#a78bfa 6%,var(--bg)));color:var(--text);cursor:pointer;font-size:14px;font-weight:600;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px;" onmouseover="this.style.borderColor='var(--accent)';this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px var(--shadow)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform='none';this.style.boxShadow='none'">🎯 Set Goals & Timetable</button>
      </div>
    </div>`;
  document.getElementById('contentWrapper').scrollTop = 0;
}

function motiNext() {
  motiIndex = (motiIndex + 1) % MOTIVATION_QUOTES.length;
  animateMotivation();
}
function motiPrev() {
  motiIndex = (motiIndex - 1 + MOTIVATION_QUOTES.length) % MOTIVATION_QUOTES.length;
  animateMotivation();
}
function motiRandom() {
  motiIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
  animateMotivation();
}

// ─── Home page quote refresh ───
// Smoothly fades out the current quote and fades in a new random one
function dashRefreshQuote() {
  if (typeof MOTIVATION_QUOTES === 'undefined' || MOTIVATION_QUOTES.length === 0) return;
  const textEl = document.getElementById('welcomeQuoteText');
  const authorEl = document.getElementById('welcomeQuoteAuthor');
  if (!textEl || !authorEl) return;

  // Pick a fresh quote (different from current if possible)
  let idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
  if (MOTIVATION_QUOTES.length > 1) {
    const currentText = textEl.textContent;
    let attempts = 0;
    while (currentText.includes(MOTIVATION_QUOTES[idx].q) && attempts < 5) {
      idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
      attempts++;
    }
  }
  const quote = MOTIVATION_QUOTES[idx];

  textEl.style.opacity = 0;
  authorEl.style.opacity = 0;
  setTimeout(() => {
    textEl.innerHTML = '\u201C' + escapeHTML(quote.q) + '\u201D';
    authorEl.innerHTML = '\u2014 ' + escapeHTML(quote.a);
    textEl.style.opacity = 1;
    authorEl.style.opacity = 1;
  }, 180);
}
function animateMotivation() {
  const q = document.getElementById('motiQuote');
  const a = document.getElementById('motiAuthor');
  if (!q) return renderMotivation();
  q.style.animation = 'none'; a.style.animation = 'none';
  void q.offsetHeight; // reflow
  const quote = MOTIVATION_QUOTES[motiIndex];
  q.textContent = `"${quote.q}"`;
  a.textContent = `— ${quote.a}`;
  q.style.animation = 'motiFadeIn 0.5s ease';
  a.style.animation = 'motiFadeIn 0.5s ease 0.15s both';
  document.querySelector('.moti-num').textContent = `${motiIndex + 1} of ${MOTIVATION_QUOTES.length}`;
  document.querySelector('.moti-progress-fill').style.width = `${((motiIndex+1)/MOTIVATION_QUOTES.length)*100}%`;
}

// ─── Goals & Timetable Page ───
function getGoalsData() {
  return JSON.parse(localStorage.getItem('ml4-goals') || '{"goals":[],"timetable":[]}');
}
function saveGoalsData(data) {
  localStorage.setItem('ml4-goals', JSON.stringify(data));
}

let goalsShowForm = false;
let goalsShowTTForm = false;
let goalsShowCompleted = false;

function showGoals() {
  exitFocusMode();
  trackChapterClose();
  currentIndex = -1;
  currentPage = 'goals';
  renderSidebar();
  closeSidebar();
  document.getElementById('tocPanel').classList.remove('visible');
  document.getElementById('breadcrumb').textContent = '🎯 Goals & Timetable';
  document.getElementById('readBtn').style.display = 'none';

  document.getElementById('focusBtn').style.display = 'none';
  pushHash('goals');
  const el = document.getElementById('readingTime'); if (el) el.remove();
  renderGoalsPage();
}

function renderGoalsPage() {
  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view');
  const data = getGoalsData();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const active = data.goals.filter(g => !g.completed).sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });
  const completed = data.goals.filter(g => g.completed);
  const overdue = active.filter(g => g.deadline && g.deadline < todayStr).length;
  const dueThisWeek = active.filter(g => {
    if (!g.deadline) return false;
    const d = new Date(g.deadline);
    const weekFromNow = new Date(now); weekFromNow.setDate(weekFromNow.getDate() + 7);
    return d >= now && d <= weekFromNow;
  }).length;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = [
    { label: 'Morning', key: 'morning', range: '6am–12pm' },
    { label: 'Afternoon', key: 'afternoon', range: '12pm–5pm' },
    { label: 'Evening', key: 'evening', range: '5pm–9pm' },
    { label: 'Night', key: 'night', range: '9pm–12am' },
  ];
  const todayDay = days[(now.getDay() + 6) % 7]; // Convert Sun=0 to Mon=0

  const ttColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  function deadlineBadge(deadline, completed) {
    if (!deadline) return '';
    const d = new Date(deadline + 'T00:00:00');
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    let cls = 'goal-deadline-badge';
    let text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    // Completed goals never count as overdue — they're already done, so the
    // urgency styling is irrelevant and misleading.
    if (completed) {
      cls += ' done';
      return `<span class="${cls}">📅 ${text}</span>`;
    }
    if (diff < 0) { cls += ' overdue'; text += ' (overdue)'; }
    else if (diff === 0) { cls += ' soon'; text += ' (today)'; }
    else if (diff <= 3) { cls += ' soon'; text += ` (${diff}d left)`; }
    else { text += ` (${diff}d left)`; }
    return `<span class="${cls}">📅 ${text}</span>`;
  }

  function renderGoalCard(g) {
    return `<div class="goal-card ${g.completed ? 'done' : ''}">
      <div class="goal-check" onclick="toggleGoalDone('${g.id}')" title="${g.completed ? 'Mark incomplete' : 'Mark complete'}">${g.completed ? '✓' : ''}</div>
      <div class="goal-body">
        <div class="goal-title">${escapeHtml(g.title)}</div>
        ${g.notes ? `<div class="goal-notes">${escapeHtml(g.notes)}</div>` : ''}
        <div class="goal-meta">
          <span class="goal-priority-badge ${g.priority}">${g.priority}</span>
          ${deadlineBadge(g.deadline, g.completed)}
        </div>
      </div>
      <button class="goal-delete-btn" onclick="deleteGoal('${g.id}')" title="Delete">×</button>
    </div>`;
  }

  const goalFormHtml = goalsShowForm ? `
    <div class="goal-form">
      <div class="goal-form-row">
        <input class="goal-input" id="goalTitle" placeholder="What's your goal?" autofocus>
      </div>
      <div class="goal-form-row">
        <input class="goal-input" id="goalNotes" placeholder="Notes (optional)">
      </div>
      <div class="goal-form-row">
        <div>
          <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Deadline</label>
          <input class="goal-input" id="goalDeadline" type="date" min="${todayStr}">
        </div>
        <div>
          <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:4px;">Priority</label>
          <select class="goal-input goal-select" id="goalPriority">
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <div class="goal-form-actions">
        <button class="goal-save-btn" onclick="addGoal()">Add Goal</button>
        <button class="goal-cancel-btn" onclick="goalsShowForm=false;renderGoalsPage();">Cancel</button>
      </div>
    </div>` : '';

  const dayLabels = { Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S' };
  const ttFormHtml = goalsShowTTForm ? `
    <div class="tt-add-form">
      <div class="tt-add-row">
        <div style="flex:1;min-width:120px;">
          <label>Activity</label>
          <input class="goal-input" id="ttActivity" placeholder="e.g. ML Chapter 5" style="margin-top:4px;">
        </div>
        <div>
          <label>Time</label>
          <select class="goal-input goal-select" id="ttTime" style="margin-top:4px;">
            ${timeSlots.map(t => `<option value="${t.key}">${t.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Color</label>
          <div style="display:flex;gap:4px;margin-top:4px;" id="ttColorPicker">
            ${ttColors.map((c, i) => `<div class="tt-color-swatch ${i === 0 ? 'active' : ''}" style="background:${c};" onclick="document.querySelectorAll('.tt-color-swatch').forEach(s=>s.classList.remove('active'));this.classList.add('active');this.dataset.picked='1';" data-color="${c}"></div>`).join('')}
          </div>
        </div>
      </div>
      <div style="margin-top:12px;">
        <label style="font-size:11px;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:0.3px;">Days</label>
        <div style="display:flex;gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap;">
          ${days.map(d => `<button type="button" class="tt-day-toggle ${d === todayDay ? 'active' : ''}" data-day="${d}" onclick="this.classList.toggle('active')">${dayLabels[d]}</button>`).join('')}
          <span style="width:1px;height:20px;background:var(--border);margin:0 4px;"></span>
          <button type="button" class="tt-quick-sel" onclick="document.querySelectorAll('.tt-day-toggle').forEach((b,i)=>{if(i<5)b.classList.add('active');else b.classList.remove('active');})">Weekdays</button>
          <button type="button" class="tt-quick-sel" onclick="document.querySelectorAll('.tt-day-toggle').forEach(b=>b.classList.add('active'))">Every day</button>
          <button type="button" class="tt-quick-sel" onclick="document.querySelectorAll('.tt-day-toggle').forEach(b=>b.classList.remove('active'))">Clear</button>
        </div>
      </div>
      <div class="goal-form-actions" style="margin-top:14px;">
        <button class="goal-save-btn" onclick="addTTSlot()">Add to Schedule</button>
        <button class="goal-cancel-btn" onclick="goalsShowTTForm=false;renderGoalsPage();">Cancel</button>
      </div>
    </div>` : '';

  // Build timetable grid cells
  let ttGridHtml = `<div class="tt-corner"></div>`;
  ttGridHtml += days.map(d => `<div class="tt-day-header ${d === todayDay ? 'today' : ''}">${d}</div>`).join('');

  timeSlots.forEach(ts => {
    ttGridHtml += `<div class="tt-time-label">${ts.label}<br><span style="font-size:9px;opacity:0.7;">${ts.range}</span></div>`;
    days.forEach(d => {
      const slots = (data.timetable || []).filter(s => s.day === d && s.time === ts.key);
      const slotsHtml = slots.map(s => {
        const isRecurring = s.groupId && (data.timetable || []).filter(t => t.groupId === s.groupId).length > 1;
        return `<div class="tt-slot" style="background:${s.color}22;color:${s.color};border-left:3px solid ${s.color};">
          ${escapeHtml(s.activity)}${isRecurring ? '<span class="tt-recur-badge">🔁 weekly</span>' : ''}
          <button class="tt-slot-del" onclick="event.stopPropagation();deleteTTSlot('${s.id}','${s.groupId || ''}');" title="${isRecurring ? 'Remove from all days' : 'Remove'}">×</button>
        </div>`;
      }).join('');
      ttGridHtml += `<div class="tt-cell" onclick="ttCellClick('${d}','${ts.key}')">${slotsHtml}</div>`;
    });
  });

  contentEl.innerHTML = `
    <div class="goals-container">
      <div class="goals-header">
        <div>
          <h1 style="font-size:26px;border:none;margin-bottom:2px;">🎯 Goals & Timetable</h1>
          <p style="color:var(--text-secondary);font-size:14px;">Set targets, track progress, plan your week</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-shrink:0;">
          <button onclick="showMotivation()" style="padding:6px 14px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);cursor:pointer;font-size:13px;transition:all 0.15s;white-space:nowrap;" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">💪 Motivation</button>
        </div>
      </div>

      <div class="goals-stats">
        <div class="goals-stat">
          <div class="num" style="color:var(--accent);">${active.length}</div>
          <div class="label">Active Goals</div>
        </div>
        <div class="goals-stat">
          <div class="num" style="color:#22c55e;">${completed.length}</div>
          <div class="label">Completed</div>
        </div>
        <div class="goals-stat">
          <div class="num" style="color:#f59e0b;">${dueThisWeek}</div>
          <div class="label">Due This Week</div>
        </div>
        <div class="goals-stat">
          <div class="num" style="color:#ef4444;">${overdue}</div>
          <div class="label">Overdue</div>
        </div>
      </div>

      <div class="goals-section">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h2 class="goals-section-title" style="margin:0;">🎯 Goals</h2>
          ${!goalsShowForm ? `<button class="goal-save-btn" onclick="goalsShowForm=true;renderGoalsPage();setTimeout(()=>{const el=document.getElementById('goalTitle');if(el)el.focus();},100);" style="font-size:13px;padding:8px 18px;">+ Add Goal</button>` : ''}
        </div>
        ${goalFormHtml}
        ${active.length === 0 && completed.length === 0 ? `
          <div class="goals-empty">
            <div class="goals-empty-icon">🎯</div>
            <div style="font-size:16px;font-weight:600;color:var(--heading);margin-bottom:6px;">No goals yet</div>
            <div>Add your first goal to start tracking your progress</div>
          </div>` : ''}
        ${active.map(g => renderGoalCard(g)).join('')}
        ${completed.length > 0 ? `
          <div class="completed-toggle" onclick="goalsShowCompleted=!goalsShowCompleted;renderGoalsPage();">
            <span style="transition:transform 0.2s;display:inline-block;transform:rotate(${goalsShowCompleted ? '90deg' : '0deg'});">▶</span>
            Completed (${completed.length})
          </div>
          ${goalsShowCompleted ? completed.map(g => renderGoalCard(g)).join('') : ''}
        ` : ''}
      </div>

      <div class="goals-section">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h2 class="goals-section-title" style="margin:0;">📅 Weekly Timetable</h2>
          ${!goalsShowTTForm ? `<button class="goal-save-btn" onclick="goalsShowTTForm=true;renderGoalsPage();setTimeout(()=>{const el=document.getElementById('ttActivity');if(el)el.focus();},100);" style="font-size:13px;padding:8px 18px;">+ Add Slot</button>` : ''}
        </div>
        ${ttFormHtml}
        <div class="tt-container">
          <div class="tt-grid">${ttGridHtml}</div>
        </div>
        ${(data.timetable || []).length === 0 ? `<p style="text-align:center;color:var(--text-secondary);font-size:13px;margin-top:12px;">Click any cell or use "+ Add Slot" to plan your week</p>` : ''}
      </div>
    </div>`;

  document.getElementById('contentWrapper').scrollTop = 0;
}

function addGoal() {
  const title = document.getElementById('goalTitle').value.trim();
  if (!title) { document.getElementById('goalTitle').style.borderColor = '#ef4444'; return; }
  const deadline = document.getElementById('goalDeadline').value || '';
  const priority = document.getElementById('goalPriority').value;
  const notes = document.getElementById('goalNotes').value.trim();
  const data = getGoalsData();
  data.goals.push({
    id: 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    title, notes, deadline, priority, completed: false, createdAt: new Date().toISOString()
  });
  saveGoalsData(data);
  goalsShowForm = false;
  renderGoalsPage();
}

function toggleGoalDone(id) {
  const data = getGoalsData();
  const goal = data.goals.find(g => g.id === id);
  if (goal) {
    goal.completed = !goal.completed;
    if (goal.completed) goal.completedAt = new Date().toISOString();
    else delete goal.completedAt;
    saveGoalsData(data);
    renderGoalsPage();
  }
}

function deleteGoal(id) {
  const data = getGoalsData();
  data.goals = data.goals.filter(g => g.id !== id);
  saveGoalsData(data);
  renderGoalsPage();
}

function addTTSlot() {
  const activity = document.getElementById('ttActivity').value.trim();
  if (!activity) { document.getElementById('ttActivity').style.borderColor = '#ef4444'; return; }
  const selectedDays = [...document.querySelectorAll('.tt-day-toggle.active')].map(b => b.dataset.day);
  if (selectedDays.length === 0) return;
  const time = document.getElementById('ttTime').value;
  const activeSwatch = document.querySelector('.tt-color-swatch.active');
  const color = activeSwatch ? activeSwatch.dataset.color : '#6366f1';
  const data = getGoalsData();
  if (!data.timetable) data.timetable = [];
  const groupId = selectedDays.length > 1 ? 'grp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) : null;
  selectedDays.forEach(day => {
    data.timetable.push({
      id: 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      activity, day, time, color,
      ...(groupId ? { groupId } : {})
    });
  });
  saveGoalsData(data);
  goalsShowTTForm = false;
  renderGoalsPage();
}

function deleteTTSlot(id, groupId) {
  const data = getGoalsData();
  if (groupId) {
    data.timetable = (data.timetable || []).filter(s => s.groupId !== groupId);
  } else {
    data.timetable = (data.timetable || []).filter(s => s.id !== id);
  }
  saveGoalsData(data);
  renderGoalsPage();
}

function ttCellClick(day, time) {
  goalsShowTTForm = true;
  renderGoalsPage();
  setTimeout(() => {
    document.querySelectorAll('.tt-day-toggle').forEach(b => {
      b.classList.toggle('active', b.dataset.day === day);
    });
    const timeEl = document.getElementById('ttTime');
    const actEl = document.getElementById('ttActivity');
    if (timeEl) timeEl.value = time;
    if (actEl) actEl.focus();
  }, 100);
}

