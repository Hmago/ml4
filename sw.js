// Service Worker for ML Study Notes PWA
const CACHE_NAME = 'ml-notes-v2';

// Detect base path dynamically (works on both localhost:8000 and github.io/ml4/)
const BASE = self.registration.scope;

// Files to cache for offline use (relative to scope)
const STATIC_FILES = [
  '',
  'index.html',
  'quizzes.js',
  'dsa_problems.js',
  'manifest.json',
  'icon-192.svg',
  'icon-512.svg',
  'README.md',
  '00_google_ai_engineer_strategy.md',
  '01_brain_training.md',
  '02_math_fundamentals.md',
  '03_introduction.md',
  '04_core_concepts.md',
  '05_data_preprocessing.md',
  '06_supervised_learning.md',
  '07_unsupervised_learning.md',
  '08_reinforcement_learning.md',
  '09_key_algorithms.md',
  '10_neural_networks.md',
  '11_model_evaluation.md',
  '12_deep_learning.md',
  '13_llm.md',
  '14_design_fundamentals.md',
  '15_interview_questions.md',
  '16_llm_interview_questions.md',
  '17_ml_system_design.md',
  '18_dsa_trees_graphs.md',
  '19_google_ml_ecosystem.md',
  '20_google_top10_ml_interview.md',
  '20_Modern System Design.md',
  '21_quick_reference_cheat_sheet.md',
  'behavioral_interview.md',
  'practical_ml.md',
  'staying_relevant_ai_era.md',
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

  // For local assets: cache first, network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback for navigation
      if (event.request.mode === 'navigate') {
        return caches.match(BASE + 'index.html');
      }
    })
  );
});
