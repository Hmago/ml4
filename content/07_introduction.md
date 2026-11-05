# Chapter 7 — Introduction to Machine Learning

---

## What You'll Learn

After reading this chapter, you will be able to:
- Define machine learning and explain how it differs from traditional programming
- Place ML correctly inside the AI / ML / Deep Learning / Generative AI hierarchy
- Name the four main types of ML and give a concrete example of each
- Use the core ML vocabulary (features, labels, training set, loss, inference, …)
- Tell an algorithm from a model, and parameters from hyperparameters
- Explain generalisation, and spot overfitting and data leakage
- Walk an ML project end-to-end, from problem definition to deployment
- Identify when ML is (and isn't) the right approach to a problem
- Explain the No Free Lunch theorem and why every project needs a baseline

---

## What is Machine Learning?

> **Machine Learning is a subfield of AI in which algorithms learn patterns from data instead of being explicitly programmed with rules.**

![Infographic: what machine learning is. Traditional programming turns rules plus input into output, while machine learning turns input plus output into rules. A bar chart shows the training accuracy of the spam rule 'spam if words >= t' for t = 0 to 8, peaking at 89.4% for the learned t = 3. A table compares the guessed rule t = 1 (67.2% on 500 new emails) with the learned rule t = 3 (88.8%), plus Mitchell's T, P, E for a spam filter and the loss-minimisation formula.](diagrams/intro07_info_what_is_ml_ai.png)

<details>
<summary><strong>Read as text</strong> — rules vs learning, training vs inference and the maths</summary>

The idea is simpler than it sounds. Imagine you want to teach someone to recognize cats. You don't hand them a rulebook. Instead, you show them **hundreds of pictures** and say *"this is a cat."* After enough examples, they recognize cats they've never seen — cartoons, kittens, even blurry ones.

**Machine Learning works the same way.** A program studies thousands of examples and adjusts internal settings called **parameters** — picture a panel of little dials, anywhere from a handful to billions of them — until it's good at the task. Nobody hand-wrote the rules; the computer figured them out from data.

```
Traditional Programming                Machine Learning
──────────────────────                 ─────────────────────

   Rules + Input  ──►  Output          Input + Output  ──►  Rules
    (you code)         (runs)           (examples)      (discovered)

   Human writes logic                  Algorithm discovers logic
   Computer executes it                 from the data
```

Once the rules are learned, they are used like any program: new input → model → output. Finding the rules is called **training**; using them on a new input is called **inference**.

> **Maths in one line:** `θ* = argmin_θ (1/n) Σᵢ loss(f_θ(xᵢ), yᵢ)` — learning means trying settings θ of the dials and keeping the setting whose predictions f_θ(x) are, on average, least wrong on the n training examples.

</details>

### Two classic definitions

<details>
<summary><strong>Read as text</strong> — Samuel and Mitchell, and T, P, E for a spam filter</summary>

> **Arthur Samuel, 1959** — *the original idea, and still the shortest:*
> *"Machine Learning is the field of study that gives computers the ability to learn without being explicitly programmed."*

That sentence is a **paraphrase** that textbooks attribute to Samuel — it does not appear word for word in his 1959 checkers paper. The paper's own goal is close: *"Programming computers to learn from experience should eventually eliminate the need for much of this detailed programming effort."* (Andrew Ng's popular course words it as *"the science of getting computers to act without being explicitly programmed."*)

> **Tom Mitchell, 1997** — *the precise one (from his textbook* Machine Learning*):*
> *"A computer program is said to learn from experience E with respect to some class of tasks T and performance measure P, if its performance at tasks in T, as measured by P, improves with experience E."*

For a spam filter:

- **T (task):** sort each email into *spam* or *not spam*.
- **P (performance):** the percentage of emails sorted correctly.
- **E (experience):** emails that people have already marked as spam or not spam.

Both definitions point at the same idea: **the programmer supplies examples, not rules**. The program below shows it. A programmer guesses a spam rule; the learner tries every rule of the form "spam if it has at least *t* spammy words", keeps the one that scores best on 500 labelled training emails, and both rules are then checked on 500 emails neither has seen.

</details>

```python
# Rules vs learning: a hand-written spam rule against a threshold learned from labelled emails.
import numpy as np

rng = np.random.default_rng(0)
# Experience E: 1,000 labelled emails. The one feature = how many "spammy" words
# ("free", "winner", "$$$", ...) each email contains.
is_spam = np.arange(1000) < 500                              # 500 spam, 500 normal
words = np.where(is_spam, rng.poisson(5, 1000), rng.poisson(1, 1000))
order = rng.permutation(1000)
train, test = order[:500], order[500:]                       # learn on 500, check on 500 new ones

def accuracy(t, rows):                                       # performance P: % sorted correctly
    return 100 * np.mean((words[rows] >= t) == is_spam[rows])

human_t = 1                                                  # traditional: "any spammy word = spam"
candidates = np.arange(0, 9)                                 # ML: try every rule "spam if words >= t"
train_acc = np.array([accuracy(t, train) for t in candidates])
learned_t = int(candidates[train_acc.argmax()])              # ... keep the best one on TRAINING emails

print("rule: spam if words >= t   training accuracy")
for t, a in zip(candidates, train_acc):
    print(f"   t = {t}                    {a:5.1f}%" + ("   <- learned" if t == learned_t else ""))
print("On 500 NEW emails (the test set):")
print(f"  hand-written rule (t = {human_t}): {accuracy(human_t, test):.1f}% correct")
print(f"  learned rule      (t = {learned_t}): {accuracy(learned_t, test):.1f}% correct")

assert accuracy(0, train) == 100 * is_spam[train].mean()     # t = 0 calls everything spam
assert accuracy(learned_t, test) > accuracy(human_t, test)
```

**Output:**

```
rule: spam if words >= t   training accuracy
   t = 0                     51.0%
   t = 1                     68.6%
   t = 2                     85.6%
   t = 3                     89.4%   <- learned
   t = 4                     86.8%
   t = 5                     79.0%
   t = 6                     68.2%
   t = 7                     61.6%
   t = 8                     54.6%
On 500 NEW emails (the test set):
  hand-written rule (t = 1): 67.2% correct
  learned rule      (t = 3): 88.8% correct
```

<details>
<summary><strong>Read as text</strong> — continued: what the output shows</summary>

The column of training scores *is* the learning: the program searched over its one dial, *t*, and kept the best setting. The guessed rule flags too many normal emails, because normal emails also say "free" now and then. The learned rule scores about the same on new emails (88.8%) as on the training emails (89.4%) — it found a real pattern instead of memorising.

</details>

---

## Why Does ML Matter?

![Infographic: why machine learning matters now. An 8-card grid shows where you meet ML: Healthcare (cancer detection in X-rays, drug discovery), Finance (card fraud, loan approval), Transport (self-driving cars, Google Maps ETAs), Entertainment (Netflix, Spotify, YouTube recs), Shopping, Language, Security and Science (weather forecasts, AlphaFold). Three pillars, Data (mostly unlabelled), Compute (GPUs and TPUs) and Algorithms (deep learning and Transformers), converge into the modern ML breakthrough, with a question-and-answer table and the trap that labels, not data, are scarce.](diagrams/intro07_info_why_ml_matters_ai.png)

![Why machine learning took off](diagrams/intro07_why_now_ai.png)

<details>
<summary><strong>Read as text</strong> — where you meet ML, and why now</summary>

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
1. **Data** — the internet, sensors, and phones produce oceans of data. Most of it is *unlabelled*, which is why learning without human labels (Type 3 below) matters so much.
2. **Compute** — GPUs and TPUs made training huge models affordable.
3. **Algorithms** — deep learning and transformers cracked problems that stumped classical ML.

</details>

---

## The AI Family Tree

![Infographic: the AI family tree as four nested boxes, AI (the goal) containing Machine Learning (rules learned from data), containing Deep Learning (many-layered neural networks that learn their own features), containing Generative AI (makes new text, images, code, audio, e.g. ChatGPT, Gemini, Claude, Stable Diffusion). Side cards contrast rule-based AI (Deep Blue chess 1997, GPS route planning, tax software) with learned AI; a shrinks-vs-expands panel contrasts discriminative ML (photo to cat) with generative AI (astronaut cat on Mars to a full image); a table maps each kind of system to an example.](diagrams/intro07_info_ai_family_tree_ai.png)

![Discriminative ML shrinks, generative AI expands](diagrams/intro07_genai_flip_ai.png)

<details>
<summary><strong>Read as text</strong> — the nesting dolls: AI ⊃ ML ⊃ DL ⊃ Gen AI</summary>

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

</details>

### What each one actually means

<details>
<summary><strong>Read as text</strong> — how the next four parts are laid out</summary>

Before the big comparison table, let's unpack each layer with concrete intuition. Each section ends with a one-line takeaway you can carry with you.

</details>

---

#### 1. Artificial Intelligence — the goal

<details>
<summary><strong>Read as text</strong> — rule-based vs learned AI</summary>

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
  • Deep Blue chess (1997)     • Spam filters
  • GPS route planning         • Face recognition
  • Tax software               • ChatGPT
  • Classic expert systems     • Self-driving cars
```

Rule-based AI dominated from the 1950s through the 1980s; by the 1990s statistical ML was taking over. Rules work well when they are knowable — tax code, chess legal moves, turn-by-turn directions — but break on messy, real-world inputs like photos or natural language. That's the door ML walked through. (Even chess moved on: today's strongest engines evaluate positions with learned neural networks.)

> **Takeaway:** AI is the **goal** (appear intelligent). ML is today's preferred **technique** for reaching it.

</details>

---

#### 2. Machine Learning — learning from data

<details>
<summary><strong>Read as text</strong> — why hand-written rules hit a wall, and what training produces</summary>

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

What the algorithm actually produces is a file of numbers called **parameters** — from a few kilobytes for a small model to hundreds of gigabytes, even terabytes, for the largest LLMs. Those numbers *are* the learned rules. They're not human-readable, but when you multiply them against a new photo's pixels in a precise pattern, a label pops out — usually the right one.

> **Takeaway:** In ML, the programmer supplies the **data**; the algorithm supplies the **rules**.

</details>

---

#### 3. Deep Learning — neural networks with many layers

<details>
<summary><strong>Read as text</strong> — features learned layer by layer</summary>

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

Nobody tells the network what an edge looks like or what makes a whisker. It discovers these features on its own from millions of examples. (Real networks learn messier, overlapping features than this tidy five-step picture, but the low-to-high trend is real.) "Deep" is not marketing; it just means *many layers* — from a handful to a few hundred (ResNet-50 has 50; GPT-3 has 96 Transformer layers).

This automatic feature learning is the common thread behind the big breakthroughs: AlexNet's ImageNet win (2012), AlphaGo (2016), Face ID, voice assistants, self-driving cars, and today's LLMs. Go deeper in [Ch 14 — Neural Networks](#content/14_neural_networks) and [Ch 16 — Deep Learning](#content/16_deep_learning).

> **Takeaway:** Classical ML needs **hand-designed features**. Deep Learning **invents its own**.

</details>

---

#### 4. Generative AI — models that produce new content

<details>
<summary><strong>Read as text</strong> — discriminative vs generative, Transformers and diffusion</summary>

> **Generative AI is a class of deep learning models that produce new content — text, images, code, audio — rather than just classifying or labeling input.**

For most of ML's history, the ML that people used day to day was mostly **discriminative**: given a big input, predict a small label. Generative models existed — machine translation, GANs (2014) — but around 2020–2022 (GPT-3, Stable Diffusion, ChatGPT) they became good enough for everyday use. Generative AI flips the direction: given a small prompt, produce a big, rich output.

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

The underlying technology is the same deep neural networks — for text, mostly a design called the **Transformer** (invented at Google, 2017); image generators mostly use **diffusion models**. Transformers turn out to be remarkable at two things: handling long sequences, and improving predictably as you add more data and parameters. That's why Gen AI sits firmly inside the Deep Learning box. (Statistics also uses the word "generative" for simple models such as Naive Bayes; "Generative AI" means these large deep models.)

Why is this the center of the AI gold rush? For most of computing history, software could **process** or **classify** the information we fed it. Generative models **produce new content** — text, images, code, audio — often at human-like quality. That shift is what's reshaping jobs, education, creative industries, and public debate about AI. How LLMs work is [Ch 17](#content/17_llm); today's landscape is [Ch 20](#content/20_2026_landscape).

> **Takeaway:** Classical ML **shrinks** inputs into labels. Generative AI **expands** prompts into artifacts.

</details>

### Quick comparison table

<details>
<summary><strong>Read as text</strong> — how to read the columns</summary>

> **Note:** each column is an **umbrella** over the columns to its right — AI contains ML, ML contains Deep Learning, Deep Learning contains Gen AI. So the wider columns cover the *full range* of what they contain.

</details>

| Dimension | **AI** *(the umbrella)* | **ML** | **Deep Learning** | **Generative AI** |
|---|---|---|---|---|
| **What it does** | Any task that needs "intelligence": reasoning, recognising, planning, creating | Learns patterns from data: classify, predict numbers, group, act, generate | Learns its own features with many-layered neural networks | Produces new text, images, code or audio from a prompt |
| **Where the rules come from** | Hand-written **or** learned | Learned from data (supervised, unsupervised, self-supervised, RL) | Learned — including the features themselves | Self-supervised pre-training, then fine-tuning and human feedback |
| **Data needed** | None (rule-based) up to billions of examples | Hundreds of rows (classical ML) up to billions | Usually millions of examples (fewer when fine-tuning a pre-trained model) | Trillions of tokens of text; up to billions of images |
| **Flagship example** | Deep Blue (rules) · route planning · ChatGPT (learned) | Gmail spam filter · Netflix recs · AlphaGo | AlexNet · Face ID · AlphaGo · ChatGPT | ChatGPT · Gemini · Claude · Stable Diffusion |
| **Main limitation** | Rule-based is brittle; learned is opaque | Classical ML needs hand-made features; deep ML needs lots of data | Data- and compute-hungry; hard to explain | Hallucinates; costly; copyright and misuse concerns |

<details>
<summary><strong>Read as text</strong> — continued: a one-line memory trick</summary>

> **One-line memory trick:**
> **AI** = smart computer. **ML** = smart computer that *learned* from data. **DL** = ML with deep neural networks. **Gen AI** = DL that *makes new stuff*.

</details>

---

## Key ML Vocabulary

![Infographic: the core ML vocabulary. A dataset of features (house size) and a label (price) is split 80% training, 10% validation and 10% test; the algorithm fits parameters on the training set by lowering the loss to produce a model used for inference on new data, the validation set tunes hyperparameters and the test set is reported once. The model price = 500 x size + 300,000 has learned parameters 500 and 300,000; a table separates algorithm, model, parameters and hyperparameters, and training is compared to compiling a program.](diagrams/intro07_info_ml_vocabulary_ai.png)

![How core ML vocabulary connects](diagrams/intro07_vocab_flow_ai.png)

<details>
<summary><strong>Read as text</strong> — the twelve terms, how they connect and a sample dataset</summary>

These twelve terms appear in every chapter that follows. Pin them down now.

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
│ Algorithm     │ The learning recipe that fits the parameters     │
│ Model         │ The trained "thing" that makes predictions       │
│ Parameters    │ Internal dials the model tunes during training   │
│ Hyperparameter│ A setting YOU choose before training starts      │
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

80 / 10 / 10 is a common split for datasets of roughly 10,000 to 1,000,000 rows; [Ch 08 — Core Concepts](#content/08_core_concepts) shows how to choose one for other sizes.

**A few rows of a dataset look like this:**

```
┌──────────────────── FEATURES ────────────────────┐   ┌─ LABEL ─┐
│ size_sqft │ bedrooms │ age_yrs │ neighborhood    │   │  price  │
├───────────┼──────────┼─────────┼─────────────────┤   ├─────────┤
│   1,800   │    3     │    12   │  Mountain View  │   │ $1.2M   │
│   2,400   │    4     │     5   │  Palo Alto      │   │ $2.1M   │
│     900   │    2     │    40   │  East Palo Alto │   │ $0.7M   │
└───────────┴──────────┴─────────┴─────────────────┘   └─────────┘
```

</details>

### Algorithm vs Model vs Parameters vs Hyperparameters

<details>
<summary><strong>Read as text</strong> — the four words, and training vs inference</summary>

Interviewers love this one, because beginners use the four words interchangeably. Using the house-price example:

| Word | What it is | House-price example |
|---|---|---|
| **Algorithm** | The learning recipe | Linear regression: "find the straight line with the smallest squared error" |
| **Model** | What training produces; it makes the predictions | `price = 500 × size + 300,000` |
| **Parameters** | The numbers inside the model, **learned** from the training data | `500` (dollars per sq ft) and `300,000` |
| **Hyperparameters** | Settings **you choose** before training, compared on the validation set | For gradient boosting: tree depth, learning rate, number of trees |

**Training vs inference:** training runs the algorithm on data to fit the parameters — slow, and done once or on a schedule. Inference uses the finished model on one new input — fast, and done millions of times. A trained model is like a compiled program: the expensive work happened before you use it. More in [Ch 08](#content/08_core_concepts): §8.6 parameters vs hyperparameters, §8.7 the training loop.

</details>

### Generalisation, Overfitting and Data Leakage

![Infographic on generalisation, overfitting and data leakage: the goal is doing well on unseen data, generalisation gap = error on new data minus error on training data; bar chart from the chapter's house-price program where the memoriser is $0 off on training houses but about $102K off on new ones (overfitting) while the best-fit line is about $64K on training and $68K on new houses (generalises); a leak diagram with a sale_date column stamped LEAK and the question Would I know this at prediction time?; worked-numbers table with the baseline at $283K / $290K and the best-fit line's one-time test error of $61K.](diagrams/intro07_info_generalisation_leakage_ai.png)

<details>
<summary><strong>Read as text</strong> — the gap, overfitting, leakage and the defence</summary>

A model is only useful if it does well on data it has **never seen**. That ability is called **generalisation**, and it is the real goal of ML. A score on the training data only tells you how well the model fits examples it has already seen.

> **Maths in one line:** `generalisation gap = error on new data − error on training data` — a small gap means the model learned a real pattern; a big gap means it memorised its examples.

Two ways to fool yourself:

- **Overfitting:** the model memorises its training examples, noise included. Training error is tiny; error on new data is much worse. The opposite, **underfitting**, is a model too simple to fit even the training data.
- **Data leakage:** information that will not exist at prediction time sneaks into training — for example a `sale_date` column when predicting *whether* a house will sell, or test rows used to compute a training statistic. The test score looks wonderful; the model fails in production.

The defence is the same for both: keep the test set locked away until the very end, and ask of every feature, *"would I know this at the moment I make the prediction?"* The worked example below shows a "memoriser" that overfits. Depth: [Ch 08](#content/08_core_concepts) (§8.4 leakage, §8.12 generalisation, §8.13 overfitting, §8.14 the bias–variance trade-off).

</details>

---

## The 4 Types of Machine Learning

![Infographic on the 4 types of machine learning, part 1: four boxes grouped by feedback (supervised: the right answer for every example, spam filter; unsupervised: no answers, find structure, customer groups; self-supervised: answers made from the data, GPT next word; reinforcement: a reward after each action, AlphaGo); then supervised vs unsupervised side by side: y-hat = f(x) learned so y-hat is close to y, classification (email to spam or not spam) and regression (size, bedrooms to $1.2M), versus clustering that picks k centres to minimise squared distances, shown as dots grouped into clusters A, B and C; a pick-the-type table and common mix-ups.](diagrams/intro07_info_four_types_overview_ai.png)

<details>
<summary><strong>Read as text</strong> — grouped by the feedback they learn from</summary>

ML algorithms are grouped by **what kind of feedback they learn from**. Older textbooks list three; modern ML adds a fourth — **self-supervised learning** — which powers today's LLMs.

```
                    WHAT FEEDBACK DOES THE MODEL LEARN FROM?
                    ────────────────────────────────────────

  The right answer      No answers:         Answers made       A reward after
 for every example     find structure      from the data        each action
         │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼
 ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
 │   SUPERVISED   │  │  UNSUPERVISED  │  │SELF-SUPERVISED │  │ REINFORCEMENT  │
 └────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘
    spam filter       customer groups      GPT: next word         AlphaGo

  Semi-supervised = a few labelled examples + lots of unlabelled ones (a mix).
```

</details>

---

### Type 1: Supervised Learning

<details>
<summary><strong>Read as text</strong> — definition, maths, classification vs regression and examples</summary>

> **Supervised Learning trains a model on labeled examples — (input, correct-answer) pairs — so it can predict the correct answer for new, unseen inputs.**

The labels act as a teacher, correcting the model every time it guesses wrong. A label can come from a person (someone marks an email as spam) or from a recorded outcome (the price a house actually sold for).

> **Maths in one line:** `ŷ = f(x)`, learned from pairs (x, y) so that ŷ ≈ y — find a function f that turns the features x into a prediction ŷ close to the true label y.

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

**Everyday example:** Gmail's spam filter learns from the huge number of emails that users mark as *spam* or *not spam*. More in [Ch 10 — Supervised Learning](#content/10_supervised_learning).

</details>

---

### Type 2: Unsupervised Learning

<details>
<summary><strong>Read as text</strong> — definition, maths, clustering and examples</summary>

> **Unsupervised Learning finds structure in unlabeled data — grouping, compressing, or spotting anomalies without any predefined correct answers.**

No labels means no teacher. The model has to figure out what's interesting about the data on its own.

> **Maths in one line:** there is no y, only the features x₁ … xₙ. Clustering, for example, picks k group centres to make `Σᵢ (distance from xᵢ to its nearest centre)²` as small as possible — points in the same group end up close together.

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

**Everyday example:** a music app noticing that a group of listeners all play "lo-fi beats at 2am" — nobody defined that group in advance — and building a playlist for them. More in [Ch 11 — Unsupervised Learning](#content/11_unsupervised_learning).

</details>

---

### Type 3: Self-Supervised & Semi-Supervised Learning

> **Self-Supervised Learning creates its own labels from the structure of the data itself, allowing training on massive unlabeled datasets without any human annotation.**

![Infographic on self-supervised and reinforcement learning: self-supervised hides part of the input and predicts it (GPT-style The cat sat on the ___ gives mat; BERT-style The cat MASK on the mat gives sat), loss = -log P(next word given the words before it), and the recipe huge unlabelled data, pre-train, fine-tune on a small labelled set, production-ready model; reinforcement shows an agent-environment loop (action out, new state + reward back), G = r1 + gamma x r2 + gamma squared x r3 with gamma between 0 and 1, AlphaGo beating Lee Sedol 4-1 in 2016 and RLHF; a who-supplies-the-answer table for supervised, unsupervised, self-supervised, semi-supervised (1,000 labelled + 1,000,000 unlabelled photos) and reinforcement.](diagrams/intro07_info_self_supervised_rl_ai.png)

<details>
<summary><strong>Read as text</strong> — pretext tasks, the loss, semi-supervised and pre-train → fine-tune</summary>

This is the secret behind modern LLMs. There are mountains of unlabelled data — Wikipedia, huge slices of the public web, books, code — and the model learns by **hiding part of the input and predicting it from the rest**. The hidden part *is* the label, so no human has to write a single one. Training then works exactly like supervised learning: guess, compare with the right answer, adjust.

**Two classic pretext tasks** (a *pretext task* is a made-up exercise whose only purpose is to force the model to learn):

```
 GPT-style: predict the NEXT word          BERT-style: fill in a HIDDEN word
 ───────────────────────────────────       ─────────────────────────────────
 Input:   "The cat sat on the"             Input:   "The cat [MASK] on the mat."
 Answer:  "mat"  ← the word that           Answer:  "sat"  ← the word that
                   really came next                          was covered up
```

Next-word prediction, repeated over trillions of words, is how GPT-style LLMs such as Gemini, Claude and the GPT models are pre-trained; fill-in-the-blank is how BERT learned. See [Ch 17 §3.1 — Pre-Training](#content/17_llm).

> **Maths in one line:** `loss = −log P(next word | the words before it)` — the model is penalised whenever it gave a low probability to the word that really came next; the text itself supplies the answer.

**Semi-supervised learning** is a hybrid: a small labelled set + a huge unlabelled set. Hand-label 1,000 images, then use those to bootstrap learning on 1,000,000 unlabelled ones.

**Don't mix them up** — the difference is *who supplies the answer*:

| Type | Who supplies the answer? | Example |
|---|---|---|
| **Supervised** | Every example comes with its correct answer | Emails marked spam / not spam |
| **Unsupervised** | Nobody — there is no answer; find structure | Group customers by behaviour |
| **Self-supervised** | The data itself: hide a part, predict it | Predict the next word of web text |
| **Semi-supervised** | A few examples are labelled; most are not | 1,000 labelled + 1,000,000 unlabelled photos |

Some textbooks file self-supervised learning under *unsupervised*, because no human labels are used. The difference that matters: self-supervised training has a right answer at every step, just like supervised learning; unsupervised learning has none.

The usual modern recipe combines them — pre-train on unlabelled data, then fine-tune on a small labelled set:

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

**Why it matters:** labels are expensive, but raw data is effectively free. Self-supervised learning exploits that imbalance — which is why it's the engine behind LLMs, image generators, and almost every modern *foundation model* (a large model pre-trained on broad data that can be adapted to many tasks).

</details>

---

### Type 4: Reinforcement Learning (RL)

<details>
<summary><strong>Read as text</strong> — the agent loop, discounted reward and examples</summary>

> **Reinforcement Learning trains an agent to take actions in an environment so as to maximize a cumulative reward signal.**

Usually there's no pre-collected dataset — the agent generates its own experience through trial and error, and learns a *policy* (a strategy) that earns the most reward over time. (*Offline* RL is the exception: it learns from a fixed log of past interactions — see [Ch 15](#content/15_reinforcement_learning).)

> **Maths in one line:** `G = r₁ + γ·r₂ + γ²·r₃ + …` — the agent picks actions to make the total future reward G as large as possible; the discount γ (between 0 and 1) makes later rewards count a little less.

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
- AlphaGo beating Lee Sedol, one of the world's strongest Go players, 4–1 (2016)
- Robots learning to walk
- Ad-placement systems optimizing click-through rate
- **ChatGPT's RLHF** (RL from human feedback) — people ranked the model's answers, a *reward model* learned those preferences, and RL then tuned the chatbot to score well ([Ch 17 §3.4](#content/17_llm))

More in [Ch 15 — Reinforcement Learning](#content/15_reinforcement_learning).

</details>

---

### Side-by-side: the four types

<details>
<summary><strong>Read as text</strong> — the four types compared in one table</summary>

After reading the sections above, use this table to cement the differences at a glance.

| Type | Input | How it learns | Example algorithms | Real-world example |
|---|---|---|---|---|
| **Supervised** | Features + label | From the correct answer attached to each example | Linear / Logistic Regression · Random Forest · XGBoost · Neural Nets | Gmail spam filter · medical diagnosis |
| **Unsupervised** | Features only | By finding structure in unlabelled data | K-Means · DBSCAN · PCA · Autoencoders | Customer segmentation · fraud detection |
| **Self-supervised** | Raw data only | By predicting hidden parts of the input from the rest | Next-token prediction (GPT) · Masked LM (BERT) · Contrastive (SimCLR) | GPT · BERT pre-training · CLIP |
| **Reinforcement** | State of an environment | From rewards earned via trial and error | Q-Learning · DQN · PPO · Actor-Critic | AlphaGo · robotics · ChatGPT's RLHF |

> **How to read each row:** *"A **supervised** learner gets features + label as input, learns from the correct answers, uses algorithms like XGBoost, and powers things like Gmail's spam filter."* Walk each row this way.

</details>

---

## The Machine Learning Workflow

> **The ML Workflow is the end-to-end process of turning a business problem into a deployed model — define, collect, clean, engineer features, train, evaluate, deploy, monitor.**

![Infographic showing the machine learning workflow as a loop of 7 steps: 1 Define Problem, 2 Collect Data, 3 Explore and Clean, 4 Feature Engineer, 5 Split and Train, 6 Evaluate on the test set once, 7 Deploy and Monitor, with steps 2 to 4 shaded as data work, the biggest share of time, a not-good-enough arrow from Evaluate back to Define, and a retrain-as-the-world-changes arrow from Deploy back to the start; a survey table (CrowdFlower 2016: 60% cleaning + 19% collecting; Anaconda 2020-2022: 38-45% loading and cleaning) and a trap noting the famous 80% is not a law.](diagrams/intro07_info_ml_workflow_ai.png)

<details>
<summary><strong>Read as text</strong> — the 7-step loop and where the time goes</summary>

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
      │ 6. Evaluate      │   Measure on the held-out test set (once)
      │                  │   Is it good enough for production?
      └────────┬─────────┘
               │  ◄─── loop back if not good enough
               ▼
      ┌──────────────────┐
      │ 7. Deploy &      │   Ship to production, monitor drift,
      │    Monitor       │   retrain as the world changes
      └──────────────────┘
```

> **Where the time goes:** surveys of data scientists consistently find that data work (steps 2–4) takes the **biggest share** of the job. The famous "80%" comes from a small 2016 CrowdFlower survey (60% cleaning and organising data + 19% collecting it); Anaconda's larger surveys put loading and cleaning at 38–45% of working time (2020–2022). Either way, "modelling" is glamorous; "data plumbing" is most of the job. See [Ch 09 — Data Preprocessing](#content/09_data_preprocessing).

</details>

---

## Worked Example: Predicting House Prices

![Infographic: predicting house prices step by step. A pipeline Raw Data, Clean, Features, Train, Model, API, Monitor with a retrain loop; the MAE formula; and a table from the chapter's runnable program on 2,000 made-up sales: baseline valid MAE $290,385, memoriser $0 on train but $101,719 on validation, best-fit line $68,179 on validation and $60,697 on test, price = 500 x size + 298,756, and a 1,800 sq ft house priced at $1,198,326. One year later the same line is $192,437 off, so retrain.](diagrams/intro07_info_house_prices_example_ai.png)

<details>
<summary><strong>Read as text</strong> — the scenario</summary>

Let's walk one concrete problem through every step of the workflow.

**The scenario:** a real-estate site wants to show an "estimated value" for every home.

</details>

### Step 1 — Define the problem

<details>
<summary><strong>Read as text</strong> — task, type and the MAE metric</summary>

- **Task:** given a house's attributes, predict its sale price.
- **Type:** *supervised regression* (predicting a number).
- **Success metric:** Mean Absolute Error (MAE) — on average, how many dollars off is the prediction?

> **Maths in one line:** `MAE = (1/n) Σᵢ |actual priceᵢ − predicted priceᵢ|` — the average number of dollars the estimate is off by, ignoring whether it was too high or too low.

</details>

### Step 2 — Collect data

<details>
<summary><strong>Read as text</strong> — the raw data</summary>

Pull 100,000 past home sales. Each row has: size, bedrooms, age, zip code, school rating, lot size, sale price.

```
size │ bed │ age │ zip    │ schools │ lot  │ PRICE (label)
─────┼─────┼─────┼────────┼─────────┼──────┼──────────────
1800 │  3  │  12 │ 94040  │   8.2   │ 5500 │ $1,200,000
2400 │  4  │   5 │ 94301  │   9.1   │ 7200 │ $2,100,000
 900 │  2  │  40 │ 94303  │   5.4   │ 3000 │   $700,000
 ... │ ... │ ... │  ...   │   ...   │  ... │     ...
```

</details>

### Step 3 — Explore & clean

<details>
<summary><strong>Read as text</strong> — what gets cleaned</summary>

- Drop 120 rows with missing prices.
- Cap obvious outliers (that $50M listing is a mansion, not signal).
- Plot price vs size — roughly linear but noisy.

</details>

### Step 4 — Feature engineer

<details>
<summary><strong>Read as text</strong> — the features, and a leakage trap</summary>

- Convert `zip` (categorical) into one-hot columns or an embedding.
- Scale `size`, `lot` to comparable ranges (normalization).
- Create a new feature: `median_price_per_sqft_in_zip` — computed from the **training rows only**. If test-set prices went into this average, the answer would leak into the inputs (data leakage).

</details>

### Step 5 — Split & train

<details>
<summary><strong>Read as text</strong> — the split, the baseline and the candidates</summary>

- 80% train / 10% validation / 10% test.
- **Baseline first:** predict the average training price for every house. Any real model must beat this.
- Try three models: **Linear Regression → Random Forest → Gradient Boosting**.
- Use the validation set to tune hyperparameters (tree depth, learning rate, etc.) and to pick the winner.

</details>

### Step 6 — Evaluate

<details>
<summary><strong>Read as text</strong> — the result, and whether it is good enough</summary>

- Best model: **Gradient Boosting**, with MAE ≈ **$65K** on the held-out test set — far better than the predict-the-average baseline. (These numbers are illustrative.)
- Is an average error of $65K good enough? For homes averaging 1.5 million dollars, that's about 4% error — probably yes, but the business decides, using the success metric agreed in Step 1.

</details>

### Step 7 — Deploy & monitor

<details>
<summary><strong>Read as text</strong> — serving, logging and retraining</summary>

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

</details>

### Run the workflow yourself

<details>
<summary><strong>Read as text</strong> — the made-up dataset and the three candidate models</summary>

The same steps on a small, made-up dataset: 2,000 past sales from one neighbourhood, where the true price in dollars is 300,000 + 500 × square feet, plus random noise of about ±80,000 (the models never see this formula). Three candidate models compete:

- **Baseline:** always predict the average training price — the score to beat.
- **Memoriser:** copy the price of the most similar house it has seen — pure memorisation.
- **Best-fit line:** `np.linalg.lstsq` finds the straight line `price = w × size + b` with the smallest total squared error on the training houses — that is all "training" means here.

</details>

```python
# House prices, Steps 2-7 in miniature: a baseline, a memoriser and a best-fit line, judged on unseen houses.
import numpy as np

rng = np.random.default_rng(0)
# Step 2 - collect: 2,000 made-up past sales in one neighbourhood (size in sq ft, price in $).
size = rng.uniform(800, 3000, 2000)
price = 300_000 + 500 * size + rng.normal(0, 80_000, 2000)   # hidden truth + noise; no model sees it
price[[3, 141, 275]] = np.nan                                # three sales recorded without a price

# Step 3 - clean: drop the rows with no label.
keep = ~np.isnan(price)
size, price = size[keep], price[keep]

# Step 5 - split at random: 80% train / 10% validation / 10% test.
idx = rng.permutation(len(price))
n_tr, n_va = int(0.8 * len(idx)), int(0.1 * len(idx))
tr, va, te = idx[:n_tr], idx[n_tr:n_tr + n_va], idx[n_tr + n_va:]

# Train three candidate models on the training rows ONLY.
mean_price = price[tr].mean()
X = np.column_stack([size, np.ones_like(size)])              # columns: size, 1 (for the intercept)
(w, b), *_ = np.linalg.lstsq(X[tr], price[tr], rcond=None)   # find the best line (least squared error)
models = {
    "baseline (mean price)": lambda s: np.full(len(s), mean_price),
    "memoriser (copy nearest)": lambda s: price[tr][np.abs(size[tr] - s[:, None]).argmin(axis=1)],
    "best-fit line": lambda s: w * s + b,
}
def mae(name, rows):                                         # Step 1's metric: average $ off
    return np.mean(np.abs(models[name](size[rows]) - price[rows]))

# Step 6 - evaluate: compare on validation, then score the winner ONCE on the test set.
print(f"{'model':<26}{'train MAE':>11}{'valid MAE':>11}")
for name in models:
    print(f"{name:<26}{mae(name, tr):>11,.0f}{mae(name, va):>11,.0f}")
best = min(models, key=lambda name: mae(name, va))
print(f"\nchosen on validation: {best}, price = {w:,.0f} x size + {b:,.0f}")
print(f"test MAE (reported once): ${mae(best, te):,.0f}")
print(f"the chapter's 1,800 sq ft house: ${w * 1800 + b:,.0f}")

# Step 7 - monitor: a year later the market is 15% higher, and the old line drifts off.
new_size = rng.uniform(800, 3000, 100)
new_price = 1.15 * (300_000 + 500 * new_size) + rng.normal(0, 80_000, 100)
live_mae = np.mean(np.abs(w * new_size + b - new_price))
print(f"one year later, live MAE: ${live_mae:,.0f} -> time to retrain")

assert mae("memoriser (copy nearest)", tr) == 0              # perfect on houses it has seen ...
assert mae("memoriser (copy nearest)", va) > mae("best-fit line", va)   # ... worse on new ones
assert best == "best-fit line" and mae(best, te) < mae("baseline (mean price)", te) / 2
assert live_mae > 2 * mae(best, te)
```

**Output:**

```
model                       train MAE  valid MAE
baseline (mean price)         282,864    290,385
memoriser (copy nearest)            0    101,719
best-fit line                  64,361     68,179

chosen on validation: best-fit line, price = 500 x size + 298,756
test MAE (reported once): $60,697
the chapter's 1,800 sq ft house: $1,198,326
one year later, live MAE: $192,437 -> time to retrain
```

<details>
<summary><strong>Read as text</strong> — continued: how to read the results</summary>

How to read it (all errors in dollars):

- **The baseline** is off by about 283K–290K dollars. That is the floor: a model that cannot beat it has learned nothing useful.
- **The memoriser** scores a perfect 0 on the houses it has seen, and is off by about $102K on new ones — **overfitting** in one line.
- **The best-fit line** scores about the same on training, validation and test houses (61K–68K dollars): it **generalises**. It also recovered the hidden rule (≈ 500 dollars per sq ft + ≈ 300K), and it prices the chapter's 1,800 sq ft house at about 1.2 million dollars.
- **A year later** the market has moved, and the same line is off by about $192K. Nothing in the code broke; the world changed. That is why Step 7 monitors and retrains.

</details>

---

## When to Use Machine Learning?

> **Use ML when the rules are too complex to hand-code, the data is plentiful, and some error is tolerable. Otherwise, a simple rule or formula is usually better.**

![Infographic: when to use machine learning and which kind. Five reasons to use ML, such as rules too complex to hand-write and some error being tolerable, beside five cases where a rule or formula is better, such as a simple rule like if x > 5 or a known formula like sales tax = price x tax rate. Below, classical ML for tabular, small-to-medium data, interpretability and limited compute (XGBoost, LightGBM, Random Forests, SVMs) versus deep learning for images, audio, text and video with huge data or a pre-trained model and GPUs or TPUs (CNNs, Transformers, Diffusion models, LLMs), a pick-by-situation table and a note that since 2025 TabPFN can match boosted trees on some small-to-medium tables.](diagrams/intro07_info_when_to_use_ml_ai.png)

<details>
<summary><strong>Read as text</strong> — when ML fits and when a rule is better</summary>

```
 USE ML when...                          DON'T use ML when...
 ────────────────────────────            ──────────────────────────────
 ✓ Problem is too complex                ✗ A simple rule works
   for hand-written rules                  (if x > 5 then ...)

 ✓ You have lots of relevant             ✗ You have very little relevant
   data                                    data and no way to get more

 ✓ Pattern evolves over time             ✗ Every decision must be explained
   (spam, prices, fashion)                 step by step (some legal or credit
                                           decisions) — prefer rules or a
                                           simple, readable model

 ✓ Humans can do it intuitively          ✗ A wrong answer is catastrophic
   but can't explain how                   and you can't tolerate errors
   (image/speech recognition)

 ✓ Tolerance for some error              ✗ The problem is deterministic
                                           with a known formula
```

</details>

### Classical ML vs Deep Learning — which should you pick?

<details>
<summary><strong>Read as text</strong> — tabular vs unstructured data, and the TabPFN caveat</summary>

```
 Use CLASSICAL ML when...             Use DEEP LEARNING when...
 ──────────────────────────           ──────────────────────────────
 • Tabular data (rows of              • Unstructured data: images,
   features)                            audio, text, video

 • Small-to-medium dataset            • Huge dataset
   (deep nets need far more)            (millions of examples), or a
                                        pre-trained model to fine-tune

 • Interpretability matters           • Best accuracy on perception
   (regulated industries)               and language tasks

 • Limited compute                    • GPUs / TPUs available

 Examples: XGBoost, LightGBM,         Examples: CNNs, Transformers,
 Random Forests, SVMs                 Diffusion models, LLMs
```

> **Surprising fact:** on *tabular* data (spreadsheet-style rows and columns), gradient-boosted trees (XGBoost, LightGBM, CatBoost) are still the standard first choice and often beat deep networks. Since 2025, pre-trained "tabular foundation models" such as TabPFN can match or beat them on some small-to-medium tables, so benchmark both — see [Ch 12 — Key Algorithms](#content/12_key_algorithms). Deep learning's home turf is images, audio and language.

</details>

---

## No Free Lunch — Why No Algorithm Wins Everywhere

![Infographic: the No Free Lunch theorem. Summed over every possible problem f, any two algorithms A and B perform the same, but real problems have structure, so an algorithm wins when its assumptions match. Shows a Swiss Army knife analogy, a five-step baseline ladder from naive baseline (predict the mean or majority class) through single feature, linear model and gradient boosting to your fancy model, a table of typical strengths such as XGBoost on tabular data and CNNs on images, and myths such as neural networks are always best.](diagrams/intro07_info_no_free_lunch_ai.png)

### Simple Explanation

<details>
<summary><strong>Read as text</strong> — the analogy, the theorem, what it does not say and the baseline ladder</summary>

Imagine a Swiss Army knife. It has a blade, scissors, a screwdriver and a bottle opener, and it's
pretty good at a lot of things — but a chef would never use that tiny blade instead of a proper
kitchen knife, and an electrician would never use that stubby screwdriver for real work.

In ML there is **no Swiss Army knife that beats everything**. Neural networks are astonishing on
images and text but often overkill for a tidy spreadsheet. Decision trees are excellent on structured
data and hopeless on raw photographs. With 100 rows of data, a simple algorithm will often beat a
fancy one.

This isn't just a rule of thumb — it's backed by a pair of **theorems**: one for learning
algorithms (Wolpert, 1996) and one for optimisation, or search, algorithms (Wolpert & Macready, 1997).

**Official Definition:**
> The **No Free Lunch theorems** state that, averaged over *all possible* problems, every
> algorithm performs identically. For learning: averaged uniformly over every possible target
> function, all learners have the same expected error on examples outside the training set
> (Wolpert, 1996). For optimisation: averaged over every possible objective function, all search
> algorithms perform the same (Wolpert & Macready, 1997). Superior performance on one class of
> problems is paid for by inferior performance on another.

> **Maths in one line:** `Σ_f performance(A, f) = Σ_f performance(B, f)` for any two algorithms A and B, where the sum runs over **every** possible problem f — wins on some problems are exactly cancelled by losses on others.

**What it does *not* say:** that all algorithms are equally good on *your* problem. Real problems
are a tiny, structured corner of "all possible problems" — nearby houses have similar prices,
neighbouring pixels belong together, words depend on the words before them. An algorithm wins when
its built-in assumptions (its *inductive bias*, [Ch 08 §8.5](#content/08_core_concepts)) match
that structure. So the lesson is not "nothing works"; it is "you have to test on your data".

```
  WHAT THIS MEANS IN PRACTICE  (typical strengths, not guarantees)
  ─────────────────────────────────────────────────────────────────
  XGBoost / LightGBM  strong default on tabular, structured data
  CNNs / ViTs         strong on images
  Transformers        strong on text and sequences
  Naive Bayes         can win on simple text with little data
  KNN                 can win on some low-dimensional problems

  ✗ "Neural networks are always best"  — FALSE
  ✗ "XGBoost always beats neural nets" — FALSE
  ✓ "Try several, pick what works here" — TRUE
```

The practical consequence is that **every project starts with a baseline**. Before you build
anything complex, beat something simple — otherwise you have no idea whether your complexity is
buying you anything. (The house-price program above does exactly this: the line cuts the
baseline's error by more than three-quarters.)

```
  BASELINE HIERARCHY
  ───────────────────────────────────────────────────────────────
  1. Naive baseline    Regression: always predict the mean
                       Classification: always predict majority class
  2. Single feature    Use only the most correlated feature
  3. Linear model      Linear / Logistic Regression
  4. Gradient boosting XGBoost / LightGBM on raw features
  5. Your fancy model  Deep learning, ensembles, etc.

  If step 5 barely beats step 3, the complexity isn't worth it.
  If step 5 crushes step 3, you've found real signal.
```

</details>

---

## Common Misconceptions

<details>
<summary><strong>Read as text</strong> — eight myths and the reality</summary>

| Myth | Reality |
|---|---|
| *"ML is just statistics with a rebrand."* | They overlap a lot, but ML focuses on **predicting** new cases well, while classical statistics focuses on **explaining** relationships, with confidence intervals. ML also scales to far messier data. |
| *"More data always wins."* | More **good, relevant** data wins. Garbage in → garbage out. |
| *"The algorithm is the hard part."* | Data pipelines and feature engineering dominate real projects. |
| *"ML models understand what they predict."* | They learn statistical patterns from their training data; on inputs unlike that data they can be confidently wrong, with no built-in common sense. |
| *"A great training score means a great model."* | Only held-out data shows whether it generalises — a memoriser scores perfectly on training data. |
| *"Once deployed, you're done."* | Data drifts, users change; models degrade silently. Monitoring is non-optional. |
| *"Deep learning has replaced everything."* | For tabular data, gradient-boosted trees are still the standard first choice. |
| *"Accuracy is the right metric."* | Often it isn't — for imbalanced data, use precision/recall/F1/AUC ([Ch 13](#content/13_model_evaluation)). |

</details>

---

## A Brief History of Machine Learning

![Infographic timeline of machine learning history from 1950 to 2025 in 12 cards: Turing asks Can machines think (1950), Rosenblatt's perceptron (1958), Minsky and Papert's XOR result (1969), the first AI winter (1974-80), backpropagation (1986), Deep Blue (1997), AlexNet winning ImageNet with 15.3% vs 26.2% top-5 error (2012), AlphaGo beating Lee Sedol 4-1 (2016), the Transformer (2017), GPT-3 with 175B parameters (2020), ChatGPT launching Nov 30 (2022) and IMO gold level (2025). A question table adds Arthur Samuel 1959, SVMs 1992-95, the 2006 deep learning revival, GPT-1 and BERT in 2018 and the 2026 GPT-6, Claude 5.5 and Gemini 4 families. Trap: Deep Blue was not machine learning.](diagrams/intro07_info_history_timeline_ai.png)

<details>
<summary>Click to expand timeline</summary>

```
1950 ──► Alan Turing asks "Can machines think?" and proposes
         the imitation game (the "Turing Test")

1958 ──► Frank Rosenblatt's Perceptron: the first well-known neural
         network that learns its weights from examples (report 1957,
         paper 1958)

1959 ──► Arthur Samuel's checkers program improves by playing itself;
         his paper popularises the term "machine learning"

1969 ──► Minsky & Papert's book "Perceptrons" shows a single-layer
         perceptron cannot learn XOR; neural-network research stalls

1974–80 ──► First "AI winter": funding cut after over-promising

1980s ──► Expert systems (hand-written rules) boom, then bust:
          second AI winter, from ~1987 into the 1990s

1986 ──► Rumelhart, Hinton & Williams popularise backpropagation
         for training multi-layer networks (the idea dates to the 1970s)

1992–95 ──► Support Vector Machines (Boser, Guyon & Vapnik 1992;
            Cortes & Vapnik 1995): statistical ML becomes dominant

1997 ──► IBM Deep Blue beats world chess champion Garry Kasparov
         (brute-force search + a mostly hand-tuned scoring function;
         its knowledge was not learned from data)

2006 ──► Hinton and colleagues train deep networks layer by layer:
         the "deep learning" revival begins

2012 ──► AlexNet wins ImageNet (15.3% vs 26.2% top-5 error)
         Deep learning + GPUs prove themselves on images

2016 ──► AlphaGo beats Lee Sedol 4–1 at Go
         Deep learning + reinforcement learning + tree search

2017 ──► Google's Transformer paper, "Attention Is All You Need"

2018 ──► GPT-1 and BERT: pre-train on raw text, then fine-tune

2020 ──► GPT-3 (175B parameters): learns new tasks from examples
         in the prompt (few-shot learning)

2022 ──► ChatGPT launches (Nov 30); LLMs go mainstream

2023 ──► GPT-4, Claude, Llama, Gemini 1.0: image input, open weights

2024 ──► OpenAI o1: the first "reasoning" model, thinks before answering
         Nobel Prizes: Hopfield & Hinton (physics, neural networks);
         Hassabis & Jumper (chemistry, AlphaFold protein structures)

2025 ──► DeepSeek-R1 (open, RL-trained reasoning); Claude 4, GPT-5,
         Gemini 3; AI reaches gold-medal level at the Maths Olympiad (IMO)

2026 ──► GPT-6, Claude 5.5 and Gemini 4 families: 1M-token context,
         an adjustable "thinking effort" dial, agents that use tools
```

*The 2023–2026 entries are model families, not every release; versions change every few months. The detailed LLM timeline is [Ch 17 §16.2](#content/17_llm), and today's landscape is [Ch 20](#content/20_2026_landscape).*

</details>

---

## Review Questions — Test Your Understanding

Try to answer these without scrolling up. Then check your answers.

1. In your own words, what's the difference between traditional programming and machine learning?
2. A company wants to predict which customers will cancel their subscription next month. Which type of ML is this?
3. You have a dataset of customer purchases but **no labels**. You want to find natural groups. Which type of ML?
4. GPT was trained by predicting the next word across a huge amount of web text. Which type of learning is that?
5. Name the 7 steps of the realistic ML workflow.
6. Define each term in one sentence: *feature*, *label*, *training set*, *loss*, *inference*.
7. Give one example where ML is **not** the right approach, and explain why.
8. Surveys keep finding that data work takes the biggest share of an ML project's time. Which workflow steps is that, and why do they take so long?
9. You have 5,000 rows of tabular customer data and need interpretability for regulators. Classical ML or Deep Learning?
10. Using Tom Mitchell's definition, name T, P and E for a spam filter.
11. In the model `price = 500 × size + 300,000`, what are the parameters? Name one hyperparameter of a gradient-boosting model, and say which data set you use to choose it.
12. Model A is 99% accurate on its training data but 70% on new data. Model B predicts whether a newly listed house will sell within 30 days; it scores 99% on the test set, but one of its features is the date the house was sold. What has gone wrong in each case?
13. In the house-price program, the memoriser's training MAE is exactly $0. Why — and why is that not good news?
14. Does the No Free Lunch theorem mean that every algorithm is equally good on *your* problem?

<details>
<summary>Answers</summary>

1. **Traditional programming:** human writes explicit rules (Input + Rules → Output). **ML:** computer discovers the rules from examples (Input + Output → Rules).
2. **Supervised** (classification) — historical data is labeled *cancelled* / *didn't cancel*.
3. **Unsupervised** — specifically *clustering*.
4. **Self-supervised** — the labels (the "next word") come from the text itself, so no human has to label anything ([Ch 17 §3.1](#content/17_llm)).
5. Define Problem → Collect Data → Explore & Clean → Feature Engineer → Split & Train → Evaluate → Deploy & Monitor.
6. **Feature:** input variable. **Label:** the target answer. **Training set:** examples the model learns from. **Loss:** a number measuring how wrong the model is. **Inference:** using a trained model to make a new prediction.
7. Calculating sales tax — it's a fixed formula (`price × tax_rate`). ML would be less accurate than the rule and adds complexity for no benefit.
8. Steps 2–4: collecting, cleaning and feature engineering. Real data is scattered, messy and incomplete, and every fix must be checked. The often-quoted "80%" comes from one small 2016 survey; larger surveys find 38–45% for loading and cleaning alone — still the biggest single block of work.
9. **Classical ML** (e.g., Gradient Boosting or Logistic Regression). Small-ish tabular data + interpretability requirement = deep learning is the wrong tool.
10. **T:** sort emails into spam / not spam. **P:** the percentage of emails sorted correctly. **E:** emails that people have already marked as spam or not spam. It "learns" if P on new emails improves as E grows.
11. The parameters are **500** and **300,000** — learned from the training data. Tree depth, learning rate or number of trees are hyperparameters: you choose them before training and compare candidates on the **validation** set. The test set is used once, at the end; tuning on it would make its score too optimistic.
12. **A is overfitting:** it memorised its training data, so it fails on new data (a big generalisation gap). **B is data leakage:** the sale date only exists *after* a sale, so it gives away the answer; in production that feature isn't available and the model collapses. Drop any feature you would not know at prediction time.
13. Each training house's nearest neighbour is itself, so the memoriser copies its own price exactly. On a new house it copies a neighbour's price *including that neighbour's random noise*, so it is off by about $102K, versus about 68K for the line. A perfect training score with a much worse score on new data is overfitting.
14. **No.** The theorem averages over *all possible* problems, most of which are pure noise. Real problems have structure, and an algorithm whose assumptions match that structure really does win. The practical lesson: no algorithm is best everywhere, so start with a baseline and compare several models on your own data.
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
║  5. Algorithm = the recipe; model = what training produces;       ║
║     parameters are LEARNED inside it; hyperparameters are         ║
║     CHOSEN by you and compared on the validation set              ║
║  6. Training fits the parameters (slow, once or on a schedule);   ║
║     inference uses the model on new input (fast, every request)   ║
║  7. Generalisation is the goal: judge a model only on data it     ║
║     never saw (gap = error on new data − error on training)       ║
║  8. Overfitting = memorising the training data; data leakage =    ║
║     using information you won't have at prediction time           ║
║  9. Workflow is a LOOP: Define → Data → Clean → Features →        ║
║     Train → Evaluate → Deploy → Monitor → (loop back)             ║
║  10. Data work is the biggest share of a project (surveys:        ║
║      roughly 40–80% of the time, depending on what is counted)    ║
║  11. Good data beats clever algorithms                            ║
║  12. Beat a baseline first, pick on validation, test once:        ║
║      best-fit line ~$68K off vs predict-the-mean ~$290K           ║
║  13. A perfect training score can be pure memorising ($0 on       ║
║      seen houses, ~$102K on new). And models drift: the same      ║
║      line was ~$192K off a year later — monitor and retrain       ║
║  14. No Free Lunch: no algorithm wins everywhere — compare        ║
║      several on your own data                                     ║
║  15. Use ML when rules are too complex, data is plentiful,        ║
║      and some error is tolerable                                  ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

**Next:** [Chapter 8 — Core Concepts & Terminology](#content/08_core_concepts)
