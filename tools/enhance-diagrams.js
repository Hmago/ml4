#!/usr/bin/env node
/*
 * enhance-diagrams.js — post-processes the hand-authored case-study HLD SVGs in
 * diagrams/ to add three things uniformly, WITHOUT touching their existing layout:
 *   1. Accessibility: a <title> + <desc> (screen readers only get the markdown alt today).
 *   2. A compact in-figure legend documenting the colour / line-style vocabulary
 *      (the "notes style" key: service / datastore / queue / external / gateway,
 *       solid = sync path, dashed = async).
 *   3. Dark-mode support via an internal <style> @media (prefers-color-scheme: dark)
 *      block that recolours the known, uniform palette so the diagram is legible on
 *      a dark canvas (keyed to the OS scheme when the SVG is rendered as <img>).
 *
 * The legend lives in a NEW 46px strip appended at the bottom (viewBox height grows),
 * so nothing in the original drawing moves or is overlapped.
 *
 * Idempotent: files already carrying data-enhanced="1" are skipped.
 * Usage:  node tools/enhance-diagrams.js [--check]
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'diagrams');
const STRIP = 46; // height added at the bottom for the legend
const checkOnly = process.argv.includes('--check');

// Human-readable titles per file (falls back to a prettified filename).
const TITLES = {
  notification: 'Notification System', chat: 'Chat / Messaging (WhatsApp / Slack)',
  video_conf: 'Video Conferencing (Zoom / Google Meet)', collab_editor: 'Collaborative Editor (Google Docs)',
  autocomplete: 'Search Autocomplete / Typeahead', crawler: 'Web Crawler (Googlebot)',
  proximity: 'Proximity / Nearby (Maps / Yelp)', ride_hailing: 'Ride-Hailing (Uber / Lyft)',
  news_feed: 'News Feed (Twitter / Facebook)', video_streaming: 'Video Streaming (YouTube / Netflix)',
  file_sync: 'File Sync & Storage (Drive / Dropbox)', url_shortener: 'URL Shortener (TinyURL)',
  rate_limiter: 'Distributed Rate Limiter', unique_id: 'Distributed Unique ID Generator (Snowflake)',
  topk: 'Top-K / Trending / Heavy Hitters', leaderboard: 'Leaderboard / Ranking',
  dist_cache: 'Distributed Cache (Redis / Memcached)', scheduler: 'Distributed Job Scheduler / Task Queue',
  payment: 'Payment System / Digital Wallet', inventory: 'E-commerce Inventory / Flash Sale',
  kv_store: 'Distributed Key-Value Store (Dynamo-style)', pastebin: 'Pastebin',
  llm_serving: 'LLM Inference Serving', rag: 'RAG / Semantic Search', recsys: 'Recommendation Feed',
  amazon: 'E-commerce Platform (Amazon / Flipkart)',
};

const DESC =
  'High-level architecture diagram. Rounded boxes are stateless services or datastores; ' +
  'solid arrows mark the critical/synchronous request path and dashed arrows mark ' +
  'asynchronous or secondary flows; dashed rounded containers group a service boundary. ' +
  'Colour denotes role: blue = service, teal = datastore, orange = queue/stream, ' +
  'green = external/3rd-party, indigo = gateway/load balancer.';

const xmlEsc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Dark-mode style: overrides keyed to the uniform palette these SVGs share.
const DARK_STYLE =
  '<style>@media (prefers-color-scheme:dark){' +
  '.dgm-bg{fill:#0b1220}' +
  'rect[fill="#fff"]{fill:#1f2937}' +
  'rect[fill="#ffffff"]:not(.dgm-bg):not(.dgm-leg){fill:#1f2937}' +
  'rect[fill="#f8fafc"]{fill:#111827}' +
  '[fill="#3c454d"]{fill:#cbd5e1}' +
  '[fill="#27313a"]{fill:#e5e7eb}' +
  'path[stroke="#55606a"]{stroke:#94a3b8}' +
  'polygon[fill="#55606a"]{fill:#94a3b8}' +
  '[stroke="#dde2e7"]{stroke:#3b4657}' +
  '}</style>';

function legend(W, yTop) {
  const items = [
    ['sw', '#0078D4', 'service'],
    ['sw', '#0C8599', 'datastore'],
    ['sw', '#F7630C', 'queue'],
    ['sw', '#2f9e44', 'external'],
    ['sw', '#4f46e5', 'gateway'],
    ['solid', null, 'sync'],
    ['dash', null, 'async'],
  ];
  const pad = 16;
  const usable = W - pad * 2;
  const step = usable / items.length;
  const yc = yTop + 25;
  let g = `<g class="dgm-legend"><path d="M${pad},${yTop + 6} L${W - pad},${yTop + 6}" stroke="#dde2e7" stroke-width="1" fill="none"></path>`;
  items.forEach((it, i) => {
    const x = pad + step * i + 8;
    if (it[0] === 'sw') {
      g += `<rect class="dgm-leg" x="${x}" y="${yc - 6}" width="13" height="13" rx="3" ry="3" fill="${it[1]}"></rect>`;
      g += `<text x="${x + 19}" y="${yc}" fill="#27313a" font-size="10.5" font-weight="600" dominant-baseline="central">${it[2]}</text>`;
    } else if (it[0] === 'solid') {
      g += `<path d="M${x},${yc} L${x + 22},${yc}" stroke="#55606a" stroke-width="1.9" fill="none"></path>`;
      g += `<polygon points="${x + 22},${yc} ${x + 16},${yc - 3} ${x + 16},${yc + 3}" fill="#55606a"></polygon>`;
      g += `<text x="${x + 28}" y="${yc}" fill="#27313a" font-size="10.5" font-weight="600" dominant-baseline="central">${it[2]}</text>`;
    } else {
      g += `<path d="M${x},${yc} L${x + 22},${yc}" stroke="#aab2bb" stroke-width="1.6" stroke-dasharray="6 5" fill="none"></path>`;
      g += `<polygon points="${x + 22},${yc} ${x + 16},${yc - 3} ${x + 16},${yc + 3}" fill="#aab2bb"></polygon>`;
      g += `<text x="${x + 28}" y="${yc}" fill="#27313a" font-size="10.5" font-weight="600" dominant-baseline="central">${it[2]}</text>`;
    }
  });
  return g + '</g>';
}

function enhance(file) {
  const key = path.basename(file, '.svg');
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes('data-enhanced="1"')) return { key, status: 'skip' };

  const svgTagMatch = s.match(/<svg\b[^>]*>/);
  if (!svgTagMatch) return { key, status: 'no-svg-tag' };
  const svgTag = svgTagMatch[0];

  const vb = svgTag.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  if (!vb) return { key, status: 'no-viewbox' };
  const W = parseFloat(vb[1]);
  const H = parseFloat(vb[2]);
  const H2 = H + STRIP;

  // 1. Rewrite the opening <svg> tag: mark enhanced, grow viewBox + height.
  let newTag = svgTag
    .replace(/viewBox="0 0 [\d.]+ [\d.]+"/, `viewBox="0 0 ${W} ${H2}"`)
    .replace(/(\sheight=")[\d.]+(")/, `$1${H2}$2`);
  if (!/data-enhanced=/.test(newTag)) newTag = newTag.replace(/<svg\b/, '<svg data-enhanced="1"');

  // 2. Grow the full-canvas background rect + tag it for dark-mode targeting.
  const bgRe = new RegExp(`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"\\s*/?>(?:</rect>)?`);
  if (!bgRe.test(s)) return { key, status: 'no-bg-rect' };
  s = s.replace(bgRe, `<rect class="dgm-bg" x="0" y="0" width="${W}" height="${H2}" fill="#ffffff"></rect>`);

  // 3. Inject <title>/<desc>/<style> right after the opening tag.
  const title = TITLES[key] || key.replace(/_/g, ' ');
  const head = `<title>${xmlEsc(title)} — high-level architecture (HLD)</title>` +
    `<desc>${xmlEsc(DESC)}</desc>` + DARK_STYLE;
  s = s.replace(svgTag, newTag + head);

  // 4. Append legend in the new bottom strip, just before </svg>.
  s = s.replace(/<\/svg>\s*$/, legend(W, H) + '</svg>');

  if (!checkOnly) fs.writeFileSync(file, s, 'utf8');
  return { key, status: checkOnly ? 'would-update' : 'updated', W, H: H2 };
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.svg')).sort();
let changed = 0;
for (const f of files) {
  const r = enhance(path.join(DIR, f));
  if (r.status === 'updated' || r.status === 'would-update') changed++;
  if (r.status !== 'skip') console.log(`${r.status.padEnd(13)} ${r.key}${r.W ? `  (${r.W}x${r.H})` : ''}`);
}
console.log(`\n${changed} ${checkOnly ? 'would change' : 'changed'}, ${files.length} total.`);
