#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// validate_fragment.js — validate a SINGLE tools/mock_gen/<key>.json fragment.
// Sub-agents run this to self-check their output before finishing:
//
//     node tools/validate_fragment.js 07_introduction.md
//
// Exits non-zero (and prints the problems) if anything is wrong, so an agent
// knows to fix and rewrite. On success prints the count + answer distribution.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const key = process.argv[2];
if (!key) { console.error('Usage: node tools/validate_fragment.js <key>  (e.g. 07_introduction.md)'); process.exit(2); }

const file = path.join(__dirname, 'mock_gen', key.endsWith('.json') ? key : key + '.json');
if (!fs.existsSync(file)) { console.error('Not found: ' + file); process.exit(2); }

let arr;
try { arr = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (e) { console.error('Invalid JSON: ' + e.message); process.exit(1); }

if (!Array.isArray(arr)) { console.error('Top level must be a JSON array.'); process.exit(1); }

const errors = [];
const seen = new Set();
const norm = s => String(s).toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
const dist = [0, 0, 0, 0];
let longestIsCorrect = 0;

arr.forEach((q, i) => {
  const c = `[${i}]`;
  if (!q || typeof q !== 'object' || Array.isArray(q)) { errors.push(`${c} not an object`); return; }
  if (typeof q.q !== 'string' || !q.q.trim()) errors.push(`${c} empty "q"`);
  if (!Array.isArray(q.options) || q.options.length !== 4) { errors.push(`${c} need exactly 4 options`); return; }
  if (q.options.some(o => typeof o !== 'string' || !o.trim())) errors.push(`${c} has an empty option`);
  if (new Set(q.options.map(o => String(o).toLowerCase().trim())).size !== 4) errors.push(`${c} options not all distinct`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errors.push(`${c} "answer" must be int 0-3`);
  if (typeof q.explanation !== 'string' || !q.explanation.trim()) errors.push(`${c} empty "explanation"`);
  if (q.options.some(o => /\b(all|none|both)\b.*\babove\b/i.test(String(o)))) errors.push(`${c} uses "(all|none) of the above"`);
  const nk = norm(q.q);
  if (seen.has(nk)) errors.push(`${c} duplicate question`);
  seen.add(nk);
  if (Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4) {
    dist[q.answer]++;
    const lens = q.options.map(o => String(o).length);
    const mx = Math.max(...lens);
    if (lens[q.answer] === mx && lens.filter(l => l === mx).length === 1) longestIsCorrect++;
  }
});

const n = arr.length;
console.log(`${key}: ${n} questions · answer A/B/C/D = ${dist.join('/')}`);

if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s):`);
  errors.slice(0, 80).forEach(e => console.error('  - ' + e));
  process.exit(1);
}

const warn = [];
if (n < 50) warn.push(`only ${n} questions (target ~60)`);
const pcts = dist.map(d => Math.round((d / n) * 100));
if (Math.max(...pcts) > 38 || Math.min(...pcts) < 14) warn.push(`answer distribution skewed (${pcts.join('/')}%) — aim ~25% each`);
if (longestIsCorrect / n > 0.45) warn.push(`correct option is longest in ${Math.round(longestIsCorrect / n * 100)}% of Qs — make distractors similar length`);
if (warn.length) { console.log('\n⚠ ' + warn.join('\n⚠ ')); console.log('\n(Warnings only — fix if easy. Errors above would block the build.)'); }
else console.log('\n✓ Looks good.');
