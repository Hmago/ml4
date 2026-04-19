// Service Worker for ML Study Notes PWA
const CACHE_NAME = 'ml-notes-v89';

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
  'js/pins.js',
  'js/init.js',
  'js/data/quizzes.js',
  'js/data/dsa_problems_index.js',
  'js/data/dsa_problems_full.js',
  'manifest.json',
  'icon-192.svg',
  'icon-512.svg',
  'README.md',
  'content/00_google_ai_engineer_strategy.md',
  'content/01_brain_training.md',
  'content/02_math_fundamentals.md',
  'content/03_introduction.md',
  'content/04_core_concepts.md',
  'content/05_data_preprocessing.md',
  'content/06_supervised_learning.md',
  'content/07_unsupervised_learning.md',
  'content/08_reinforcement_learning.md',
  'content/09_key_algorithms.md',
  'content/10_neural_networks.md',
  'content/11_model_evaluation.md',
  'content/12_deep_learning.md',
  'content/13_llm.md',
  'content/14_design_fundamentals.md',
  'content/15_interview_questions.md',
  'content/16_llm_interview_questions.md',
  'content/17_ml_system_design.md',
  'content/18_dsa_trees_graphs.md',
  'content/19_google_ml_ecosystem.md',
  'content/20_google_top10_ml_interview.md',
  'content/20_Modern System Design.md',
  'content/21_quick_reference_cheat_sheet.md',
  'content/22_modern_ai_stack.md',
  'content/behavioral_interview.md',
  'content/practical_ml.md',
  'content/practical_ml.ipynb',
  'content/staying_relevant_ai_era.md',
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

  // For navigation requests (HTML): network-first with cache fallback,
  // so users get the latest index.html when online but still work offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request).then(c => c || caches.match(BASE + 'index.html')))
    );
    return;
  }

  // For other local assets (JS/CSS/MD/JSON/images): stale-while-revalidate.
  // Serve from cache instantly; update cache in background so the next load is fresh.
  // This fixes the prior "network-first undermines offline" issue.
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
