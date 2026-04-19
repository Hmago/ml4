// ═══════════════════════════════════════════════════════════
// ═══  chapter.js — chapter reader: sidebar, loading, TOC, ═══
// ═══  comments, highlights, quizzes, notebook, pyodide      ═══
// ═══════════════════════════════════════════════════════════

// ─── Chapter Data (with section dividers) ───
const chapters = [
  // ── STRATEGY & PLANNING (read first!) ──
  { section: 'Strategy & Planning' },
  { id: '00', file: 'content/00_google_ai_engineer_strategy.md', title: 'Google AI Engineer Strategy' },
  { id: '\u2302', file: 'README.md', title: 'Learning Roadmap' },
  { id: '\u2605', file: 'content/staying_relevant_ai_era.md', title: 'Staying Relevant in AI Era' },
  { id: '01', file: 'content/01_brain_training.md', title: 'Brain Training & Memory' },

  // ── MATH FOUNDATIONS ──
  { section: 'Math Foundations' },
  { id: '02', file: 'content/02_math_fundamentals.md', title: 'Math for ML & AI' },

  // ── ML CURRICULUM ──
  { section: 'ML Curriculum' },
  { id: '03', file: 'content/03_introduction.md', title: 'Introduction to ML' },
  { id: '04', file: 'content/04_core_concepts.md', title: 'Core Concepts & Terminology' },
  { id: '05', file: 'content/05_data_preprocessing.md', title: 'Data Preprocessing' },
  { id: '06', file: 'content/06_supervised_learning.md', title: 'Supervised Learning' },
  { id: '07', file: 'content/07_unsupervised_learning.md', title: 'Unsupervised Learning' },
  { id: '08', file: 'content/08_reinforcement_learning.md', title: 'Reinforcement Learning' },
  { id: '09', file: 'content/09_key_algorithms.md', title: 'Key Algorithms Deep Dive' },
  { id: '10', file: 'content/10_neural_networks.md', title: 'Neural Networks' },
  { id: '11', file: 'content/11_model_evaluation.md', title: 'Model Evaluation & Tuning' },

  // ── DEEP LEARNING & LLMs ──
  { section: 'Deep Learning & LLMs' },
  { id: '12', file: 'content/12_deep_learning.md', title: 'Deep Learning Reference' },
  { id: '13', file: 'content/13_llm.md', title: 'Large Language Models' },
  { id: '22', file: 'content/22_modern_ai_stack.md', title: 'Modern AI Stack — Agents, MCP, Skills (2026)' },

  // ── SYSTEM DESIGN ──
  { section: 'System Design' },
  { id: '14', file: 'content/14_design_fundamentals.md', title: 'Design Fundamentals (Java)' },
  { id: '17', file: 'content/17_ml_system_design.md', title: 'ML System Design (Google)' },
  { id: '20', file: 'content/20_Modern System Design.md', title: 'Modern System Design (Grokking)' },

  // ── PRACTICAL / HANDS-ON ──
  { section: 'Practical / Hands-On' },
  { id: '\u2692', file: 'content/practical_ml.md', title: 'Practical ML: Zero to Production' },
  { id: '\u25B6', file: 'content/practical_ml.ipynb', title: 'Practical ML Notebook', notebook: true },

  // ── GOOGLE ML ECOSYSTEM ──
  { section: 'Google ML Ecosystem' },
  { id: '19', file: 'content/19_google_ml_ecosystem.md', title: 'Google ML Ecosystem (TPUs, JAX, Vertex AI)' },

  // ── DSA / CODING ──
  { section: 'DSA / Coding' },
  { id: '18', file: 'content/18_dsa_trees_graphs.md', title: 'DSA & ML Coding (Java)' },

  // ── INTERVIEW PREP ──
  { section: 'Interview Prep' },
  { id: '\u270D', file: 'content/behavioral_interview.md', title: 'Behavioral Interview (Google)' },
  { id: '15', file: 'content/15_interview_questions.md', title: 'ML Interview Questions' },
  { id: '16', file: 'content/16_llm_interview_questions.md', title: 'LLM Interview Questions' },
  { id: '20b', file: 'content/20_google_top10_ml_interview.md', title: "Google's Top 10 ML Interview Topics" },

  // ── QUICK REFERENCE (always at bottom) ──
  { section: 'Quick Reference' },
  { id: '21', file: 'content/21_quick_reference_cheat_sheet.md', title: 'Cheat Sheet — All Topics', ref: true },
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
  document.getElementById('welcome')?.remove();
  renderSidebar();
  closeSidebar();

  const contentEl = document.getElementById('content');
  contentEl.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

  try {
    let md;
    if (cachedContent[ch.file]) {
      md = cachedContent[ch.file];
    } else {
      const res = await fetch(ch.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      md = await res.text();
      cachedContent[ch.file] = md;
    }

    var mathProtected = protectMath(md);
    contentEl.innerHTML = restoreMath(marked.parse(mathProtected.md), mathProtected.store);
    contentEl.innerHTML += renderNavButtons();

    // Render LaTeX math formulas with KaTeX
    if (window.renderMathInElement) {
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

  } catch (err) {
    contentEl.innerHTML = `<div class="loading" style="color:red;">
      Failed to load ${ch.file}: ${err.message}<br><br>
      <small>Make sure you're running a local server:<br>
      <code>python -m http.server 8000</code></small>
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
  if (readChapters[file]) {
    delete readChapters[file];
  } else {
    readChapters[file] = true;
  }
  localStorage.setItem('ml4-read', JSON.stringify(readChapters));
  document.getElementById('readBtn').classList.toggle('active', !!readChapters[file]);
  renderSidebar();
}

// ─── Search ───
let searchTimeout;
document.getElementById('search').addEventListener('input', function(e) {
  clearTimeout(searchTimeout);
  const query = e.target.value.trim().toLowerCase();
  const resultsEl = document.getElementById('searchResults');

  if (query.length < 2) {
    resultsEl.classList.remove('visible');
    document.getElementById('chapterList').style.display = '';
    return;
  }

  searchTimeout = setTimeout(async () => {
    const results = [];
    for (const ch of chapters) {
      if (ch.section) continue;   // skip section dividers
      let md = cachedContent[ch.file];
      if (!md) {
        try {
          const res = await fetch(ch.file);
          if (res.ok) {
            md = await res.text();
            cachedContent[ch.file] = md;
          }
        } catch {}
      }
      if (!md) continue;
      const lines = md.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(query)) {
          const line = lines[i].replace(/[#*`|]/g, '').trim();
          if (!line) continue;
          const idx = line.toLowerCase().indexOf(query);
          const start = Math.max(0, idx - 30);
          const end = Math.min(line.length, idx + query.length + 30);
          let snippet = (start > 0 ? '...' : '') + line.slice(start, end) + (end < line.length ? '...' : '');
          snippet = snippet.replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>');
          results.push({ chapter: ch, index: chapters.indexOf(ch), snippet, lineNum: i });
          if (results.length >= 30) break;
        }
      }
      if (results.length >= 30) break;
    }

    document.getElementById('chapterList').style.display = 'none';
    resultsEl.classList.add('visible');
    resultsEl.innerHTML = results.length === 0
      ? '<div class="search-result-item" style="color:var(--text-secondary)">No results found</div>'
      : results.map(r => `
        <div class="search-result-item" onclick="loadChapter(${r.index}); document.getElementById('search').value=''; document.getElementById('searchResults').classList.remove('visible'); document.getElementById('chapterList').style.display='';">
          <strong>${r.chapter.title}</strong>
          <div class="match">${r.snippet}</div>
        </div>
      `).join('');
  }, 200);
});

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
  // Escape — close search / sidebar
  if (e.key === 'Escape') {
    document.getElementById('search').value = '';
    document.getElementById('search').blur();
    document.getElementById('searchResults').classList.remove('visible');
    document.getElementById('chapterList').style.display = '';
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
  // M — mark as read
  if ((e.key === 'm' || e.key === 'M') && currentPage === 'chapter') toggleReadStatus();
});


// ─── Scroll Progress Bar ───
function setupScrollProgress() {
  const wrapper = document.getElementById('contentWrapper');
  const bar = document.getElementById('scrollProgress');
  wrapper.addEventListener('scroll', () => {
    const scrollTop = wrapper.scrollTop;
    const scrollHeight = wrapper.scrollHeight - wrapper.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = progress + '%';
    // Award XP for reaching end of chapter
    if (progress > 95 && interactiveMode) {
      const key = 'scroll_' + currentIndex;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        addXP(10, 'Finished scrolling through chapter');
      }
    }
  });
}

// ─── Enhanced Content ───
function enhanceContent() {
  if (!interactiveMode) return;
  const contentEl = document.getElementById('content');
  contentEl.classList.add('chapter-view');

  // Page enter animation
  contentEl.classList.add('page-enter');
  setTimeout(() => contentEl.classList.remove('page-enter'), 600);

  // 1. Copy buttons on code blocks
  contentEl.querySelectorAll('pre').forEach(pre => {
    if (pre.parentElement?.classList.contains('code-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
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

  // 5. Mermaid diagrams
  if (window.mermaid) {
    contentEl.querySelectorAll('code.language-mermaid').forEach(block => {
      const pre = block.parentElement;
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = block.textContent;
      pre.replaceWith(div);
    });
    mermaid.init(undefined, '.mermaid');
  }

  // 5b. Chart.js charts
  renderCharts(contentEl);

  // 6. Python Run buttons on code blocks
  addRunButtons(contentEl);

  // 6. Award XP for opening a chapter
  addXP(5, 'Opened: ' + (chapters[currentIndex]?.title || 'chapter'));
}

function setupScrollSpy() {
  const wrapper = document.getElementById('contentWrapper');
  const tocLinks = document.querySelectorAll('#tocLinks a');
  if (!tocLinks.length) return;
  wrapper.addEventListener('scroll', () => {
    let current = '';
    document.querySelectorAll('#content h2, #content h3').forEach(h => {
      if (h.getBoundingClientRect().top < 150) current = h.id;
    });
    tocLinks.forEach(a => a.classList.toggle('spy-active', a.getAttribute('href') === '#' + current));
  });
}


// ─── Quiz System ───
let quizState = { questions: [], current: 0, score: 0, answered: false };

function startQuiz(file) {
  const key = file.replace(/^content\//, '');
  const questions = (typeof QUIZ_DATA !== 'undefined' && (QUIZ_DATA[key] || QUIZ_DATA[file])) || [];
  if (!questions.length) {
    showToast('📝 No quiz yet', 'Quiz coming soon for this chapter', '📚');
    return;
  }
  quizState = { questions: [...questions], current: 0, score: 0, answered: false };
  // Shuffle questions
  for (let i = quizState.questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quizState.questions[i], quizState.questions[j]] = [quizState.questions[j], quizState.questions[i]];
  }
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const { questions, current, score } = quizState;

  // Results screen
  if (current >= questions.length) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 80 ? 'great' : pct >= 50 ? 'good' : 'needs-work';
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📖';
    const msg = pct >= 80 ? 'Excellent! You know this well!' : pct >= 50 ? 'Good job! Review the ones you missed.' : 'Keep studying — you\'ll get there!';
    const xpEarned = Math.round(pct / 100 * 30);
    addXP(xpEarned, `Quiz score: ${pct}% (${score}/${questions.length})`);

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
          <p style="font-size:13px;color:var(--accent);font-weight:600;">+${xpEarned} XP earned</p>
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
      <div class="quiz-question">${current + 1}. ${q.q}</div>
      ${quizState.shuffledOptions.map((opt, i) => `
        <button class="quiz-option" onclick="answerQuiz(${i})" id="qopt${i}">${String.fromCharCode(65+i)}. ${opt}</button>
      `).join('')}
      <div id="quizFeedback"></div>
    </div>`;
  if (window.renderMathInElement) renderMathInElement(overlay, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false });
}

function closeQuiz() {
  const { questions, current, score } = quizState;
  if (current >= questions.length) {
    // Already on results screen — just close
    document.querySelector('.quiz-overlay')?.remove();
    return;
  }
  const answered = current + (quizState.answered ? 1 : 0);
  const remaining = questions.length - answered;
  if (remaining > 0) {
    const confirmed = confirm(`You have ${remaining} question${remaining > 1 ? 's' : ''} remaining.\nYour current score: ${score}/${answered}\n\nAre you sure you want to quit the quiz?`);
    if (!confirmed) return;
  }
  document.querySelector('.quiz-overlay')?.remove();
  // Save partial score
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
      ${isCorrect ? '✅ Correct!' : '❌ Incorrect.'} ${q.explanation}
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
    addXP(25, 'Completed: ' + (chapters[currentIndex]?.title || 'chapter'));
    fireConfetti();
    // Launch quiz after a brief delay
    setTimeout(() => startQuiz(file), 800);
  }
};

// ─── Hook into loadChapter to add interactive enhancements ───
const _origLoadChapter = loadChapter;
loadChapter = async function(index) {
  // Check if this is a notebook file
  if (index >= 0 && index < chapters.length && chapters[index].notebook) {
    if (chapters[index].section) return;
    currentIndex = index;
    currentPage = 'chapter';
    const ch = chapters[index];
    trackChapterOpen(ch.file);
    document.getElementById('breadcrumb').textContent = `${ch.id} — ${ch.title}`;
    document.getElementById('readBtn').style.display = '';
    document.getElementById('tocPanel').classList.remove('visible');
    renderSidebar();
    closeSidebar();
    await loadNotebook(ch.file);
    loadHighlights(ch.file);
    injectComments(ch.file);
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
  }
};

// ─── Init Mermaid ───
if (window.mermaid) {
  mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
}

// ─── Render Chart.js charts ───
function renderCharts(root) {
  console.log('[renderCharts] called, Chart available:', !!window.Chart);
  if (!window.Chart) return;
  const blocks = root.querySelectorAll('code.language-chart');
  console.log('[renderCharts] found blocks:', blocks.length);
  if (blocks.length === 0) {
    // Try alternate selectors
    const allCode = root.querySelectorAll('code[class]');
    console.log('[renderCharts] all code elements with class:', Array.from(allCode).map(c => c.className));
  }
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
}


// ─── Notebook Renderer ───
let nbCellCounter = 0;

async function loadNotebook(file) {
  const contentEl = document.getElementById('content');
  contentEl.classList.remove('chapter-view');
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

    // Detect and install needed packages
    const pkgMap = {
      'pandas': 'pandas',
      'sklearn': 'scikit-learn',
      'scipy': 'scipy',
      'seaborn': 'seaborn',
      'matplotlib': 'matplotlib',
    };
    const neededPkgs = [];
    for (const [imp, pkg] of Object.entries(pkgMap)) {
      if (code.includes(imp)) neededPkgs.push(pkg);
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
}

function renderSingleComment(c, index, file, isReply = false, parentIndex = null) {
  const id = isReply ? `${parentIndex}-${index}` : `${index}`;
  const date = new Date(c.date).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit'});
  const edited = c.edited ? ' <small>(edited)</small>' : '';
  const resolved = c.resolved && !isReply;
  const resolvedBadge = resolved ? '<span class="comment-resolved-badge">&#10003; Resolved</span>' : '';
  const resolveBtn = !isReply ? `<button class="resolve-btn" onclick="resolveComment('${file}', ${index})">${resolved ? '↺ Reopen' : '✓ Resolve'}</button>` : '';
  let html = `<div class="comment-item${resolved ? ' resolved' : ''}" id="comment-${id}">
    <div class="comment-header">
      <span class="comment-date">${date}${edited}${resolvedBadge}</span>
      <div class="comment-actions">
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

  // Wrap selected text in a highlight mark
  try {
    const mark = document.createElement('mark');
    mark.className = 'user-hl';
    mark.title = 'Click to remove highlight';
    mark.dataset.file = file;
    selectionRange.surroundContents(mark);
    saveHighlights(file);
    showToast('🖍 Highlighted', selectedText.substring(0, 40) + '...', '✓');
  } catch(e) {
    // surroundContents fails if selection spans multiple elements
    showToast('⚠️ Highlight failed', 'Try selecting text within a single paragraph', '🖍');
  }
  window.getSelection().removeAllRanges();
}

// Event delegation — handle click on ANY highlight mark
document.addEventListener('click', function(e) {
  const mark = e.target.closest('mark.user-hl');
  if (!mark) return;

  // Don't trigger during text selection
  if (window.getSelection().toString().length > 0) return;

  const file = mark.dataset.file || (currentIndex >= 0 ? chapters[currentIndex]?.file : null);
  const parent = mark.parentNode;
  parent.replaceChild(document.createTextNode(mark.textContent), mark);
  parent.normalize();
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
  const highlights = [];
  content.querySelectorAll('mark.user-hl').forEach(m => {
    // Save the text AND surrounding context for accurate restoration
    const parent = m.parentNode;
    const parentText = parent ? parent.textContent.substring(0, 200) : '';
    highlights.push({ text: m.textContent, context: parentText });
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
  // Walk all text nodes in content and wrap matching text
  highlights.forEach(h => {
    const searchText = typeof h === 'string' ? h : h.text;
    if (!searchText || searchText.length < 2) return;
    highlightTextInNode(content, searchText, file);
  });
}

function highlightTextInNode(root, searchText, file) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const matches = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    // Skip nodes inside comments section, code blocks, scripts
    if (node.parentElement.closest('.comments-section, pre, code, script, .sel-popup')) continue;
    const idx = node.textContent.indexOf(searchText);
    if (idx >= 0) {
      matches.push({ node, idx });
    }
  }

  // Only highlight the first match (can't disambiguate without stored position)
  if (matches.length > 0) {
    const { node, idx } = matches[0];
    try {
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + searchText.length);
      const mark = document.createElement('mark');
      mark.className = 'user-hl';
      mark.title = 'Click to remove highlight';
      mark.dataset.file = file;
      range.surroundContents(mark);
    } catch(e) { /* skip if DOM structure doesn't allow it */ }
  }
}

// Update addComment to include quote if present
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
  all[file].unshift(comment);
  saveComments(all);
  input.value = '';
  renderComments(file);
  updateCommentFab(file);
  addXP(2, 'Added a note');
};
