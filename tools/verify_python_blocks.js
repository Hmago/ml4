// Verification harness: extract python code blocks from a chapter and classify
// them exactly the way the app's runtime does, so we test what readers will run.
//
//   node tools/verify_python_blocks.js content/40_python_ml_ai.md [--out DIR]
//
// Classification mirrors js/chapter.js:
//   * run button   -> language-python/py tag, OR text matching the isPython heuristic
//   * blocklisted  -> imports a top-level module in `browserIncompatible` (friendly box)
//   * must-execute -> everything else; these are written to DIR for running
const fs = require('fs');
const path = require('path');

const chapterFile = process.argv[2];
if (!chapterFile) {
  console.error('usage: node tools/verify_python_blocks.js <chapter.md> [--out DIR]');
  process.exit(2);
}
const outIdx = process.argv.indexOf('--out');
const outDir = outIdx > -1 ? process.argv[outIdx + 1] : 'tmp_blocks';

// ─── Read the real blocklist + package map out of chapter.js ───
const appSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'chapter.js'), 'utf8');
function sliceKeys(startMarker, endMarker) {
  const a = appSrc.indexOf(startMarker);
  const b = appSrc.indexOf(endMarker);
  if (a < 0 || b < 0) throw new Error(`could not locate ${startMarker} in chapter.js`);
  return [...appSrc.slice(a, b).matchAll(/'([\w.]+)'\s*:\s*([^,\n]+)/g)]
    .map(m => ({ mod: m[1], val: m[2].trim() }));
}
const blockEntries = sliceKeys('const browserIncompatible', 'const blockedHits');
// A `null` value means "skip silently" — it does NOT produce the friendly box.
const blocked = new Set(blockEntries.filter(e => e.val !== 'null').map(e => e.mod));
const pkgMap = new Set(sliceKeys('const pkgMap', 'const neededPkgs').map(e => e.mod));

// ─── Split the chapter into fenced blocks ───
const lines = fs.readFileSync(chapterFile, 'utf8').split(/\r?\n/);
const blocks = [];
let cur = null;
lines.forEach((line, i) => {
  const fence = line.match(/^```(\w*)\s*$/);
  if (fence) {
    if (cur === null) cur = { tag: fence[1], start: i + 1, body: [] };
    else { blocks.push(cur); cur = null; }
    return;
  }
  if (cur) cur.body.push(line);
});

// Same heuristic as js/chapter.js addRunButtons()
const IS_PYTHON = /^\s*(import |from |def |class |print\(|#)/m;

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const summary = { total: blocks.length, run: 0, blocklisted: 0, mustExecute: 0, needsPkg: new Set() };
const notes = [];

blocks.forEach((b, idx) => {
  const code = b.body.join('\n');
  const tagged = b.tag === 'python' || b.tag === 'py';
  if (!tagged && !IS_PYTHON.test(code)) return;      // no run button -> not our problem
  if (b.tag && !tagged) {
    notes.push(`  ! L${b.start}: \`\`\`${b.tag} block matches the isPython heuristic and WILL get a Run button`);
  }
  summary.run++;

  const mods = new Set();
  const re = /(?:^|\n)\s*(?:from|import)\s+([a-zA-Z_][\w.]*)/g;
  let m;
  while ((m = re.exec(code)) !== null) mods.add(m[1].split('.')[0]);

  const hits = [...mods].filter(x => blocked.has(x));
  if (hits.length) {
    summary.blocklisted++;
    notes.push(`  · L${b.start}: blocklisted via ${hits.join(', ')} -> friendly box`);
    return;
  }
  [...mods].filter(x => pkgMap.has(x)).forEach(x => summary.needsPkg.add(x));
  summary.mustExecute++;
  fs.writeFileSync(path.join(outDir, `L${String(b.start).padStart(4, '0')}.py`), code);
});

console.log(`chapter: ${chapterFile}`);
console.log(`fenced blocks: ${summary.total}`);
console.log(`  run button:    ${summary.run}`);
console.log(`  blocklisted:   ${summary.blocklisted}  (show the friendly copy-locally box)`);
console.log(`  must-execute:  ${summary.mustExecute}  -> written to ${outDir}/`);
if (summary.needsPkg.size) {
  console.log(`  pyodide packages required: ${[...summary.needsPkg].join(', ')}`);
}
if (notes.length) console.log(notes.join('\n'));
