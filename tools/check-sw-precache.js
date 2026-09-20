#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// check-sw-precache.js
//
// Guards the service worker's install payload. Everything listed in
// STATIC_FILES in sw.js is downloaded in full before the worker activates, so
// on a mobile connection every byte there competes with the page's own
// requests.
//
// This check exists because that list grew, one diagram at a time, to 217
// entries / ~150 MB (115 PNGs were ~136 MB of it). Installing that saturated 4G
// links for minutes and made the page time out on first load and after every
// CACHE_NAME bump.
//
//     node tools/check-sw-precache.js          # report the payload
//     node tools/check-sw-precache.js --check  # exit 1 if it breaks the budget
//
// Content (chapter markdown, js/data bundles, diagrams) must NOT go in
// STATIC_FILES — the fetch handler caches it on first view, and sw.js's
// WARM_ON_IDLE warms markdown in the background on a connection that can
// afford it.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SW = path.join(ROOT, 'sw.js');
const BUDGET_BYTES = 2 * 1024 * 1024;        // 2 MB — the shell is ~0.65 MB today
const checkOnly = process.argv.includes('--check');

function listArray(src, name) {
  const start = src.indexOf(`const ${name} = [`);
  if (start === -1) throw new Error(`${name} not found in sw.js`);
  const end = src.indexOf('];', start);
  const body = src.slice(start, end).replace(/\/\/[^\n]*/g, '');   // drop comments
  return [...body.matchAll(/'([^']*)'/g)].map(m => m[1]);
}

const src = fs.readFileSync(SW, 'utf8');
const staticFiles = listArray(src, 'STATIC_FILES');
const warmFiles = listArray(src, 'WARM_ON_IDLE');

let total = 0;
const missing = [];
const offenders = [];
for (const f of staticFiles) {
  if (f === '') continue;                                    // the scope root
  const abs = path.join(ROOT, f);
  if (!fs.existsSync(abs)) { missing.push(f); continue; }
  total += fs.statSync(abs).size;
  if (/\.(png|jpe?g|gif|webp)$/i.test(f) || f.startsWith('content/') || f.startsWith('js/data/')) {
    offenders.push(f);
  }
}

const MB = b => (b / 1024 / 1024).toFixed(2) + ' MB';
console.log(`\nservice-worker install payload: ${staticFiles.length} entries, ${MB(total)}`);
console.log(`background warm list:            ${warmFiles.length} entries (not installed)`);
for (const [label, mbps] of [['4G average (4 Mbps)', 4], ['4G congested (1.5 Mbps)', 1.5]]) {
  console.log(`  install time, ${label.padEnd(24)} ${((total * 8) / (mbps * 1e6)).toFixed(1)}s`);
}

let bad = false;
if (missing.length) {
  bad = true;
  console.error(`\n${missing.length} precached file(s) do not exist on disk:`);
  missing.forEach(f => console.error('   ' + f));
}
if (offenders.length) {
  bad = true;
  console.error(`\n${offenders.length} content file(s) must not be in STATIC_FILES:`);
  offenders.slice(0, 20).forEach(f => console.error('   ' + f));
  if (offenders.length > 20) console.error(`   …and ${offenders.length - 20} more`);
  console.error('Images, chapter markdown and js/data bundles are cached on first view instead.');
}
if (total > BUDGET_BYTES) {
  bad = true;
  console.error(`\nPayload ${MB(total)} exceeds the ${MB(BUDGET_BYTES)} app-shell budget.`);
}

// Every chapter in the registry should be in the background warm list, or it
// will only ever be cached the first time somebody opens it.
const chapterSrc = fs.readFileSync(path.join(ROOT, 'js', 'chapter.js'), 'utf8');
const chapterFiles = [...chapterSrc.matchAll(/file:\s*'(content\/[^']+)'/g)].map(m => m[1]);
const warmSet = new Set(warmFiles);
const unwarmed = chapterFiles.filter(f => !warmSet.has(f));
const staleWarm = warmFiles.filter(f => f !== 'README.md' && !chapterFiles.includes(f));
if (unwarmed.length) {
  bad = true;
  console.error(`\n${unwarmed.length} registered chapter(s) missing from WARM_ON_IDLE in sw.js:`);
  unwarmed.forEach(f => console.error('   ' + f));
}
if (staleWarm.length) {
  bad = true;
  console.error(`\n${staleWarm.length} WARM_ON_IDLE entr(ies) are no longer in the chapters registry:`);
  staleWarm.forEach(f => console.error('   ' + f));
}

if (bad) {
  console.error('\nFAILED — the install payload would slow down mobile first load.\n');
  process.exit(1);
}
console.log(`warm list covers all ${chapterFiles.length} registered chapters.`);
console.log('\nOK — install payload is within the app-shell budget.\n');
