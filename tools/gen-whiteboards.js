#!/usr/bin/env node
/*
 * gen-whiteboards.js — generates "whiteboard rehearsal" companion diagrams for the
 * case-study HLD figures in chapters 35-37. For each clean HLD SVG in diagrams/<key>.svg
 * it parses the (uniform) structure and re-renders the SAME architecture, at the SAME
 * coordinates, in a hand-drawn Excalidraw-style sketch (rough boxes + arrows, Virgil
 * font) — the way a candidate would actually draw it live on a whiteboard.
 *
 * It writes diagrams/<key>_whiteboard.svg. The artisanal notification_whiteboard.svg is
 * intentionally NOT regenerated (it is hand-authored in Excalidraw).
 *
 * Role is encoded in the clean SVG by the node's stroke colour; we remap role -> the
 * Excalidraw whiteboard palette:
 *   client (grey #6c757d) -> green   gateway (indigo #4338ca) -> grey
 *   service (blue #0F5BB5) -> blue    datastore (teal #0A6E80) -> red
 *   queue  (orange #C8590B) -> orange external (green #1F7A33) -> violet
 *
 * Deterministic: every element is seeded from its own coordinates, so re-running the
 * tool produces byte-identical output (no spurious diffs).
 *
 * Usage:  node tools/gen-whiteboards.js [--check] [key ...]
 *   --check : parse + render in memory, report, but do not write files (CI guard).
 *   key...  : restrict to specific diagram keys (default: all in KEYS).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'diagrams');

const KEYS = [
  'chat', 'video_conf', 'collab_editor',
  'autocomplete', 'crawler', 'proximity', 'ride_hailing', 'news_feed',
  'video_streaming', 'file_sync', 'url_shortener',
  'rate_limiter', 'unique_id', 'topk', 'leaderboard', 'dist_cache', 'scheduler',
  'payment', 'inventory', 'kv_store', 'pastebin', 'amazon',
  'llm_serving', 'rag', 'recsys',
  'arch_reference',
];

// clean stroke colour -> logical role
const ROLE = {
  '#6c757d': 'client', '#4338ca': 'gateway', '#0F5BB5': 'service',
  '#0A6E80': 'datastore', '#C8590B': 'queue', '#1F7A33': 'external',
};
// role -> [fill, stroke] in the Excalidraw whiteboard palette
const WB = {
  client: ['#b2f2bb', '#2f9e44'], gateway: ['#dee2e6', '#495057'],
  service: ['#a5d8ff', '#1971c2'], datastore: ['#ffc9c9', '#e03131'],
  queue: ['#ffd8a8', '#e8590c'], external: ['#d0bfff', '#7048e8'],
};
const INK = '#1e1e1e';   // hand-ink for arrows / labels
const SUBINK = '#495057';

// ---------------------------------------------------------------- seeded PRNG
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedOf = (x, y) => ((Math.round(x) * 73856093) ^ (Math.round(y) * 19349663)) >>> 0;
const n = (v) => Math.round(v * 100) / 100; // trim float noise in path output

// ----------------------------------------------------------------- rough geometry
function jit(rng, a) { return (rng() * 2 - 1) * a; }

// a sketchy cubic from p0->p1 with control points along the line, jittered
function seg(p0, p1, rng, amp) {
  const c1x = p0[0] + (p1[0] - p0[0]) * 0.33 + jit(rng, amp);
  const c1y = p0[1] + (p1[1] - p0[1]) * 0.33 + jit(rng, amp);
  const c2x = p0[0] + (p1[0] - p0[0]) * 0.66 + jit(rng, amp);
  const c2y = p0[1] + (p1[1] - p0[1]) * 0.66 + jit(rng, amp);
  const ex = p1[0] + jit(rng, amp * 0.5), ey = p1[1] + jit(rng, amp * 0.5);
  return `C${n(c1x)} ${n(c1y)}, ${n(c2x)} ${n(c2y)}, ${n(ex)} ${n(ey)}`;
}
// corner from A->B rounding around right-angle vertex V
function corner(A, B, V, rng, amp) {
  const k = 0.55;
  const c1x = A[0] + (V[0] - A[0]) * k + jit(rng, amp);
  const c1y = A[1] + (V[1] - A[1]) * k + jit(rng, amp);
  const c2x = B[0] + (V[0] - B[0]) * k + jit(rng, amp);
  const c2y = B[1] + (V[1] - B[1]) * k + jit(rng, amp);
  return `C${n(c1x)} ${n(c1y)}, ${n(c2x)} ${n(c2y)}, ${n(B[0])} ${n(B[1])}`;
}
// rounded-rect outline as one pass of bezier segments (clockwise from top-left start)
function rectLoop(w, h, r, rng, amp) {
  r = Math.max(2, Math.min(r, w / 2 - 1, h / 2 - 1));
  const P = {
    t0: [r, 0], t1: [w - r, 0], rt: [w, r], rb: [w, h - r],
    b1: [w - r, h], b0: [r, h], lb: [0, h - r], lt: [0, r],
  };
  let d = `M${n(P.t0[0])} ${n(P.t0[1])} `;
  d += seg(P.t0, P.t1, rng, amp) + ' ';
  d += corner(P.t1, P.rt, [w, 0], rng, amp) + ' ';
  d += seg(P.rt, P.rb, rng, amp) + ' ';
  d += corner(P.rb, P.b1, [w, h], rng, amp) + ' ';
  d += seg(P.b1, P.b0, rng, amp) + ' ';
  d += corner(P.b0, P.lb, [0, h], rng, amp) + ' ';
  d += seg(P.lb, P.lt, rng, amp) + ' ';
  d += corner(P.lt, P.t0, [0, 0], rng, amp);
  return d;
}
// a filled+stroked rough box at (x,y,w,h) for the given role colour
function roughBox(x, y, w, h, fill, stroke, seed) {
  const r = Math.min(16, h / 2.4);
  const rngF = mulberry32(seed);
  const fillD = rectLoop(w, h, r, rngF, 0.6) + ' Z';
  const rngS1 = mulberry32(seed ^ 0x9e3779b9);
  const rngS2 = mulberry32(seed ^ 0x85ebca6b);
  const strokeD = rectLoop(w, h, r, rngS1, 1.4) + ' ' + rectLoop(w, h, r, rngS2, 1.4);
  return `<g transform="translate(${n(x)} ${n(y)})">`
    + `<path d="${fillD}" stroke="none" fill="${fill}"></path>`
    + `<path d="${strokeD}" stroke="${stroke}" stroke-width="1.7" fill="none" stroke-linecap="round"></path>`
    + `</g>`;
}
// dashed rough container (service boundary)
function roughGroup(x, y, w, h, seed) {
  const r = 18;
  const rng = mulberry32(seed);
  const d = rectLoop(w, h, r, rng, 1.0);
  return `<g transform="translate(${n(x)} ${n(y)})">`
    + `<path d="${d}" stroke="${SUBINK}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-dasharray="8 9"></path>`
    + `</g>`;
}

// ----------------------------------------------------------------- text helpers
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// clean SVG text is already XML-escaped; decode it before we re-escape (avoids &amp;lt;)
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#0?39;/g, "'").replace(/&#x27;/gi, "'").replace(/&amp;/g, '&');
// rough character-width model for the Virgil hand font (em fractions)
function textW(s, size) { return s.length * size * 0.52; }
function fitSize(s, max, base, min) {
  let sz = base;
  const w = textW(s, sz);
  if (w > max) sz = Math.max(min, base * max / w);
  return Math.round(sz * 10) / 10;
}
function label(cx, cy, title, sub, maxW) {
  let out = '';
  const tSize = fitSize(title, maxW, 15, 9.5);
  if (sub) {
    out += `<text x="${n(cx)}" y="${n(cy - 9)}" font-family="Virgil, Segoe UI Emoji" font-size="${tSize}px" fill="${INK}" text-anchor="middle" dominant-baseline="central" style="white-space:pre">${esc(title)}</text>`;
    const sSize = fitSize(sub, maxW, 12, 8.5);
    out += `<text x="${n(cx)}" y="${n(cy + 10)}" font-family="Virgil, Segoe UI Emoji" font-size="${sSize}px" fill="${SUBINK}" text-anchor="middle" dominant-baseline="central" style="white-space:pre">${esc(sub)}</text>`;
  } else {
    out += `<text x="${n(cx)}" y="${n(cy)}" font-family="Virgil, Segoe UI Emoji" font-size="${tSize}px" fill="${INK}" text-anchor="middle" dominant-baseline="central" style="white-space:pre">${esc(title)}</text>`;
  }
  return out;
}

// ----------------------------------------------------------------- arrows
function arrow(pts, seed) {
  const rng = mulberry32(seed);
  let d = `M${n(pts[0][0])} ${n(pts[0][1])} `;
  for (let i = 1; i < pts.length; i++) d += seg(pts[i - 1], pts[i], rng, 1.1) + ' ';
  const tip = pts[pts.length - 1], prev = pts[pts.length - 2];
  const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  const L = 11, spread = 0.42;
  const a1 = ang + Math.PI - spread, a2 = ang + Math.PI + spread;
  const h1 = `M${n(tip[0])} ${n(tip[1])} L${n(tip[0] + L * Math.cos(a1))} ${n(tip[1] + L * Math.sin(a1))}`;
  const h2 = `M${n(tip[0])} ${n(tip[1])} L${n(tip[0] + L * Math.cos(a2))} ${n(tip[1] + L * Math.sin(a2))}`;
  return `<path d="${d.trim()}" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"></path>`
    + `<path d="${h1} ${h2}" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"></path>`;
}

// ----------------------------------------------------------------- parse clean SVG
const A = (s, name) => { const m = s.match(new RegExp(name + '="([^"]*)"')); return m ? m[1] : null; };
const NUM = (s, name) => { const v = A(s, name); return v == null ? null : parseFloat(v); };

function tokenize(svg) {
  const toks = [];
  const re = /<text\b([^>]*)>([\s\S]*?)<\/text>|<(rect|path|polygon)\b([^>]*?)\/?>(?:<\/\3>)?/g;
  let m;
  while ((m = re.exec(svg)) !== null) {
    if (m[1] !== undefined) toks.push({ tag: 'text', attrs: m[1], text: decode(m[2].replace(/<[^>]+>/g, '')) });
    else toks.push({ tag: m[3], attrs: m[4], text: '' });
  }
  return toks;
}
function pathPoints(d) {
  const pts = [];
  const re = /([ML])\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/g;
  let m;
  while ((m = re.exec(d)) !== null) pts.push([parseFloat(m[2]), parseFloat(m[3])]);
  return pts;
}

function parse(svg) {
  const vb = A(svg, 'viewBox').split(/\s+/).map(Number);
  const toks = tokenize(svg);
  const nodes = [], groups = [], arrows = [], pills = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.tag === 'rect') {
      const stroke = A(t.attrs, 'stroke');
      const dash = /stroke-dasharray/.test(t.attrs);
      const x = NUM(t.attrs, 'x'), y = NUM(t.attrs, 'y'), w = NUM(t.attrs, 'width'), h = NUM(t.attrs, 'height');
      if (dash) {
        // group container; label = next text within a few tokens
        let lab = '';
        for (let j = i + 1; j < Math.min(i + 4, toks.length); j++) {
          if (toks[j].tag === 'text') { lab = toks[j].text.replace(/^▢\s*/, '').trim(); break; }
        }
        groups.push({ x, y, w, h, label: lab });
      } else if (stroke === '#dde2e7') {
        const nx = toks[i + 1];
        const lab = nx && nx.tag === 'text' ? nx.text.trim() : '';
        pills.push({ cx: x + w / 2, cy: y + h / 2, label: lab });
      } else if (ROLE[stroke]) {
        // node box: collect title/subtitle texts up to next rect/polygon
        const texts = [];
        for (let j = i + 1; j < toks.length; j++) {
          if (toks[j].tag === 'rect' || toks[j].tag === 'polygon') break;
          if (toks[j].tag === 'text') texts.push(toks[j].text.trim());
        }
        nodes.push({ x, y, w, h, role: ROLE[stroke], title: texts[0] || '', sub: texts.slice(1).filter(Boolean).join(' · ') });
      }
    } else if (t.tag === 'polygon') {
      // arrow: the immediately preceding <path> is its line
      for (let j = i - 1; j >= 0; j--) {
        if (toks[j].tag === 'path') {
          const pts = pathPoints(A(toks[j].attrs, 'd') || '');
          if (pts.length >= 2) arrows.push(pts);
          break;
        }
        if (toks[j].tag === 'polygon' || toks[j].tag === 'rect') break;
      }
    }
  }
  // drop free-floating arrow stubs (legend/decoration in some source SVGs): a real
  // connector always touches a node box at one end. margin tolerates the ~0-9px gap
  // the clean SVGs leave between an arrowhead and the box edge.
  const M = 28;
  const touchesBox = (p) => nodes.some((b) =>
    p[0] >= b.x - M && p[0] <= b.x + b.w + M && p[1] >= b.y - M && p[1] <= b.y + b.h + M);
  const keptArrows = arrows.filter((pts) => touchesBox(pts[0]) || touchesBox(pts[pts.length - 1]));
  return { vb, nodes, groups, arrows: keptArrows, pills };
}

// ----------------------------------------------------------------- emit whiteboard SVG
const FONT_DEFS = `<defs><style class="style-fonts">
@font-face{font-family:"Virgil";src:url("https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist//dist/excalidraw-assets/Virgil.woff2");}
</style></defs>`;

function render(title, parsed) {
  const TOP = 84;
  const W = parsed.vb[2], H = parsed.vb[3] + TOP;
  let body = '';
  // groups (background border only — labels drawn on top later)
  for (const g of parsed.groups) {
    body += roughGroup(g.x, g.y, g.w, g.h, seedOf(g.x, g.y));
  }
  // arrows
  for (const pts of parsed.arrows) body += arrow(pts, seedOf(pts[0][0] + pts[pts.length - 1][0], pts[0][1] + pts[pts.length - 1][1]));
  // node boxes + labels
  for (const nd of parsed.nodes) {
    const [fill, stroke] = WB[nd.role];
    body += roughBox(nd.x, nd.y, nd.w, nd.h, fill, stroke, seedOf(nd.x, nd.y));
    body += label(nd.x + nd.w / 2, nd.y + nd.h / 2, nd.title, nd.sub, nd.w - 16);
  }
  // group boundary labels — sit on the top border (fieldset-legend style) with a white halo
  for (const g of parsed.groups) {
    if (!g.label) continue;
    const sz = 12.5, lx = g.x + 18, tw = textW(g.label, sz);
    body += `<rect x="${n(lx - 5)}" y="${n(g.y - 9)}" width="${n(tw + 10)}" height="18" fill="#ffffff" stroke="none"></rect>`;
    body += `<text x="${n(lx)}" y="${n(g.y)}" font-family="Virgil, Segoe UI Emoji" font-size="${sz}px" fill="${SUBINK}" text-anchor="start" dominant-baseline="central" style="white-space:pre">${esc(g.label)}</text>`;
  }
  // step labels (flow numbers) — small ink text with a soft halo
  for (const p of parsed.pills) {
    if (!p.label) continue;
    const sz = fitSize(p.label, 150, 11.5, 8.5);
    const halfW = textW(p.label, sz) / 2 + 4;
    body += `<rect x="${n(p.cx - halfW)}" y="${n(p.cy - 9)}" width="${n(halfW * 2)}" height="18" rx="6" ry="6" fill="#ffffff" fill-opacity="0.82" stroke="none"></rect>`;
    body += `<text x="${n(p.cx)}" y="${n(p.cy)}" font-family="Virgil, Segoe UI Emoji" font-size="${sz}px" fill="#27313a" text-anchor="middle" dominant-baseline="central" style="white-space:pre">${esc(p.label)}</text>`;
  }
  const legend = 'green = client   ·   grey = edge / LB   ·   blue = service   ·   red = datastore   ·   orange = queue / stream   ·   violet = 3rd-party';
  return `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <!-- svg-source:gen-whiteboards.js -->
  ${FONT_DEFS}
  <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"></rect>
  <text x="24" y="26" font-family="Virgil, Segoe UI Emoji" font-size="22px" fill="#1e1e1e" text-anchor="start" dominant-baseline="central" style="white-space:pre">${esc(title)} — how you'd draw it live on the whiteboard</text>
  <text x="24" y="58" font-family="Virgil, Segoe UI Emoji" font-size="13px" fill="#868e96" text-anchor="start" dominant-baseline="central" style="white-space:pre">${esc(legend)}</text>
  <g transform="translate(0 ${TOP})">${body}</g>
</svg>
`;
}

// titles (from enhance-diagrams.js)
const TITLES = {
  chat: 'Chat / Messaging (WhatsApp / Slack)', video_conf: 'Video Conferencing (Zoom / Google Meet)',
  collab_editor: 'Collaborative Editor (Google Docs)', autocomplete: 'Search Autocomplete / Typeahead',
  crawler: 'Web Crawler (Googlebot)', proximity: 'Proximity / Nearby (Maps / Yelp)',
  ride_hailing: 'Ride-Hailing (Uber / Lyft)', news_feed: 'News Feed (Twitter / Facebook)',
  video_streaming: 'Video Streaming (YouTube / Netflix)', file_sync: 'File Sync & Storage (Drive / Dropbox)',
  url_shortener: 'URL Shortener (TinyURL)', rate_limiter: 'Distributed Rate Limiter',
  unique_id: 'Distributed Unique ID Generator (Snowflake)', topk: 'Top-K / Trending / Heavy Hitters',
  leaderboard: 'Leaderboard / Ranking', dist_cache: 'Distributed Cache (Redis / Memcached)',
  scheduler: 'Distributed Job Scheduler / Task Queue', payment: 'Payment System / Digital Wallet',
  inventory: 'E-commerce Inventory / Flash Sale', kv_store: 'Distributed Key-Value Store (Dynamo-style)',
  pastebin: 'Pastebin', amazon: 'E-commerce Platform (Amazon / Flipkart)',
  llm_serving: 'LLM Inference Serving', rag: 'RAG / Semantic Search', recsys: 'Recommendation Feed',
  arch_reference: 'The 4-Layer Reference Architecture',
};

// which chapter file each diagram lives in
const CH = {
  35: 'content/35_system_design_cases_realtime.md',
  36: 'content/36_system_design_cases_search_media.md',
  37: 'content/37_system_design_cases_scale_infra.md',
};
const FILEOF = {
  chat: 35, video_conf: 35, collab_editor: 35, arch_reference: 35,
  autocomplete: 36, crawler: 36, proximity: 36, ride_hailing: 36, news_feed: 36,
  video_streaming: 36, file_sync: 36, url_shortener: 36,
  rate_limiter: 37, unique_id: 37, topk: 37, leaderboard: 37, dist_cache: 37,
  scheduler: 37, payment: 37, inventory: 37, kv_store: 37, pastebin: 37, amazon: 37,
  llm_serving: 37, rag: 37, recsys: 37,
};

// The whiteboard rehearsal is an UNNUMBERED companion section that sits directly ABOVE the
// clean HLD section/heading (you rehearse the rough sketch first, then read the polished
// reference). `level` matches the HLD heading's level (## for normal cases, ### for the
// F1–F3 AI designs); `token` is the HLD heading's number, used for the cross-reference.
function makeSection(level, token, key, title) {
  const h = '#'.repeat(level);
  const alt = `${title} — whiteboard rehearsal sketch`;
  return [
    `${h} Whiteboard rehearsal — how you'd actually draw this live`,
    ``,
    `In the room you don't reproduce the polished diagram in §${token} below — you sketch rough`,
    `boxes and talk. So **rehearse from this first**: here is the same architecture as a **live`,
    `whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour`,
    `code is the one most candidates settle into:`,
    ``,
    `> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**`,
    ``,
    `![${alt}](diagrams/${key}_whiteboard.svg)`,
    ``,
    `**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §${token} is for`,
    `*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while`,
    `narrating every box out loud — that muscle memory is exactly what the interview tests. It is the`,
    `*same* components as the clean §${token} diagram, only drawn in the loose, name-the-tool style`,
    `your hand can produce under pressure: every box names a concrete technology, each datastore is`,
    `called out in red, queues in orange, third-party vendors in violet. That visual discipline is`,
    `the signal an interviewer is looking for.`,
  ];
}

// Idempotent: places the whiteboard section directly before the clean diagram's HLD heading.
// If a whiteboard block already exists in the wrong spot (e.g. below the clean diagram) it is
// removed and re-placed; if it is already above, the file is left untouched.
function insertMarkdown(check) {
  const root = path.join(__dirname, '..');
  let placed = 0, skipped = 0;
  for (const key of KEYS) {
    const rel = CH[FILEOF[key]];
    const file = path.join(root, rel);
    let lines = fs.readFileSync(file, 'utf8').split('\n');

    const cleanIdx0 = lines.findIndex((l) => l.includes(`](diagrams/${key}.svg)`));
    if (cleanIdx0 < 0) { console.error('  ! clean image not found for', key, 'in', rel); process.exitCode = 1; continue; }

    // Remove any existing (wrongly-placed) whiteboard block; skip if already above the diagram.
    const wbImg = lines.findIndex((l) => l.includes(`${key}_whiteboard.svg`));
    if (wbImg >= 0 && wbImg < cleanIdx0) { skipped++; continue; }
    if (wbImg >= 0) {
      let s = -1;
      for (let i = wbImg; i >= 0; i--) { if (/^#{2,3}\s/.test(lines[i])) { s = i; break; } }
      let e = lines.length;
      for (let i = s + 1; i < lines.length; i++) { if (/^#{1,3}\s/.test(lines[i])) { e = i; break; } }
      lines.splice(s, e - s);
    }

    // Find the clean diagram's HLD heading (nearest heading above it) — insert before it.
    const cleanIdx = lines.findIndex((l) => l.includes(`](diagrams/${key}.svg)`));
    let hldIdx = -1;
    for (let i = cleanIdx; i >= 0; i--) { if (/^#{2,3}\s/.test(lines[i])) { hldIdx = i; break; } }
    if (hldIdx < 0) { console.error('  ! HLD heading not found for', key); process.exitCode = 1; continue; }
    const m = lines[hldIdx].match(/^(#{2,3})\s+(\S+)/);
    const level = m[1].length, token = m[2];

    const sec = makeSection(level, token, key, TITLES[key] || key);
    const pre = (hldIdx > 0 && lines[hldIdx - 1].trim() !== '') ? [''] : [];
    if (!check) {
      lines.splice(hldIdx, 0, ...pre, ...sec, '');
      fs.writeFileSync(file, lines.join('\n'));
    }
    console.log(`  ~ ${key.padEnd(16)} -> ${rel}  whiteboard before ${'#'.repeat(level)} ${token}`);
    placed++;
  }
  console.log(`\nmarkdown: ${placed} placed/moved, ${skipped} already correct.`);
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  if (args.includes('--md')) { insertMarkdown(check); return; }
  const only = args.filter((a) => !a.startsWith('--'));
  const keys = only.length ? only : KEYS;
  let ok = 0;
  for (const key of keys) {
    const f = path.join(DIR, key + '.svg');
    if (!fs.existsSync(f)) { console.error('MISSING', key); process.exitCode = 1; continue; }
    const parsed = parse(fs.readFileSync(f, 'utf8'));
    const svg = render(TITLES[key] || key, parsed);
    const out = path.join(DIR, key + '_whiteboard.svg');
    if (!check) fs.writeFileSync(out, svg);
    console.log(`${key.padEnd(16)} nodes=${parsed.nodes.length} groups=${parsed.groups.length} arrows=${parsed.arrows.length} pills=${parsed.pills.length}${check ? ' (check)' : ' -> ' + path.basename(out)}`);
    ok++;
  }
  console.log(`\n${ok}/${keys.length} diagrams ${check ? 'validated' : 'written'}.`);
}
main();
