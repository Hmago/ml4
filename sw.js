// Service Worker for ML Study Notes PWA
const CACHE_NAME = 'ml-notes-v242';

// Detect base path dynamically (works on both localhost:8000 and github.io/ml4/)
const BASE = self.registration.scope;

// Files to cache for offline use (relative to scope)
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
  'js/data/quizzes.js',
  'js/data/mock_questions.js',
  'js/data/dsa_problems_index.js',
  'js/data/dsa_problems_full.js',
  'manifest.json',
  'icon-192.svg',
  'icon-512.svg',
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
  'content/16_deep_learning.md',
  'content/17_llm.md',
  'content/18_ai_agents.md',
  'content/19_ai_frameworks.md',
  'content/20_2026_landscape.md',
  'content/21_design_fundamentals.md',
  'content/22_engineering_tools.md',
  'content/23_system_design_fundamentals_deep_dive.md',
  'content/24_system_design_data_distributed.md',
  'content/25_system_design_operations_case_studies.md',
  'content/26_ml_system_design.md',
  'content/35_system_design_cases_realtime.md',
  'content/36_system_design_cases_search_media.md',
  'content/37_system_design_cases_scale_infra.md',
  'content/27_practical_ml.md',
  'content/27_practical_ml.ipynb',
  'content/28_semantic_search.md',
  'content/29_gpus_tpus_infrastructure.md',
  'content/30_google_ml_ecosystem.md',
  'content/31_dsa_coding.md',
  'content/32_interview_questions.md',
  'content/33_llm_interview_questions.md',
  'content/33b_llm_interview_questions_part2.md',
  'content/34_google_top10_ml_interview.md',
  'content/34b_google_top10_ml_interview_part2.md',

  // Case-study HLD diagrams (Ch 35–37) — SVG figures embedded in chapters
  'diagrams/notification.svg', 'diagrams/notification_whiteboard.svg', 'diagrams/arch_reference.svg', 'diagrams/chat.svg', 'diagrams/video_conf.svg', 'diagrams/collab_editor.svg',
  'diagrams/autocomplete.svg', 'diagrams/crawler.svg', 'diagrams/proximity.svg', 'diagrams/ride_hailing.svg',
  'diagrams/news_feed.svg', 'diagrams/video_streaming.svg', 'diagrams/file_sync.svg', 'diagrams/url_shortener.svg',
  'diagrams/rate_limiter.svg', 'diagrams/unique_id.svg', 'diagrams/topk.svg', 'diagrams/leaderboard.svg',
  'diagrams/dist_cache.svg', 'diagrams/scheduler.svg', 'diagrams/payment.svg', 'diagrams/inventory.svg',
  'diagrams/kv_store.svg', 'diagrams/pastebin.svg', 'diagrams/amazon.svg',
  'diagrams/llm_serving.svg', 'diagrams/rag.svg', 'diagrams/recsys.svg',

  // Whiteboard rehearsal companions (hand-drawn "draw it live" sketch per case study)
  'diagrams/chat_whiteboard.svg', 'diagrams/video_conf_whiteboard.svg', 'diagrams/collab_editor_whiteboard.svg',
  'diagrams/arch_reference_whiteboard.svg', 'diagrams/autocomplete_whiteboard.svg', 'diagrams/crawler_whiteboard.svg',
  'diagrams/proximity_whiteboard.svg', 'diagrams/ride_hailing_whiteboard.svg', 'diagrams/news_feed_whiteboard.svg',
  'diagrams/video_streaming_whiteboard.svg', 'diagrams/file_sync_whiteboard.svg', 'diagrams/url_shortener_whiteboard.svg',
  'diagrams/rate_limiter_whiteboard.svg', 'diagrams/unique_id_whiteboard.svg', 'diagrams/topk_whiteboard.svg',
  'diagrams/leaderboard_whiteboard.svg', 'diagrams/dist_cache_whiteboard.svg', 'diagrams/scheduler_whiteboard.svg',
  'diagrams/payment_whiteboard.svg', 'diagrams/inventory_whiteboard.svg', 'diagrams/kv_store_whiteboard.svg',
  'diagrams/pastebin_whiteboard.svg', 'diagrams/amazon_whiteboard.svg', 'diagrams/llm_serving_whiteboard.svg',
  'diagrams/rag_whiteboard.svg', 'diagrams/recsys_whiteboard.svg',
];
const STATIC_ASSETS = STATIC_FILES.map(f => BASE + f);

// CDN assets — cache on first use
const CDN_PATTERNS = [
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
];

// Install — cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        // Cache what we can, skip failures (some files may not exist yet)
        return Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url)));
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
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
