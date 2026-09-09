#!/usr/bin/env node
// tools/generate-diagrams.js
//
// Generates AI architecture diagrams (via the internal Microsoft Designer/
// Copilot "Create" image-generation API) for every case study in Chapters
// 35-37, and inserts each result as a NEW image line immediately after the
// existing hand-made SVG diagram in the chapter markdown, for side-by-side
// review. Does NOT touch or remove any existing diagram.
//
// USAGE:
//   1. cp tools/diagrams-auth.example.json tools/diagrams-auth.json
//      and fill in real values captured from your browser session (see that
//      file's _howTo notes). tools/diagrams-auth.json is gitignored — never
//      commit real credentials.
//   2. node tools/generate-diagrams.js --dry-run
//        Prints every target + its full prompt without calling the API, so
//        you can review prompts before spending your ~1-hour token window.
//   3. node tools/generate-diagrams.js [--concurrency=4] [--only=chat,topk]
//        Runs for real. --only limits to specific target ids (comma-separated),
//        useful for retrying just the ones that failed.
//
// Requires Node 18+ (built-in fetch/crypto.randomUUID).

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { buildPrompt, DIAGRAM_TARGETS } = require('./diagram-prompts');

const REPO_ROOT = path.resolve(__dirname, '..');
const AUTH_PATH = path.join(__dirname, 'diagrams-auth.json');
const DIAGRAMS_DIR = path.join(REPO_ROOT, 'diagrams');

const POLL_TIMEOUT_MS = 5 * 60 * 1000; // give up on one generation after 5 min
const DEFAULT_CONCURRENCY = 4;

function parseArgs(argv) {
  const args = { dryRun: false, only: null, concurrency: DEFAULT_CONCURRENCY };
  for (const a of argv) {
    if (a === '--dry-run') args.dryRun = true;
    else if (a.startsWith('--only=')) args.only = a.slice('--only='.length).split(',').map(s => s.trim()).filter(Boolean);
    else if (a.startsWith('--concurrency=')) args.concurrency = parseInt(a.slice('--concurrency='.length), 10) || DEFAULT_CONCURRENCY;
  }
  return args;
}

function loadConfig() {
  if (!fs.existsSync(AUTH_PATH)) {
    console.error(`\nMissing ${path.relative(REPO_ROOT, AUTH_PATH)}.\n` +
      `Copy tools/diagrams-auth.example.json to tools/diagrams-auth.json and fill in real values\n` +
      `captured from a live browser session (see the _howTo notes in the example file).\n`);
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(AUTH_PATH, 'utf8'));
  const required = ['apiBase', 'sessionId', 'deviceId', 'userId', 'containerId', 'fileToken', 'origin', 'referer', 'authorization'];
  const missing = required.filter(k => !cfg[k] || String(cfg[k]).startsWith('PASTE-'));
  if (missing.length) {
    console.error(`\ntools/diagrams-auth.json is missing/unfilled fields: ${missing.join(', ')}\n`);
    process.exit(1);
  }
  return cfg;
}

// Headers shared by generate.ashx / Poll.ashx, matching a real captured session.
function sessionHeaders(cfg, correlationId) {
  return {
    'content-type': 'application/json',
    'accept': 'application/json, text/plain, */*',
    'audiencegroup': cfg.audienceGroup || 'Dogfood',
    'authorization': cfg.authorization,
    'caller': cfg.caller || 'CreateModule',
    'clientname': cfg.clientName || 'CreateModule',
    'containerid': cfg.containerId,
    'deviceid': cfg.deviceId,
    'filetoken': cfg.fileToken,
    'operationtype': cfg.operationType || 'AiGeneration',
    'origin': cfg.origin,
    'referer': cfg.referer,
    'sessionid': cfg.sessionId,
    'userid': cfg.userId,
    'x-correlation': correlationId,
    'x-dc-hint': cfg.dcHint || 'WestUS2',
    'x-modelvariant': cfg.modelVariant || 'prod-gpt-image-2',
  };
}

async function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

// Step 1: kick off generation. Returns the initial poll cursor + interval.
async function startGeneration(cfg, prompt, correlationId) {
  const body = {
    conversation: {
      messages: [{ id: correlationId, content: { parts: [prompt] } }],
      orientation: cfg.orientation || 'landscape',
    },
    enablePartialResponse: true,
    enableEditableDesign: false,
    orientation: cfg.orientation || 'landscape',
    metadata: {
      outputFormat: 'design',
      outputType: 'url',
      dimensions: cfg.dimensions || { width: 1536, height: 1024 },
    },
    persist: true,
  };
  const res = await fetch(`${cfg.apiBase}/generate.ashx?intent=image`, {
    method: 'POST',
    headers: sessionHeaders(cfg, correlationId),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`generate.ashx failed: ${res.status} ${res.statusText} — ${await res.text().catch(() => '')}`);
  const json = await res.json();
  const pr = json.polling_response;
  if (!pr || !pr.polling_meta_data) throw new Error(`generate.ashx: unexpected response shape: ${JSON.stringify(json).slice(0, 300)}`);
  return { cursor: pr.polling_meta_data.poll_cursor, intervalMs: pr.polling_meta_data.poll_interval || 2000 };
}

// Step 2: poll until Completed/Failed or timeout. Returns the final JSON body.
async function pollUntilDone(cfg, cursor, intervalMs, correlationId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let currentCursor = cursor;
  while (Date.now() < deadline) {
    await sleep(intervalMs);
    const res = await fetch(`${cfg.apiBase}/Poll.ashx?cursor=${encodeURIComponent(currentCursor)}`, {
      method: 'GET',
      headers: sessionHeaders(cfg, correlationId),
    });
    if (!res.ok) throw new Error(`Poll.ashx failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const status = json.polling_response && json.polling_response.polling_status;
    if (status === 'Completed') return json;
    if (status === 'Failed' || status === 'Error') throw new Error(`generation failed: ${JSON.stringify(json).slice(0, 300)}`);
    // still InProgress — keep polling with the (possibly refreshed) cursor
    currentCursor = (json.polling_response && json.polling_response.polling_meta_data && json.polling_response.polling_meta_data.poll_cursor) || currentCursor;
  }
  throw new Error(`timed out after ${POLL_TIMEOUT_MS / 1000}s waiting for completion`);
}

// Step 3: fetch the actual PNG bytes. The URL in the poll response carries a
// per-image `fileToken` query param (a JWT-like token distinct from the
// session-level cfg.fileToken GUID used on generate.ashx/Poll.ashx). The
// working pattern (confirmed against a real captured 200 response) is to
// MOVE that per-image token from the query string into a `filetoken` HEADER.
// IMPORTANT: manipulate the URL with plain string/regex ops, NOT the URL /
// URLSearchParams API — round-tripping through URLSearchParams can re-encode
// the `path` param (which itself contains %2F-encoded slashes) differently
// than the server originally sent it, which silently breaks an exact-match
// signature check server-side (observed as a 401 with no useful message).
function extractAndStripFileToken(rawUrl) {
  const match = rawUrl.match(/[?&]fileToken=([^&]+)/);
  const fileToken = match ? decodeURIComponent(match[1]) : null;
  const strippedUrl = rawUrl.replace(/([?&])fileToken=[^&]+&?/, (whole, sep) => (sep === '?' ? '?' : '')).replace(/[?&]$/, '');
  return { fileToken, strippedUrl };
}

async function fetchImageBytes(cfg, imageUrl) {
  const { fileToken: perImageFileToken, strippedUrl } = extractAndStripFileToken(imageUrl);
  const res = await fetch(strippedUrl, {
    method: 'GET',
    headers: {
      accept: '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'en-US,en;q=0.9',
      authorization: cfg.authorization,
      origin: cfg.origin,
      referer: cfg.referer,
      filetoken: perImageFileToken || cfg.fileToken,
      'user-agent': cfg.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
    },
  });
  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    throw new Error(`document.ashx fetch failed: ${res.status} ${res.statusText} | url=${strippedUrl} | usedPerImageToken=${!!perImageFileToken} | body=${bodyText.slice(0, 300)}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Inserts (or updates) the AI-image markdown line right after the existing
// SVG line. Idempotent by PNG PATH, not by exact line text — matching on the
// full line (including the title) would create a duplicate every time a
// prompt's `title` is edited, since the old line would no longer match the
// newly-composed one. Instead: find any existing line pointing at the same
// `diagrams/<svgBase>_ai.png`, and replace it in place if the text differs;
// otherwise insert fresh after the SVG line.
function insertImageIntoChapter(chapterFile, existingImageLine, newImageLine, relOut) {
  const filePath = path.join(REPO_ROOT, chapterFile);
  const text = fs.readFileSync(filePath, 'utf8');
  const existingLineRegex = new RegExp(`^!\\[[^\\]]*\\]\\(${relOut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)$`, 'm');
  const match = text.match(existingLineRegex);
  if (match) {
    if (match[0] === newImageLine) return { inserted: false, reason: 'already present and up to date' };
    fs.writeFileSync(filePath, text.replace(existingLineRegex, newImageLine), 'utf8');
    return { inserted: true, reason: 'replaced stale line (title text had changed)' };
  }
  if (!text.includes(existingImageLine)) return { inserted: false, reason: 'existingImageLine not found — chapter text may have changed' };
  const updated = text.replace(existingImageLine, `${existingImageLine}\n${newImageLine}`);
  fs.writeFileSync(filePath, updated, 'utf8');
  return { inserted: true, reason: 'fresh insert' };
}

async function runOne(cfg, target) {
  const correlationId = randomUUID();
  const prompt = buildPrompt(target);
  console.log(`[${target.id}] starting generation…`);
  const { cursor, intervalMs } = await startGeneration(cfg, prompt, correlationId);
  const done = await pollUntilDone(cfg, cursor, intervalMs, correlationId);
  const image = done.images && done.images[0];
  if (!image || !image.url) throw new Error(`no image in completed response: ${JSON.stringify(done).slice(0, 300)}`);
  console.log(`[${target.id}] generation complete, fetching bytes…`);
  const bytes = await fetchImageBytes(cfg, image.url);
  if (!fs.existsSync(DIAGRAMS_DIR)) fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
  const outPath = path.join(DIAGRAMS_DIR, `${target.svgBase}_ai.png`);
  fs.writeFileSync(outPath, bytes);
  const relOut = `diagrams/${target.svgBase}_ai.png`;
  // Reuse the original HLD caption text (preserved in existingImageLine even though
  // that old SVG has since been deleted) so regenerated images keep the finalized,
  // "not a draft" caption style rather than reverting to draft/review wording.
  const altMatch = target.existingImageLine && target.existingImageLine.match(/^!\[([^\]]*)\]\(/);
  const caption = altMatch ? altMatch[1] : target.title;
  const newImageLine = `![${caption}](${relOut})`;
  const insertResult = insertImageIntoChapter(target.chapterFile, target.existingImageLine, newImageLine, relOut);
  console.log(`[${target.id}] saved ${relOut} (${(bytes.length / 1024).toFixed(0)} KB) — ${insertResult.inserted ? 'inserted into chapter' : 'NOT inserted: ' + insertResult.reason}`);
  return { id: target.id, ok: true, outPath, insertResult };
}

// Simple concurrency-limited runner.
async function runAllLimited(cfg, targets, concurrency) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < targets.length) {
      const target = targets[idx++];
      try {
        results.push(await runOne(cfg, target));
      } catch (err) {
        console.error(`[${target.id}] FAILED: ${err.message}`);
        results.push({ id: target.id, ok: false, error: err.message });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, worker));
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let targets = DIAGRAM_TARGETS;
  if (args.only) targets = targets.filter(t => args.only.includes(t.id));
  if (!targets.length) {
    console.error('No matching targets. Valid ids: ' + DIAGRAM_TARGETS.map(t => t.id).join(', '));
    process.exit(1);
  }

  if (args.dryRun) {
    for (const t of targets) {
      console.log(`\n=== [${t.id}] ${t.title} ===`);
      console.log(`chapter: ${t.chapterFile}`);
      console.log(`output:  diagrams/${t.svgBase}_ai.png`);
      console.log(`--- full prompt ---\n${buildPrompt(t)}\n`);
    }
    console.log(`\n(dry run — ${targets.length} target(s), no API calls made)`);
    return;
  }

  const cfg = loadConfig();
  console.log(`Generating ${targets.length} diagram(s) with concurrency=${args.concurrency}…`);
  const started = Date.now();
  const results = await runAllLimited(cfg, targets, args.concurrency);
  const ok = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);
  console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(0)}s — ${ok.length} succeeded, ${failed.length} failed.`);
  if (failed.length) {
    console.log('Failed ids (retry with --only=' + failed.map(f => f.id).join(',') + '):');
    failed.forEach(f => console.log(`  - ${f.id}: ${f.error}`));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
