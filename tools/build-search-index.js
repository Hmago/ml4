#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// build-search-index.js
//
// Builds js/data/search_index.js — a PREBUILT full-text search index over the
// chapter markdown, so the app no longer has to fetch all ~34 markdown files on
// the first in-app search. The `chapters` array in js/chapter.js is the single
// source of truth for WHICH files get indexed.
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
//       headings: ["Heading text", ...],          // unique pool, first-seen order
//       lines:    [["clean body line", headingIdx], ...]   // headingIdx = -1 before any heading
//     }, ...]
//   };
//   if (typeof module !== 'undefined' && module.exports) module.exports = SEARCH_INDEX;
//
// Section dividers and notebooks (.ipynb) are skipped; README.md and the recap
// chapters are kept. Deterministic & idempotent apart from `v`: identical content
// always yields an identical structure.
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
  s = s.replace(/[*`]/g, '');             // bold / italic / inline-code markers
  return s.replace(/\s+/g, ' ').trim();
}

function cleanBody(raw) {
  let s = stripLinksImages(raw);
  s = s.replace(/[#*`|>]/g, '');                  // md markers, table pipes, blockquote '>'
  s = s.replace(/^\s*(?:[-+]\s+|\d+\.\s+)/, '');   // leading list marker (-, +, 1.)
  return s.replace(/\s+/g, ' ').trim();
}

function cleanCode(raw) {
  // Strip leading indentation, collapse runs of whitespace, trim.
  return raw.replace(/\s+/g, ' ').trim();
}

// Horizontal rule: ---, ***, ___ (3+ of one marker, optional spaces between).
function isHorizontalRule(t) {
  return /^([-*_])(?:\s*\1){2,}$/.test(t);
}

// Markdown table separator row: only |, :, -, spaces, with at least one '-' and
// at least one '|' or ':' (e.g. |---|---|, :---:, | :--- | ---: |).
function isTableSeparator(t) {
  return /-/.test(t) && /[|:]/.test(t) && /^[|:\s-]+$/.test(t);
}

// ── Markdown → { headings, lines } ──
function processMarkdown(md) {
  const headings = [];
  const headingPool = new Map(); // heading text → pool index
  const lines = [];
  let currentHeading = -1;
  let inCode = false;
  let prev = null; // last pushed text, for consecutive-dedup

  for (const raw of md.split(/\r?\n/)) {
    // Fence: toggle code state, never emit the fence line itself.
    if (raw.trimStart().startsWith(FENCE)) { inCode = !inCode; prev = null; continue; }

    if (inCode) {
      const c = cleanCode(raw);
      if (!c || !HAS_ALNUM.test(c)) continue;
      if (c === prev) continue;
      lines.push([c, currentHeading]);
      prev = c;
      continue;
    }

    // Heading: update the current heading context; never emit it as a body line.
    if (/^#{1,6}\s+/.test(raw)) {
      const h = cleanHeading(raw);
      if (h) {
        if (headingPool.has(h)) {
          currentHeading = headingPool.get(h);
        } else {
          currentHeading = headings.length;
          headings.push(h);
          headingPool.set(h, currentHeading);
        }
      }
      prev = null;
      continue;
    }

    const t = raw.trim();
    if (!t) continue;                       // blank line
    if (isHorizontalRule(t)) continue;      // --- *** ___
    if (isTableSeparator(t)) continue;      // |---|---|  :---:

    const c = cleanBody(raw);
    if (!c || !HAS_ALNUM.test(c)) continue; // empty or pure ASCII-diagram border
    if (c === prev) continue;               // consecutive duplicate
    lines.push([c, currentHeading]);
    prev = c;
  }

  return { headings, lines };
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
    if (typeof c.title !== 'string') errors.push(`${ctx}: title must be a string`);
    if (!Array.isArray(c.headings) || !c.headings.every(h => typeof h === 'string')) {
      errors.push(`${ctx}: headings must be an array of strings`);
    }
    if (!Array.isArray(c.lines)) { errors.push(`${ctx}: lines must be an array`); return; }
    const nh = Array.isArray(c.headings) ? c.headings.length : 0;
    c.lines.forEach((ln, j) => {
      if (!Array.isArray(ln) || ln.length !== 2) { errors.push(`${ctx}.lines[${j}]: must be a [text, headingIndex] tuple`); return; }
      if (typeof ln[0] !== 'string' || !ln[0]) errors.push(`${ctx}.lines[${j}]: text must be a non-empty string`);
      if (!Number.isInteger(ln[1]) || ln[1] < -1 || ln[1] >= nh) errors.push(`${ctx}.lines[${j}]: headingIndex ${ln[1]} out of range [-1, ${nh - 1}]`);
    });
  });
}

const BANNER =
  '// Prebuilt full-text search index over the chapter markdown.\n' +
  '// GENERATED by tools/build-search-index.js — do not edit by hand. Re-run the tool instead.\n' +
  '// Shape: { v, chapters:[{ id, file, title, headings:[...], lines:[[text, headingIndex], ...] }] }.\n' +
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
  let totalLines = 0;

  for (const ch of kept) {
    if (!ch.file) { errors.push(`entry "${ch.id || '?'}": has no file`); continue; }
    let md;
    try {
      md = fs.readFileSync(path.join(ROOT, ch.file), 'utf8');
    } catch (e) {
      errors.push(`${ch.file}: cannot read — ${e.message}`);
      continue;
    }
    const { headings, lines } = processMarkdown(md);
    if (lines.length === 0) errors.push(`${ch.file}: produced 0 indexable lines`);
    chapters.push({ id: String(ch.id), file: ch.file, title: String(ch.title == null ? '' : ch.title), headings, lines });
    totalLines += lines.length;
  }

  const index = { v: Date.now(), chapters };
  const content =
    BANNER +
    'const SEARCH_INDEX = ' + JSON.stringify(index) + ';\n' +
    "if (typeof module !== 'undefined' && module.exports) module.exports = SEARCH_INDEX; // lets node require() it for tests; harmless in browser (module is undefined)\n";
  const bytes = Buffer.byteLength(content);

  validateStructure(index, errors);

  // ── Report ──
  console.log(`\nSearch index — ${chapters.length} chapters, ${totalLines} lines, ~${(bytes / 1024).toFixed(0)} KB`);
  chapters.forEach(c => {
    console.log(
      `  ${c.id.padEnd(4)} ${path.basename(c.file).padEnd(44)} ` +
      `${String(c.lines.length).padStart(5)} lines  ${String(c.headings.length).padStart(3)} headings`);
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
