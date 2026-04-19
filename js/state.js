// ═══════════════════════════════════════════════════════════
// ═══  state.js — global state, storage helpers, gamification ═══
// ═══════════════════════════════════════════════════════════

// ─── One-time migration: chapter files moved from root → content/ folder ───
// User-saved data (read status, scores, comments, etc.) keys are file paths.
// Rewrite any old-format keys (e.g., "03_introduction.md") to new-format
// ("content/03_introduction.md") so existing progress survives the move.
(function migrateChapterPathsToContentFolder() {
  if (localStorage.getItem('ml4-migration-content-v1') === 'done') return;
  const moved = [
    '00_google_ai_engineer_strategy.md', '01_brain_training.md', '02_math_fundamentals.md',
    '03_introduction.md', '04_core_concepts.md', '05_data_preprocessing.md',
    '06_supervised_learning.md', '07_unsupervised_learning.md', '08_reinforcement_learning.md',
    '09_key_algorithms.md', '10_neural_networks.md', '11_model_evaluation.md',
    '12_deep_learning.md', '13_llm.md', '14_design_fundamentals.md',
    '15_interview_questions.md', '16_llm_interview_questions.md', '17_ml_system_design.md',
    '18_dsa_trees_graphs.md', '19_google_ml_ecosystem.md',
    '20_google_top10_ml_interview.md', '20_Modern System Design.md',
    '21_quick_reference_cheat_sheet.md',
    'behavioral_interview.md', 'practical_ml.md', 'practical_ml.ipynb',
    'staying_relevant_ai_era.md',
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

// ─── State ───
let currentIndex = -1;
let readChapters = JSON.parse(localStorage.getItem('ml4-read') || '{}');
let cachedContent = {};
let fontSize = parseInt(localStorage.getItem('ml4-fontsize') || '0');

// ─── Marked Config ───
marked.setOptions({
  highlight: function(code, lang) {
    if (lang === 'chart' || lang === 'mermaid') return code;
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: false,
  gfm: true,
});

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

// ─── Theme ───
function initTheme() {
  const saved = localStorage.getItem('ml4-theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('hljs-theme').href =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
  document.getElementById('hljs-theme').href = isDark
    ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css'
    : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
  localStorage.setItem('ml4-theme', isDark ? 'light' : 'dark');
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
  const data = getXP();
  data.xp += amount;
  // Streak tracking
  const today = new Date().toDateString();
  if (data.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    data.streak = (data.lastDate === yesterday) ? data.streak + 1 : 1;
    data.lastDate = today;
  }
  saveXP(data);
  showToast(`+${amount} XP`, reason, amount >= 50 ? '🏆' : '⚡');
  // Check level up
  const oldLevel = getLevel(data.xp - amount);
  const newLevel = getLevel(data.xp);
  if (newLevel > oldLevel) {
    setTimeout(() => {
      showToast('🎉 LEVEL UP!', `You reached Level ${newLevel}!`, '🚀');
      fireConfetti();
    }, 600);
  }
  // Check achievements
  checkAchievements(data);
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
  }
});
