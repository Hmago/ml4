// ═══════════════════════════════════════════════════════════
// ═══  pages.js — welcome, dashboard, motivation, goals     ═══
// ═══════════════════════════════════════════════════════════

// ─── Animated Welcome Dashboard ───
function renderWelcome() {
  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view');
  currentPage = 'welcome';
  currentIndex = -1;
  pushHash('home');
  document.getElementById('breadcrumb').textContent = '';
  document.getElementById('readBtn').style.display = 'none';

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
        <button onclick="showMotivation()" title="Daily motivation">💪 Motivation</button>
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


// ─── Dashboard Page ───
function showDashboard() {
  trackChapterClose();
  currentIndex = -1;
  currentPage = 'dashboard';
  pushHash('dashboard');
  renderSidebar();
  closeSidebar();
  document.getElementById('tocPanel').classList.remove('visible');
  document.getElementById('breadcrumb').textContent = '📊 Dashboard';
  document.getElementById('readBtn').style.display = 'none';
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
    'content/04_core_concepts.md': 180,
    'content/05_data_preprocessing.md': 55,
    'content/06_supervised_learning.md': 150,
    'content/07_unsupervised_learning.md': 165,
    'content/08_reinforcement_learning.md': 70,
    'content/09_key_algorithms.md': 135,
    'content/10_neural_networks.md': 135,
    'content/11_model_evaluation.md': 60,
    'content/12_deep_learning.md': 200,
    'content/13_llm.md': 540,
    'content/14_design_fundamentals.md': 285,
    'content/15_interview_questions.md': 215,
    'content/16_llm_interview_questions.md': 445,
    'content/17_ml_system_design.md': 225,
    'content/behavioral_interview.md': 145,
    'content/practical_ml.md': 195,
    'content/practical_ml.ipynb': 195,
    'content/staying_relevant_ai_era.md': 75,
    'README.md': 30,
    'content/18_dsa_trees_graphs.md': 340,
    'content/19_google_ml_ecosystem.md': 160,
    'content/20_Modern System Design.md': 160,
    'content/20_google_top10_ml_interview.md': 490,
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
  const ringR = 58;
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

  contentEl.innerHTML = `
    <div style="max-width:740px;margin:0 auto;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:8px;">
        <div>
          <h1 style="font-size:26px;border:none;margin-bottom:2px;">📊 Your Learning Dashboard</h1>
          <p style="color:var(--text-secondary);font-size:14px;">Track your progress, scores, and study time</p>
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-shrink:0;">
          <button onclick="showMotivation()" style="padding:6px 14px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);cursor:pointer;font-size:13px;transition:all 0.15s;white-space:nowrap;" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">💪 Motivation</button>
          <div class="mode-toggle ${interactiveMode ? 'active' : ''}" onclick="toggleInteractiveMode();" style="cursor:pointer;">
            <span>Interactive</span>
            <div class="mode-switch"></div>
          </div>
        </div>
      </div>

      <div class="dash-hero">
        <div class="progress-ring-wrap" title="Weighted by estimated study time per chapter — a 9h chapter counts more than a 1h chapter.">
          <svg width="150" height="150">
            <defs><linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a78bfa"/></linearGradient></defs>
            <circle class="progress-ring-bg" cx="75" cy="75" r="58"/>
            <circle class="progress-ring-fill" cx="75" cy="75" r="58" stroke-dasharray="${2*Math.PI*58}" stroke-dashoffset="${2*Math.PI*58}" id="progressRing"/>
            <g class="progress-ring-text" style="transform-origin:75px 75px;">
              <text x="75" y="68" text-anchor="middle" fill="var(--heading)" font-size="34" font-weight="800">${pct}%</text>
              <text x="75" y="90" text-anchor="middle" fill="var(--text-secondary)" font-size="11" text-transform="uppercase">complete</text>
            </g>
          </svg>
          <div style="text-align:center;font-size:11px;color:var(--text-secondary);margin-top:4px;">~${doneH}h of ${totalH}h · <span style="opacity:0.7;" title="Weighted by each chapter's estimated study time.">time-weighted</span></div>
        </div>
        <div style="text-align:left;">
          <div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;">Level</div>
          <div style="font-size:40px;font-weight:800;background:linear-gradient(135deg,#6366f1,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1;">${getLevel(data.xp)}</div>
          <div style="font-size:13px;color:var(--text-secondary);margin:6px 0 8px;">${data.xp} XP &middot; ${xpProgress}/100 to next level</div>
          <div class="dash-xp-track" style="width:180px;"><div class="dash-xp-fill" id="dashXpFill" style="width:0%"></div></div>
          <div style="font-size:13px;margin-top:10px;">${data.streak > 0 ? '<span style="background:linear-gradient(135deg,#f97316,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:700;">🔥 '+data.streak+' day streak</span>' : '<span style="color:var(--text-secondary);">Start your streak today!</span>'}</div>
        </div>
      </div>

      <div class="dash-grid">
        <div class="dash-card" title="Raw chapter count — the main ring at the top is weighted by study time."><div class="dash-num">${readCount}<small style="font-size:16px;opacity:0.5;">/${realCh.length}</small></div><div class="dash-label">Chapters Read</div></div>
        <div class="dash-card"><div class="dash-num">${remainH}<small style="font-size:14px;opacity:0.5;">h</small></div><div class="dash-label">Est. Remaining</div></div>
        <div class="dash-card"><div class="dash-num">${studyHrs}<small style="font-size:14px;opacity:0.5;">h</small></div><div class="dash-label">Study Time</div></div>
        <div class="dash-card"><div class="dash-num">${study.sessions||0}</div><div class="dash-label">Sessions</div></div>
        <div class="dash-card"><div class="dash-num">${totalAttempts}</div><div class="dash-label">Quiz Attempts</div></div>
        <div class="dash-card"><div class="dash-num">${avgScore}<small style="font-size:14px;opacity:0.5;">%</small></div><div class="dash-label">Avg Quiz Score</div></div>
        <div class="dash-card"><div class="dash-num">${bestQuiz}<small style="font-size:14px;opacity:0.5;">%</small></div><div class="dash-label">Best Quiz</div></div>
        <div class="dash-card"><div class="dash-num">${passedQuizzes}<small style="font-size:14px;opacity:0.5;">/${totalQuizzes}</small></div><div class="dash-label">Quizzes Passed</div></div>
        <div class="dash-card"><div class="dash-num">${openComments}${resolvedComments > 0 ? '<small style="font-size:14px;opacity:0.5;">+' + resolvedComments + '✓</small>' : ''}</div><div class="dash-label">Notes (open${resolvedComments > 0 ? '+resolved' : ''})</div></div>
        <div class="dash-card"><div class="dash-num">${Object.values(JSON.parse(localStorage.getItem('ml4-highlights')||'{}')).reduce((s,a)=>s+a.length,0)}</div><div class="dash-label">Highlights</div></div>
      </div>

      <div class="dash-timeline">
        <div class="dash-timeline-item"><div class="tl-label">📅 Started</div><div class="tl-value">${startDate}</div></div>
        <div class="dash-timeline-item"><div class="tl-label">🏁 Completion</div><div class="tl-value">${completionDate}</div></div>
        <div class="dash-timeline-item"><div class="tl-label">⏱️ Study Time</div><div class="tl-value">${studyHrs} hours</div></div>
      </div>

      <div class="dash-section">
        <h3>📚 Chapter Details</h3>
        <div style="overflow-x:auto;border:1px solid var(--border);border-radius:12px;">
        <table class="dash-table">
          <thead><tr>
            <th>Chapter</th>
            <th>Status</th>
            <th>Est.</th>
            <th>Started</th>
            <th>Completed</th>
            <th>Time Spent</th>
            <th>Quiz</th>
            <th></th>
          </tr></thead>
          <tbody>
          ${realCh.map(c => {
            const isRead = !!readChapters[c.file];
            const qh = quizHist[c.file];
            const ct = chTrack[c.file] || {};
            const estMin = chapterMinutes[c.file] || 30;
            const estStr = estMin >= 60 ? Math.floor(estMin/60)+'h '+estMin%60+'m' : estMin+'m';
            const timeStr = ct.seconds ? (ct.seconds >= 3600 ? Math.floor(ct.seconds/3600)+'h '+Math.floor((ct.seconds%3600)/60)+'m' : Math.floor(ct.seconds/60)+'m') : '—';
            const startD = ct.startDate ? new Date(ct.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—';
            const compD = ct.completedDate ? new Date(ct.completedDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—';
            const scoreStr = qh ? qh.bestScore+'% <small>('+qh.attempts+'x)</small>' : '';
            return `<tr>
              <td>${isRead ? '✅' : '⬜'} ${c.title}</td>
              <td>${isRead ? '<span class="badge badge-read">Done</span>' : '<span class="badge badge-unread">Todo</span>'}</td>
              <td style="color:var(--text-secondary);">${estStr}</td>
              <td style="color:var(--text-secondary);">${startD}</td>
              <td style="color:var(--text-secondary);">${compD}</td>
              <td style="color:var(--text-secondary);">${timeStr}</td>
              <td>${qh ? '<span class="badge badge-score">'+scoreStr+'</span> <button class="btn-retest-ch" onclick="retakeQuiz(\''+c.file.replace(/'/g,"\\'")+'\')" title="Retake this quiz">↺ Retake</button>' : '<span style="color:var(--text-secondary);">—</span>'}</td>
              <td>${(isRead || qh || ct.seconds) ? `<button class="btn-reset-ch" onclick="resetChapter('${c.file.replace(/'/g,"\\'")}', '${c.title.replace(/'/g,"\\'")}')">↺ Reset</button>` : ''}</td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>
        </div>
      </div>

      <div class="dash-section">
        <h3>🏅 Achievements <small style="font-weight:400;color:var(--text-secondary);">(${(data.achievements||[]).length}/30 unlocked)</small></h3>
        <div class="ach-grid">
          ${[
            // ── Reading (4) ──
            {id:'first_read',icon:'📖',name:'First Steps',desc:'Read 1 chapter',cat:'read',tier:'common'},
            {id:'five_read',icon:'📚',name:'Getting Serious',desc:'Read 5 chapters',cat:'read',tier:'common'},
            {id:'ten_read',icon:'🐛',name:'Bookworm',desc:'Read 10 chapters',cat:'read',tier:'rare'},
            {id:'all_read',icon:'🏛️',name:'Scholar',desc:'Read every chapter',cat:'read',tier:'epic'},
            // ── Streaks (3) ──
            {id:'streak7',icon:'💪',name:'Dedicated',desc:'7-day streak',cat:'streak',tier:'common'},
            {id:'streak14',icon:'⚡',name:'Unstoppable',desc:'14-day streak',cat:'streak',tier:'rare'},
            {id:'streak30',icon:'🛡️',name:'Iron Will',desc:'30-day streak',cat:'streak',tier:'epic'},
            // ── XP & Levels (4) ──
            {id:'xp100',icon:'💎',name:'Centurion',desc:'100 XP',cat:'xp',tier:'common'},
            {id:'xp500',icon:'🏆',name:'XP Hunter',desc:'500 XP',cat:'xp',tier:'rare'},
            {id:'xp1000',icon:'👑',name:'XP Legend',desc:'1000 XP',cat:'xp',tier:'epic'},
            {id:'level10',icon:'🌟',name:'Double Digits',desc:'Level 10',cat:'xp',tier:'rare'},
            // ── Quizzes (4) ──
            {id:'first_quiz',icon:'📝',name:'Quiz Taker',desc:'Complete a quiz',cat:'quiz',tier:'common'},
            {id:'quiz10',icon:'⚔️',name:'Quiz Warrior',desc:'10 quizzes done',cat:'quiz',tier:'rare'},
            {id:'quiz_perfect',icon:'💯',name:'Flawless',desc:'100% on a quiz',cat:'quiz',tier:'epic'},
            {id:'quiz_master',icon:'🧠',name:'Quiz Master',desc:'90%+ on 5 quizzes',cat:'quiz',tier:'epic'},
            // ── Study (3) ──
            {id:'study5h',icon:'🧘',name:'Deep Focus',desc:'5 hours study',cat:'study',tier:'common'},
            {id:'study10h',icon:'🏅',name:'Marathon Learner',desc:'10 hours study',cat:'study',tier:'rare'},
            {id:'study25h',icon:'⛏️',name:'Grinder',desc:'25 hours study',cat:'study',tier:'epic'},
            // ── Notes (1) ──
            {id:'first_note',icon:'🗒️',name:'Note Taker',desc:'Write first note',cat:'note',tier:'common'},
            // ── DSA (1) ──
            {id:'dsa10',icon:'💻',name:'Algorithm Pro',desc:'Solve 10 DSA problems',cat:'dsa',tier:'rare'},
            // ── New additions (v2) ──
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

      <div class="dash-section">
        <h3>💻 DSA Practice Progress</h3>
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
          return '<div class="dash-grid" style="margin-bottom:16px;">' +
            '<div class="dash-card"><div class="dash-num">' + dsaSolved + '<small style="font-size:14px;opacity:0.5;">/' + dsaTotal + '</small></div><div class="dash-label">Problems Solved</div></div>' +
            '<div class="dash-card"><div class="dash-num">' + dsaPct + '<small style="font-size:14px;opacity:0.5;">%</small></div><div class="dash-label">Completion</div></div>' +
            '<div class="dash-card"><div class="dash-num">' + dsaAttempted + '</div><div class="dash-label">Attempted</div></div>' +
            '<div class="dash-card"><div class="dash-num">' + (dsaTotal - dsaSolved) + '</div><div class="dash-label">Remaining</div></div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:12px;">' +
            Object.entries(cats).map(([cat, d]) =>
              '<div style="padding:8px 12px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;">' +
                '<div style="font-size:12px;color:var(--text-secondary);">' + cat + '</div>' +
                '<div style="font-size:16px;font-weight:700;">' + d.solved + '/' + d.total + '</div>' +
                '<div style="height:4px;background:var(--border);border-radius:2px;margin-top:4px;"><div style="height:100%;width:' + (d.total > 0 ? Math.round(d.solved/d.total*100) : 0) + '%;background:var(--accent);border-radius:2px;"></div></div>' +
              '</div>'
            ).join('') +
          '</div>' +
          '<button onclick="showDSAPractice()" style="padding:8px 20px;border:1px solid var(--accent);border-radius:8px;background:var(--accent);color:#fff;cursor:pointer;font-size:14px;">Open DSA Practice &#8594;</button>';
        })()}
      </div>

      <div class="dash-section">
        <h3>💾 Backup &amp; Restore</h3>
        <p style="font-size:14px;color:var(--text-secondary);margin:8px 0 16px;">Export your full progress — chapters read, quiz scores, DSA solutions &amp; code, notes, highlights, study time, settings — as a JSON file. Useful for backups, syncing to another device, or sharing with yourself.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <button onclick="exportUserData()" style="padding:9px 18px;border:1px solid var(--accent);border-radius:8px;background:var(--accent);color:#fff;cursor:pointer;font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:6px;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">&#x2913; Export All Data</button>
          <button onclick="triggerImportData()" style="padding:9px 18px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);cursor:pointer;font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:6px;" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">&#x2912; Import from File&hellip;</button>
          <input type="file" id="dashImportFile" accept=".json,application/json" style="display:none;" onchange="handleImportData(event)">
          <span style="font-size:12px;color:var(--text-secondary);">Importing replaces all current data.</span>
        </div>
      </div>

      <div class="dash-danger-zone">
        <h3>⚠️ Danger Zone</h3>
        <p style="font-size:14px;color:var(--text-secondary);margin:8px 0 16px;">Reset scoped parts of your data. Each button is independent — none of these cascade.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button class="dash-danger-btn" onclick="resetAppData()">🗑️ Reset Progress (keeps comments)</button>
          <button class="dash-danger-btn" onclick="resetQuizData()" style="background:#06b6d4;">📝 Reset Quiz Scores</button>
          <button class="dash-danger-btn" onclick="deleteAllComments()" style="background:#8b5cf6;">💬 Delete All Comments</button>
          <button class="dash-danger-btn" onclick="deleteAllHighlights()" style="background:#f59e0b;color:#1a1a2e;">🖍 Delete All Highlights</button>
        </div>
      </div>
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
  trackChapterClose();
  currentIndex = -1;
  currentPage = 'motivation';
  renderSidebar();
  closeSidebar();
  document.getElementById('tocPanel').classList.remove('visible');
  document.getElementById('breadcrumb').textContent = '💪 Daily Motivation';
  document.getElementById('readBtn').style.display = 'none';
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
  trackChapterClose();
  currentIndex = -1;
  currentPage = 'goals';
  renderSidebar();
  closeSidebar();
  document.getElementById('tocPanel').classList.remove('visible');
  document.getElementById('breadcrumb').textContent = '🎯 Goals & Timetable';
  document.getElementById('readBtn').style.display = 'none';
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

