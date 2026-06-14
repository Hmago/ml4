#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// build_mock_questions.js
//
// Assembles js/data/mock_questions.js (the `MOCK_DATA` bank used by the Mock
// Test feature) from per-chapter JSON fragments in tools/mock_gen/.
//
//   node tools/build_mock_questions.js            # build + validate, write output
//   node tools/build_mock_questions.js --check    # validate only, write nothing
//
// Each fragment is tools/mock_gen/<key>.json where <key> is the bare chapter
// filename (e.g. "07_introduction.md") — the same key used by QUIZ_DATA. The
// file's contents are a JSON array of question objects:
//   { "q": "...", "options": ["a","b","c","d"], "answer": 0-3, "explanation": "..." }
//
// Validation (fatal → non-zero exit): each question must have a non-empty q,
// exactly 4 non-empty distinct options, an integer answer in [0,3], and a
// non-empty explanation. Duplicate questions within a chapter are dropped.
//
// Quality report (warnings, non-fatal): per-chapter answer-index distribution
// (ideal ~25% each) and option-length skew (the correct option should not be
// consistently the longest — a classic "guessable" tell).
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GEN_DIR = path.join(__dirname, 'mock_gen');
const OUT_FILE = path.join(ROOT, 'js', 'data', 'mock_questions.js');
const checkOnly = process.argv.includes('--check');

function normQ(s) {
  return String(s).toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
}

function validateQuestion(q, ctx, errors) {
  if (!q || typeof q !== 'object' || Array.isArray(q)) { errors.push(`${ctx}: not an object`); return false; }
  if (typeof q.q !== 'string' || !q.q.trim()) { errors.push(`${ctx}: empty/invalid "q"`); return false; }
  if (!Array.isArray(q.options) || q.options.length !== 4) { errors.push(`${ctx}: "options" must have exactly 4 entries (got ${Array.isArray(q.options) ? q.options.length : typeof q.options})`); return false; }
  for (let i = 0; i < 4; i++) {
    if (typeof q.options[i] !== 'string' || !q.options[i].trim()) { errors.push(`${ctx}: option ${i} empty/invalid`); return false; }
  }
  const lowered = q.options.map(o => o.toLowerCase().trim());
  if (new Set(lowered).size !== 4) { errors.push(`${ctx}: options are not all distinct`); return false; }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) { errors.push(`${ctx}: "answer" must be an integer 0-3 (got ${q.answer})`); return false; }
  if (typeof q.explanation !== 'string' || !q.explanation.trim()) { errors.push(`${ctx}: empty/invalid "explanation"`); return false; }
  // Reject lazy "all/none of the above" style distractors that defeat the point.
  if (lowered.some(o => /\b(all|none|both)\b.*\babove\b/.test(o))) { errors.push(`${ctx}: contains an "(all|none) of the above" style option`); return false; }
  return true;
}

function main() {
  if (!fs.existsSync(GEN_DIR)) {
    console.error('No tools/mock_gen/ directory found. Nothing to assemble.');
    process.exit(1);
  }
  const files = fs.readdirSync(GEN_DIR).filter(f => f.endsWith('.json')).sort();
  if (!files.length) {
    console.error('No .json fragments in tools/mock_gen/. Nothing to assemble.');
    process.exit(1);
  }

  const errors = [];
  const warnings = [];
  const data = {};
  let totalQ = 0;

  for (const file of files) {
    const key = file.replace(/\.json$/, '');
    const full = path.join(GEN_DIR, file);
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      errors.push(`${file}: invalid JSON — ${e.message}`);
      continue;
    }
    if (!Array.isArray(parsed)) { errors.push(`${file}: top level must be a JSON array`); continue; }

    const seen = new Set();
    const kept = [];
    parsed.forEach((q, i) => {
      const ctx = `${key}[${i}]`;
      if (!validateQuestion(q, ctx, errors)) return;
      const nk = normQ(q.q);
      if (seen.has(nk)) { warnings.push(`${ctx}: duplicate question dropped`); return; }
      seen.add(nk);
      kept.push({ q: q.q.trim(), options: q.options.map(o => o.trim()), answer: q.answer, explanation: q.explanation.trim() });
    });

    if (!kept.length) { warnings.push(`${key}: no valid questions`); continue; }

    // ── Quality report: answer-index balance ──
    const dist = [0, 0, 0, 0];
    kept.forEach(q => dist[q.answer]++);
    const n = kept.length;
    const pcts = dist.map(d => Math.round((d / n) * 100));
    const maxP = Math.max(...pcts), minP = Math.min(...pcts);
    if (n >= 12 && (maxP > 40 || minP < 12)) {
      warnings.push(`${key}: answer distribution skewed A/B/C/D = ${pcts.join('/')}% (ideal ~25% each)`);
    }

    // ── Quality report: "longest option is correct" tell ──
    let longestIsCorrect = 0;
    kept.forEach(q => {
      const lens = q.options.map(o => o.length);
      const maxLen = Math.max(...lens);
      if (lens[q.answer] === maxLen && lens.filter(l => l === maxLen).length === 1) longestIsCorrect++;
    });
    if (n >= 12 && longestIsCorrect / n > 0.45) {
      warnings.push(`${key}: correct option is the single longest in ${Math.round(longestIsCorrect / n * 100)}% of questions (guessable tell)`);
    }

    data[key] = kept;
    totalQ += kept.length;
  }

  // ── Report ──
  console.log(`\nMock question bank — ${Object.keys(data).length} chapters, ${totalQ} questions\n`);
  Object.keys(data).sort().forEach(k => {
    const dist = [0, 0, 0, 0];
    data[k].forEach(q => dist[q.answer]++);
    console.log(`  ${k.padEnd(46)} ${String(data[k].length).padStart(3)}  (A/B/C/D ${dist.join('/')})`);
  });

  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} warning(s):`);
    warnings.forEach(w => console.log('  - ' + w));
  }
  if (errors.length) {
    console.error(`\n✗ ${errors.length} error(s):`);
    errors.slice(0, 60).forEach(e => console.error('  - ' + e));
    if (errors.length > 60) console.error(`  …and ${errors.length - 60} more`);
    console.error('\nBuild failed. Fix the fragments above and re-run.');
    process.exit(1);
  }

  if (checkOnly) {
    console.log('\n✓ --check passed: all fragments valid. (No file written.)');
    return;
  }

  // ── Emit js/data/mock_questions.js ──
  const header =
    '// Mock Test question bank — SEPARATE from the per-chapter quizzes (QUIZ_DATA).\n' +
    '// GENERATED by tools/build_mock_questions.js from tools/mock_gen/*.json — do not edit by hand.\n' +
    '// Format: { q, options: [a,b,c,d], answer: 0-3, explanation }. Keyed by bare chapter filename.\n' +
    '// Lazy-loaded on first Mock Test open (js/mock.js ensureMockData).\n\n';
  let body = 'const MOCK_DATA = {\n';
  const keys = Object.keys(data).sort();
  keys.forEach((k, ki) => {
    body += `\n'${k}': [\n`;
    body += data[k].map(q => '  ' + JSON.stringify(q)).join(',\n');
    body += '\n]' + (ki < keys.length - 1 ? ',' : '') + '\n';
  });
  body += '\n};\n';
  fs.writeFileSync(OUT_FILE, header + body, 'utf8');
  console.log(`\n✓ Wrote ${path.relative(ROOT, OUT_FILE)} (${(Buffer.byteLength(header + body) / 1024).toFixed(0)} KB)`);
}

main();
