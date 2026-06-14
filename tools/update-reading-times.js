#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// update-reading-times.js
//
// Regenerates the CHAPTER_MINUTES baseline in js/state.js from the live word
// counts of each chapter. Run after substantial content edits so the dashboard's
// per-chapter "Time" column and the total/remaining hours stay accurate:
//
//     node tools/update-reading-times.js          # rewrite the baseline in place
//     node tools/update-reading-times.js --check   # report drift, change nothing (exit 1 if stale)
//
// It only touches the block between the @generated-reading-times markers in
// state.js, recomputing the value for every file key already listed there
// (so adding/removing a chapter still means editing that list by hand once).
//
// Estimate model: ~55 words/min study pace, rounded to the nearest 5 min, min 5.
// Notebooks (.ipynb) are JSON, not prose — they reuse their sibling .md count.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STATE_FILE = path.join(ROOT, 'js', 'state.js');
const READING_WPM = 55;
const START = '/* @generated-reading-times:start */';
const END = '/* @generated-reading-times:end */';

const checkOnly = process.argv.includes('--check');

function wordsToMinutes(words) {
  return Math.max(5, Math.round(words / READING_WPM / 5) * 5);
}

function countWords(file) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  return text.split(/\s+/).filter(Boolean).length;
}

const src = fs.readFileSync(STATE_FILE, 'utf8');
const startIdx = src.indexOf(START);
const endIdx = src.indexOf(END);
if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  console.error('Could not find the @generated-reading-times markers in', STATE_FILE);
  process.exit(2);
}

const block = src.slice(startIdx + START.length, endIdx);
// Pull every "'path': number," key in the order they appear.
const keyRe = /'([^']+)'\s*:\s*(\d+)/g;
const entries = [];
let m;
while ((m = keyRe.exec(block)) !== null) entries.push({ file: m[1], old: Number(m[2]) });

if (!entries.length) {
  console.error('No chapter entries found inside the generated block.');
  process.exit(2);
}

let stale = 0;
const lines = entries.map(({ file, old }) => {
  // Notebooks are JSON — borrow the word count from the .md of the same chapter.
  const wordSrc = /\.ipynb$/.test(file) ? file.replace(/\.ipynb$/, '.md') : file;
  let mins;
  try {
    mins = wordsToMinutes(countWords(wordSrc));
  } catch (e) {
    console.warn(`  ! ${file} — missing, keeping ${old}`);
    mins = old;
  }
  if (mins !== old) {
    stale++;
    const delta = mins - old;
    console.log(`  ~ ${file.padEnd(52)} ${String(old).padStart(4)} -> ${String(mins).padStart(4)} min (${delta > 0 ? '+' : ''}${delta})`);
  }
  return `  '${file}': ${mins},`;
});

const totalMin = entries.reduce((s, e, i) => {
  const v = Number(lines[i].match(/:\s*(\d+)/)[1]);
  return s + v;
}, 0);

console.log(`\n${stale} of ${entries.length} chapters changed. Baseline total: ${totalMin} min ≈ ${(totalMin / 60).toFixed(1)}h.`);

if (checkOnly) {
  if (stale > 0) {
    console.error('\nReading times are stale. Run `node tools/update-reading-times.js` to refresh.');
    process.exit(1);
  }
  console.log('Reading times are up to date.');
  process.exit(0);
}

if (stale === 0) {
  console.log('Nothing to write — already up to date.');
  process.exit(0);
}

const rebuilt =
  src.slice(0, startIdx + START.length) +
  '\n' + lines.join('\n') + '\n' +
  src.slice(endIdx);

fs.writeFileSync(STATE_FILE, rebuilt);
console.log(`\nUpdated ${path.relative(ROOT, STATE_FILE)}.`);
