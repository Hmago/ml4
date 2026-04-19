// Splits js/data/dsa_problems.js into:
//   js/data/dsa_problems_index.js — metadata (everything except starterCode)
//   js/data/dsa_problems_full.js  — { id: starterCodeString, ... } lookup
//
// Run:  node tools/split-dsa.js
// Validates round-trip equivalence before writing.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'js', 'data', 'dsa_problems.js');
const INDEX_OUT = path.join(__dirname, '..', 'js', 'data', 'dsa_problems_index.js');
const FULL_OUT = path.join(__dirname, '..', 'js', 'data', 'dsa_problems_full.js');

const src = fs.readFileSync(SRC, 'utf8');

// 1. Capture (id, starterCode) pairs by scanning left-to-right. We rely on the
//    invariant that no backtick appears inside any Java starter code (enforced
//    during authoring). So each `starterCode: \`...\`` is a simple delimited block.
const idRe = /id:\s*['"]([^'"]+)['"]/g;
const codeStartRe = /starterCode:\s*`/g;

// Pair each starterCode with the closest preceding id.
function extractProblems(source) {
  const ids = [];
  let m;
  idRe.lastIndex = 0;
  while ((m = idRe.exec(source)) !== null) {
    ids.push({ id: m[1], pos: m.index });
  }

  const codes = [];
  codeStartRe.lastIndex = 0;
  while ((m = codeStartRe.exec(source)) !== null) {
    const start = m.index + m[0].length;
    // find matching backtick
    const end = source.indexOf('`', start);
    if (end === -1) throw new Error('Unclosed starterCode at pos ' + m.index);
    codes.push({ start: m.index, codeStart: start, codeEnd: end, content: source.substring(start, end) });
  }

  // Pair each code with the nearest preceding id (same problem object)
  const pairs = [];
  for (const c of codes) {
    let matchId = null;
    for (const i of ids) {
      if (i.pos < c.start) matchId = i.id;
      else break;
    }
    if (!matchId) throw new Error('No id found before starterCode at pos ' + c.start);
    pairs.push({ id: matchId, code: c.content, blockStart: c.start, blockEnd: c.codeEnd + 1 });
  }
  return pairs;
}

const pairs = extractProblems(src);
console.log('Extracted', pairs.length, 'problems');

// Check for duplicate ids
const idCounts = {};
for (const p of pairs) idCounts[p.id] = (idCounts[p.id] || 0) + 1;
const dups = Object.entries(idCounts).filter(([, c]) => c > 1);
if (dups.length) {
  console.error('DUPLICATE IDS:', dups);
  process.exit(1);
}

// 2. Build index source: replace each starterCode block with `starterCode: null`.
//    Walk from end to start so byte offsets stay valid.
let indexSrc = src;
const sortedByPos = [...pairs].sort((a, b) => b.blockStart - a.blockStart);
for (const p of sortedByPos) {
  indexSrc = indexSrc.substring(0, p.blockStart) + 'starterCode: null' + indexSrc.substring(p.blockEnd);
}

// Sanity: the index source should still parse and give the same problems with null starterCode.
const ctx1 = {};
vm.runInNewContext(indexSrc + '\nthis.DSA_PROBLEMS = DSA_PROBLEMS;', ctx1);
if (!Array.isArray(ctx1.DSA_PROBLEMS)) throw new Error('Index: DSA_PROBLEMS is not an array');
if (ctx1.DSA_PROBLEMS.length !== pairs.length) {
  throw new Error('Index array length mismatch: ' + ctx1.DSA_PROBLEMS.length + ' vs ' + pairs.length);
}
for (const p of ctx1.DSA_PROBLEMS) {
  if (p.starterCode !== null) throw new Error('Index problem ' + p.id + ' starterCode not null');
}

// 3. Build full source: a lookup map. Use template literal to preserve content.
//    Keys as JSON-stringified (ASCII-safe), values as raw backticks.
const fullLines = [];
fullLines.push('// Full starter-code data for DSA problems. Lazy-loaded by dsa.js when a');
fullLines.push('// problem page is opened. The metadata-only index lives in dsa_problems_index.js.');
fullLines.push('');
fullLines.push('const DSA_STARTER_CODE = {');
for (const p of pairs) {
  // Safety: if any backtick slipped in, escape it. Should never happen in practice.
  if (p.code.indexOf('`') !== -1) throw new Error('Backtick in starter code for ' + p.id);
  // Safety: Java code should not contain ${...} but check anyway.
  if (/\$\{/.test(p.code)) throw new Error('${} in starter code for ' + p.id);
  fullLines.push(`  ${JSON.stringify(p.id)}: \`${p.code}\`,`);
}
fullLines.push('};');
fullLines.push('');
fullLines.push('// Merge into DSA_PROBLEMS (index must have loaded first).');
fullLines.push('if (typeof DSA_PROBLEMS !== "undefined") {');
fullLines.push('  for (const p of DSA_PROBLEMS) {');
fullLines.push('    if (DSA_STARTER_CODE[p.id]) p.starterCode = DSA_STARTER_CODE[p.id];');
fullLines.push('  }');
fullLines.push('}');
fullLines.push('');
fullLines.push('// Signal to code waiting for lazy load to resolve (see dsa.js ensureDsaFullData).');
fullLines.push('if (typeof window !== "undefined") {');
fullLines.push('  window.__dsaFullLoaded = true;');
fullLines.push('  window.dispatchEvent(new Event("dsa-full-loaded"));');
fullLines.push('}');

const fullSrc = fullLines.join('\n') + '\n';

// Round-trip validation: merge and compare to original.
const ctx2 = {};
vm.runInNewContext(indexSrc + '\nthis.DSA_PROBLEMS = DSA_PROBLEMS;', ctx2);
vm.runInNewContext(fullSrc, ctx2);
const ctx3 = {};
vm.runInNewContext(src + '\nthis.DSA_PROBLEMS = DSA_PROBLEMS;', ctx3);
if (ctx2.DSA_PROBLEMS.length !== ctx3.DSA_PROBLEMS.length) {
  throw new Error('Merged length mismatch');
}
let mismatches = 0;
for (let i = 0; i < ctx2.DSA_PROBLEMS.length; i++) {
  const a = ctx2.DSA_PROBLEMS[i];
  const b = ctx3.DSA_PROBLEMS[i];
  if (a.id !== b.id) mismatches++;
  if (a.starterCode !== b.starterCode) mismatches++;
}
if (mismatches > 0) {
  console.error('Round-trip mismatches:', mismatches);
  process.exit(1);
}

fs.writeFileSync(INDEX_OUT, indexSrc);
fs.writeFileSync(FULL_OUT, fullSrc);
console.log('Index bytes:', indexSrc.length, '→', INDEX_OUT);
console.log('Full bytes:', fullSrc.length, '→', FULL_OUT);
console.log('Round-trip OK.');
