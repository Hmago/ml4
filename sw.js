// Service Worker for ML Study Notes PWA
const CACHE_NAME = 'ml-notes-v325';

// Detect base path dynamically (works on both localhost:8000 and github.io/ml4/)
const BASE = self.registration.scope;

// ── What the service worker installs up front ──────────────────────────────
// KEEP THIS LIST TINY. It is downloaded in full before the worker activates,
// and on a mobile connection every byte here competes with the page's own
// requests. A previous version listed 217 entries totalling ~150 MB (115 PNG
// diagrams alone were ~136 MB of it), which saturated 4G links for minutes and
// made the page time out on first load and after every CACHE_NAME bump.
//
// Everything else — chapter markdown, the big js/data/*.js bundles, and every
// diagram — is cached by the fetch handler's stale-while-revalidate branches on
// first view, and warmed in the background by WARM_ON_IDLE below when the
// connection can afford it. Do not move content back into this list.
const STATIC_FILES = [
  '',
  'index.html',
  'styles.css',
  'js/state.js',
  'js/chapter.js',
  'js/pages.js',
  'js/dsa.js',
  'js/mock.js',
  'js/pins.js',
  'js/init.js',
  'manifest.json',
  'icon-192.svg',
  'icon-512.svg',
];

// Warmed in the background AFTER activation, and only on a connection that can
// afford it (see shouldWarm() below). Losing this costs nothing but a slower
// first open of a chapter the user has not visited yet.
const WARM_ON_IDLE = [
  'README.md',
  'content/00p_dl_llm_playbook.md',
  'content/00_quick_reference_cheat_sheet.md',
  'content/01_google_ai_engineer_strategy.md',
  'content/02_behavioral_interview.md',
  'content/03_staying_relevant_ai_era.md',
  'content/04_aptitude_mental_math.md',
  'content/05_brain_training.md',
  'content/05b_brain_upgrade_30_days.md',
  'content/06_math_fundamentals.md',
  'content/07_introduction.md',
  'content/08_core_concepts.md',
  'content/09_data_preprocessing.md',
  'content/10_supervised_learning.md',
  'content/11_unsupervised_learning.md',
  'content/12_key_algorithms.md',
  'content/13_model_evaluation.md',
  'content/14_neural_networks.md',
  'content/15_reinforcement_learning.md',
  'content/15s_ml_curriculum_recap.md',
  'content/16_deep_learning.md',
  'content/17_llm.md',
  'content/17b_llm_applications.md',
  'content/17c_llm_systems.md',
  'content/18_ai_agents.md',
  'content/18b_agents_in_production.md',
  'content/19_ai_frameworks.md',
  'content/20_2026_landscape.md',
  'content/20s_deep_learning_llms_recap.md',
  'content/21_design_fundamentals.md',
  'content/22_engineering_tools.md',
  'content/23_system_design_fundamentals_deep_dive.md',
  'content/24_system_design_data_distributed.md',
  'content/25_system_design_operations_case_studies.md',
  'content/26_ml_system_design.md',
  'content/26s_system_design_recap.md',
  'content/35_system_design_cases_realtime.md',
  'content/36_system_design_cases_search_media.md',
  'content/37_system_design_cases_scale_infra.md',
  'content/40_python_ml_ai.md',
  'content/27_practical_ml.md',
  'content/27_practical_ml.ipynb',
  'content/28_semantic_search.md',
  'content/29_gpus_tpus_infrastructure.md',
  'content/30_google_ml_ecosystem.md',
  'content/38_java_refresher.md',
  'content/38b_java_modern.md',
  'content/39_python_refresher.md',
  'content/31_dsa_foundations.md',
  'content/31b_dsa_graphs.md',
  'content/31c_dynamic_programming.md',
  'content/31d_dsa_advanced_ml_coding.md',
  'content/32_interview_questions.md',
  'content/33_llm_interview_questions.md',
  'content/33b_llm_interview_questions_part2.md',
  'content/34_google_top10_ml_interview.md',
  'content/34b_google_top10_ml_interview_part2.md',
];

const STATIC_ASSETS = STATIC_FILES.map(f => BASE + f);

// CDN assets — cache on first use
const CDN_PATTERNS = [
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
];

// Install — cache the (tiny) app shell. Deliberately NOT atomic: cache.addAll()
// rejects the whole batch if a single request fails, which on a flaky mobile
// link used to abort the install and then retry every URL again. allSettled
// means one dropped request costs one file, not the entire install.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// Is this connection one we can afford to prefetch on? Bail out on metered or
// slow links — the whole point of the shell-only install is to leave a mobile
// connection free for the page's own requests.
function shouldWarm() {
  const c = self.navigator && self.navigator.connection;
  if (!c) return true;                                   // unknown: assume fine
  if (c.saveData) return false;                          // user asked us not to
  if (['slow-2g', '2g', '3g'].includes(c.effectiveType)) return false;
  return true;
}

// Warm the chapter markdown in the background, well after activation, a few
// files at a time. Anything that fails is simply left for the fetch handler to
// cache on first view.
async function warmContent() {
  if (!shouldWarm()) return;
  const cache = await caches.open(CACHE_NAME);
  const urls = WARM_ON_IDLE.map(f => BASE + f);
  const BATCH = 3;
  for (let i = 0; i < urls.length; i += BATCH) {
    if (!shouldWarm()) return;                           // connection may have changed
    await Promise.allSettled(
      urls.slice(i, i + BATCH).map(async url => {
        if (await cache.match(url)) return;              // already have it
        return cache.add(url);
      })
    );
  }
}

// Activate — clean up old caches, then warm content in the background.
// The warm-up is awaited inside waitUntil so the browser keeps this worker
// alive long enough to finish it; it does not block page fetches, since
// clients.claim() has already happened and the fetch handler is independent.
// Any warming cut short simply resumes on the next visit — warmContent skips
// whatever is already cached.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => new Promise(resolve => setTimeout(resolve, 5000)))   // let the page load first
      .then(() => warmContent())
      .catch(() => {})
  );
  self.clients.claim();
});

// Allow the page to ask for a content warm-up (e.g. on a repeat visit where no
// install/activate happened). The worker still decides whether the connection
// can afford it, and skips anything already cached.
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'warm-content') {
    event.waitUntil(warmContent().catch(() => {}));
  }
});

// Fetch — serve from cache first, fall back to network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // For CDN assets: cache on first use (stale-while-revalidate)
  if (CDN_PATTERNS.some(p => url.hostname.includes(p))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // For navigation requests (HTML): stale-while-revalidate. Serve the cached
  // app shell instantly on repeat visits, then refresh the cache in the
  // background so the next load is up to date. A version bump (CACHE_NAME)
  // still forces fresh content via the install/activate precache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached || caches.match(BASE + 'index.html'));
        return cached || fetchPromise;
      })
    );
    return;
  }

  // For .md / .js / .css: stale-while-revalidate. Cached copy is served
  // immediately (instant chapter opens and shell scripts), and the network
  // copy refreshes the cache for next time. Content edits surface on the load
  // after they're fetched; a CACHE_NAME bump makes them appear immediately.
  if (url.pathname.endsWith('.md') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // For other assets (images, fonts): stale-while-revalidate.
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
