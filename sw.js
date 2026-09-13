// Service Worker for ML Study Notes PWA
const CACHE_NAME = 'ml-notes-v315';

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
  'js/data/search_index.js',
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
  'content/27_practical_ml.md',
  'content/27_practical_ml.ipynb',
  'content/28_semantic_search.md',
  'content/29_gpus_tpus_infrastructure.md',
  'content/30_google_ml_ecosystem.md',
  'content/38_java_refresher.md',
  'content/38b_java_modern.md',
  'content/31_dsa_coding.md',
  'content/32_interview_questions.md',
  'content/33_llm_interview_questions.md',
  'content/33b_llm_interview_questions_part2.md',
  'content/34_google_top10_ml_interview.md',
  'content/34b_google_top10_ml_interview_part2.md',

  // Whiteboard rehearsal companions (hand-drawn "draw it live" sketch per case study)
  'diagrams/notification_whiteboard.svg', 'diagrams/chat_whiteboard.svg', 'diagrams/video_conf_whiteboard.svg', 'diagrams/collab_editor_whiteboard.svg',
  'diagrams/arch_reference_whiteboard.svg', 'diagrams/autocomplete_whiteboard.svg', 'diagrams/crawler_whiteboard.svg',
  'diagrams/proximity_whiteboard.svg', 'diagrams/ride_hailing_whiteboard.svg', 'diagrams/news_feed_whiteboard.svg',
  'diagrams/video_streaming_whiteboard.svg', 'diagrams/file_sync_whiteboard.svg', 'diagrams/url_shortener_whiteboard.svg',
  'diagrams/rate_limiter_whiteboard.svg', 'diagrams/unique_id_whiteboard.svg', 'diagrams/topk_whiteboard.svg',
  'diagrams/leaderboard_whiteboard.svg', 'diagrams/dist_cache_whiteboard.svg', 'diagrams/scheduler_whiteboard.svg',
  'diagrams/payment_whiteboard.svg', 'diagrams/inventory_whiteboard.svg', 'diagrams/kv_store_whiteboard.svg',
  'diagrams/pastebin_whiteboard.svg', 'diagrams/amazon_whiteboard.svg', 'diagrams/llm_serving_whiteboard.svg',
  'diagrams/rag_whiteboard.svg', 'diagrams/recsys_whiteboard.svg',

  // Case-study architecture diagrams (Ch 35–37) — AI-generated, final
  'diagrams/arch_reference_ai.png', 'diagrams/notification_ai.png', 'diagrams/chat_ai.png', 'diagrams/video_conf_ai.png', 'diagrams/collab_editor_ai.png',
  'diagrams/autocomplete_ai.png', 'diagrams/crawler_ai.png', 'diagrams/proximity_ai.png', 'diagrams/ride_hailing_ai.png',
  'diagrams/news_feed_ai.png', 'diagrams/video_streaming_ai.png', 'diagrams/file_sync_ai.png', 'diagrams/url_shortener_ai.png',
  'diagrams/rate_limiter_ai.png', 'diagrams/unique_id_ai.png', 'diagrams/topk_ai.png', 'diagrams/leaderboard_ai.png',
  'diagrams/dist_cache_ai.png', 'diagrams/scheduler_ai.png', 'diagrams/payment_ai.png', 'diagrams/inventory_ai.png',
  'diagrams/kv_store_ai.png', 'diagrams/pastebin_ai.png', 'diagrams/amazon_ai.png',
  'diagrams/llm_serving_ai.png', 'diagrams/rag_ai.png', 'diagrams/recsys_ai.png',

  // Chapter 14 (Neural Networks) — AI-generated educational concept diagrams
  'diagrams/nn_neuron_ai.png', 'diagrams/nn_layers_ai.png', 'diagrams/nn_backprop_ai.png',
  'diagrams/nn_cnn_ai.png', 'diagrams/nn_rnn_ai.png', 'diagrams/nn_transformer_ai.png', 'diagrams/nn_gan_ai.png',
  'diagrams/nn_vanishing_ai.png', 'diagrams/nn_init_ai.png', 'diagrams/nn_archchooser_ai.png',
  'diagrams/nn_xor_ai.png', 'diagrams/nn_loss_ai.png', 'diagrams/nn_regularization_ai.png', 'diagrams/nn_transfer_ai.png',

  // NOTE: the ML Curriculum recap diagrams (diagrams/rev_*_ai.png) are deliberately
  // NOT precached — they add ~13 MB to an already large install. The fetch handler's
  // stale-while-revalidate branch caches them on first view instead.

  // Chapter 15 (Reinforcement Learning) — AI-generated educational concept diagrams
  'diagrams/rl_loop_ai.png', 'diagrams/rl_discount_ai.png', 'diagrams/rl_explore_exploit_ai.png',
  'diagrams/rl_bellman_ai.png', 'diagrams/rl_qupdate_ai.png', 'diagrams/rl_dqn_ai.png', 'diagrams/rl_rlhf_ai.png',

  // Chapter 16 (Deep Learning) — AI-generated educational concept diagrams
  'diagrams/dl16_optimizers_ai.png', 'diagrams/dl16_normalization_ai.png', 'diagrams/dl16_resnet_ai.png',
  'diagrams/dl16_vit_ai.png', 'diagrams/dl16_diffusion_ai.png', 'diagrams/dl16_moe_ai.png',
  'diagrams/dl16_rope_ai.png', 'diagrams/dl16_gnn_ai.png',

  // Chapter 17 (LLMs) — AI-generated educational concept diagrams
  'diagrams/llm17_tokenization_ai.png', 'diagrams/llm17_embeddings_ai.png', 'diagrams/llm17_selfattention_ai.png',
  'diagrams/llm17_pretraining_ai.png', 'diagrams/llm17_scalinglaws_ai.png', 'diagrams/llm17_decoding_ai.png',
  'diagrams/llm17_grpo_ai.png', 'diagrams/llm17_attentionvariants_ai.png',

  // Chapter 17b (LLM Applications) — AI-generated educational concept diagrams
  'diagrams/llm17b_ragpipeline_ai.png', 'diagrams/llm17b_promptinjection_ai.png', 'diagrams/llm17b_agentloop_ai.png',
  'diagrams/llm17b_lora_ai.png', 'diagrams/llm17b_vectorsearch_ai.png', 'diagrams/llm17b_chunking_ai.png',
  'diagrams/llm17b_guardrails_ai.png',

  // Chapter 17c (LLM Systems) — AI-generated educational concept diagrams
  'diagrams/llm17c_kvcachegrowth_ai.png', 'diagrams/llm17c_continuousbatching_ai.png', 'diagrams/llm17c_pagedattention_ai.png',
  'diagrams/llm17c_prefixcaching_ai.png', 'diagrams/llm17c_quantization_ai.png', 'diagrams/llm17c_multilora_ai.png',
  'diagrams/llm17c_evalstack_ai.png',

  // Chapter 18 (AI Agents) — AI-generated educational concept diagrams
  'diagrams/agent18_functioncalling_ai.png', 'diagrams/agent18_mcpwhy_ai.png', 'diagrams/agent18_toolpoisoning_ai.png',
  'diagrams/agent18_patterncomparison_ai.png', 'diagrams/agent18_computeruse_ai.png', 'diagrams/agent18_contextstack_ai.png',
  'diagrams/agent18_toolbloat_ai.png',

  // Chapter 18b (Agents in Production) — AI-generated educational concept diagrams
  'diagrams/agent18b_fivefailures_ai.png', 'diagrams/agent18b_dualllm_ai.png', 'diagrams/agent18b_endtoendvsperstep_ai.png',
  'diagrams/agent18b_agentops_ai.png', 'diagrams/agent18b_autonomyspectrum_ai.png', 'diagrams/agent18b_actionclassification_ai.png',
  'diagrams/agent18b_isolationladder_ai.png', 'diagrams/agent18b_longrunningfailures_ai.png',

  // Chapter 19 (AI Frameworks & Engineering) — AI-generated educational concept diagrams
  'diagrams/fw19_ecosystemmap_ai.png', 'diagrams/fw19_multiagentmodels_ai.png', 'diagrams/fw19_ragfixes_ai.png',
  'diagrams/fw19_embeddingaxes_ai.png', 'diagrams/fw19_servinghierarchy_ai.png', 'diagrams/fw19_modelaccess_ai.png',
  'diagrams/fw19_mlopslifecycle_ai.png', 'diagrams/fw19_costlevers_ai.png',

  // Chapter 20 (The 2026 AI Landscape) — AI-generated educational concept diagrams
  'diagrams/land20_frontiermap_ai.png', 'diagrams/land20_testtimecompute_ai.png', 'diagrams/land20_swebench_ai.png',
  'diagrams/land20_ondevice_ai.png', 'diagrams/land20_costcurve_ai.png', 'diagrams/land20_eutimeline_ai.png',
  'diagrams/land20_googlestack_ai.png', 'diagrams/land20_decisiontree_ai.png',
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
