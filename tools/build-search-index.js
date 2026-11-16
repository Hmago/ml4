#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// build-search-index.js
//
// Builds js/data/search_index.js — a PREBUILT index of chapter names, H1–H4
// headings and collapsible-block titles (DSA problems, self-test questions) for
// the sidebar search, so the app doesn't fetch every markdown file on the first
// search. Body text is NOT indexed: search is navigational and ranks chapter
// name > H1 > H2 > H3 > H4 > block titles (in-chapter text search is Ctrl+F).
// The `chapters` array in js/chapter.js is the single source of truth for WHICH
// files get indexed.
//
//   node tools/build-search-index.js            # build + validate, write output
//   node tools/build-search-index.js --check    # build + validate only, write nothing
//
// Output contract (a classic, non-module script — assigns a top-level global the
// same way js/data/quizzes.js assigns QUIZ_DATA; consumed by js/chapter.js):
//
//   const SEARCH_INDEX = {
//     v: <epoch ms>,                  // version stamp — the ONLY nondeterministic field
//     chapters: [{
//       id, file, title,
//       headings: [[level, "Heading text", parentIdx], ...],  // level 1–4, document order
//       blocks:   [["Block title", parentIdx, "Medium"], ...]  // parentIdx → headings[], -1 = none
//     }, ...]
//   };
//   if (typeof module !== 'undefined' && module.exports) module.exports = SEARCH_INDEX;
//
// Section dividers and notebooks (.ipynb) are skipped; README.md and the recap
// chapters are kept. Deterministic & idempotent apart from `v`: identical content
// always yields an identical structure. js/chapter.js (_extractStructure) parses
// the markdown the same way for its offline fallback — keep the two in step.
//
// GENERATED output — never hand-edit js/data/search_index.js; re-run this tool.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHAPTER_JS = path.join(ROOT, 'js', 'chapter.js');
const OUT_FILE = path.join(ROOT, 'js', 'data', 'search_index.js');
const checkOnly = process.argv.includes('--check');

const FENCE = '```';
const HAS_ALNUM = /[a-zA-Z0-9]/;
const MAX_LEVEL = 4;

// ── Extract and evaluate the `chapters` array literal from js/chapter.js ──
// The literal is pure object literals (no function calls), so evaluating it with
// the Function constructor is safe here: build-time tooling over trusted local
// source. A small scanner finds the matching closing bracket while skipping
// strings and comments so brackets inside them never throw off the depth count.
function extractChapters(src) {
  const marker = 'const chapters = [';
  const start = src.indexOf(marker);
  if (start === -1) throw new Error('could not locate "const chapters = [" in js/chapter.js');
  const open = start + marker.length - 1; // index of the opening '['
  let depth = 0;
  let inStr = null;
  let lineComment = false;
  let blockComment = false;
  let end = -1;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i++; } continue; }
    if (inStr) { if (c === '\\') { i++; } else if (c === inStr) inStr = null; continue; }
    if (c === '/' && n === '/') { lineComment = true; i++; continue; }
    if (c === '/' && n === '*') { blockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end === -1) throw new Error('could not find the closing "]" of the chapters array');
  // eslint-disable-next-line no-new-func
  return new Function('return ' + src.slice(open, end) + ';')();
}

// ── Markdown cleaning ──
function stripLinksImages(s) {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')      // images  → drop entirely
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');  // links   → keep the link text
}

function cleanHeading(raw) {
  let s = raw.replace(/^#{1,6}\s+/, '');  // strip leading ATX '#'s
  s = s.replace(/\s+#+\s*$/, '');         // strip optional closing ATX '#'s
  s = stripLinksImages(s);
  s = s.replace(/<[^>]+>/g, '');          // inline HTML tags (anchors, <br>, …)
  s = s.replace(/[*`]/g, '');             // bold / italic / inline-code markers
  s = s.replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1'); // markdown backslash escapes
  return s.replace(/\s+/g, ' ').trim();
}

// ── Markdown → { headings, blocks } ──
// headings: [[level, text, parent], ...] — every H1–H4 outside code fences, in
//   document order (repeats kept: "Practice" under two sections is two places).
//   `parent` = index of the nearest enclosing heading (lower level), or -1.
// blocks: [[title, parent, note], ...] — titles of collapsible <details> blocks
//   (DSA problems, self-test questions). `parent` = enclosing heading index;
//   `note` = Easy/Medium/Hard when the summary states one. Repeated generic
//   labels ("Read as text", "Answer") are dropped later in pruneBlocks().
function extractStructure(md) {
  const headings = [];
  const blocks = [];
  const stack = []; // [level, index] of open headings
  let inCode = false;
  for (const raw of md.split(/\r?\n/)) {
    if (raw.trimStart().startsWith(FENCE)) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = raw.match(/^(#{1,6})\s+/);
    if (m) {
      const level = m[1].length;
      if (level > MAX_LEVEL) continue;
      const text = cleanHeading(raw);
      if (!text || !HAS_ALNUM.test(text)) continue;
      while (stack.length && stack[stack.length - 1][0] >= level) stack.pop();
      const parent = stack.length ? stack[stack.length - 1][1] : -1;
      headings.push([level, text, parent]);
      stack.push([level, headings.length - 1]);
      continue;
    }
    const s = raw.match(/<summary>(.*?)<\/summary>/);
    if (s) {
      const inner = s[1];
      const strong = inner.match(/^\s*<(strong|b)>(.*?)<\/\1>(.*)$/);
      const title = cleanHeading(strong ? strong[2] : inner);
      if (!title || !HAS_ALNUM.test(title)) continue;
      const diff = ((strong ? strong[3] : '').match(/\b(Easy|Medium|Hard)\b/) || [])[1] || '';
      blocks.push([title, stack.length ? stack[stack.length - 1][1] : -1, diff]);
    }
  }
  return { headings, blocks };
}

// Block titles that repeat across the corpus are UI labels, not content
// ("Read as text" ×2772, "Answer" ×424, "Quick check." ×76) — and bare
// numbering ("1.", "2.") says nothing. Keep only distinctive titles.
const BLOCK_REPEAT_LIMIT = 4;
function pruneBlocks(chapters) {
  const count = new Map();
  chapters.forEach(c => c.blocks.forEach(b => { const k = b[0].toLowerCase(); count.set(k, (count.get(k) || 0) + 1); }));
  let dropped = 0;
  chapters.forEach(c => {
    const before = c.blocks.length;
    c.blocks = c.blocks.filter(b => count.get(b[0].toLowerCase()) < BLOCK_REPEAT_LIMIT &&
      b[0].replace(/^\d+[.)]\s*/, '').replace(/[^a-zA-Z0-9]/g, '').length >= 3);
    dropped += before - c.blocks.length;
  });
  return dropped;
}

// ── Structural validation of the built index against the contract ──
function validateStructure(index, errors) {
  if (!index || typeof index !== 'object') { errors.push('index is not an object'); return; }
  if (typeof index.v !== 'number') errors.push('index.v must be a number');
  if (!Array.isArray(index.chapters)) { errors.push('index.chapters must be an array'); return; }
  index.chapters.forEach((c, i) => {
    const ctx = `chapters[${i}] (${c && c.file || '?'})`;
    if (!c || typeof c !== 'object') { errors.push(`${ctx}: not an object`); return; }
    if (typeof c.id !== 'string') errors.push(`${ctx}: id must be a string`);
    if (typeof c.file !== 'string' || !c.file) errors.push(`${ctx}: file must be a non-empty string`);
    if (typeof c.title !== 'string' || !c.title) errors.push(`${ctx}: title must be a non-empty string`);
    if (!Array.isArray(c.headings)) { errors.push(`${ctx}: headings must be an array`); return; }
    c.headings.forEach((h, j) => {
      if (!Array.isArray(h) || h.length !== 3) { errors.push(`${ctx}.headings[${j}]: must be a [level, text, parent] tuple`); return; }
      if (!Number.isInteger(h[0]) || h[0] < 1 || h[0] > MAX_LEVEL) errors.push(`${ctx}.headings[${j}]: level ${h[0]} out of range 1–${MAX_LEVEL}`);
      if (typeof h[1] !== 'string' || !h[1]) errors.push(`${ctx}.headings[${j}]: text must be a non-empty string`);
      if (!Number.isInteger(h[2]) || h[2] < -1 || h[2] >= j) errors.push(`${ctx}.headings[${j}]: parent ${h[2]} must point at an earlier heading or -1`);
      else if (h[2] >= 0 && c.headings[h[2]][0] >= h[0]) errors.push(`${ctx}.headings[${j}]: parent is not a higher-level heading`);
    });
    if (!Array.isArray(c.blocks)) { errors.push(`${ctx}: blocks must be an array`); return; }
    c.blocks.forEach((b, j) => {
      if (!Array.isArray(b) || b.length !== 3) { errors.push(`${ctx}.blocks[${j}]: must be a [title, parent, note] tuple`); return; }
      if (typeof b[0] !== 'string' || !b[0]) errors.push(`${ctx}.blocks[${j}]: title must be a non-empty string`);
      if (!Number.isInteger(b[1]) || b[1] < -1 || b[1] >= c.headings.length) errors.push(`${ctx}.blocks[${j}]: parent ${b[1]} out of range`);
      if (typeof b[2] !== 'string') errors.push(`${ctx}.blocks[${j}]: note must be a string`);
    });
  });
}

const BANNER =
  '// Prebuilt search index: chapter names, H1–H4 headings and collapsible-block titles (no body text).\n' +
  '// GENERATED by tools/build-search-index.js — do not edit by hand. Re-run the tool instead.\n' +
  '// Shape: { v, chapters:[{ id, file, title, headings:[[level, text, parent], ...], blocks:[[title, parent, note], ...] }] }.\n' +
  '// `v` is a build timestamp (Date.now()); everything else is deterministic from the content.\n\n';

function main() {
  let src;
  try {
    src = fs.readFileSync(CHAPTER_JS, 'utf8');
  } catch (e) {
    console.error('✗ cannot read js/chapter.js: ' + e.message);
    process.exit(1);
  }

  let registry;
  try {
    registry = extractChapters(src);
  } catch (e) {
    console.error('✗ failed to extract chapters array: ' + e.message);
    process.exit(1);
  }

  // Source of truth for what to index: drop section dividers and notebooks.
  const kept = registry.filter(ch =>
    !ch.section && !ch.notebook && !(ch.file && ch.file.endsWith('.ipynb')));

  const errors = [];
  const chapters = [];
  const perLevel = [0, 0, 0, 0, 0];

  for (const ch of kept) {
    if (!ch.file) { errors.push(`entry "${ch.id || '?'}": has no file`); continue; }
    let md;
    try {
      md = fs.readFileSync(path.join(ROOT, ch.file), 'utf8');
    } catch (e) {
      errors.push(`${ch.file}: cannot read — ${e.message}`);
      continue;
    }
    const { headings, blocks } = extractStructure(md);
    headings.forEach(h => { perLevel[h[0]]++; });
    chapters.push({ id: String(ch.id), file: ch.file, title: String(ch.title == null ? '' : ch.title), headings, blocks });
  }
  const droppedBlocks = pruneBlocks(chapters);

  const index = { v: Date.now(), chapters };
  const content =
    BANNER +
    'const SEARCH_INDEX = ' + JSON.stringify(index) + ';\n' +
    "if (typeof module !== 'undefined' && module.exports) module.exports = SEARCH_INDEX; // lets node require() it for tests; harmless in browser (module is undefined)\n";
  const bytes = Buffer.byteLength(content);

  validateStructure(index, errors);

  // ── Report ──
  const total = perLevel.reduce((a, b) => a + b, 0);
  const totalBlocks = chapters.reduce((s, c) => s + c.blocks.length, 0);
  console.log(`\nSearch index — ${chapters.length} chapters, ${total} headings ` +
    `(H1 ${perLevel[1]} · H2 ${perLevel[2]} · H3 ${perLevel[3]} · H4 ${perLevel[4]}), ` +
    `${totalBlocks} block titles (${droppedBlocks} generic labels skipped), ~${(bytes / 1024).toFixed(0)} KB`);
  chapters.forEach(c => {
    const n = [1, 2, 3, 4].map(l => c.headings.filter(h => h[0] === l).length);
    console.log(
      `  ${c.id.padEnd(4)} ${path.basename(c.file).padEnd(44)} ` +
      `${String(c.headings.length).padStart(4)} headings  (${n.join(' / ')})  ${String(c.blocks.length).padStart(3)} blocks`);
  });

  if (errors.length) {
    console.error(`\n✗ ${errors.length} error(s):`);
    errors.slice(0, 60).forEach(e => console.error('  - ' + e));
    if (errors.length > 60) console.error(`  …and ${errors.length - 60} more`);
    console.error('\nBuild failed. Fix the problems above and re-run.');
    process.exit(1);
  }

  if (checkOnly) {
    console.log('\n✓ --check passed: index valid. (No file written.)');
    return;
  }

  fs.writeFileSync(OUT_FILE, content, 'utf8');
  console.log(`\n✓ Wrote ${path.relative(ROOT, OUT_FILE).replace(/\\/g, '/')} (${(bytes / 1024).toFixed(0)} KB)`);
}

main();
