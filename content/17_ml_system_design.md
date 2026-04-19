# ML System Design — Google Interview Edition

> "In an ML system design interview, Google doesn't want you to just pick a model.
> They want to see you design the ENTIRE system — from data collection to production monitoring.
> Think like an engineer who owns the whole pipeline."

**What this document covers:**
Everything you need to design production ML systems at Google scale — from framing the problem to serving predictions to billions of users. Every concept is explained simply with real-world examples. Designed specifically for Google L5+ ML System Design interviews.

**How Google ML System Design Interviews Work:**
- 45 minutes
- Open-ended question: "Design a system that..." (recommendation, search ranking, fraud detection, etc.)
- No coding — draw diagrams, explain trade-offs, show depth
- They evaluate: problem framing, data thinking, modeling choices, serving strategy, metrics, and trade-offs

---

## Table of Contents

| Part | Topic | Key Concepts |
|------|-------|--------------|
| 1 | The ML System Design Framework | Step-by-step approach, what Google looks for |
| 2 | Problem Framing | Converting business problems to ML problems |
| 3 | Data | Collection, storage, pipelines, quality, labeling |
| 4 | Feature Engineering & Feature Stores | Feature design, stores, online/offline serving |
| 5 | Model Selection & Training | Choosing models, training at scale, distributed training |
| 6 | Evaluation & Metrics | Offline metrics, online metrics, A/B testing |
| 7 | Model Serving & Inference | Batch vs real-time, latency, throughput, caching |
| 8 | Monitoring & Maintenance | Data drift, model decay, retraining, alerts |
| 9 | ML Infrastructure & MLOps | CI/CD for ML, model registry, feature stores, pipelines |
| 10 | Full Design: Recommendation System | YouTube/Netflix-style recommendations end-to-end |
| 11 | Full Design: Search Ranking | Google Search-style ranking system |
| 12 | Full Design: Fraud Detection | Payment fraud detection at scale |
| 13 | Full Design: Content Moderation | Detecting harmful content (text, image, video) |
| 14 | Full Design: Ads Click Prediction | Predicting which ads a user will click |
| 15 | Full Design: Newsfeed Ranking | Ranking posts in a social media feed |
| 16 | Full Design: Autocomplete / Query Suggestion | Search suggestions as you type |
| 17 | Full Design: Notification System | Which notifications to send and when |
| 18 | Trade-offs Cheat Sheet | Common trade-offs interviewers ask about |
| 19 | Interview Tips & Anti-Patterns | What to do and what NOT to do |
| 20 | Quick Reference | Frameworks, metrics, and checklists |

---

# PART 1: THE ML SYSTEM DESIGN FRAMEWORK

---

## 1.1 The 8-Step Framework

Every ML system design question can be answered with this framework. Google interviewers expect you to cover most of these steps.

```
  THE ML SYSTEM DESIGN FRAMEWORK (memorize this!)
  ════════════════════════════════════════════════

  STEP 1: CLARIFY REQUIREMENTS (3-5 min)
  ────────────────────────────────────────
  "Before I design anything, let me make sure I understand the problem."
  - What is the business goal?
  - Who are the users?
  - What scale are we talking about? (users, QPS, data size)
  - What latency requirements? (real-time vs batch)
  - What are the constraints? (privacy, fairness, cost)

  STEP 2: FRAME AS AN ML PROBLEM (3-5 min)
  ────────────────────────────────────────
  "Let me translate this business goal into an ML problem."
  - What type of ML problem is this? (classification, ranking, regression, etc.)
  - What is the prediction target (label)?
  - What does the training data look like?
  - Is this supervised, unsupervised, or reinforcement learning?

  STEP 3: DATA (5 min)
  ────────────────────────────────────────
  "Let me think about what data we need and how to get it."
  - What data sources exist?
  - How do we get labels? (explicit, implicit, human annotation)
  - How much data do we need?
  - Data quality issues (bias, noise, missing values)
  - Privacy and compliance (GDPR, PII)

  STEP 4: FEATURE ENGINEERING (5 min)
  ────────────────────────────────────────
  "What signals (features) help the model make good predictions?"
  - User features, item features, context features
  - Real-time vs batch features
  - Feature store architecture

  STEP 5: MODEL SELECTION & TRAINING (5-7 min)
  ────────────────────────────────────────
  "Let me pick the right model and explain how to train it."
  - Start simple (baseline), then iterate
  - Model architecture
  - Loss function
  - Training pipeline (offline, how often to retrain)

  STEP 6: EVALUATION (5 min)
  ────────────────────────────────────────
  "How do we know if the model is good?"
  - Offline metrics (accuracy, AUC, NDCG, etc.)
  - Online metrics (CTR, revenue, user satisfaction)
  - A/B testing design

  STEP 7: SERVING & DEPLOYMENT (5 min)
  ────────────────────────────────────────
  "How do we get predictions to users?"
  - Batch vs real-time inference
  - Latency and throughput requirements
  - Caching strategies
  - Canary deployment / gradual rollout

  STEP 8: MONITORING & ITERATION (3 min)
  ────────────────────────────────────────
  "How do we know it's still working in production?"
  - Data drift detection
  - Model performance monitoring
  - Retraining strategy
  - Feedback loops
```

**The analogy:** Think of it like opening a restaurant.
- Step 1: What kind of restaurant? (Clarify)
- Step 2: What dishes will we serve? (Frame)
- Step 3: Where do we get ingredients? (Data)
- Step 4: How do we prep ingredients? (Features)
- Step 5: What recipes do we use? (Model)
- Step 6: How do we taste-test? (Evaluation)
- Step 7: How do we serve customers? (Serving)
- Step 8: How do we handle complaints? (Monitoring)

---

## 1.2 What Google Interviewers Look For

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  STRONG CANDIDATE                  │  WEAK CANDIDATE              │
  ├────────────────────────────────────┼──────────────────────────────┤
  │ Asks clarifying questions first    │ Jumps straight to "use BERT" │
  │ Frames problem clearly as ML task  │ Vague problem definition      │
  │ Discusses data quality + labeling  │ Assumes perfect data exists   │
  │ Starts with simple baseline        │ Goes straight to deep learning│
  │ Discusses multiple metrics         │ Only mentions "accuracy"      │
  │ Addresses latency & scale          │ Ignores serving constraints   │
  │ Discusses trade-offs explicitly    │ Says "this is the best"       │
  │ Mentions monitoring & drift        │ Assumes model works forever   │
  │ Thinks about fairness & bias       │ Ignores ethical concerns      │
  └────────────────────────────────────┴──────────────────────────────┘
```

---

# PART 2: PROBLEM FRAMING

---

## 2.1 Converting Business Problems to ML Problems

The first and most important skill: **translate a vague business goal into a concrete ML task.**

```
  BUSINESS GOAL                    ML PROBLEM
  ────────────────────────         ──────────────────────────────

  "Show users content they like"   → Ranking problem
                                     Predict: P(user engages with item)
                                     Rank items by predicted engagement

  "Detect fraudulent payments"     → Binary classification
                                     Predict: P(transaction is fraud)
                                     Threshold: if P > 0.5, flag it

  "Predict how long delivery       → Regression
   will take"                        Predict: estimated minutes

  "Group similar customers"        → Clustering (unsupervised)
                                     Find natural segments in data

  "Suggest search queries"         → Sequence generation / ranking
                                     Generate or rank query completions

  "Decide what notification        → Multi-objective ranking
   to send"                          Predict: P(open), P(positive reaction)
                                     Optimize: engagement - annoyance
```

### The Label is Everything

```
  The LABEL (what you're predicting) determines everything about your system.
  Getting this wrong = building the wrong system.

  EXAMPLE: "Design a recommendation system for YouTube"

  POSSIBLE LABELS:
  ┌──────────────────────────┬───────────────────────────────────────────┐
  │ Label                    │ What it optimizes for                      │
  ├──────────────────────────┼───────────────────────────────────────────┤
  │ P(click)                 │ Clickbait! Users click but don't enjoy     │
  │ P(watch > 50%)           │ Engaging content, but ignores short videos │
  │ Watch time (minutes)     │ Long content favored over short            │
  │ P(like)                  │ Quality content, but few people like        │
  │ P(share)                 │ Viral content, not necessarily good         │
  │ Satisfaction survey score│ True quality, but very sparse signal        │
  └──────────────────────────┴───────────────────────────────────────────┘

  YouTube actually uses a COMBINATION:
  Engagement = weighted(watch_time, likes, shares, comments) - weighted(dislikes, "not interested")

  KEY LESSON: The label you choose shapes user behavior.
  Optimize for clicks → you get clickbait.
  Optimize for watch time → you get long rambling videos.
  This is why label design is so critical and why interviewers ask about it.
```

---

## 2.2 ML Problem Types

```
  ┌────────────────────────┬───────────────────────────────────────────┐
  │ Type                   │ When to Use                                │
  ├────────────────────────┼───────────────────────────────────────────┤
  │ Binary Classification  │ Yes/No decisions: spam? fraud? click?      │
  │ Multi-class            │ Which category? (language, topic, intent)  │
  │ Multi-label            │ Multiple tags (a photo can be: cat, cute,  │
  │                        │ animal, indoor)                            │
  │ Ranking / Learning     │ Order items by relevance                   │
  │ to Rank                │ (search results, recommendations, feeds)   │
  │ Regression             │ Predict a number (price, ETA, score)       │
  │ Sequence-to-Sequence   │ Input sequence → output sequence           │
  │                        │ (translation, summarization, code gen)     │
  │ Retrieval              │ Find the top-K items from millions          │
  │                        │ (candidate generation in recommendations)  │
  │ Anomaly Detection      │ Find unusual patterns (fraud, intrusions)  │
  └────────────────────────┴───────────────────────────────────────────┘
```

---

# PART 3: DATA

---

## 3.1 Data Collection — Where Does Training Data Come From?

```
  ┌───────────────────────────────────────────────────────────────────────┐
  │ SOURCE                     │ EXAMPLE                │ QUALITY         │
  ├────────────────────────────┼────────────────────────┼─────────────────┤
  │ USER BEHAVIOR LOGS         │ Clicks, views, purchases│ Abundant,       │
  │ (implicit labels)          │ search queries, dwell   │ noisy, biased   │
  │                            │ time, skips             │                 │
  ├────────────────────────────┼────────────────────────┼─────────────────┤
  │ EXPLICIT FEEDBACK          │ Ratings (1-5 stars),    │ Sparse but      │
  │                            │ thumbs up/down, reviews │ high quality    │
  ├────────────────────────────┼────────────────────────┼─────────────────┤
  │ HUMAN ANNOTATION           │ Labelers tag images,    │ Expensive but   │
  │                            │ classify text, rate     │ very accurate   │
  │                            │ relevance               │                 │
  ├────────────────────────────┼────────────────────────┼─────────────────┤
  │ EXISTING DATABASES         │ Product catalogs,       │ Structured,     │
  │                            │ user profiles,          │ reliable        │
  │                            │ knowledge graphs        │                 │
  ├────────────────────────────┼────────────────────────┼─────────────────┤
  │ THIRD-PARTY DATA           │ Census data, weather,   │ Varies          │
  │                            │ economic indicators     │                 │
  ├────────────────────────────┼────────────────────────┼─────────────────┤
  │ SYNTHETIC DATA             │ Generated by models,    │ Cheap, abundant │
  │                            │ simulation, augmentation│ May not match   │
  │                            │                         │ real distribution│
  └────────────────────────────┴────────────────────────┴─────────────────┘

  GOOGLE INTERVIEW TIP: Always discuss where labels come from.
  This is often the hardest part of a real ML system.
```

### Implicit vs Explicit Labels

```
  IMPLICIT labels (from user behavior — easy to collect, noisy):
  ────────────────────────────────────────────────────────
  User clicked on a video                    → positive signal
  User watched 90% of a video               → strong positive
  User scrolled past without clicking        → weak negative
  User clicked but bounced in 2 seconds      → negative (misleading title)

  The problem: NOT clicking doesn't mean "not interested."
  Maybe the user didn't see the item (position bias).
  Maybe the thumbnail was bad (presentation bias).
  Maybe they were in a hurry (context bias).

  EXPLICIT labels (user tells you — sparse, but cleaner):
  ────────────────────────────────────────────────────────
  User rated 5 stars                         → definitely positive
  User rated 1 star                          → definitely negative
  User clicked "not interested"              → strong negative

  The problem: Very few users bother to rate things.
  Netflix: only ~2% of watched shows get rated.

  BEST APPROACH: Combine both.
  Use implicit signals for volume, explicit signals for quality.
  Weight explicit feedback higher.
```

---

## 3.2 Data Quality Issues

```
  ISSUE                    WHAT IT MEANS              HOW TO FIX
  ─────────────────────    ──────────────────────      ─────────────────────

  MISSING DATA             Some fields are empty       Imputation, or use
                                                       models that handle NaN

  LABEL NOISE              Labels are wrong            Cross-validation,
                           (mislabeled images,         label cleaning,
                           wrong categories)           confidence thresholds

  CLASS IMBALANCE          99.9% normal, 0.1% fraud    Oversampling, under-
                           Model just predicts          sampling, class weights,
                           "normal" always              focal loss

  SELECTION BIAS           Training data doesn't       Collect more diverse
                           represent real users         data, reweight samples

  POSITION BIAS            Items shown first get       Randomize positions
                           more clicks regardless      in training data,
                           of quality                  use position as feature

  FEEDBACK LOOPS           Model recommendations       Explore/exploit,
                           affect future data           inject randomness,
                           (filter bubbles)            counterfactual evaluation

  DATA FRESHNESS           Old data doesn't reflect    Windowed training,
                           current trends              weight recent data higher
```

---

## 3.3 Data Pipelines — Moving Data at Scale ★★

```
  RAW DATA → PROCESSING → CLEAN DATA → FEATURE STORE → MODEL

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  Data Sources │     │   ETL / ELT  │     │ Data Storage  │
  │              │     │              │     │              │
  │ - Event logs │ ──► │ - Clean      │ ──► │ - Data Lake   │
  │ - Databases  │     │ - Transform  │     │   (raw)       │
  │ - APIs       │     │ - Validate   │     │ - Data        │
  │ - Streams    │     │ - Join       │     │   Warehouse   │
  └──────────────┘     └──────────────┘     │   (processed) │
                                             └──────────────┘

  BATCH PIPELINE (process data periodically):
  ─────────────────────────────────────────
  Run daily/hourly. Process large volumes. High throughput.
  Tools: Apache Spark, Apache Beam, BigQuery, Dataflow

  Example: Every night at 2 AM, process yesterday's click logs
  to update the recommendation model's training data.


  STREAMING PIPELINE (process data in real-time):
  ─────────────────────────────────────────
  Process events as they happen. Low latency. Lower throughput.
  Tools: Apache Kafka, Apache Flink, Google Pub/Sub, Dataflow

  Example: When a user clicks on a product RIGHT NOW, update their
  real-time features immediately for the next recommendation.


  GOOGLE'S APPROACH:
  Most systems use BOTH:
  - Batch pipeline for heavy processing (daily model training)
  - Streaming pipeline for real-time features (last 5 minutes of activity)
```

---

# PART 4: FEATURE ENGINEERING & FEATURE STORES

---

## 4.1 Feature Categories

In every ML system design, organize features into these categories:

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │  USER FEATURES (who is making the request?)                          │
  │  ──────────────────────────────────────────────                     │
  │  - Demographics: age, country, language                              │
  │  - History: past purchases, watch history, search history            │
  │  - Aggregates: avg session length, total purchases last 30 days     │
  │  - Embeddings: user embedding from collaborative filtering          │
  │                                                                      │
  │  ITEM FEATURES (what is being recommended/ranked?)                   │
  │  ──────────────────────────────────────────────                     │
  │  - Metadata: title, category, price, upload date                     │
  │  - Content: text embeddings, image embeddings                        │
  │  - Popularity: total views, avg rating, trending score               │
  │  - Quality: content quality score, creator reputation                │
  │                                                                      │
  │  CONTEXT FEATURES (when/where/how is the request happening?)         │
  │  ──────────────────────────────────────────────                     │
  │  - Time: hour of day, day of week, time since last visit             │
  │  - Device: mobile vs desktop, browser, OS                            │
  │  - Location: country, city (if available)                            │
  │  - Session: how many items seen so far, session duration             │
  │                                                                      │
  │  CROSS FEATURES (interactions between user and item)                 │
  │  ──────────────────────────────────────────────                     │
  │  - Has user interacted with this item before?                        │
  │  - Has user interacted with items from this category?                │
  │  - Similarity between user embedding and item embedding              │
  │  - How many friends liked this item?                                 │
  └──────────────────────────────────────────────────────────────────────┘

  GOOGLE INTERVIEW TIP: Always organize features into these 4 categories.
  It shows structured thinking and covers all the important signals.
```

---

## 4.2 Feature Stores ★★

```
  A FEATURE STORE is a centralized system for managing, storing, and
  serving ML features. It's the bridge between data and models.

  WHY? Without a feature store:
  - Every team computes features differently → inconsistency
  - Training features ≠ serving features → training-serving skew
  - Recomputing features for each model → wasted computation
  - No way to share features across teams → duplication

  ┌──────────────────────────────────────────────────────────────────────┐
  │                       FEATURE STORE ARCHITECTURE                      │
  │                                                                      │
  │  ┌─────────────────┐                                                │
  │  │  Batch Sources   │──►┌─────────────────┐                         │
  │  │  (data warehouse)│   │                 │     ┌──────────────┐    │
  │  └─────────────────┘   │  FEATURE STORE   │────►│  OFFLINE      │    │
  │                         │                 │     │  (training)   │    │
  │  ┌─────────────────┐   │  - Compute      │     │  BigQuery,    │    │
  │  │  Stream Sources  │──►│  - Store        │     │  Hive         │    │
  │  │  (event logs)    │   │  - Serve        │     └──────────────┘    │
  │  └─────────────────┘   │  - Monitor      │                         │
  │                         │                 │     ┌──────────────┐    │
  │                         │                 │────►│  ONLINE       │    │
  │                         │                 │     │  (serving)    │    │
  │                         └─────────────────┘     │  Redis,       │    │
  │                                                  │  Bigtable     │    │
  │                                                  └──────────────┘    │
  └──────────────────────────────────────────────────────────────────────┘

  OFFLINE STORE: For training. Historical features. High throughput.
  ONLINE STORE: For serving. Latest features. Low latency (<10ms).

  THE KEY GUARANTEE: Features computed for training are EXACTLY the same
  as features served at prediction time. No training-serving skew.

  Popular feature stores: Feast (open-source), Tecton, Google Vertex AI Feature Store
```

---

# PART 5: MODEL SELECTION & TRAINING

---

## 5.1 Start Simple, Then Iterate

```
  GOOGLE'S PHILOSOPHY: "Don't be a hero. Start with the simplest thing that works."

  PROGRESSION:
  ────────────────────────────────────────

  STEP 1: HEURISTIC BASELINE (no ML)
  "Most popular items" or "rule-based filter"
  → Establish a floor. If ML can't beat this, something is wrong.

  STEP 2: SIMPLE ML MODEL
  Logistic regression or gradient boosted trees (XGBoost/LightGBM)
  → Fast to train, easy to debug, interpretable
  → Often surprisingly competitive

  STEP 3: NEURAL NETWORK
  Deep learning model (wide & deep, two-tower, transformer)
  → Better for large data, complex patterns
  → Harder to debug, more compute

  STEP 4: ENSEMBLE / SPECIALIZED
  Combine models, use domain-specific architectures
  → Marginal gains, high complexity

  ┌──────────────────────────────────────────────────────────────┐
  │  In a 45-minute interview, propose Step 1 as baseline,       │
  │  discuss Step 2 in detail, and mention Step 3 as improvement. │
  │  This shows maturity and pragmatism.                          │
  └──────────────────────────────────────────────────────────────┘
```

---

## 5.2 Common Model Architectures for ML Systems

```
  TWO-TOWER MODEL (for retrieval / candidate generation):
  ──────────────────────────────────────────────────────
  Used when you need to find relevant items from MILLIONS of candidates.

  ┌──────────┐         ┌──────────┐
  │ User     │         │ Item     │
  │ Features │         │ Features │
  │          │         │          │
  │ [Neural  │         │ [Neural  │
  │  Network]│         │  Network]│
  │          │         │          │
  │  User    │         │  Item    │
  │  Embedding│         │  Embedding│
  └────┬─────┘         └────┬─────┘
       │    DOT PRODUCT      │
       └───────────┬─────────┘
                   │
            SIMILARITY SCORE

  Pre-compute all item embeddings → store in a vector index (ANN)
  At serving time: compute user embedding → find nearest item embeddings
  This turns O(N) scoring into O(log N) retrieval!

  Used by: YouTube, Google Play, Pinterest


  WIDE & DEEP (for ranking):
  ──────────────────────────────────────────────────────
  Combines memorization (wide) with generalization (deep).

  Wide: Logistic regression on cross features
        "Users who bought X also bought Y" (memorization)

  Deep: Neural network on embeddings
        "This user might like items similar to what they've seen" (generalization)

  ┌──────────────────────────────────────────┐
  │  Input Features                           │
  │       │              │                    │
  │  ┌────▼────┐    ┌───▼─────────────┐      │
  │  │  WIDE   │    │     DEEP        │      │
  │  │ (cross  │    │  (embeddings →  │      │
  │  │ features)│    │   hidden layers)│      │
  │  └────┬────┘    └───────┬─────────┘      │
  │       └────────┬────────┘                 │
  │           ┌────▼────┐                     │
  │           │  OUTPUT  │                    │
  │           │ (sigmoid)│                    │
  │           └──────────┘                    │
  └──────────────────────────────────────────┘

  Used by: Google Play, Google Ads


  MULTI-STAGE PIPELINE (most real systems):
  ──────────────────────────────────────────────────────

  1 BILLION items
       │
       ▼
  ┌──────────────┐
  │  RETRIEVAL   │  Fast, approximate. Two-tower or ANN.
  │  (1B → 1000) │  Reduces 1 billion items to ~1000 candidates.
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │  FILTERING   │  Business rules. Remove blocked content,
  │  (1000 → 500)│  already seen items, policy violations.
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │   RANKING    │  Accurate but slow. Wide & Deep or transformer.
  │  (500 → 50)  │  Score each candidate with all features.
  └──────┬───────┘
         ▼
  ┌──────────────┐
  │  RE-RANKING  │  Business logic. Diversity, freshness,
  │  (50 → 20)   │  fairness constraints, ads injection.
  └──────┬───────┘
         ▼
     SHOW TO USER

  This is how YouTube, Google Search, Instagram, TikTok ALL work.
  Every ML system design answer should discuss this pipeline.
```

---

# PART 6: EVALUATION & METRICS

---

## 6.1 Offline Metrics

```
  CLASSIFICATION METRICS:
  ┌──────────────────┬──────────────────────────────────────────────────┐
  │ AUC-ROC          │ How well the model separates positives from      │
  │                  │ negatives. 0.5 = random. 1.0 = perfect.          │
  │                  │ Best single metric for binary classification.     │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ Precision @ K    │ Of the top K predictions, how many are relevant? │
  │                  │ "If I show 10 results, how many are good?"       │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ Recall @ K       │ Of all relevant items, how many are in top K?    │
  │                  │ "Did I find all the good ones?"                  │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ Log Loss         │ How well calibrated are the probabilities?       │
  │                  │ Lower = model's confidence matches reality.      │
  └──────────────────┴──────────────────────────────────────────────────┘

  RANKING METRICS:
  ┌──────────────────┬──────────────────────────────────────────────────┐
  │ NDCG             │ Normalized Discounted Cumulative Gain            │
  │ (most important  │ Measures ranking quality: are the best items     │
  │  for ranking)    │ near the top? Penalizes relevant items ranked    │
  │                  │ too low. Range: 0 to 1. Higher = better.         │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ MRR              │ Mean Reciprocal Rank                             │
  │                  │ 1/position of the first relevant result.         │
  │                  │ If first relevant result is at position 3:       │
  │                  │ MRR = 1/3 = 0.33                                │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ MAP              │ Mean Average Precision                           │
  │                  │ Average precision at each relevant position.     │
  └──────────────────┴──────────────────────────────────────────────────┘

  REGRESSION METRICS: MSE, MAE, MAPE (Mean Absolute Percentage Error)
```

---

## 6.2 Online Metrics — What REALLY Matters

```
  Offline metrics tell you if the model is TECHNICALLY good.
  Online metrics tell you if the model is ACTUALLY useful.

  THEY CAN DISAGREE. A model with better AUC might decrease revenue.
  Online metrics are the final judge. Always.

  ┌──────────────────┬──────────────────────────────────────────────────┐
  │ METRIC           │ WHAT IT MEASURES                                  │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ CTR              │ Click-through rate. % of impressions that get     │
  │                  │ clicked. Higher = more engaging.                  │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ Engagement       │ Likes, comments, shares, watch time.             │
  │                  │ Deeper than clicks.                              │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ Revenue          │ Total money generated. The ultimate business     │
  │                  │ metric for ads and e-commerce.                    │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ Retention        │ Do users come back? Daily/weekly active users.   │
  │                  │ Long-term health of the product.                 │
  ├──────────────────┼──────────────────────────────────────────────────┤
  │ User satisfaction│ Survey scores, "not interested" clicks, reports.  │
  │                  │ Hardest to measure, most important.               │
  └──────────────────┴──────────────────────────────────────────────────┘

  GOOGLE INTERVIEW TIP: Always mention BOTH offline and online metrics.
  Discuss potential disagreements between them.
```

---

## 6.3 A/B Testing ★★★

```
  A/B TESTING: The gold standard for measuring real-world impact.

  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │  ALL USERS                                                   │
  │       │                                                      │
  │  ┌────▼────────────────────────┐                             │
  │  │   RANDOM SPLIT (e.g., 50/50)│                             │
  │  └──────┬───────────────┬──────┘                             │
  │         │               │                                    │
  │    ┌────▼────┐    ┌────▼────┐                               │
  │    │ CONTROL │    │  TEST   │                               │
  │    │ (old    │    │ (new    │                               │
  │    │  model) │    │  model) │                               │
  │    └────┬────┘    └────┬────┘                               │
  │         │               │                                    │
  │   Measure metrics  Measure metrics                          │
  │         │               │                                    │
  │    ┌────▼───────────────▼────┐                               │
  │    │  STATISTICAL TEST       │                               │
  │    │  Is the difference real │                               │
  │    │  or just noise?         │                               │
  │    │  (p-value < 0.05?)      │                               │
  │    └─────────────────────────┘                               │
  └──────────────────────────────────────────────────────────────┘

  KEY CONSIDERATIONS:
  ─────────────────────────────────────────
  - Sample size: need enough users for statistical significance
  - Duration: run long enough to capture weekly patterns (usually 1-2 weeks)
  - Guardrail metrics: metrics that must NOT go down (e.g., revenue, crashes)
  - Network effects: user A's experience might affect user B
  - Novelty effect: new features get more clicks initially (wears off)

  GRADUAL ROLLOUT:
  1% → 5% → 25% → 50% → 100%
  If something goes wrong at 5%, you only affected 5% of users.
```

---

# PART 7: MODEL SERVING & INFERENCE

---

## 7.1 Batch vs Real-Time Serving ★★

```
  BATCH SERVING (pre-compute predictions):
  ─────────────────────────────────────────
  Run the model on all items/users periodically (e.g., every hour).
  Store predictions in a database. Serve from cache.

  ┌─────────────────────────────────────────────────────────────┐
  │  WHEN TO USE BATCH:                                          │
  │  ✓ Predictions don't change frequently                       │
  │  ✓ Latency requirement is relaxed (> 1 second OK)           │
  │  ✓ Large number of predictions to make                       │
  │  ✓ Model is very expensive to run                            │
  │                                                              │
  │  EXAMPLES:                                                   │
  │  - Email recommendations (compute overnight, send in morning)│
  │  - Product recommendations on homepage (update every hour)   │
  │  - Fraud risk scores (update daily)                          │
  └─────────────────────────────────────────────────────────────┘

  REAL-TIME SERVING (compute on-the-fly):
  ─────────────────────────────────────────
  Run the model when the user makes a request. Returns in milliseconds.

  ┌─────────────────────────────────────────────────────────────┐
  │  WHEN TO USE REAL-TIME:                                      │
  │  ✓ Prediction depends on real-time context                   │
  │  ✓ User expects instant response                             │
  │  ✓ High freshness required                                   │
  │                                                              │
  │  EXAMPLES:                                                   │
  │  - Search ranking (depends on the query typed right now)     │
  │  - Fraud detection (must decide before payment processes)    │
  │  - Autocomplete (must respond in <100ms as user types)       │
  └─────────────────────────────────────────────────────────────┘

  HYBRID (most real systems):
  ─────────────────────────────────────────
  - Batch: pre-compute candidate lists (top 1000 items per user)
  - Real-time: re-rank the candidates using current context
  - Cache frequently requested predictions (popular items)
```

---

## 7.2 Serving Architecture ★★★

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │                    ML SERVING ARCHITECTURE                            │
  │                                                                      │
  │  Client Request                                                      │
  │       │                                                              │
  │       ▼                                                              │
  │  ┌──────────────┐                                                    │
  │  │  API Gateway  │  Auth, rate limiting, routing                     │
  │  └──────┬───────┘                                                    │
  │         ▼                                                            │
  │  ┌──────────────┐     ┌──────────────┐                              │
  │  │  Application │────►│ Feature Store │  Fetch user/item features    │
  │  │  Server      │     │ (online)     │  in <10ms                    │
  │  └──────┬───────┘     └──────────────┘                              │
  │         ▼                                                            │
  │  ┌──────────────┐                                                    │
  │  │  Prediction  │  ML model inference                               │
  │  │  Service     │  GPU/CPU, batching, caching                       │
  │  └──────┬───────┘                                                    │
  │         ▼                                                            │
  │  ┌──────────────┐                                                    │
  │  │  Post-       │  Business rules, diversity,                       │
  │  │  Processing  │  fairness constraints                             │
  │  └──────┬───────┘                                                    │
  │         ▼                                                            │
  │     Response                                                         │
  └──────────────────────────────────────────────────────────────────────┘

  LATENCY BUDGET EXAMPLE (search ranking):
  ─────────────────────────────────────────
  Total budget: 200ms
  ├── Network:           20ms
  ├── Feature lookup:    10ms
  ├── Model inference:   50ms
  ├── Post-processing:   10ms
  ├── Serialization:      5ms
  └── Buffer:           105ms
```

---

# PART 8: MONITORING & MAINTENANCE

---

## 8.1 Why Models Decay ★★

```
  ML models are NOT "deploy and forget." They decay over time.

  DATA DRIFT: The input data distribution changes.
  ─────────────────────────────────────────
  Example: COVID-19 changed shopping patterns overnight.
  Your model trained on 2019 data doesn't understand 2020 behavior.

  CONCEPT DRIFT: The relationship between input and output changes.
  ─────────────────────────────────────────
  Example: "Wireless" used to mean radios. Now it means WiFi.
  The same features predict different outcomes over time.

  FEATURE DRIFT: A feature's distribution changes.
  ─────────────────────────────────────────
  Example: A new app version changes how "session_length" is calculated.
  The feature still exists but means something different.

  ┌──────────────────────────────────────────────────────────────┐
  │  HOW TO DETECT:                                               │
  │  - Monitor input feature distributions (PSI, KL divergence)  │
  │  - Monitor prediction distribution (mean, variance over time)│
  │  - Monitor online metrics (CTR, revenue) for degradation     │
  │  - Set up alerts for sudden changes                          │
  │                                                              │
  │  HOW TO FIX:                                                  │
  │  - Retrain on fresh data (scheduled or triggered)            │
  │  - Use sliding windows (only train on last N days of data)   │
  │  - Online learning (update model with each new example)      │
  │  - Feature monitoring with automated alerts                  │
  └──────────────────────────────────────────────────────────────┘
```

---

# PART 9: ML INFRASTRUCTURE & MLOps

---

## 9.1 The ML Lifecycle

```
  ┌─────────────────────────────────────────────────────────────────┐
  │                    ML LIFECYCLE (continuous loop)                 │
  │                                                                  │
  │    ┌──────────┐    ┌──────────┐    ┌──────────┐                │
  │    │  DATA    │───►│  TRAIN   │───►│ EVALUATE │                │
  │    │ PIPELINE │    │  MODEL   │    │  MODEL   │                │
  │    └──────────┘    └──────────┘    └─────┬────┘                │
  │         ▲                                │                      │
  │         │                                ▼                      │
  │    ┌──────────┐    ┌──────────┐    ┌──────────┐                │
  │    │ MONITOR  │◄───│  SERVE   │◄───│  DEPLOY  │                │
  │    │ & ALERT  │    │ PREDICT  │    │  MODEL   │                │
  │    └──────────┘    └──────────┘    └──────────┘                │
  │                                                                  │
  └─────────────────────────────────────────────────────────────────┘

  KEY INFRASTRUCTURE COMPONENTS:
  ─────────────────────────────────────────

  MODEL REGISTRY: Version control for models.
  ─────────────────────────────────────────
  Store every model version with metadata:
  - Which data was it trained on?
  - What hyperparameters were used?
  - What were the evaluation metrics?
  - Who approved it for production?
  Tools: MLflow, Google Vertex AI Model Registry, Weights & Biases

  EXPERIMENT TRACKING: Record every experiment.
  ─────────────────────────────────────────
  Compare runs: "Model A with LR=0.001 got AUC=0.89, Model B with LR=0.01 got AUC=0.87"
  Tools: MLflow, W&B, TensorBoard, Google Vertex AI Experiments

  CI/CD FOR ML: Automate the pipeline.
  ─────────────────────────────────────────
  - New data arrives → trigger data validation
  - Data passes checks → trigger model training
  - Model passes eval thresholds → trigger deployment
  - Deployment passes canary checks → full rollout
  Tools: Kubeflow Pipelines, Google Vertex AI Pipelines, Airflow
```

---

# PART 10: FULL DESIGN — RECOMMENDATION SYSTEM

---

## Design a Video Recommendation System (YouTube-style) ★★★

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  STEP 1: CLARIFY                                                  │
  │  - Personalized homepage recommendations                         │
  │  - Scale: 2 billion users, 500 million videos                    │
  │  - Latency: <200ms                                               │
  │  - Goal: maximize long-term user satisfaction (not just clicks)  │
  └──────────────────────────────────────────────────────────────────┘

  STEP 2: FRAME AS ML
  ─────────────────────
  Two-stage ranking problem:
  Stage 1 (Retrieval): From 500M videos, find 1000 candidates for this user
  Stage 2 (Ranking): Rank 1000 candidates, show top 20

  Label: weighted combination of (watch time, likes, shares) - (dislikes, "not interested")

  STEP 3: DATA
  ─────────────────────
  - User watch history (billions of events/day)
  - User interactions (likes, comments, shares, subscriptions)
  - Video metadata (title, description, category, upload date, duration)
  - Creator information (subscriber count, upload frequency)
  - Implicit negatives: videos shown but NOT clicked (position-debiased)

  STEP 4: FEATURES
  ─────────────────────
  User: watch_history_embedding, avg_watch_duration, preferred_categories,
        activity_level, subscription_list, demographics
  Video: video_embedding, duration, category, freshness, creator_quality,
         avg_engagement_rate, title_embedding
  Context: time_of_day, device_type, session_length, last_watched_video
  Cross: user_category_affinity, user_creator_following, similar_to_recent

  STEP 5: MODEL
  ─────────────────────
  Stage 1 — Retrieval (Two-Tower):
    User tower: user features → 128-dim embedding
    Video tower: video features → 128-dim embedding
    Score = dot_product(user_emb, video_emb)
    Use approximate nearest neighbor (ANN) index for fast retrieval

  Stage 2 — Ranking (Wide & Deep or Transformer):
    Input: all user + video + context + cross features
    Output: P(engagement | user, video, context)
    Train with cross-entropy loss

  Stage 3 — Re-ranking:
    - Diversity: don't show 5 cooking videos in a row
    - Freshness: boost new content from subscribed creators
    - Fairness: ensure diverse creator representation
    - Ads: insert sponsored content at appropriate positions

  STEP 6: EVALUATION
  ─────────────────────
  Offline: NDCG@20, AUC, recall@1000 (retrieval), precision@20 (ranking)
  Online: watch time per session, user retention, "not interested" rate
  A/B test: 1% → 5% → 50% → 100% rollout over 2 weeks

  STEP 7: SERVING
  ─────────────────────
  Retrieval: batch pre-compute candidate lists (update hourly)
  Ranking: real-time inference (depends on current context)
  Feature store: online store for real-time features (Redis/Bigtable)
  Caching: cache predictions for popular user-video pairs

  STEP 8: MONITORING
  ─────────────────────
  - Watch time per session (main metric, daily dashboard)
  - "Not interested" click rate (quality metric)
  - Model prediction distribution (drift detection)
  - Feature freshness (is data pipeline healthy?)
  - Retrain weekly on last 30 days of data
```

---

# PART 11: FULL DESIGN — SEARCH RANKING

---

## Design a Search Ranking System (Google-style) ★★★

```
  STEP 1: CLARIFY
  - Web search: user types query, see ranked list of results
  - Scale: 8.5 billion queries/day, billions of web pages
  - Latency: <500ms total, <100ms for ML ranking
  - Goal: most RELEVANT results at the top

  STEP 2: FRAME AS ML
  - Learning-to-rank problem
  - Input: (query, document) pair
  - Output: relevance score
  - Rank documents by score, show top 10

  STEP 3: DATA
  - Click logs: which results users clicked
  - Dwell time: how long they stayed on the page
  - Human relevance judgments (raters score query-document pairs 1-5)
  - Pogo-sticking: user clicks result, immediately comes back (negative signal)

  STEP 4: FEATURES
  Query: query_embedding, query_length, query_intent (navigational/informational)
  Document: PageRank, content_quality, freshness, domain_authority, title_match
  Query-Document: BM25_score, semantic_similarity, query_term_coverage
  User: search_history, location, language, device
  Context: time_of_day, trending_topics

  STEP 5: MODEL
  Retrieval: BM25 + semantic search (dual encoder) → top 1000 candidates
  Ranking: Cross-encoder (BERT-based) scores (query, document) pairs
  Loss: LambdaMART or pairwise ranking loss

  STEP 6: METRICS
  Offline: NDCG@10, MRR, query-level precision
  Online: successful query rate (user doesn't reformulate), CTR, time to first click
```

---

# PART 12: FULL DESIGN — FRAUD DETECTION

---

## Design a Payment Fraud Detection System ★★

```
  STEP 1: CLARIFY
  - Real-time: must decide before payment is processed (<100ms)
  - Scale: 10 million transactions/day
  - Extreme imbalance: 99.9% legitimate, 0.1% fraudulent
  - Cost: false negative (missed fraud) = $$$. False positive (blocked legit) = angry customer.

  STEP 2: FRAME AS ML
  - Binary classification: P(fraud | transaction)
  - Multi-threshold: different actions at different confidence levels
    P > 0.9: block immediately
    P > 0.5: flag for manual review
    P < 0.5: allow

  STEP 3: DATA
  - Transaction history (amount, merchant, time, location, frequency)
  - User profile (account age, typical spending, devices used)
  - Device fingerprint (IP, browser, device ID)
  - Network features (graph of who sends money to whom)
  - Known fraud cases (labeled by investigators)

  STEP 4: FEATURES
  Transaction: amount, merchant_category, time_of_day, is_international
  User patterns: avg_transaction_amount, transaction_frequency,
                 amount_deviation_from_mean, new_merchant_flag
  Velocity: transactions_last_hour, unique_merchants_last_24h,
            amount_last_hour (real-time aggregates!)
  Device: device_age, ip_risk_score, geolocation_mismatch
  Graph: is_connected_to_known_fraudster, cluster_fraud_rate

  STEP 5: MODEL
  - Gradient boosted trees (XGBoost): fast, handles imbalance well
  - Class weights or focal loss for imbalance
  - Real-time features critical: "5 transactions in the last 10 minutes" is a strong fraud signal
  - Ensemble: combine rule-based system + ML model

  STEP 6: METRICS
  Offline: AUC-ROC, precision@recall=0.9 (at 90% fraud caught, what's the false positive rate?)
  Online: fraud loss rate ($), false positive rate, customer complaint rate
  VERY IMPORTANT: optimize for BUSINESS cost, not just accuracy

  STEP 7: SERVING
  - Must be real-time (<100ms)
  - Feature store: real-time velocity features (streaming pipeline)
  - Model serves as a microservice with multiple replicas
  - Fallback: if ML service is down, use rule-based system (never block the payment flow)

  STEP 8: MONITORING
  - Fraud loss rate (daily, compare to baseline)
  - False positive rate (customer complaints about blocked transactions)
  - Feature drift (are spending patterns changing?)
  - Adversarial drift (fraudsters change tactics to avoid detection)
  - Retrain frequently (weekly) — fraud patterns evolve fast
```

---

# PART 13: FULL DESIGN — CONTENT MODERATION

---

## Design a Content Moderation System ★★

```
  STEP 1: CLARIFY
  - Detect harmful content: hate speech, violence, misinformation, spam, CSAM
  - Multi-modal: text, images, videos
  - Scale: 500 million posts/day
  - Latency: <1 second for text, <5 seconds for images/video
  - Safety: must err on the side of caution (remove harmful content even if uncertain)

  STEP 2: FRAME AS ML
  - Multi-label classification (a post can be hate speech AND misinformation)
  - Each category is a binary classifier: P(hate_speech | post)
  - Different thresholds per category (lower for CSAM, higher for borderline content)

  STEP 3: DATA
  - Human-labeled examples (content moderators review and label posts)
  - User reports ("flag" button)
  - Appeals (content incorrectly removed — false positives)
  - Policy guidelines (written rules → training examples)
  - Adversarial examples (users trying to evade detection)

  STEP 5: MODEL
  Text: Fine-tuned BERT/transformer for text classification
  Image: CNN or Vision Transformer for image classification
  Video: Sample frames → image model + audio model → aggregate
  Multi-modal: Combine text + image signals for posts with both

  Multi-stage:
  Stage 1 (Fast): Lightweight model runs on ALL content (<100ms)
                   Catches obvious violations (exact hash match, clear violations)
  Stage 2 (Accurate): Heavy model on flagged content (<5s)
                       More nuanced classification
  Stage 3 (Human): Borderline cases go to human reviewers
                    Human decisions become training data

  STEP 6: METRICS
  Precision: Don't over-remove (censorship concerns)
  Recall: Don't miss harmful content (safety concerns)
  Time to action: How fast is harmful content removed?
  Appeal overturn rate: How often are human reviewers overriding the model?

  KEY TRADE-OFF: Precision vs Recall
  - High recall, low precision: remove lots of content, some incorrectly (over-moderation)
  - High precision, low recall: only remove obvious stuff, miss subtle harm (under-moderation)
  - For CSAM: maximize recall (miss NOTHING), accept some false positives
  - For political speech: maximize precision (don't censor legitimate speech)
```

---

# PART 14: FULL DESIGN — ADS CLICK PREDICTION

---

## Design an Ads Click Prediction System ★★★

```
  STEP 1: CLARIFY
  - Predict: P(user clicks on this ad)
  - Scale: billions of ad impressions/day
  - Latency: <50ms (ad auction happens in real-time)
  - Revenue: ads are the primary business model — get this wrong, company loses money

  STEP 2: DATA
  - Ad impression logs (which ads were shown, which were clicked)
  - User profile (demographics, interests, search history)
  - Ad creative (text, image, landing page, advertiser)
  - Context (query, page content, device, time)

  STEP 4: FEATURES
  User: user_embedding, past_click_categories, demographic_segment
  Ad: ad_embedding, advertiser_quality, ad_freshness, creative_type
  Context: query_ad_relevance, page_type, device, time_of_day
  Cross: user_ad_category_affinity, query_ad_similarity, user_advertiser_history

  STEP 5: MODEL
  - Wide & Deep (Google's standard for ads)
  - Or DLRM (Deep Learning Recommendation Model)
  - Calibration is critical: P(click) = 0.05 should mean 5% of such impressions get clicked
  - Train on billions of examples daily

  AD AUCTION:
  For each ad slot, the system runs an auction:
  Ad score = P(click) × bid_amount
  Show the ad with the highest score.
  Charge the advertiser the minimum bid needed to win.

  If your model overestimates P(click), you show irrelevant ads (users unhappy).
  If your model underestimates P(click), you show cheaper ads (revenue lost).
  CALIBRATION matters more than raw AUC here.
```

---

# PART 15: FULL DESIGN — NEWSFEED RANKING

---

## Design a Social Media Newsfeed Ranking System

```
  STEP 1: CLARIFY
  - Rank posts from friends/following in a personalized order
  - Scale: 1 billion users, average user follows 200 accounts
  - New posts: 100 million per hour
  - Latency: <300ms

  STEP 2: FRAME
  Multi-objective ranking:
  Predict: P(like), P(comment), P(share), P(hide), P(report)
  Final score = w₁·P(like) + w₂·P(comment) + w₃·P(share) - w₄·P(hide) - w₅·P(report)
  Weights chosen to optimize long-term engagement, not just clicks.

  STEP 5: MODEL SERVING CHALLENGE
  Fan-out problem: When a celebrity with 10M followers posts,
  do you immediately rank that post for 10M timelines?

  Fan-out on WRITE: When user posts, push to all followers' feeds.
  + Fast reads. - Expensive writes for popular users.

  Fan-out on READ: When user opens feed, pull posts from all followed accounts.
  + Simple writes. - Slow reads (must aggregate and rank on the fly).

  HYBRID: Fan-out on write for regular users, fan-out on read for celebrities.
  This is how Twitter/Instagram actually work.
```

---

# PART 16: FULL DESIGN — AUTOCOMPLETE / QUERY SUGGESTION

---

## Design a Search Autocomplete System

```
  STEP 1: CLARIFY
  - As user types "how to l...", suggest completions: "how to learn python"
  - Latency: <100ms (must feel instant)
  - Scale: 5 billion queries/day
  - Safety: must not suggest harmful, offensive, or illegal queries

  STEP 2: FRAME
  Ranking problem: given a prefix, rank possible completions.

  APPROACH 1 — Popularity-based (baseline):
  Pre-compute most popular queries starting with each prefix.
  Store in a trie or prefix-indexed cache. Fast, simple.

  APPROACH 2 — Personalized (ML):
  Features: prefix, user history, trending queries, time of day, location
  Model: lightweight ranker (logistic regression or small neural network)
  Candidates: top 100 from popularity trie → re-rank with ML

  LATENCY TRICK: Pre-compute suggestions for ALL 2-character prefixes.
  "ho" → [how to, hotels near me, home depot, ...]
  When user types "how", intersect "ho" suggestions with "how" prefix.
  No ML needed for the first few characters — just prefix matching.

  ML kicks in after 3+ characters when the query is more specific.
```

---

# PART 17: FULL DESIGN — NOTIFICATION SYSTEM

---

## Design a Smart Notification System

```
  STEP 1: CLARIFY
  - Decide: which notifications to send, when, and through which channel
  - Goal: maximize engagement WITHOUT annoying users
  - Constraint: each user has a daily notification budget (e.g., max 5/day)

  STEP 2: FRAME
  Multi-objective optimization under constraints:
  For each candidate notification, predict:
  - P(open): will the user open this notification?
  - P(positive_action): will they take a positive action?
  - P(mute/unsubscribe): will they mute or unsubscribe?

  Score = P(open) × P(positive_action) - λ × P(mute)

  Subject to: total notifications ≤ budget per user per day

  This is a CONSTRAINED OPTIMIZATION problem — select the highest-value
  set of notifications under the budget constraint.

  KEY INSIGHT: Sending every notification maximizes individual-notification CTR
  but DECREASES overall engagement because users get notification fatigue.
  The system must learn the optimal VOLUME per user.
```

---

# PART 18: TRADE-OFFS CHEAT SHEET

---

```
  ┌─────────────────────────────────┬──────────────────────────────────────┐
  │  TRADE-OFF                      │  WHEN TO CHOOSE WHICH                 │
  ├─────────────────────────────────┼──────────────────────────────────────┤
  │  Simple model vs complex model  │  Start simple. Complex only if        │
  │                                 │  simple doesn't meet requirements.   │
  ├─────────────────────────────────┼──────────────────────────────────────┤
  │  Precision vs recall            │  Fraud/safety → recall               │
  │                                 │  Spam filter → precision              │
  ├─────────────────────────────────┼──────────────────────────────────────┤
  │  Batch vs real-time serving     │  Depends on freshness requirements.  │
  │                                 │  Hybrid is usually the answer.       │
  ├─────────────────────────────────┼──────────────────────────────────────┤
  │  Accuracy vs latency            │  50ms model with 90% acc often       │
  │                                 │  beats 500ms model with 92% acc.     │
  ├─────────────────────────────────┼──────────────────────────────────────┤
  │  Exploration vs exploitation    │  New system → more exploration.      │
  │                                 │  Mature system → more exploitation.  │
  ├─────────────────────────────────┼──────────────────────────────────────┤
  │  Engagement vs satisfaction     │  Clickbait wins engagement.           │
  │                                 │  Quality wins long-term retention.    │
  ├─────────────────────────────────┼──────────────────────────────────────┤
  │  Fairness vs performance        │  Sometimes the most accurate model    │
  │                                 │  is biased. Add fairness constraints. │
  ├─────────────────────────────────┼──────────────────────────────────────┤
  │  Fresh data vs more data        │  Depends on domain. Fraud: fresh.    │
  │                                 │  Language: more. Both is best.        │
  ├─────────────────────────────────┼──────────────────────────────────────┤
  │  Model retraining: frequent     │  Frequent → expensive, fresh.        │
  │  vs infrequent                  │  Infrequent → cheap, possibly stale. │
  │                                 │  Trigger on drift detection.          │
  └─────────────────────────────────┴──────────────────────────────────────┘
```

---

# PART 19: INTERVIEW TIPS & ANTI-PATTERNS

---

```
  DO:
  ────────────────────────────────────────
  ✓ Ask clarifying questions before designing
  ✓ Start with a simple baseline
  ✓ Draw the system architecture diagram
  ✓ Discuss data collection and labeling explicitly
  ✓ Mention both offline and online metrics
  ✓ Discuss trade-offs at every decision point
  ✓ Think about edge cases (cold start, adversarial users)
  ✓ Mention monitoring and retraining
  ✓ Consider fairness, bias, and privacy
  ✓ Manage your time (don't spend 20 min on features alone)

  DON'T:
  ────────────────────────────────────────
  ✗ Jump straight to "use a transformer"
  ✗ Assume perfect data exists
  ✗ Ignore latency and serving constraints
  ✗ Only mention accuracy as a metric
  ✗ Forget about class imbalance
  ✗ Design a system that can't be monitored
  ✗ Ignore the label design question
  ✗ Propose a model you can't explain
  ✗ Forget about the re-ranking stage
  ✗ Spend all your time on the model and none on data/serving
```

---

# PART 20: QUICK REFERENCE

---

```
  ╔══════════════════════════════════════════════════════════════════════╗
  ║  ML SYSTEM DESIGN CHEAT SHEET                                       ║
  ╠══════════════════════════════════════════════════════════════════════╣
  ║                                                                      ║
  ║  FRAMEWORK: Clarify → Frame → Data → Features → Model →             ║
  ║             Evaluate → Serve → Monitor                               ║
  ║                                                                      ║
  ║  PIPELINE:  1B items → Retrieval (→1K) → Filtering → Ranking (→50) ║
  ║             → Re-ranking (→20) → Show to user                       ║
  ║                                                                      ║
  ║  MODELS:    Retrieval: Two-Tower + ANN index                        ║
  ║             Ranking: Wide & Deep, GBDT, or Transformer              ║
  ║             Start simple: logistic regression baseline               ║
  ║                                                                      ║
  ║  FEATURES:  User | Item | Context | Cross (always use all 4)        ║
  ║                                                                      ║
  ║  METRICS:   Offline: AUC, NDCG, Precision@K, Recall@K              ║
  ║             Online: CTR, revenue, retention, satisfaction            ║
  ║             Always mention BOTH                                      ║
  ║                                                                      ║
  ║  SERVING:   Batch for pre-computation                                ║
  ║             Real-time for context-dependent predictions              ║
  ║             Hybrid for most systems                                  ║
  ║                                                                      ║
  ║  DATA:      Implicit > explicit (volume vs quality)                  ║
  ║             Label design shapes the system's behavior                ║
  ║             Data quality > model complexity                          ║
  ║                                                                      ║
  ║  MONITORING: Data drift, concept drift, feature drift               ║
  ║              Retrain on schedule + on drift detection                ║
  ║              Canary deployment for safe rollout                      ║
  ║                                                                      ║
  ║  TRADE-OFFS: Always discuss explicitly. There is no "best."         ║
  ╚══════════════════════════════════════════════════════════════════════╝
```

---

# PART 21: INTERVIEW QUESTIONS & ANSWERS

> These questions are what Google actually asks. The answers are written in simple language
> — imagine you're explaining to a smart 10-year-old who understands basic computer ideas.

---

## Q1: How would you design a recommendation system for YouTube?

**Simple answer:**

Think of YouTube like a super-smart librarian. You walk into a library with 500 million books. The librarian needs to pick 20 books you'll love — in under 1 second.

**Step 1 — Narrow down (Retrieval):**
The librarian can't read 500 million books. So they use a shortcut: "This person likes cooking, so grab the cooking section." Using something called a Two-Tower model, we turn every user and every video into a list of numbers (an embedding). Videos whose numbers are "close" to the user's numbers are probably interesting. This narrows 500 million videos down to about 1,000.

**Step 2 — Pick the best (Ranking):**
Now the librarian carefully looks at those 1,000 books and picks the best 20. A bigger, smarter model looks at everything — who you are, what the video is about, what time it is, what device you're using — and scores each video. The top 20 win.

**Step 3 — Mix it up (Re-ranking):**
Don't show 20 cooking videos in a row! Mix in some variety. Remove anything you've already seen. Maybe add a trending video. This is business logic on top of ML.

**What label do we predict?**
NOT just clicks — that gives you clickbait. YouTube uses a mix: watch time + likes + shares - dislikes - "not interested." This way the system learns to show genuinely good videos, not just ones with catchy thumbnails.

**How do we know it works?**
- Offline: Does the ranking put good videos near the top? (Measure with NDCG)
- Online: Do people watch longer? Come back tomorrow? Click "not interested" less?
- A/B test: Show the new system to 5% of users, compare to the old system.

---

## Q2: How would you design a fraud detection system for payments?

**Simple answer:**

Imagine you're a security guard at a bank. Every second, people walk up and want to take money out. You need to spot the thieves — but 999 out of 1,000 people are honest. You have less than 1 second to decide.

**The tricky parts:**

**1. Extreme imbalance:**
If you just say "everyone is honest," you're right 99.9% of the time! But you caught zero thieves. Accuracy is a terrible metric here. Instead, we care about: "Of all the real thieves, how many did I catch?" (That's recall.)

**2. Speed:**
You MUST decide before the payment goes through. If the model takes 5 seconds, the money is already gone. So we need predictions in under 100 milliseconds.

**3. Sneaky fraudsters:**
Fraudsters change tactics. Last month they used stolen credit cards. This month they use fake accounts. The model must adapt quickly — retrain every week, not every year.

**What features help catch fraud?**

Think about what looks suspicious to a human:
- "This person usually spends $50, but this transaction is $5,000" → **amount deviation**
- "5 transactions in the last 10 minutes from different countries" → **velocity features** (real-time!)
- "This device was never used before" → **new device flag**
- "The IP address is from a country the user has never visited" → **location mismatch**

The real-time features (what happened in the last few minutes) are the most powerful. You need a streaming data pipeline to compute them.

**Model:**
Start with gradient boosted trees (XGBoost). They're fast, handle imbalanced data well, and are easy to debug. Use class weights or focal loss to handle the 99.9% vs 0.1% imbalance.

**Multi-threshold decision:**
- Score > 0.9 → Block the payment immediately
- Score 0.5-0.9 → Flag for human review (a person checks it)
- Score < 0.5 → Allow the payment

**Monitoring:**
Fraudsters evolve. If your fraud loss rate starts creeping up, the model might be outdated. Monitor daily and retrain weekly.

---

## Q3: What's the difference between offline and online metrics? Why do they sometimes disagree?

**Simple answer:**

**Offline metrics** are like a practice test. You test the model on old data you already have answers for. "On last month's data, how well does the new model rank videos?" Common offline metrics: AUC, NDCG, precision.

**Online metrics** are like the real exam. You deploy the model to real users and measure what actually happens. "Did people watch more videos? Did they come back the next day? Did revenue go up?" Common online metrics: CTR, watch time, revenue, retention.

**Why they can disagree:**

Imagine a restaurant hires a new chef. In taste tests (offline), everyone loves the new food. But when the restaurant opens (online), customers stop coming. Why?

- **The taste test was biased.** It used food critics, not regular customers.
- **The experience changed.** Maybe the new food takes 30 minutes longer to prepare. Customers don't want to wait.
- **Novelty effect.** In the taste test, the new food was exciting because it was different. After a week, people get bored.
- **Measurement is different.** The taste test measured "how good does it taste?" But the restaurant cares about "do people come back?"

Same with ML: a model might have better AUC (offline) but decrease revenue (online) because it recommends niche items that get high engagement from a few people but confuse most users.

**Rule: Online metrics are the final judge. Always.**

---

## Q4: Explain the multi-stage pipeline (Retrieval → Ranking → Re-ranking). Why not just use one model?

**Simple answer:**

Imagine you're picking a birthday present for your friend from ALL the products on Amazon (500 million items).

**Why not one model?**
If you asked a super-smart expert to carefully evaluate every single one of 500 million products — even at 1 millisecond per product, it would take 500,000 seconds = almost 6 days! Your friend's birthday would be over.

**The multi-stage trick:**

**Stage 1 — Retrieval (Fast but rough):**
Use a simple, fast method to grab ~1,000 "maybe good" items. Like walking into the store and going to the right section (electronics, books, toys) based on what your friend likes. Takes 10 milliseconds for 500 million items using approximate nearest neighbors.

**Stage 2 — Ranking (Accurate but slow):**
Now carefully score those 1,000 items with a big, smart model that considers everything. "Your friend likes gaming, this is the latest controller, it has great reviews, it's in your budget." Takes 50 milliseconds for 1,000 items. Narrows to top 50.

**Stage 3 — Re-ranking (Business rules):**
Apply final adjustments. Remove out-of-stock items. Add diversity (don't show 5 similar controllers). Maybe boost a sponsored product. Narrows to 20.

**Analogy:**
- Retrieval = Using a metal detector to scan a beach (fast, finds all metal things)
- Ranking = Examining each metal thing closely (slow, finds the gold)
- Re-ranking = Picking the best gold pieces for the display (business decisions)

Each stage trades off speed vs accuracy. Fast stages handle billions. Slow stages handle hundreds. This is how YouTube, Google Search, Instagram, TikTok, and Amazon ALL work.

---

## Q5: What is training-serving skew and why is it dangerous?

**Simple answer:**

Imagine you practice basketball by shooting hoops in your backyard. But in the actual game, the basket is 2 inches higher. Your practice didn't match reality, so your shots miss.

**Training-serving skew** is the same idea in ML: the features your model saw during training are DIFFERENT from the features it gets during serving (real predictions).

**Common causes:**

**1. Different code paths:**
Training uses Python + pandas to compute features.
Serving uses Java + custom code.
Tiny differences (rounding, null handling) → different feature values.

**2. Time travel:**
During training, you accidentally used a feature that "knows the future."
Example: "Was this transaction flagged as fraud?" — Well, yes, but you only know that AFTER the fact! At serving time, you don't have this feature yet.

**3. Stale features:**
Training uses the latest user profile. But serving uses a cached profile from 6 hours ago. The user changed their preferences, but the model doesn't know.

**How to prevent it:**
Use a **feature store** — a single system that computes features THE SAME WAY for both training and serving. If training reads "user_avg_spend = $45.20," serving must read the exact same $45.20 (at that point in time).

**Why interviewers love this question:**
Because it's a REAL production bug that has caused millions of dollars in losses at real companies. A model that's 95% accurate in testing but has skew might perform at 70% in production — and you won't know why until you debug the feature pipeline.

---

## Q6: How do you handle the cold-start problem in recommendations?

**Simple answer:**

**Cold start** = a new user or new item with NO history. The model can't recommend based on what you've done because you haven't done anything yet.

**New user cold start:**
You signed up 5 seconds ago. The model knows nothing about you.

Solutions:
- **Popular items:** Show everyone the most popular stuff until we learn your taste. Simple and surprisingly effective.
- **Ask preferences:** "What topics interest you?" (YouTube does this on signup)
- **Demographic-based:** You're 25, from India, use Android → show what similar users like.
- **Explore aggressively:** Show a diverse mix and quickly learn from what you click on. After 10-20 interactions, personalization kicks in.

**New item cold start:**
A video was uploaded 5 minutes ago. Nobody has watched it yet. The model has no engagement data.

Solutions:
- **Content-based features:** Use the title, description, thumbnail, and video content to estimate quality. A video titled "Python Tutorial" with good metadata probably fits the "programming" audience.
- **Creator features:** If the creator has 1M subscribers and high avg engagement, their new video is probably good.
- **Exploration budget:** Show the new item to a small random sample of users. Collect feedback. Update the model.
- **Bandits:** Use multi-armed bandit algorithms that balance showing proven content (exploitation) vs. trying new content (exploration).

**Google interview tip:** Always mention cold start. It shows you think about real-world problems, not just the happy path.

---

## Q7: What is position bias and how do you handle it?

**Simple answer:**

Position bias means: **items shown at the top of the list get more clicks just because they're at the top** — not because they're better.

Think of a search results page. The first result gets ~30% of clicks. The second gets ~15%. The tenth gets ~2%. Even if you swap the first and tenth results, the first POSITION still gets the most clicks.

**Why this is a problem for ML:**
If you train on click data, the model learns "items shown at position 1 are great!" But that's circular — they got clicks BECAUSE of position, not quality. The model just learns to rank popular/lucky items higher.

**Fixes:**

**1. Use position as a feature during training, remove during serving:**
Train: score = f(user, item, position)
Serve: score = f(user, item, position=0) — pretend everything is position 0
This way the model learns "this item gets X clicks GIVEN it's at position Y" and can separate item quality from position effect.

**2. Randomize positions (exploration):**
Occasionally shuffle the results. Collect click data on items at various positions. This gives you unbiased training data. But hurts user experience — use sparingly (1-5% of traffic).

**3. Inverse propensity weighting:**
Weight each training example by 1/P(position). Items at position 1 get lower weight (they'd be clicked anyway). Items at position 10 get higher weight (a click here really means quality).

---

## Q8: Explain the difference between content-based filtering and collaborative filtering.

**Simple answer:**

**Content-based filtering** = Recommend items SIMILAR to what you liked before.

"You watched 3 cooking videos → here are more cooking videos."

It uses item features (category, description, keywords) to find similar items.
- Pros: Works for new items (no need for other users' data). Explainable.
- Cons: Never recommends outside your bubble. Can't discover new interests.

**Collaborative filtering** = Recommend items that SIMILAR USERS liked.

"Users who watched the same 10 videos as you also watched THIS video."

It uses patterns from many users to find recommendations.
- Pros: Can discover surprising, serendipitous recommendations. No need for item features.
- Cons: Cold start problem (new users/items have no data). Not explainable.

**Matrix factorization (a type of collaborative filtering):**
Imagine a giant table: rows = users, columns = items, cells = ratings.
Most cells are empty (you haven't rated most things).
Factor this matrix into User × Item matrices (low-rank approximation).
Fill in the blanks → those are your predictions.

**Modern systems use BOTH:**
- Content-based: for new items / cold start
- Collaborative: for personalization / discovery
- Neural models combine both: take item features AND user interaction history as input.

---

## Q9: How do you decide how often to retrain a model?

**Simple answer:**

It depends on how fast the world changes in your domain.

**Fast-changing domains (retrain frequently):**
- Fraud detection: Fraudsters change tactics weekly → retrain weekly
- News ranking: Today's trending topics are different from yesterday → retrain daily
- Ads: User interests shift with seasons, events → retrain daily/weekly

**Slow-changing domains (retrain less often):**
- Language translation: Languages don't change fast → retrain monthly
- Medical diagnosis: Disease symptoms don't change → retrain quarterly
- Image classification: Cats still look like cats → retrain when you have new data

**The smart approach — drift-triggered retraining:**

Instead of guessing, DETECT when the model is getting worse:

1. Monitor the distribution of incoming data (are features changing?)
2. Monitor prediction distribution (is the model outputting unusual scores?)
3. Monitor online metrics (is CTR dropping? Is fraud loss increasing?)

When drift is detected → trigger retraining automatically.

**Sliding window training:**
Don't train on ALL historical data — train on the last N days only.
- Last 7 days: very fresh, but small dataset
- Last 90 days: larger dataset, but includes stale patterns
- Common: last 30 days with exponential decay (recent data weighted higher)

---

## Q10: What's the difference between batch and real-time features? Give examples.

**Simple answer:**

**Batch features** are computed periodically (every hour, every day) on large amounts of data. They're "slow but comprehensive."

Examples:
- User's average spend over the last 30 days
- Item's total view count
- User's most-watched category
- Creator's subscriber count

These don't change every second. Computing them once a day is fine.

**Real-time features** are computed at the moment of the request, using the very latest data. They're "fast and fresh."

Examples:
- Number of transactions in the last 5 minutes (fraud detection)
- What the user just searched for 10 seconds ago
- How many items the user has viewed in this session
- Current trending topics

These change every second. Stale values could mean wrong predictions.

**Why this matters:**
For fraud detection, knowing "this user made 10 transactions in the last 5 minutes" is a MUCH stronger signal than "this user's average is 2 transactions per day." The real-time feature catches fraud that the batch feature misses.

**Architecture:**
- Batch features: computed in Spark/BigQuery, stored in a data warehouse, loaded into feature store
- Real-time features: computed in a streaming pipeline (Kafka/Flink), stored in Redis or Bigtable, served with <10ms latency

Most production systems need BOTH.

---

## Q11: How would you handle class imbalance in fraud detection (0.1% fraud, 99.9% legitimate)?

**Simple answer:**

Imagine you're teaching a child to identify poisonous mushrooms. But you show them 999 safe mushrooms and only 1 poisonous one. They'll just learn "all mushrooms are safe!" — and get poisoned.

**The problem:**
A model trained on imbalanced data learns the easy shortcut: predict "not fraud" for everything → 99.9% accuracy! But catches 0% of actual fraud. Useless.

**Solutions (from simplest to most advanced):**

**1. Class weights:**
Tell the model: "Getting a fraud case wrong costs 1000x more than a legitimate case."
In code: `class_weight = {0: 1, 1: 1000}`
The model pays much more attention to fraud examples.

**2. Oversampling (SMOTE):**
Create synthetic copies of the minority class (fraud examples).
1000 fraud examples → generate 10,000 synthetic fraud examples.
Now the model sees a more balanced dataset.

**3. Undersampling:**
Randomly remove majority class examples.
Keep all 1000 fraud, randomly sample 5000 legitimate.
Faster training, but throws away data.

**4. Focal loss:**
A special loss function that automatically focuses on hard examples.
Easy cases (obvious legitimate transactions) contribute less to the loss.
Hard cases (ambiguous transactions) contribute more.

**5. Anomaly detection approach:**
Instead of classification, train only on legitimate transactions.
Learn what "normal" looks like. Flag anything that deviates.
No fraud labels needed — but less precise.

**6. Ensemble:**
Train multiple models on different subsamples.
Each model sees a balanced subset.
Combine predictions (voting or averaging).

**Most effective in practice:** Class weights + focal loss + real-time velocity features. The velocity features ("5 transactions in 10 minutes") are so powerful that they make the imbalance much less severe — most fraud DOES look different from legitimate behavior when you have the right features.

---

## Q12: What is an A/B test and why can't you just compare offline metrics?

**Simple answer:**

An **A/B test** is an experiment where you randomly split real users into two groups:
- Group A (control): sees the OLD system
- Group B (treatment): sees the NEW system

You measure real-world metrics for both groups and compare. If Group B is significantly better → launch the new system.

**Why offline metrics aren't enough:**

**1. Offline data is the past. The real world is the present.**
Your test dataset is from last month. User behavior may have changed.

**2. Offline metrics can't measure user experience.**
AUC tells you ranking quality. But does the user FEEL happier? Do they come back tomorrow? Only real users tell you that.

**3. Second-order effects.**
A new recommendation model might increase clicks (good!) but show more sensational content, which makes users trust the platform less (bad!). Offline metrics can't capture this.

**4. Novelty bias.**
In offline tests, the new model looks better on held-out data. But in real life, users may be excited about the change initially (novelty effect) and then revert. Or vice versa — they might hate the change at first but learn to love it.

**A/B test design tips:**

- **Sample size:** Need enough users for statistical significance. Use power calculators.
- **Duration:** Run for at least 1-2 weeks to capture day-of-week effects.
- **Guardrail metrics:** Define metrics that MUST NOT degrade (revenue, crash rate, latency).
- **Randomization unit:** Usually by user ID (not by request, because one user would see both versions).
- **Gradual rollout:** 1% → 5% → 25% → 50% → 100%. If anything breaks at 5%, only 5% of users are affected.

---

## Q13: Design a content moderation system. What's the hardest part?

**Simple answer:**

Content moderation = automatically finding and removing harmful content (hate speech, violence, spam, misinformation, child exploitation material).

**The hardest parts:**

**1. Defining "harmful" is subjective.**
"This politician is terrible" — is that hate speech or free speech? Different cultures, laws, and contexts give different answers. The model must handle nuance that even humans disagree on.

**2. Adversarial users.**
People intentionally try to bypass the filter:
- "H.A.T.E" instead of "HATE"
- Replacing letters with similar-looking symbols: "h@te"
- Hiding text in images
- Using coded language that evolves ("let's go Brandon")
The model must constantly evolve with the adversaries.

**3. Scale vs accuracy trade-off.**
500 million posts per day. You can't run a heavy model on every single one.

Solution: **Multi-stage pipeline:**
- Stage 1 (ALL content, <50ms): Lightweight model catches obvious violations (exact hash match for known bad images, keyword filters, simple classifier). Catches 80% of violations.
- Stage 2 (Flagged content, <5s): Heavy model (fine-tuned BERT, Vision Transformer) analyzes nuanced cases. Catches 15% more.
- Stage 3 (Borderline, human): Human moderators review edge cases. Their decisions become training data. Catches the remaining 5%.

**4. The precision-recall dilemma varies by category:**
- Child exploitation: maximize RECALL at all costs. Remove everything suspicious. False positives are acceptable.
- Political speech: maximize PRECISION. Don't censor legitimate debate. Missing some borderline content is better than censoring free speech.

Different categories need different thresholds.

---

## Q14: What is a feature store and why would Google use one?

**Simple answer:**

Imagine you work at a restaurant chain with 100 locations. Each location makes their own ketchup from scratch. Some add more sugar, some less salt. The ketchup tastes different everywhere. Customers are confused.

A **feature store** is like a central ketchup factory. Everyone gets the same ketchup, made the same way, every time.

In ML terms: a feature store is a central system where ALL features are computed, stored, and served. Every model in the company uses the same feature definitions.

**Why Google needs one:**

Google has thousands of ML models. Without a feature store:
- Team A computes "user_activity_score" one way
- Team B computes it differently
- Team C doesn't know either exists and builds their own
- When Team A changes the computation, Team B's model breaks
- Training and serving compute features differently → **training-serving skew** → bad predictions

With a feature store:
- ONE definition of "user_activity_score"
- SHARED across all teams
- SAME computation in training and serving (guaranteed)
- Features are versioned (you can roll back)
- New teams can discover and reuse existing features

**Two stores in one:**
- **Offline store** (for training): Historical feature values. "What was user X's activity score 30 days ago?" Stored in BigQuery. High throughput.
- **Online store** (for serving): Latest feature values. "What is user X's activity score RIGHT NOW?" Stored in Redis/Bigtable. Low latency (<10ms).

---

## Q15: How would you design a search ranking system? Walk through the full pipeline.

**Simple answer:**

When you type "best pizza near me" into Google, the system needs to find the best 10 results from BILLIONS of web pages — in under 500 milliseconds.

**The pipeline:**

**1. Query understanding:**
"best pizza near me" → The system figures out:
- Intent: local search (user wants a nearby place)
- Entities: pizza (food type)
- Context: user's location (GPS), time (is it dinner time?)

**2. Retrieval (Billions → Thousands):**
Use inverted index (like a book's index) to find all pages containing "pizza."
Also use semantic search (embedding similarity) to find pages about pizza that don't use the exact word.
Result: ~10,000 candidate pages. Time: ~50ms.

**3. Ranking (Thousands → Hundreds → 10):**
Score each candidate with a big model. Features:
- **Query-document match:** How well do the words match? (BM25 score)
- **Semantic similarity:** How close are the query and page embeddings?
- **Page quality:** PageRank, domain authority, content freshness
- **User context:** Location (closer restaurants rank higher), language, device
- **Engagement history:** Click-through rate, dwell time for this page on similar queries

Model: Cross-encoder (BERT-based) that scores (query, document) pairs. This is accurate but slow — that's why we only run it on 10,000 candidates, not 10 billion.

**4. Post-processing:**
- Deduplicate (don't show the same restaurant from 3 review sites)
- Diversity (show Yelp, Google Maps, a food blog — not all from one source)
- Freshness boost (newer reviews rank higher for "best pizza")
- Spell correction ("did you mean: best pizza near me?")
- Ads insertion (sponsored results)

**Metrics:**
- Offline: NDCG@10 (are the best results near the top?)
- Online: Successful search rate (user doesn't reformulate the query), click-through rate, time to first click

---

## Q16: What metrics would you use for a recommendation system and why?

**Simple answer:**

Different metrics answer different questions. You need MULTIPLE metrics because optimizing one can hurt others.

**Offline metrics (measuring model quality on test data):**

| Metric | What it answers | When to use |
|--------|----------------|-------------|
| **NDCG@K** | "Are the best items near the top of the list?" | Always for ranking |
| **Recall@K** | "Out of all good items, how many did we find in top K?" | Retrieval stage |
| **Precision@K** | "Of the K items shown, how many are good?" | When screen space is limited |
| **AUC** | "Can the model distinguish good items from bad?" | Click prediction |
| **Hit Rate@K** | "Is at least one good item in the top K?" | When one good item is enough |

**Online metrics (measuring real user impact):**

| Metric | What it answers | Watch out for |
|--------|----------------|---------------|
| **CTR** | "Do people click?" | Clickbait gets high CTR but low satisfaction |
| **Watch time** | "How much content do people consume?" | Long but boring content scores well |
| **Session length** | "How long do users stay?" | Could mean "stuck" not "happy" |
| **Retention (DAU/MAU)** | "Do users come back?" | Best long-term metric but slow to measure |
| **Not interested rate** | "How often do users explicitly reject recommendations?" | Direct negative signal — very valuable |

**The multi-metric approach:**
- Primary metric: what you optimize for (e.g., watch time)
- Guardrail metrics: what must NOT degrade (e.g., retention, "not interested" rate)
- Debug metrics: help explain WHY the primary metric changed (e.g., coverage, diversity)

---

## Q17: How do you prevent feedback loops in recommendation systems?

**Simple answer:**

A **feedback loop** happens when the model's predictions influence the data it's trained on, creating a self-reinforcing cycle.

**Example:**
1. Model recommends cooking videos (because some cooking videos did well)
2. User sees mostly cooking videos → clicks on cooking videos (what else is there?)
3. System records: "User likes cooking!"
4. Model recommends EVEN MORE cooking videos
5. User's feed becomes 100% cooking. They never discover they'd love travel videos too.

This is called a **filter bubble**. The model thinks it's doing great (high clicks!) but the user's experience is getting narrower and narrower.

**How to break the loop:**

**1. Exploration:**
Show 10-20% of recommendations that are NOT the model's top picks. Instead, show diverse or random items. Some will be bad, but you'll discover new user interests.

**2. Counterfactual evaluation:**
Don't train on biased data. Ask: "Would the user have clicked this if I HADN'T shown it to them?" Use inverse propensity weighting to remove the model's influence from the training data.

**3. Diversity constraints:**
Force the re-ranker to include items from different categories.
"At least 3 different topics in the top 10."
"No more than 2 videos from the same creator."

**4. Fresh content injection:**
Reserve some slots for new content that hasn't been seen yet.
This gives new creators a chance and brings fresh signals into the system.

**5. Periodic full exploration:**
Occasionally show a completely random set of recommendations to a small group. This gives you a clean, unbiased sample of user preferences.

---

## Q18: What is model calibration and why does it matter for ads?

**Simple answer:**

**Calibration** means: when the model says P(click) = 0.05, does it really mean 5 out of 100 similar impressions get clicked?

**A calibrated model:** Says 5% → actual click rate is 5%. Says 20% → actual rate is 20%.
**An uncalibrated model:** Says 5% → actual rate is 12%. Says 20% → actual rate is 8%.

**Why this matters more for ads than other systems:**

In an ad auction, the system calculates:

`Ad score = P(click) × bid_amount`

- Ad A: P(click) = 0.10, bid = $1.00 → score = $0.10
- Ad B: P(click) = 0.05, bid = $3.00 → score = $0.15 → Ad B wins!

But if P(click) for Ad A is ACTUALLY 0.20 (model underestimated):
- True score for A should be $0.20, which beats B's $0.15
- The wrong ad won → bad for the advertiser, the user, AND the platform's revenue

Bad calibration means you show the wrong ads, charge the wrong prices, and everyone loses.

**How to calibrate:**
- Platt scaling: fit a logistic regression on model scores vs actual outcomes
- Isotonic regression: fit a step function that maps scores to actual probabilities
- Temperature scaling: divide logits by a learned temperature parameter

**Testing calibration:**
Plot predicted probability (x-axis) vs actual rate (y-axis). A perfectly calibrated model follows the diagonal line y = x.

---

## Q19: You deployed a model and online metrics dropped. How do you debug it?

**Simple answer:**

Don't panic. Work through this checklist systematically:

**Step 1: Is it actually the model?**
- Check if something ELSE changed at the same time (new app version, holiday, outage)
- Check if the metric drop is statistically significant (not just noise)
- Check if ALL users are affected or just a segment

**Step 2: Check the data pipeline.**
- Is fresh data flowing into the feature store?
- Did a feature source change or break? (A column renamed, a join failing)
- Are feature distributions normal? (Plot feature histograms: today vs last week)

**Step 3: Check for training-serving skew.**
- Compare features in training data vs features at serving time
- Log predictions and input features for a sample of requests
- If features differ → the pipeline has a bug

**Step 4: Check the model itself.**
- Did the model artifact deploy correctly? (Version mismatch?)
- Run the model on a test set — do offline metrics still look good?
- If offline is fine but online is bad → the problem is data or serving, not the model

**Step 5: Check the serving infrastructure.**
- Is latency normal? (If the model is slow, timeouts might cause fallback to a worse model)
- Is the caching stale? (Cached predictions might be from an old model)
- Is the A/B test configured correctly? (Users might not be routed properly)

**Step 6: Roll back if needed.**
- If you can't find the root cause quickly, roll back to the previous model
- Investigate offline with the logged data
- Fix the issue and re-deploy

**The key insight:** Most production ML bugs are NOT model bugs. They're data bugs (60%), infrastructure bugs (25%), and model bugs (15%).

---

## Q20: How would you design a notification system that doesn't annoy users?

**Simple answer:**

The goal: send the RIGHT notification, at the RIGHT time, through the RIGHT channel — and know when to SHUT UP.

**The core ML problem:**

For each candidate notification, predict three things:
1. **P(open):** Will the user open this notification?
2. **P(positive action):** Will they do something positive (buy, engage, respond)?
3. **P(negative action):** Will they mute notifications, unsubscribe, or uninstall the app?

$$\text{Score} = P(\text{open}) \times P(\text{positive}) - \lambda \times P(\text{negative})$$

Where $\lambda$ is BIG — because losing a user (uninstall) is much worse than missing one notification.

**The budget constraint:**

Each user has a maximum notifications per day (maybe 3-5). Even if there are 20 high-scoring notifications, you can only send 3.

This is a **constrained optimization** problem: pick the top 3 that maximize total value without exceeding the budget.

**When to send:**

Users are more receptive at certain times:
- Not at 3 AM (obviously)
- Not when they're in a meeting
- Maybe right after lunch, or during commute time

Train a model to predict the optimal send time per user based on their historical open patterns.

**What channel:**

Push notification, email, SMS, or in-app message? Different urgency levels → different channels.
- Flash sale ending in 1 hour → push notification
- Weekly digest of activity → email
- Account security alert → push + SMS

**Feedback loop danger:**

If you only send notifications the model thinks will be opened, you only get data on those types. You never learn if other notifications would work too.

Solution: Send 10% "exploration" notifications that the model didn't pick. This gives you unbiased data about what users actually want.

---

**Previous:** [Chapter 14 — Design Fundamentals](14_design_fundamentals.md)

**Next:** [Interview Questions](15_interview_questions.md)
