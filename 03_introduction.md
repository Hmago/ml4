# Chapter 3 — Introduction to Machine Learning

---

## What You'll Learn

After reading this chapter, you will be able to:
- Define machine learning and explain how it differs from traditional programming
- Place ML correctly inside the AI / ML / Deep Learning / Generative AI hierarchy
- Name the four main types of ML and give a concrete example of each
- Use the core ML vocabulary (features, labels, training set, loss, inference, …)
- Walk an ML project end-to-end, from problem definition to deployment
- Identify when ML is (and isn't) the right approach to a problem

---

## What is Machine Learning?

> **Machine Learning is a subfield of AI in which algorithms learn patterns from data instead of being explicitly programmed with rules.**

The idea is simpler than it sounds. Imagine you want to teach someone to recognize cats. You don't hand them a rulebook. Instead, you show them **hundreds of pictures** and say *"this is a cat."* After enough examples, they recognize cats they've never seen — cartoons, kittens, even blurry ones.

**Machine Learning works the same way.** A program studies thousands of examples and adjusts tiny internal settings called **parameters** — picture thousands of little dials — until it's good at the task. Nobody hand-wrote the rules; the computer figured them out from data.

```
Traditional Programming                Machine Learning
──────────────────────                 ─────────────────────

   Rules + Input  ──►  Output          Input + Output  ──►  Rules
    (you code)         (runs)           (examples)      (discovered)

   Human writes logic                  Algorithm discovers logic
   Computer executes it                 from the data
```

### Two classic definitions

> **Arthur Samuel, 1959** — *the original, and still the shortest:*
> *"Machine Learning is the field of study that gives computers the ability to learn without being explicitly programmed."*

> **Andrew Ng (Stanford / Coursera):** *"Machine learning is the science of getting computers to act without being explicitly programmed."*

Both definitions point at the same idea: **the programmer supplies examples, not rules**.

---

## Why Does ML Matter?

You interact with ML every day — usually without noticing.

```
┌─────────────────┬────────────────────────────────────────────────┐
│ Healthcare      │ Cancer detection in X-rays, drug discovery     │
│ Finance         │ Credit card fraud, loan approval, trading      │
│ Transport       │ Self-driving cars, Google Maps ETAs            │
│ Entertainment   │ Netflix, Spotify, YouTube recommendations      │
│ Shopping        │ Amazon product recs, dynamic pricing           │
│ Language        │ Google Translate, ChatGPT, voice assistants    │
│ Security        │ Face unlock, spam filters, deepfake detection  │
│ Science         │ Weather forecasts, protein folding (AlphaFold) │
└─────────────────┴────────────────────────────────────────────────┘
```

**Why now?** Three forces converged:
1. **Data** — the internet, sensors, and phones produce oceans of labeled data.
2. **Compute** — GPUs and TPUs made training huge models affordable.
3. **Algorithms** — deep learning and transformers cracked problems that stumped classical ML.

---

## The AI Family Tree

```
┌──────────────────────────────────────────────────────────────────┐
│                    ARTIFICIAL INTELLIGENCE                       │
│  (Computers doing smart things)                                  │
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │              MACHINE LEARNING                            │   │
│   │  (Computers learning from data)                          │   │
│   │                                                          │   │
│   │   ┌──────────────────────────────────────────────────┐   │   │
│   │   │              DEEP LEARNING                       │   │   │
│   │   │  (Using many-layered Neural Networks)            │   │   │
│   │   │                                                  │   │   │
│   │   │   ┌──────────────────────────────────────────┐   │   │   │
│   │   │   │     GENERATIVE AI                        │   │   │   │
│   │   │   │  (ChatGPT, Stable Diffusion, etc.)       │   │   │   │
│   │   │   └──────────────────────────────────────────┘   │   │   │
│   │   └──────────────────────────────────────────────────┘   │   │
│   └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

> **Big picture:** Think of these boxes like Russian nesting dolls. The biggest doll (AI) contains a smaller one (ML), which contains an even smaller one (Deep Learning), which contains the smallest (Generative AI). Every Generative AI **is** Deep Learning, every Deep Learning **is** ML, every ML **is** AI — but not the other way around.

### What each one actually means

Before the big comparison table, let's unpack each layer with concrete intuition. Each section ends with a one-line takeaway you can carry with you.

---

#### 1. Artificial Intelligence — the goal

> **AI is the ability of computers to perform tasks that normally require human intelligence** — recognizing images, understanding language, planning, making decisions, playing strategic games.

That's a definition about **what the system does**, not how it does it. Which leads to a critical split most beginners miss:

```
   AI  =  any system that appears intelligent
   ──────────────────┬────────────────────────
                     │
        ┌────────────┴───────────────┐
        ▼                            ▼
  Rule-based AI                Learned AI  (this is ML)
  ───────────────              ─────────────────────────
  • Chess engines              • Spam filters
  • GPS route planning         • Face recognition
  • Tax software               • ChatGPT
  • Classic expert systems     • Self-driving cars
```

Rule-based AI dominated from the 1950s through the 1990s. It works well when the rules are knowable — tax code, chess legal moves, turn-by-turn directions — but breaks on messy, real-world inputs like photos or natural language. That's the door ML walked through.

> **Takeaway:** AI is the **goal** (appear intelligent). ML is today's preferred **technique** for reaching it.

---

#### 2. Machine Learning — learning from data

> **Machine Learning is a subfield of AI where algorithms learn patterns from data instead of following hand-written rules.**

Why did ML take over? Traditional programming has one hard limit: **you can only write rules you can put into words.**

Try describing the exact rules that distinguish a cat from a dog — precise enough that a program could correctly label every photo on the internet. You can't. Neither can anyone else. The rules exist, but they live in our visual cortex, not in a form we can type.

ML sidesteps the problem. Instead of writing rules, you hand over millions of labeled examples and let an algorithm discover the rules itself:

```
     INPUT TO TRAINING                 OUTPUT OF TRAINING
     ─────────────────────             ──────────────────────────

     photo #1  ──►  "cat"
     photo #2  ──►  "dog"
     photo #3  ──►  "cat"              ┌────────────────────────┐
     photo #4  ──►  "bird"    ───►     │   A trained MODEL      │
     photo #5  ──►  "dog"              │                        │
        ⋮                              │   new photo  ──► label │
     photo #1,000,000 ──► "cat"        └────────────────────────┘
     (millions of labeled pairs)            ~95% accurate, even
                                             on photos never seen
```

What the algorithm actually produces is a file — usually a few megabytes to a few gigabytes — stuffed with millions of numbers called **parameters**. Those numbers *are* the learned rules. They're not human-readable, but when you multiply them against a new photo's pixels in a precise pattern, a correct label pops out.

> **Takeaway:** In ML, the programmer supplies the **data**; the algorithm supplies the **rules**.

---

#### 3. Deep Learning — neural networks with many layers

> **Deep Learning is a subfield of ML that uses neural networks with many layers to automatically learn features from raw data.**

The key word is **automatically**. Classical ML required a human expert to hand-design the *features* fed into the model — word counts for spam, ear-to-head ratios for cat photos, specific measurements for X-ray analysis. This capped performance at what a human could think of.

Deep Learning removed the human from that loop. Given raw pixels or raw text, a deep neural network discovers its own features by stacking layers. Each layer builds on the one below — the deeper the stack, the more abstract the concepts at the top:

```
             RAW INPUT  (pixel grid of a cat photo)
                         │
                         ▼
         ┌────────────────────────────────────────┐    ◄─ low-level
         │  Layer 1:  edges, colors, light/dark   │       features
         └───────────────────┬────────────────────┘
                             ▼
         ┌────────────────────────────────────────┐
         │  Layer 2:  corners, curves, textures   │
         └───────────────────┬────────────────────┘
                             ▼
         ┌────────────────────────────────────────┐
         │  Layer 3:  fur, stripes, patches       │
         └───────────────────┬────────────────────┘
                             ▼
         ┌────────────────────────────────────────┐
         │  Layer 4:  eyes, ears, whiskers        │
         └───────────────────┬────────────────────┘
                             ▼
         ┌────────────────────────────────────────┐    ◄─ high-level
         │  Layer 5:  whole-cat concept           │       features
         └───────────────────┬────────────────────┘
                             ▼
                      OUTPUT:  "cat"  (98% confident)
```

Nobody tells the network what an edge looks like or what makes a whisker. It discovers these features on its own from millions of examples — and the deeper the stack, the more abstract the concepts at the top. "Deep" is not marketing; it just means *many layers*, often 50 to 1,000 of them.

This automatic feature-learning is the single idea behind every modern breakthrough: ImageNet (2012), AlphaGo (2016), Face ID, voice assistants, self-driving cars, and today's LLMs.

> **Takeaway:** Classical ML needs **hand-designed features**. Deep Learning **invents its own**.

---

#### 4. Generative AI — models that produce new content

> **Generative AI is a class of deep learning models that produce new content — text, images, code, audio — rather than just classifying or labeling input.**

Until about 2020, nearly all useful ML was **discriminative**: given a big input, predict a small label. Generative AI flipped the direction. Given a small prompt, produce a big, rich output.

```
  DISCRIMINATIVE ML                    GENERATIVE AI
  many bits in  →  few bits out        few bits in  →  many bits out
  ─────────────────────────────        ───────────────────────────────

  photo         ──►  "cat"             "astronaut cat on Mars"
                                           ──►  a full photorealistic image

  email         ──►  "spam"            "write a haiku about tea"
                                           ──►  a full three-line poem

  audio clip    ──►  "Hello, world"    "fix the bug in this function"
                                           ──►  a full patched code block

  X-ray scan    ──►  "tumor: yes"      "draft a product launch email"
                                           ──►  a full formatted email
```

The underlying technology is the same deep neural networks — but specifically a flavor called **transformers** (invented at Google, 2017). Transformers turn out to be remarkable at two things: handling long sequences, and scaling predictably as you add more data and parameters. That's why Gen AI sits firmly inside the Deep Learning box.

Why is this the center of the AI gold rush? For about 60 years, computers could only **process** or **classify** information we fed them. Generative models **produce new information** — text, images, code, audio — at human or super-human quality. That single capability shift is what's reshaping jobs, education, creative industries, and public debate about AI.

> **Takeaway:** Classical ML **shrinks** inputs into labels. Generative AI **expands** prompts into artifacts.

### Quick comparison table

> **Note:** "AI" is the **umbrella term** — it covers both *rule-based AI* (hand-coded logic) and *learned AI* (ML, Deep Learning, Generative AI). So the AI column shows the *full range*, and each column to the right is a progressively more specific subset of it.

| Dimension            | **AI** *(the umbrella)*                                                  | **ML**                                  | **Deep Learning**                                  | **Generative AI**                            |
|----------------------|---------------------------------------------------------------------------|-----------------------------------------|----------------------------------------------------|----------------------------------------------|
| **What it does**     | Anything that mimics human intelligence — reasoning, recognizing, planning, creating | Learns patterns from labeled examples | Learns features automatically via deep neural nets | Produces brand-new content from a prompt    |
| **Source of rules**  | **Either** hand-coded by humans **or** learned from data                  | Algorithm fits a model to labeled data  | Same, but with deep neural networks                | Self-supervised pre-training on internet data |
| **Data needs**       | **Varies** — zero for rule-based AI, up to billions of items for learned AI | Thousands → millions of labeled rows  | Millions of labeled examples                       | Billions of documents / images               |
| **Flagship example** | Deep Blue (rule-based) · GPS routing (rule-based) · ChatGPT (learned) · Waymo (learned) | Gmail spam filter · Netflix recs | Face ID · AlphaGo · Waymo                          | ChatGPT · Gemini · DALL·E                    |
| **Main limitation**  | Depends on the technique — rule-based AI is brittle; learned AI is opaque, costly, and can hallucinate | Needs hand-designed features | Data-hungry, costly, opaque                        | Hallucinates; expensive; ethics concerns     |

> **One-line memory trick:**
> **AI** = smart computer. **ML** = smart computer that *learned* from data. **DL** = ML with deep neural networks. **Gen AI** = DL that *makes new stuff*.

---

## Key ML Vocabulary

These ten terms appear in every chapter that follows. Pin them down now.

```
┌───────────────┬──────────────────────────────────────────────────┐
│ TERM          │ WHAT IT MEANS                                    │
├───────────────┼──────────────────────────────────────────────────┤
│ Feature       │ An input variable (e.g., house size, age)        │
│ Label         │ The correct answer you want to predict           │
│ Dataset       │ Collection of examples (rows of features+labels) │
│ Training set  │ Examples the model learns from                   │
│ Validation set│ Held-out examples used to tune the model         │
│ Test set      │ Final held-out examples used to report results   │
│ Model         │ The trained "thing" that makes predictions       │
│ Parameters    │ Internal dials the model tunes during training   │
│ Loss          │ A number measuring how wrong the model is        │
│ Inference     │ Using a trained model to make a new prediction   │
└───────────────┴──────────────────────────────────────────────────┘
```

**How they connect:**

```
         Dataset (all examples)
                │
   ┌────────────┼────────────┐
   ▼            ▼            ▼
 Train       Validation    Test
  (80%)        (10%)       (10%)
   │            │            │
   ▼            ▼            ▼
[Training]  [Tuning]    [Final score]
Algorithm   hyperparams  (report once)
   │
   ▼
  MODEL ──► Inference on new data
```

**A single row of a dataset looks like this:**

```
┌──────────────────── FEATURES ────────────────────┐   ┌─ LABEL ─┐
│ size_sqft │ bedrooms │ age_yrs │ neighborhood    │   │  price  │
├───────────┼──────────┼─────────┼─────────────────┤   ├─────────┤
│   1,800   │    3     │    12   │  Mountain View  │   │ $1.2M   │
│   2,400   │    4     │     5   │  Palo Alto      │   │ $2.1M   │
│     900   │    2     │    40   │  East Palo Alto │   │ $0.7M   │
└───────────┴──────────┴─────────┴─────────────────┘   └─────────┘
```

---

## The 4 Types of Machine Learning

ML algorithms are grouped by **what kind of feedback they learn from**. Older textbooks list three; modern ML adds a fourth — **self-supervised learning** — which powers today's LLMs.

```
                     HOW DOES THE MODEL LEARN?
                     ─────────────────────────

                   Do we have labeled answers?
                     /                      \
                  YES                        NO
                   │                          │
                   ▼                          │
           ┌──────────────┐                   │
           │  SUPERVISED  │                   │
           │   LEARNING   │                   │
           └──────────────┘                   │
                                              ▼
                             Does the data create its own labels,
                             or does an agent learn via rewards?

                       labels from data     rewards           none of these
                             │                │                     │
                             ▼                ▼                     ▼
                    ┌────────────────┐ ┌───────────────┐  ┌──────────────┐
                    │ SELF- / SEMI-  │ │ REINFORCEMENT │  │ UNSUPERVISED │
                    │ SUPERVISED     │ │ LEARNING      │  │ LEARNING     │
                    └────────────────┘ └───────────────┘  └──────────────┘
```

---

### Type 1: Supervised Learning

> **Supervised Learning trains a model on labeled examples — (input, correct-answer) pairs — so it can predict the correct answer for new, unseen inputs.**

The labels act as a teacher, correcting the model every time it guesses wrong.

**Two sub-flavors:**
- **Classification** — predict a *category* (spam / not spam; cat / dog / bird).
- **Regression** — predict a *number* (house price, tomorrow's temperature).

```
 Input (features)          Model            Output
 ┌────────────────┐      ┌──────────┐     ┌─────────┐
 │ email text,    │ ───► │ trained  │ ──► │ spam    │   (classification)
 │ sender, time   │      │  model   │     │   or    │
 │                │      │          │     │ not     │
 └────────────────┘      └──────────┘     └─────────┘

 ┌────────────────┐      ┌──────────┐     ┌─────────┐
 │ size, bedrooms,│ ───► │ trained  │ ──► │ $1.2M   │   (regression)
 │ location, age  │      │  model   │     │         │
 └────────────────┘      └──────────┘     └─────────┘
```

**Common algorithms:** Linear Regression, Logistic Regression, Decision Trees, Random Forests, SVMs, Gradient Boosting, Neural Networks.

**Everyday example:** Gmail's spam filter learned from billions of emails labeled *spam* or *not spam*.

---

### Type 2: Unsupervised Learning

> **Unsupervised Learning finds structure in unlabeled data — grouping, compressing, or spotting anomalies without any predefined correct answers.**

No labels means no teacher. The model has to figure out what's interesting about the data on its own.

**Main sub-flavors:**
- **Clustering** — group similar items (customer segmentation)
- **Dimensionality reduction** — compress many features into a few (PCA, t-SNE)
- **Anomaly detection** — spot unusual points (credit-card fraud)

```
  Unlabeled data                Discovered groups
  · · ·                         ╭────╮   ╭────╮
 ·  · · ·    ── clustering ──►  │ A  │   │ B  │
·   ·   ·                       ╰────╯   ╰────╯
    ·  ·                           ╭────╮
                                   │ C  │
                                   ╰────╯
```

**Common algorithms:** K-Means, Hierarchical Clustering, DBSCAN, PCA, Autoencoders.

**Everyday example:** Spotify discovering that a cluster of users all listen to "lo-fi beats at 2am" and auto-generating a playlist for them.

---

### Type 3: Self-Supervised & Semi-Supervised Learning

> **Self-Supervised Learning creates its own labels from the structure of the data itself, allowing training on massive unlabeled datasets without any human annotation.**

This is the secret behind modern LLMs. You have mountains of unlabeled data — all of Wikipedia, the internet, every book ever scanned — and the model learns by predicting parts of the input from other parts.

**Classic pretext task:** take a sentence, hide one word, ask the model to guess it. Repeat billions of times. That's essentially how GPT and BERT learned language.

```
 Input:  "The cat sat on the ___."
                                ▲
                        Model predicts: "mat"
                        (and compares to the actual hidden word)
```

**Semi-supervised learning** is a hybrid: a small labeled set + a huge unlabeled set. Hand-label 1,000 images, then use those to bootstrap learning on 1,000,000 unlabeled ones.

```
  Huge unlabeled data    ──►   Pre-train (self-supervised)
  (text / images /                       │
  audio)                                 ▼
                               Learns rich representations
                                         │
  Small labeled dataset   ──►    Fine-tune on specific task
  (sentiment, spam, ...)                 │
                                         ▼
                                 Production-ready model
```

**Why it matters:** labels are expensive, but raw data is effectively free. Self-supervised learning exploits that imbalance — which is why it's the engine behind LLMs, Stable Diffusion, and almost every modern *foundation model*.

---

### Type 4: Reinforcement Learning (RL)

> **Reinforcement Learning trains an agent to take actions in an environment so as to maximize a cumulative reward signal.**

There's no pre-collected dataset — the agent generates its own experience through trial and error, and learns a *policy* (a strategy) that earns the most reward over time.

```
     ┌─────────┐       action       ┌──────────────┐
     │  AGENT  │ ─────────────────► │ ENVIRONMENT  │
     └─────────┘                    └──────────────┘
          ▲                                │
          │  new state + reward            │
          └────────────────────────────────┘
```

**Common algorithms:** Q-Learning, Policy Gradients, PPO, Actor-Critic.

**Everyday examples:**
- AlphaGo beating the world Go champion
- Robots learning to walk
- Ad-placement systems optimizing click-through rate
- **ChatGPT's RLHF** — learned human preferences from thumbs up/down feedback

---

### Side-by-side: the four types

| Type              | Input        | "Label" source          | Typical task                  | Flagship example         |
|-------------------|--------------|-------------------------|-------------------------------|--------------------------|
| Supervised        | x + label y  | Humans label y          | Classification / regression   | Gmail spam filter        |
| Unsupervised      | x only       | none                    | Clustering, anomaly detection | Customer segmentation    |
| Self-supervised   | x only       | derived from x itself   | Foundation-model pre-training | GPT next-word prediction |
| Reinforcement     | state        | rewards from environment| Sequential decisions          | AlphaGo, robotics        |

---

## The Machine Learning Workflow

> **The ML Workflow is the end-to-end process of turning a business problem into a deployed model — define, collect, clean, engineer features, train, evaluate, deploy, monitor.**

It's a **loop**, not a straight line. Here's the realistic 7-step flow:

```
      ┌──────────────────┐
      │ 1. Define        │   What problem? What metric of success?
      │    Problem       │   (accuracy? revenue? latency?)
      └────────┬─────────┘
               ▼
      ┌──────────────────┐
      │ 2. Collect       │   Databases, APIs, logs, scraping,
      │    Data          │   manual labeling
      └────────┬─────────┘
               ▼
      ┌──────────────────┐
      │ 3. Explore &     │   EDA: plot distributions, spot outliers,
      │    Clean         │   fix missing values, remove duplicates
      └────────┬─────────┘
               ▼
      ┌──────────────────┐
      │ 4. Feature       │   Turn raw data into numeric features:
      │    Engineer      │   normalize, encode categoricals, extract,
      └────────┬─────────┘   combine
               ▼
      ┌──────────────────┐
      │ 5. Split & Train │   Train / Validation / Test split
      │                  │   Fit model, tune hyperparameters
      └────────┬─────────┘
               ▼
      ┌──────────────────┐
      │ 6. Evaluate      │   Measure on test set
      │                  │   Is it good enough for production?
      └────────┬─────────┘
               │  ◄─── loop back if not good enough
               ▼
      ┌──────────────────┐
      │ 7. Deploy &      │   Ship to production, monitor drift,
      │    Monitor       │   retrain as the world changes
      └──────────────────┘
```

> **The 80% rule:** data scientists spend **~80% of their time on steps 2–4** (collection, cleaning, feature engineering) and only ~10% actually picking and training the model. "Modeling" is glamorous; "data plumbing" is the job.

---

## Worked Example: Predicting House Prices

Let's walk one concrete problem through every step of the workflow.

**The scenario:** a real-estate site wants to show an "estimated value" for every home.

### Step 1 — Define the problem
- **Task:** given a house's attributes, predict its sale price.
- **Type:** *supervised regression* (predicting a number).
- **Success metric:** Mean Absolute Error (MAE) — on average, how many dollars off is the prediction?

### Step 2 — Collect data
Pull 100,000 past home sales. Each row has: size, bedrooms, age, zip code, school rating, lot size, sale price.

```
size │ bed │ age │ zip    │ schools │ lot  │ PRICE (label)
─────┼─────┼─────┼────────┼─────────┼──────┼──────────────
1800 │  3  │  12 │ 94040  │   8.2   │ 5500 │ $1,200,000
2400 │  4  │   5 │ 94305  │   9.1   │ 7200 │ $2,100,000
 900 │  2  │  40 │ 94303  │   5.4   │ 3000 │   $700,000
 ... │ ... │ ... │  ...   │   ...   │  ... │     ...
```

### Step 3 — Explore & clean
- Drop 120 rows with missing prices.
- Cap obvious outliers (that $50M listing is a mansion, not signal).
- Plot price vs size — roughly linear but noisy.

### Step 4 — Feature engineer
- Convert `zip` (categorical) into one-hot columns or an embedding.
- Scale `size`, `lot` to comparable ranges (normalization).
- Create a new feature: `median_price_per_sqft_in_zip`.

### Step 5 — Split & train
- 80% train / 10% validation / 10% test.
- Try three models: **Linear Regression → Random Forest → Gradient Boosting**.
- Use the validation set to tune hyperparameters (tree depth, learning rate, etc.).

### Step 6 — Evaluate
- Best model: **Gradient Boosting**, with MAE ≈ **$65K** on the held-out test set.
- Is $65K good enough? For homes averaging $1.5M, that's ~4% error — probably yes.

### Step 7 — Deploy & monitor
- Wrap the model in an API endpoint.
- Log every prediction + the actual sale price when it comes in.
- Retrain **monthly** as the market shifts.

```
  Raw Data ──► Clean ──► Features ──► Train ──► Model ──► API
                                                  │         │
                                                  ▼         ▼
                                          Test metrics  Live predictions
                                                            │
                                                            └──► Monitor
                                                                 Retrain
                                                                 monthly
```

---

## When to Use Machine Learning?

> **Use ML when the rules are too complex to hand-code, the data is plentiful, and some error is tolerable. Otherwise, a simple rule or formula is usually better.**


```
 USE ML when...                          DON'T use ML when...
 ────────────────────────────            ──────────────────────────────
 ✓ Problem is too complex                ✗ A simple rule works
   for hand-written rules                  (if x > 5 then ...)

 ✓ You have lots of relevant             ✗ You have very little data,
   data                                    or no labels

 ✓ Pattern evolves over time             ✗ You need to fully explain
   (spam, prices, fashion)                 every decision (law, medicine)

 ✓ Humans can do it intuitively          ✗ A wrong answer is catastrophic
   but can't explain how                   and you can't tolerate errors
   (image/speech recognition)

 ✓ Tolerance for some error              ✗ The problem is deterministic
                                           with a known formula
```

### Classical ML vs Deep Learning — which should you pick?

```
 Use CLASSICAL ML when...             Use DEEP LEARNING when...
 ──────────────────────────           ──────────────────────────────
 • Tabular data (rows of              • Unstructured data: images,
   features)                            audio, text, video

 • Small-to-medium dataset            • Huge dataset
   (<100K rows)                         (millions of examples)

 • Interpretability matters           • Cutting-edge accuracy needed
   (regulated industries)               (beating human-level)

 • Limited compute                    • GPUs / TPUs available

 Examples: XGBoost, LightGBM,         Examples: CNNs, Transformers,
 Random Forests, SVMs                 Diffusion models, LLMs
```

> **Surprising fact:** on *tabular* data, Gradient Boosting (XGBoost, LightGBM) still wins most Kaggle competitions — even in the deep learning era. Deep learning dominates vision and language, not spreadsheets.

---

## Common Misconceptions

| Myth                                          | Reality                                                              |
|-----------------------------------------------|----------------------------------------------------------------------|
| *"ML is just statistics with a rebrand."*     | Overlaps exist, but ML emphasizes **prediction** over inference, and scales to far messier data. |
| *"More data always wins."*                    | More **good, relevant** data wins. Garbage in → garbage out.         |
| *"The algorithm is the hard part."*           | Data pipelines and feature engineering dominate real projects.       |
| *"ML models understand what they predict."*   | They find statistical patterns — no understanding, no common sense.  |
| *"Once deployed, you're done."*               | Data drifts, users change; models degrade silently. Monitoring is non-optional. |
| *"Deep learning has replaced everything."*    | For tabular data, Gradient Boosting still usually wins.              |
| *"Accuracy is the right metric."*             | Often it isn't — for imbalanced data, use precision/recall/F1/AUC.   |

---

## A Brief History of Machine Learning

<details>
<summary>Click to expand timeline</summary>

```
1950 ──► Alan Turing proposes the "Turing Test"
         "Can a machine think?"

1957 ──► Frank Rosenblatt invents the Perceptron
         (first simple neural network)

1959 ──► Arthur Samuel coins "Machine Learning"
         Teaches a computer to play checkers

1980s ──► Neural networks get popular
          Backpropagation algorithm discovered

1990s ──► Support Vector Machines (SVM) emerge
          Statistical ML becomes dominant

1997 ──► IBM Deep Blue beats chess champion Kasparov

2006 ──► Deep Learning renaissance begins
         Geoffrey Hinton shows deep nets can work

2012 ──► AlexNet wins ImageNet by a huge margin
         Deep learning proves itself on images

2016 ──► AlphaGo beats world Go champion
         RL + Deep Learning combined

2017 ──► Transformer architecture invented (Google)
         "Attention is All You Need" paper

2022 ──► ChatGPT launches; LLMs go mainstream

2024+ ──► Multimodal AI, AI Agents era begins
```
</details>

---

## Review Questions — Test Your Understanding

Try to answer these without scrolling up. Then check your answers.

1. In your own words, what's the difference between traditional programming and machine learning?
2. A company wants to predict which customers will cancel their subscription next month. Which type of ML is this?
3. You have a dataset of customer purchases but **no labels**. You want to find natural groups. Which type of ML?
4. GPT was trained by predicting the next word across billions of web pages. Which type of learning is that?
5. Name the 7 steps of the realistic ML workflow.
6. Define each term in one sentence: *feature*, *label*, *training set*, *loss*, *inference*.
7. Give one example where ML is **not** the right approach, and explain why.
8. Why do practitioners say the "80% rule" about data preparation?
9. You have 5,000 rows of tabular customer data and need interpretability for regulators. Classical ML or Deep Learning?

<details>
<summary>Answers</summary>

1. **Traditional programming:** human writes explicit rules (Input + Rules → Output). **ML:** computer discovers the rules from examples (Input + Output → Rules).
2. **Supervised** (classification) — historical data is labeled *cancelled* / *didn't cancel*.
3. **Unsupervised** — specifically *clustering*.
4. **Self-supervised** — the labels (the "next word") come from the data itself, no humans involved.
5. Define Problem → Collect Data → Explore & Clean → Feature Engineer → Split & Train → Evaluate → Deploy & Monitor.
6. **Feature:** input variable. **Label:** the target answer. **Training set:** examples the model learns from. **Loss:** a number measuring how wrong the model is. **Inference:** using a trained model to make a new prediction.
7. Calculating sales tax — it's a fixed formula (`price × tax_rate`). ML would be less accurate than the rule and adds complexity for no benefit.
8. Because collection, cleaning, and feature engineering consume most of a real ML project; actual model training is a small slice of the work.
9. **Classical ML** (e.g., Gradient Boosting or Logistic Regression). Small-ish tabular data + interpretability requirement = deep learning is the wrong tool.
</details>

---

## Key Takeaways

```
╔═══════════════════════════════════════════════════════════════════╗
║  REMEMBER THESE                                                   ║
║  ──────────────────────────────────────────────────────────────   ║
║  1. ML = learn patterns from data instead of hand-coding rules    ║
║  2. Nesting: Gen AI ⊂ Deep Learning ⊂ ML ⊂ AI                     ║
║  3. Four types: Supervised, Unsupervised,                         ║
║                 Self-supervised, Reinforcement                    ║
║  4. Core vocab: features, labels, train/val/test,                 ║
║                 model, parameters, loss, inference                ║
║  5. Workflow is a LOOP: Define → Data → Clean → Features →        ║
║     Train → Evaluate → Deploy → Monitor → (loop back)             ║
║  6. 80% of the work is data, not modeling                         ║
║  7. Good data beats clever algorithms                             ║
║  8. Use ML when rules are too complex, data is plentiful,         ║
║     and some error is tolerable                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

**Next:** [Chapter 4 — Core Concepts & Terminology](04_core_concepts.md)
